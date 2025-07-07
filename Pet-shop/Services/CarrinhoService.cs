using Firebase.Database;
using Firebase.Database.Query;
using Pet_shop.DTOs;

namespace Pet_shop.Services
{
    public class CarrinhoService
    {
        private readonly FirebaseClient _firebase;

        public CarrinhoService(IConfiguration configuration)
        {
            var databaseUrl = configuration["Firebase:DatabaseUrl"];
            _firebase = new FirebaseClient(databaseUrl);
        }

        public async Task AdicionarItemAsync(string usuarioId, ItemCarrinhoDTO novoItem)
        {
            var carrinho = await ObterCarrinhoAsync(usuarioId) ?? new CarrinhoDTO
            {
                UsuarioId = usuarioId,
                Itens = new List<ItemCarrinhoDTO>()
            };

            var itemExistente = carrinho.Itens.FirstOrDefault(i =>
                i.ProdutoId == novoItem.ProdutoId && i.Tamanho == novoItem.Tamanho);

            if (itemExistente != null)
                itemExistente.Quantidade += novoItem.Quantidade;
            else
                carrinho.Itens.Add(novoItem);

            carrinho.DataAtualizacao = DateTime.UtcNow;

            await _firebase
                .Child("carrinhos")
                .Child(usuarioId)
                .PutAsync(carrinho);
        }

        public async Task<CarrinhoDTO> ObterCarrinhoAsync(string usuarioId)
        {
            try
            {
                return await _firebase
                    .Child("carrinhos")
                    .Child(usuarioId)
                    .OnceSingleAsync<CarrinhoDTO>();
            }
            catch
            {
                return null;
            }
        }

        public async Task RemoverItemAsync(string usuarioId, string produtoId, string tamanho)
        {
            var carrinho = await ObterCarrinhoAsync(usuarioId);
            if (carrinho == null) return;

            carrinho.Itens.RemoveAll(i => i.ProdutoId == produtoId && i.Tamanho == tamanho);
            carrinho.DataAtualizacao = DateTime.UtcNow;

            await _firebase
                .Child("carrinhos")
                .Child(usuarioId)
                .PutAsync(carrinho);
        }

        public async Task AtualizarQuantidadeAsync(string usuarioId, string produtoId, string tamanho, int novaQuantidade)
        {
            if (novaQuantidade <= 0)
            {
                await RemoverItemAsync(usuarioId, produtoId, tamanho);
                return;
            }

            var carrinho = await ObterCarrinhoAsync(usuarioId);
            if (carrinho == null) return;

            var item = carrinho.Itens.FirstOrDefault(i => i.ProdutoId == produtoId && i.Tamanho == tamanho);
            if (item != null)
            {
                item.Quantidade = novaQuantidade;
                carrinho.DataAtualizacao = DateTime.UtcNow;

                await _firebase
                    .Child("carrinhos")
                    .Child(usuarioId)
                    .PutAsync(carrinho);
            }
        }

        public async Task LimparCarrinhoAsync(string usuarioId)
        {
            await _firebase
                .Child("carrinhos")
                .Child(usuarioId)
                .DeleteAsync();
        }
    }
}