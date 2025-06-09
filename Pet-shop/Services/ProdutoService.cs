using Firebase.Database;
using Firebase.Database.Query;
using Pet_shop.DTOs;
using Pet_shop.Models;

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

    public async Task<Produto> AdicionarProdutoAsync(ProdutoDTO produtoDto)
    {
        var post = await _firebase
            .Child("produtos")
            .PostAsync(produtoDto);

        var produto = new Produto
        {
            Id = post.Key,
            Nome = produtoDto.Nome,
            Descricao = produtoDto.Descricao,
            Preco = produtoDto.Preco,
            Categoria = produtoDto.Categoria,
            ImagensUrl = produtoDto.ImagensUrl  // lista
        };

        
        await _firebase
            .Child("produtos")
            .Child(post.Key)
            .PutAsync(produto);

        return produto;
    }



    public async Task<List<Produto>> ListarProdutosAsync()
    {
        var produtos = await _firebase
            .Child("produtos")
            .OnceAsync<ProdutoDTO>();

        return produtos.Select(p => new Produto
        {
            Id = p.Key,
            Nome = p.Object.Nome,
            Descricao = p.Object.Descricao,
            Preco = p.Object.Preco,
            Categoria = p.Object.Categoria,
            ImagensUrl = p.Object.ImagensUrl
        }).ToList();
    }

    public async Task<Produto?> BuscarPorId(string id)
    {
        var produto = await _firebase
            .Child("produtos")
            .Child(id)
            .OnceSingleAsync<Produto>();

        return produto;
    }
}

