using Microsoft.AspNetCore.Mvc;
using Pet_shop.DTOs;
using Pet_shop.Services;

[Route("api/[controller]")]
[ApiController]
public class ProdutosController : ControllerBase
{
    private readonly CloudinaryService _cloudinaryService;
    private readonly ProdutoService _produtoService;

    public ProdutosController(CloudinaryService cloudinaryService, ProdutoService produtoService)
    {
        _cloudinaryService = cloudinaryService;
        _produtoService = produtoService;
    }

    [HttpPost]
    public async Task<IActionResult> CadastrarProduto([FromForm] ProdutoDTO produto, IFormFile imagem)
    {
        if (produto == null)
            return BadRequest("Produto é null");

        if (imagem == null || imagem.Length == 0)
            return BadRequest("Imagem inválida ou não enviada");

        // Opcional: Logue dados recebidos para debug
        Console.WriteLine($"Nome: {produto.Nome}");
        Console.WriteLine($"Descrição: {produto.Descricao}");
        Console.WriteLine($"Preço: {produto.Preco}");
        Console.WriteLine($"Categoria: {produto.Categoria}");

        var urlImagem = await _cloudinaryService.UploadImagemAsync(imagem);
        produto.ImagemUrl = urlImagem;

        await _produtoService.AdicionarProdutoAsync(produto);

        return Ok(new { mensagem = "Produto cadastrado com sucesso!", produto });
    }


    [HttpGet]
    public async Task<IActionResult> ListarProdutos()
    {
        var produtos = await _produtoService.ObterProdutosAsync();
        return Ok(produtos);
    }
}
