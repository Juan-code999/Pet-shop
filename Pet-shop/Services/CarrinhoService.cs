using Firebase.Database;
using Firebase.Database.Query;
using Pet_shop.Models;

namespace Pet_shop.Services
{
    public class CarrinhoService
    {
        private readonly FirebaseClient _firebase;

        public CarrinhoService(IConfiguration configuration)
        {
            var url = configuration["Firebase:DatabaseUrl"];
            _firebase = new FirebaseClient(url);
        }

        public async Task<string> AdicionarOuAtualizarCarrinhoAsync(Carrinho carrinho)
        {
            try
            {
                // Verifica se o carrinho já existe para o usuário
                var carrinhoExistente = await _firebase
                    .Child("carrinhos")
                    .OrderBy("UsuarioId")
                    .EqualTo(carrinho.UsuarioId)
                    .OnceAsync<Carrinho>();

                if (carrinhoExistente.Any())  // Se já existir carrinho
                {
                    // Atualiza o carrinho existente
                    var key = carrinhoExistente.First().Key;
                    await _firebase
                        .Child("carrinhos")
                        .Child(key)
                        .PutAsync(new
                        {
                            carrinho.UsuarioId,
                            carrinho.ProdutoId,
                            carrinho.Quantidade
                        });

                    return key; // Retorna o ID do carrinho atualizado
                }
                else  // Se não existir, cria um novo carrinho
                {
                    var novoCarrinho = await _firebase
                        .Child("carrinhos")
                        .PostAsync(new
                        {
                            carrinho.UsuarioId,
                            carrinho.ProdutoId,
                            carrinho.Quantidade
                        });

                    return novoCarrinho.Key; // Retorna o ID do novo carrinho
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao adicionar ou atualizar carrinho: {ex.Message}");
                throw new Exception("Erro interno ao processar o carrinho.", ex);
            }
        }

        public async Task<IEnumerable<Carrinho>> ListarCarrinhosAsync(string usuarioId)
        {
            try
            {
                var carrinhos = await _firebase
                    .Child("carrinhos")
                    .OrderBy("UsuarioId")
                    .EqualTo(usuarioId)
                    .OnceAsync<Carrinho>();

                return carrinhos.Select(c => new Carrinho
                {
                    Id = c.Key,
                    UsuarioId = c.Object.UsuarioId,
                    ProdutoId = c.Object.ProdutoId,
                    Quantidade = c.Object.Quantidade
                }).ToList();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao listar carrinhos: {ex.Message}");
                throw new Exception("Erro ao listar os carrinhos.", ex);
            }
        }

    }
}