using Firebase.Database;
using Firebase.Database.Query;
using Pet_shop.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Pet_shop.Services
{
    public class ProdutoService
    {
        private readonly FirebaseClient _firebase;

        public ProdutoService(IConfiguration configuration)
        {
            _firebase = new FirebaseClient(configuration["Firebase:DatabaseUrl"]);
        }

        // Salvar produto
        public async Task<string> SalvarProdutoAsync(Produto produto)
        {
            var produtoRef = await _firebase.Child("produtos").PostAsync(produto);
            return produtoRef.Key;
        }

        // Buscar todos os produtos
        public async Task<List<Produto>> BuscarTodosProdutosAsync()
        {
            var produtosFirebase = await _firebase.Child("produtos").OnceAsync<Produto>();

            // Ajusta o Id para ser a Key do Firebase
            return produtosFirebase.Select(p =>
            {
                var produto = p.Object;
                produto.Id = p.Key;
                return produto;
            }).ToList();
        }

        // Buscar produto por id
        public async Task<Produto> BuscarProdutoPorIdAsync(string id)
        {
            var produto = await _firebase.Child("produtos").Child(id).OnceSingleAsync<Produto>();
            if (produto != null)
                produto.Id = id;
            return produto;
        }

        // Atualizar produto
        public async Task AtualizarProdutoAsync(string id, Produto produto)
        {
            await _firebase.Child("produtos").Child(id).PutAsync(produto);
        }

        // Deletar produto
        public async Task DeletarProdutoAsync(string id)
        {
            await _firebase.Child("produtos").Child(id).DeleteAsync();
        }
    }
}
