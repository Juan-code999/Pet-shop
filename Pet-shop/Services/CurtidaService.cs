using Firebase.Database;
using Firebase.Database.Query;

namespace Pet_shop.Services
{
    public class CurtidaService
    {
        private readonly FirebaseClient _firebase;

        public CurtidaService(IConfiguration configuration)
        {
            _firebase = new FirebaseClient(configuration["Firebase:DatabaseUrl"]);
        }

        // Salva uma curtida (associa produto ao usuário)
        public async Task AdicionarCurtidaAsync(string usuarioId, string produtoId)
        {
            // Grava o produtoId sob o usuárioId no nó "curtidas"
            await _firebase
                .Child("curtidas")
                .Child(usuarioId)
                .Child(produtoId)
                .PutAsync(true); // só precisa salvar true para indicar curtida
        }

        // Remove uma curtida
        public async Task RemoverCurtidaAsync(string usuarioId, string produtoId)
        {
            await _firebase
                .Child("curtidas")
                .Child(usuarioId)
                .Child(produtoId)
                .DeleteAsync();
        }

        // Retorna lista de Ids de produtos curtidos pelo usuário
        public async Task<List<string>> ObterProdutosCurtidosAsync(string usuarioId)
        {
            var snapshot = await _firebase
                .Child("curtidas")
                .Child(usuarioId)
                .OnceAsync<bool>();

            // snapshot tem uma lista de itens com Key = produtoId, Object = true
            return snapshot.Select(x => x.Key).ToList();
        }

        // Opcional: verifica se usuário curtiu determinado produto
        public async Task<bool> UsuarioCurtiuProdutoAsync(string usuarioId, string produtoId)
        {
            var curtida = await _firebase
                .Child("curtidas")
                .Child(usuarioId)
                .Child(produtoId)
                .OnceSingleAsync<bool?>();

            return curtida == true;
        }
    }
}
