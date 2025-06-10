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
        // Criação do objeto Produto com todos os campos
        var produto = new Produto
        {
            Nome = produtoDto.Nome,
            Descricao = produtoDto.Descricao,
            Categoria = produtoDto.Categoria,
            EspecieAnimal = produtoDto.EspecieAnimal,
            Marca = produtoDto.Marca,
            ImagensUrl = produtoDto.ImagensUrl,
            Tamanhos = produtoDto.Tamanhos?.Select(t => new TamanhoPreco
            {
                Tamanho = t.Tamanho,
                PrecoPorKg = t.PrecoPorKg,
                PrecoTotal = t.PrecoTotal
            }).ToList(),
            IdadeRecomendada = produtoDto.IdadeRecomendada,
            PorteAnimal = produtoDto.PorteAnimal,
            Destaque = produtoDto.Destaque,
            Desconto = produtoDto.Desconto,
            Disponivel = produtoDto.Disponivel,
            DataCadastro = DateTime.UtcNow
        };

        // Salva no Firebase e obtém a Key
        var post = await _firebase
            .Child("produtos")
            .PostAsync(produto);

        // Atribui o Id gerado (key do Firebase)
        produto.Id = post.Key;

        // Atualiza o mesmo produto já com o ID
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
            .OnceAsync<Produto>();

        return produtos.Select(p => {
            var produto = p.Object;
            produto.Id = p.Key;
            return produto;
        }).ToList();
    }


    public async Task<Produto?> BuscarPorId(string id)
    {
        var produto = await _firebase
            .Child("produtos")
            .Child(id)
            .OnceSingleAsync<Produto>();
        produto.Id = id;
        return produto;
    }

}

