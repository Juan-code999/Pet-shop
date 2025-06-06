using Firebase.Database;
using Firebase.Database.Query;
using Pet_shop.DTOs;

public class ProdutoService
{
    private readonly FirebaseClient _firebase;

    public ProdutoService(IConfiguration configuration)
    {
        _firebase = new FirebaseClient(
            configuration["Firebase:DatabaseUrl"],
            new FirebaseOptions
            {
                AuthTokenAsyncFactory = () => Task.FromResult(configuration["Firebase:Secret"])
            });
    }

    public async Task AdicionarProdutoAsync(ProdutoDTO produto)
    {
        await _firebase
            .Child("produtos")
            .PostAsync(produto);
    }

    public async Task<List<ProdutoDTO>> ListarProdutosAsync()
    {
        var produtos = await _firebase
            .Child("produtos")
            .OnceAsync<ProdutoDTO>();

        return produtos.Select(p => p.Object).ToList();
    }

    public async Task<ProdutoDTO?> BuscarPorId(string id)
    {
        var produto = await _firebase
            .Child("produtos")
            .Child(id)
            .OnceSingleAsync<ProdutoDTO>();

        return produto;
    }



}
