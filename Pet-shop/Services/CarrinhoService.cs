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

        public async Task<CarrinhoDTO> ObterCarrinhoAsync(string usuarioId)
        {
            return await _firebase
                .Child("carrinhos")
                .Child(usuarioId)
                .OnceSingleAsync<CarrinhoDTO>();
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
    }
}
