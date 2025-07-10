using Firebase.Database;
using Firebase.Database.Query;
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
        private readonly CarrinhoService _carrinhoService;
        private readonly string[] _metodosPagamentoValidos = { "cartao", "pix", "boleto" };

        public PagamentoService(IConfiguration configuration, CarrinhoService carrinhoService)
        {
            var databaseUrl = configuration["Firebase:DatabaseUrl"];
            _firebase = new FirebaseClient(databaseUrl);
            _carrinhoService = carrinhoService;
        }

        public async Task<Pagamento> ProcessarPagamentoAsync(PagamentoDTO pagamentoDto)
        {
            ValidarDadosPagamento(pagamentoDto);

            var carrinho = await _carrinhoService.ObterCarrinhoAsync(pagamentoDto.UsuarioId);
            if (carrinho == null || !carrinho.Itens.Any())
                throw new Exception("Carrinho inválido ou vazio");

            var pagamento = MapearParaModelo(pagamentoDto);

            await SimularProcessamentoPagamento(pagamento);

            await SalvarPagamentoNoFirebase(pagamento);

            return pagamento;
        }

        private void ValidarDadosPagamento(PagamentoDTO pagamentoDto)
        {
            if (pagamentoDto == null)
                throw new ArgumentNullException(nameof(pagamentoDto));

            if (string.IsNullOrEmpty(pagamentoDto.UsuarioId) ||
                string.IsNullOrEmpty(pagamentoDto.CarrinhoId))
                throw new ArgumentException("UsuárioID ou CarrinhoID inválidos");

            if (!_metodosPagamentoValidos.Contains(pagamentoDto.MetodoPagamento))
                throw new ArgumentException($"Método de pagamento inválido. Válidos: {string.Join(", ", _metodosPagamentoValidos)}");

            if (pagamentoDto.ValorTotal <= 0)
                throw new ArgumentException("Valor total deve ser maior que zero");
        }

        private Pagamento MapearParaModelo(PagamentoDTO pagamentoDto)
        {
            return new Pagamento
            {
                Id = Guid.NewGuid().ToString(),
                UsuarioId = pagamentoDto.UsuarioId,
                CarrinhoId = pagamentoDto.CarrinhoId,
                ValorTotal = pagamentoDto.ValorTotal,
                MetodoPagamento = pagamentoDto.MetodoPagamento,
                Dados = new DadosPagamento
                {
                    NumeroCartao = pagamentoDto.MetodoPagamento == "cartao" ? pagamentoDto.Dados.NumeroCartao : null,
                    NomeCartao = pagamentoDto.MetodoPagamento == "cartao" ? pagamentoDto.Dados.NomeCartao : null,
                    Validade = pagamentoDto.MetodoPagamento == "cartao" ? pagamentoDto.Dados.Validade : null,
                    CVV = pagamentoDto.MetodoPagamento == "cartao" ? pagamentoDto.Dados.CVV : null,
                    CPF = pagamentoDto.MetodoPagamento == "cartao" ? pagamentoDto.Dados.CPF : null,
                    Parcelas = pagamentoDto.MetodoPagamento == "cartao" ? pagamentoDto.Dados.Parcelas : 0,
                    ChavePix = pagamentoDto.MetodoPagamento == "pix" ? pagamentoDto.Dados.ChavePix : null,
                    CodigoBoleto = pagamentoDto.MetodoPagamento == "boleto" ? pagamentoDto.Dados.CodigoBoleto : null,
                    DataVencimento = pagamentoDto.MetodoPagamento == "boleto" ? pagamentoDto.Dados.DataVencimento : null
                },
                Status = "pendente"
            };
        }

        private async Task SimularProcessamentoPagamento(Pagamento pagamento)
        {
            await Task.Delay(1500);

            var random = new Random();
            var sucesso = random.Next(0, 100) < 80;

            pagamento.Status = sucesso ? "aprovado" : "recusado";
            pagamento.DataAtualizacao = DateTime.UtcNow;

            if (pagamento.MetodoPagamento == "pix")
            {
                pagamento.Dados.ChavePix = $"PIX-{Guid.NewGuid().ToString().Substring(0, 8)}";
            }
            else if (pagamento.MetodoPagamento == "boleto")
            {
                pagamento.Dados.CodigoBoleto = $"34191.11111 11111.111111 11111.111111 1 9999{DateTime.Now:MMdd}";
                pagamento.Dados.DataVencimento = DateTime.UtcNow.AddDays(2);
            }
        }

        private async Task SalvarPagamentoNoFirebase(Pagamento pagamento)
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
                throw new Exception("Erro ao salvar pagamento no Firebase", ex);
            }
        }

        public async Task<Pagamento> ObterPagamentoAsync(string pagamentoId)
        {
            if (string.IsNullOrWhiteSpace(pagamentoId))
                throw new ArgumentException("ID do pagamento não pode ser nulo ou vazio", nameof(pagamentoId));

            try
            {
                return await _firebase
                    .Child("pagamentos")
                    .Child(pagamentoId)
                    .OnceSingleAsync<Pagamento>();
            }
            catch (FirebaseException ex)
            {
                throw new Exception($"Erro ao acessar Firebase: {ex.Message}", ex);
            }
        }

        public async Task<Pagamento> AtualizarStatusPagamentoAsync(string pagamentoId, string status)
        {
            if (string.IsNullOrWhiteSpace(pagamentoId))
                throw new ArgumentException("ID do pagamento não pode ser nulo ou vazio", nameof(pagamentoId));

            if (string.IsNullOrWhiteSpace(status))
                throw new ArgumentException("Status não pode ser nulo ou vazio", nameof(status));

            var pagamento = await ObterPagamentoAsync(pagamentoId);
            if (pagamento == null)
                throw new KeyNotFoundException($"Pagamento com ID {pagamentoId} não encontrado");

            pagamento.Status = status;
            pagamento.DataAtualizacao = DateTime.UtcNow;

            await SalvarPagamentoNoFirebase(pagamento);

            return pagamento;
        }
    }
}