using Microsoft.AspNetCore.Mvc;
using Pet_shop.DTOs;
using Pet_shop.Services;

[ApiController]
[Route("api/[controller]")]
public class ProdutosController : ControllerBase
{
    private readonly CurtidaService _curtidaService;
    private readonly ProdutoService _produtoService;

    public ProdutosController(ProdutoService produtoService)
    {
        _produtoService = produtoService;
    }

    [HttpPost]
    public async Task<IActionResult> CadastrarProduto([FromBody] ProdutoDTO produto)
    {
        if (produto == null)
            return BadRequest("Produto inválido.");

        var produtoSalvo = await _produtoService.AdicionarProdutoAsync(produto);

        return Ok(new { mensagem = "Produto cadastrado com sucesso!", produto = produtoSalvo });
    }


    [HttpGet]
    public async Task<IActionResult> ListarProdutos()
    {
        var produtos = await _produtoService.ListarProdutosAsync();
        return Ok(produtos);
    }
    [HttpGet("{id}")]
    public async Task<IActionResult> GetProdutoPorId(string id)
    {
        var produto = await _produtoService.BuscarPorId(id);
        if (produto == null)
            return NotFound();
        return Ok(produto);
    }

    [HttpGet("usuario/{usuarioId}")]
    public async Task<IActionResult> GetCurtidos(string usuarioId)
    {
        var idsCurtidos = await _curtidaService.ObterProdutosCurtidosAsync(usuarioId);
        var todosProdutos = await _produtoService.ObterTodosAsync();

        var produtosCurtidos = todosProdutos
            .Where(p => idsCurtidos.Contains(p.Id))
            .ToList();

        return Ok(produtosCurtidos);
    }


}

