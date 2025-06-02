using Microsoft.AspNetCore.Mvc;
using Pet_shop.Models;
using Pet_shop.Services;
using System.Collections.Generic;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
public class ProdutoController : ControllerBase
{
    private readonly ProdutoService _produtoService;

    public ProdutoController(ProdutoService produtoService)
    {
        _produtoService = produtoService;
    }

    [HttpGet]
    public async Task<ActionResult<List<Produto>>> Get()
    {
        var produtos = await _produtoService.BuscarTodosProdutosAsync();
        return Ok(produtos);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Produto>> Get(string id)
    {
        var produto = await _produtoService.BuscarProdutoPorIdAsync(id);
        if (produto == null) return NotFound();
        return Ok(produto);
    }

    [HttpPost]
    public async Task<ActionResult> Post([FromBody] Produto produto)
    {
        var key = await _produtoService.SalvarProdutoAsync(produto);
        return CreatedAtAction(nameof(Get), new { id = key }, produto);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> Put(string id, [FromBody] Produto produto)
    {
        await _produtoService.AtualizarProdutoAsync(id, produto);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(string id)
    {
        await _produtoService.DeletarProdutoAsync(id);
        return NoContent();
    }
}
