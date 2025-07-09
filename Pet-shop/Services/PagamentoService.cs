using Firebase.Database;
using Firebase.Database.Query;
using Pet_shop.DTOs;
using Pet_shop.Models;

namespace Pet_shop.Services
{
    public class PagamentoService : IPagamentoService
    {
        private readonly FirebaseClient _firebase;
        private readonly CarrinhoService _carrinhoService;

        public PagamentoService(IConfiguration configuration, CarrinhoService carrinhoService)
        {
            var databaseUrl = configuration["Firebase:DatabaseUrl"];
            _firebase = new FirebaseClient(databaseUrl);
            _carrinhoService = carrinhoService;
        }

        public async Task<Pagamento> ProcessarPagamentoAsync(PagamentoDTO pagamentoDto)
        {
            // Validar carrinho
            var carrinho = await _carrinhoService.ObterCarrinhoAsync(pagamentoDto.UsuarioId);
            if (carrinho == null || !carrinho.Itens.Any())
                throw new Exception("Carrinho inválido ou vazio");

            // Calcular valor total (já vem do front-end, mas podemos validar)
            // var valorTotal = CalcularTotalCarrinho(carrinho);

            // Criar pagamento
            var pagamento = new Pagamento
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
                    Parcelas = pagamentoDto.MetodoPagamento == "cartao" ? pagamentoDto.Dados.Parcelas : 0
                },
                Status = "pendente"
            };

            // Simular processamento do pagamento
            await SimularProcessamentoPagamento(pagamento);

            // Salvar no Firebase
            await _firebase
                .Child("pagamentos")
                .Child(pagamento.Id)
                .PutAsync(pagamento);

            return pagamento;
        }

        private async Task SimularProcessamentoPagamento(Pagamento pagamento)
        {
            // Simular tempo de processamento
            await Task.Delay(1500);

            // Simular resultado aleatório (80% de chance de sucesso)
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

        public async Task<Pagamento> ObterPagamentoAsync(string pagamentoId)
        {
            if (string.IsNullOrWhiteSpace(pagamentoId))
                throw new ArgumentException("ID do pagamento não pode ser nulo ou vazio", nameof(pagamentoId));

            try
            {
                var result = await _firebase
                    .Child("pagamentos")
                    .Child(pagamentoId)
                    .OnceSingleAsync<Pagamento>();

                return result;
            }
            catch (FirebaseException firebaseEx)
            {
                // Logar o erro específico do Firebase
                Console.WriteLine($"Erro ao acessar Firebase: {firebaseEx.Message}");
                return null;
            }
            catch (Exception ex)
            {
                // Logar outros erros
                Console.WriteLine($"Erro geral: {ex.Message}");
                return null;
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

            try
            {
                await _firebase
                    .Child("pagamentos")
                    .Child(pagamentoId)
                    .PutAsync(pagamento);

                return pagamento;
            }
            catch (FirebaseException firebaseEx)
            {
                throw new Exception($"Falha ao atualizar pagamento no Firebase: {firebaseEx.Message}", firebaseEx);
            }
        }
    }
}
