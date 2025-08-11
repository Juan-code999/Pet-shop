// Services/PagamentoService.cs
using Firebase.Database;
using Firebase.Database.Query;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Pet_shop.DTOs;
using Pet_shop.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Pet_shop.Services
{
    public class PagamentoService : IPagamentoService
    {
        private readonly FirebaseClient _firebase;
        private readonly ILogger<PagamentoService> _logger;
        private readonly List<string> _metodosValidos = new List<string> { "cartao", "pix", "boleto" };
        private readonly List<string> _statusValidos = new List<string> { "pendente", "processando", "aprovado", "recusado", "cancelado" };

        public PagamentoService(IConfiguration configuration, ILogger<PagamentoService> logger)
        {
            var databaseUrl = configuration["Firebase:DatabaseUrl"] ??
                throw new ArgumentNullException("Firebase:DatabaseUrl não configurado");

            _firebase = new FirebaseClient(databaseUrl);
            _logger = logger;
        }

        public async Task<Pagamento> ProcessarPagamentoAsync(PagamentoDTO pagamentoDto)
        {
            try
            {
                ValidarPagamentoDto(pagamentoDto);

                var pagamento = new Pagamento
                {
                    Id = Guid.NewGuid().ToString(),
                    UsuarioId = pagamentoDto.UsuarioId,
                    CarrinhoId = pagamentoDto.CarrinhoId,
                    ValorTotal = pagamentoDto.ValorTotal,
                    MetodoPagamento = pagamentoDto.MetodoPagamento.ToLower(),
                    Status = "pendente",
                    Dados = new DadosPagamento()
                };

                await ProcessarMetodoPagamento(pagamentoDto, pagamento);
                await SimularProcessamento(pagamento);
                await SalvarPagamento(pagamento);

                return pagamento;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao processar pagamento");
                throw;
            }
        }

        private void ValidarPagamentoDto(PagamentoDTO dto)
        {
            if (dto == null) throw new ArgumentNullException(nameof(dto));
            if (string.IsNullOrWhiteSpace(dto.UsuarioId)) throw new ArgumentException("UsuárioID é obrigatório");
            if (dto.ValorTotal <= 0) throw new ArgumentException("Valor total deve ser positivo");
            if (!_metodosValidos.Contains(dto.MetodoPagamento?.ToLower()))
                throw new ArgumentException($"Método inválido. Use: {string.Join(", ", _metodosValidos)}");
            if (dto.Itens == null || !dto.Itens.Any()) throw new ArgumentException("Carrinho vazio");
        }

        private async Task ProcessarMetodoPagamento(PagamentoDTO dto, Pagamento pagamento)
        {
            switch (pagamento.MetodoPagamento)
            {
                case "cartao":
                    ValidarDadosCartao(dto.Dados);
                    pagamento.Dados = MapearDadosCartao(dto.Dados);
                    break;

                case "pix":
                    pagamento.Dados.ChavePix = GerarChavePix();
                    break;

                case "boleto":
                    pagamento.Dados.CodigoBoleto = GerarCodigoBoleto();
                    pagamento.Dados.DataVencimento = DateTime.UtcNow.AddDays(3);
                    break;
            }
        }

        private void ValidarDadosCartao(DadosPagamentoDTO dados)
        {
            if (dados == null) throw new ArgumentNullException(nameof(dados));
            if (string.IsNullOrWhiteSpace(dados.NumeroCartao) || dados.NumeroCartao.Length < 15)
                throw new ArgumentException("Número do cartão inválido");
            if (string.IsNullOrWhiteSpace(dados.NomeCartao))
                throw new ArgumentException("Nome no cartão é obrigatório");
            if (string.IsNullOrWhiteSpace(dados.Validade) || !dados.Validade.Contains('/'))
                throw new ArgumentException("Validade inválida (use MM/AA)");
            if (string.IsNullOrWhiteSpace(dados.CVV) || dados.CVV.Length < 3)
                throw new ArgumentException("CVV inválido");
        }

        private DadosPagamento MapearDadosCartao(DadosPagamentoDTO dados)
        {
            return new DadosPagamento
            {
                NumeroCartao = dados.NumeroCartao, // Em produção, criptografe este dado
                NomeCartao = dados.NomeCartao,
                Validade = dados.Validade,
                CVV = dados.CVV,
                CPF = dados.CPF,
                Parcelas = dados.Parcelas
            };
        }

        private string GerarChavePix() => $"PIX_{Guid.NewGuid().ToString().Substring(0, 8)}";

        private string GerarCodigoBoleto() =>
            $"3419.{Random.Shared.Next(1000, 9999)} {Random.Shared.Next(1000, 9999)} " +
            $"{Random.Shared.Next(1000, 9999)} {Random.Shared.Next(1, 9)} {DateTime.Now:MMddHHmm}";

        private async Task SimularProcessamento(Pagamento pagamento)
        {
            await Task.Delay(1500); // Simula processamento
            pagamento.Status = new Random().Next(0, 100) < 80 ? "aprovado" : "recusado";
            pagamento.DataAtualizacao = DateTime.UtcNow;
        }

        private async Task SalvarPagamento(Pagamento pagamento)
        {
            try
            {
                await _firebase
                    .Child("pagamentos")
                    .Child(pagamento.Id)
                    .PutAsync(pagamento);
            }
            catch (FirebaseException ex)
            {
                _logger.LogError(ex, "Erro ao salvar no Firebase");
                throw new Exception("Falha ao registrar pagamento", ex);
            }
        }

        public async Task<Pagamento> ObterPagamentoAsync(string pagamentoId)
        {
            if (string.IsNullOrWhiteSpace(pagamentoId))
                throw new ArgumentException("ID do pagamento é obrigatório");

            try
            {
                var pagamento = await _firebase
                    .Child("pagamentos")
                    .Child(pagamentoId)
                    .OnceSingleAsync<Pagamento>();

                return pagamento ?? throw new KeyNotFoundException("Pagamento não encontrado");
            }
            catch (FirebaseException ex)
            {
                _logger.LogError(ex, $"Erro ao buscar pagamento {pagamentoId}");
                throw new Exception("Falha ao acessar banco de dados", ex);
            }
        }

        public async Task<Pagamento> AtualizarStatusPagamentoAsync(string pagamentoId, string status)
        {
            if (!_statusValidos.Contains(status?.ToLower()))
                throw new ArgumentException($"Status inválido. Use: {string.Join(", ", _statusValidos)}");

            var pagamento = await ObterPagamentoAsync(pagamentoId);
            pagamento.Status = status.ToLower();
            pagamento.DataAtualizacao = DateTime.UtcNow;

            await SalvarPagamento(pagamento);
            return pagamento;
        }
    }
}