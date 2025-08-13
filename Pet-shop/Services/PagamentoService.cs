using Firebase.Database;
using Firebase.Database.Query;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Pet_shop.DTOs;
using Pet_shop.Models;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Pet_shop.Services
{
    public class PagamentoService : IPagamentoService
    {
        private readonly FirebaseClient _firebase;
        private readonly ILogger<PagamentoService> _logger;
        private readonly List<string> _statusValidos = new() { "pendente", "processando", "aprovado", "recusado", "cancelado" };

        public PagamentoService(IConfiguration configuration, ILogger<PagamentoService> logger)
        {
            var databaseUrl = configuration["Firebase:DatabaseUrl"] ??
                throw new ArgumentNullException("Firebase:DatabaseUrl não configurado");

            _firebase = new FirebaseClient(databaseUrl);
            _logger = logger;
        }

        public async Task<Pagamento> ProcessarPagamentoAsync<T>(PagamentoDTO<T> pagamentoDto) where T : MetodoPagamentoDTO
        {
            if (pagamentoDto.Itens == null || !pagamentoDto.Itens.Any())
                throw new ArgumentException("O pagamento deve conter itens");

            var dadosPagamento = new DadosPagamento();
            var metodo = pagamentoDto.Metodo;

            switch (metodo.Tipo)
            {
                case "pix":
                    var pix = metodo as PixPagamentoDTO;
                    dadosPagamento.ChavePix = pix?.ChavePix ?? GerarChavePix();
                    dadosPagamento.CPF = pix?.CPF;
                    break;

                case "cartao":
                    var cartao = metodo as CartaoPagamentoDTO;
                    dadosPagamento.NumeroCartao = cartao?.NumeroCartao;
                    dadosPagamento.NomeCartao = cartao?.NomeCartao;
                    dadosPagamento.Validade = cartao?.Validade;
                    dadosPagamento.CVV = cartao?.CVV;
                    dadosPagamento.CPF = cartao?.CPF;
                    dadosPagamento.Parcelas = cartao?.Parcelas ?? 1;
                    break;

                case "boleto":
                    var boleto = metodo as BoletoPagamentoDTO;
                    dadosPagamento.CodigoBoleto = GerarCodigoBoleto();
                    dadosPagamento.DataVencimento = DateTime.UtcNow.AddDays(3);
                    dadosPagamento.CPF = boleto?.CPF;
                    break;
            }

            var pagamento = new Pagamento
            {
                UsuarioId = pagamentoDto.UsuarioId,
                CarrinhoId = pagamentoDto.CarrinhoId,
                ValorTotal = pagamentoDto.ValorTotal,
                MetodoPagamento = metodo.Tipo,
                Dados = dadosPagamento,
                Status = "pendente",
                DataCriacao = DateTime.UtcNow,
                DataAtualizacao = DateTime.UtcNow
            };

            var result = await _firebase.Child("pagamentos").PostAsync(pagamento);
            pagamento.Id = result.Key;

            await _firebase.Child("pagamentos").Child(result.Key).PutAsync(pagamento);
            await SimularProcessamento(pagamento);

            return pagamento;
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

            await _firebase.Child("pagamentos").Child(pagamento.Id).PutAsync(pagamento);
        }

        public async Task<Pagamento> ObterPagamentoAsync(string pagamentoId)
        {
            if (string.IsNullOrWhiteSpace(pagamentoId))
                throw new ArgumentException("ID do pagamento é obrigatório");

            var pagamento = await _firebase
                .Child("pagamentos")
                .Child(pagamentoId)
                .OnceSingleAsync<Pagamento>();

            return pagamento ?? throw new KeyNotFoundException("Pagamento não encontrado");
        }

        public async Task<Pagamento> AtualizarStatusPagamentoAsync(string pagamentoId, string status)
        {
            if (!_statusValidos.Contains(status?.ToLower()))
                throw new ArgumentException($"Status inválido. Use: {string.Join(", ", _statusValidos)}");

            var pagamento = await ObterPagamentoAsync(pagamentoId);
            pagamento.Status = status.ToLower();
            pagamento.DataAtualizacao = DateTime.UtcNow;

            await _firebase.Child("pagamentos").Child(pagamento.Id).PutAsync(pagamento);
            return pagamento;
        }
    }
}