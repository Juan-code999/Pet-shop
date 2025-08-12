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
        private readonly List<string> _metodosValidos = new() { "cartao", "pix", "boleto" };
        private readonly List<string> _statusValidos = new() { "pendente", "processando", "aprovado", "recusado", "cancelado" };

        public PagamentoService(IConfiguration configuration, ILogger<PagamentoService> logger)
        {
            var databaseUrl = configuration["Firebase:DatabaseUrl"] ??
                throw new ArgumentNullException("Firebase:DatabaseUrl não configurado");

            _firebase = new FirebaseClient(databaseUrl);
            _logger = logger;
        }

        public async Task<Pagamento> ProcessarPagamentoAsync(PagamentoDTO pagamentoDto)
        {
            // Validações adicionais
            if (pagamentoDto.Itens == null || !pagamentoDto.Itens.Any())
            {
                throw new ArgumentException("O pagamento deve conter itens");
            }

            // Criação do objeto Pagamento
            var pagamento = new Pagamento
            {
                UsuarioId = pagamentoDto.UsuarioId,
                CarrinhoId = pagamentoDto.CarrinhoId,
                ValorTotal = pagamentoDto.ValorTotal,
                MetodoPagamento = pagamentoDto.MetodoPagamento,
                Dados = pagamentoDto.Dados,
                Status = "pendente",
                DataCriacao = DateTime.UtcNow,
                DataAtualizacao = DateTime.UtcNow
            };

            // Salva no Firebase
            var result = await _firebase
                .Child("pagamentos")
                .PostAsync(pagamento);

            pagamento.Id = result.Key;

            // Atualiza com o ID
            await _firebase
                .Child("pagamentos")
                .Child(result.Key)
                .PutAsync(pagamento);

            return pagamento;
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
                NumeroCartao = dados.NumeroCartao,
                NomeCartao = dados.NomeCartao,
                Validade = dados.Validade,
                CVV = dados.CVV,
                CPF = dados.CPF,
                Parcelas = dados.Parcelas
            };
        }

        private string GerarChavePix() => $"PIX_{Guid.NewGuid():N}".Substring(0, 12);

        private string GerarCodigoBoleto() =>
            $"3419.{Random.Shared.Next(1000, 9999)} {Random.Shared.Next(1000, 9999)} " +
            $"{Random.Shared.Next(1000, 9999)} {Random.Shared.Next(1, 9)} {DateTime.Now:MMddHHmm}";

        private async Task SimularProcessamento(Pagamento pagamento)
        {
            await Task.Delay(1500);
            pagamento.Status = new Random().Next(0, 100) < 80 ? "aprovado" : "recusado";
            pagamento.DataAtualizacao = DateTime.UtcNow;
        }

        private async Task SalvarPagamento(Pagamento pagamento)
        {
            try
            {
                // Evita problemas de serialização no Firebase
                if (pagamento.Dados?.DataVencimento == null)
                    pagamento.Dados.DataVencimento = null;

                await _firebase
                    .Child("pagamentos")
                    .Child(pagamento.Id)
                    .PutAsync(pagamento);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Erro ao salvar pagamento {pagamento.Id} no Firebase");
                throw new Exception($"Falha ao registrar pagamento no Firebase: {ex.Message}", ex);
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
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Erro ao buscar pagamento {pagamentoId}");
                throw;
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
