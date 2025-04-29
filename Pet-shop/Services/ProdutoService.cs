using Firebase.Database;
using Firebase.Database.Query;
using Pet_shop.DTOs;
using Pet_shop.Models;

namespace Pet_shop.Services
{
    public class ProdutoService
    {
        private readonly FirebaseClient _firebase;

        public ProdutoService(IConfiguration configuration)
        {
            var url = configuration["Firebase:DatabaseUrl"];
            _firebase = new FirebaseClient(url);
        }

        public async Task<string> CriarProdutoAsync(ProdutoDTO dto)
        {
            var produto = new Produto
            {
                Nome = dto.Nome,
                Descricao = dto.Descricao,
                Preco = dto.Preco,
                Estoque = dto.Estoque
            };

            var novoRef = await _firebase
                .Child("produtos")
                .PostAsync(produto);

            produto.Id = novoRef.Key;

            await _firebase
                .Child("produtos")
                .Child(produto.Id)
                .PutAsync(produto);

            return produto.Id;
        }

        public async Task<List<Produto>> ListarTodosAsync()
        {
            var produtos = await _firebase.Child("produtos").OnceAsync<Produto>();
            return produtos.Select(p => p.Object).ToList();
        }

        public async Task<Produto> BuscarPorIdAsync(string id)
        {
            return await _firebase.Child("produtos").Child(id).OnceSingleAsync<Produto>();
        }

        public async Task<bool> AtualizarAsync(string id, ProdutoDTO dto)
        {
            var produto = await BuscarPorIdAsync(id);
            if (produto == null) return false;

            produto.Nome = dto.Nome;
            produto.Descricao = dto.Descricao;
            produto.Preco = dto.Preco;
            produto.Estoque = dto.Estoque;

            await _firebase.Child("produtos").Child(id).PutAsync(produto);
            return true;
        }

        public async Task<bool> RemoverAsync(string id)
        {
            var produto = await BuscarPorIdAsync(id);
            if (produto == null) return false;

            await _firebase.Child("produtos").Child(id).DeleteAsync();
            return true;
        }
    }
}

    

