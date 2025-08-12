using Microsoft.AspNetCore.Mvc;
using Pet_shop.DTOs;
using Pet_shop.Services;

[Route("api/[controller]")]
[ApiController]
public class ProdutosController : ControllerBase
{
    private readonly ProdutoService _produtoService;
    private readonly CurtidaService _curtidaService;

    /// <summary>
    /// Construtor do ProdutosController
    /// </summary>
    public ProdutosController(ProdutoService produtoService, CurtidaService curtidaService)
    {
        _produtoService = produtoService;
        _curtidaService = curtidaService;
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
    [HttpGet("destaques")]
    public async Task<IActionResult> GetProdutosEmDestaque()
    {
        var produtos = await _produtoService.ObterProdutosEmDestaqueAsync();
        return Ok(produtos);
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

    [HttpDelete("{id}")]
    public async Task<IActionResult> ExcluirProduto(string id)
    {
        try
        {
            var produtoExcluido = await _produtoService.ExcluirProdutoAsync(id);

            if (produtoExcluido == null)
                return NotFound("Produto não encontrado");

            return Ok(new { mensagem = "Produto excluído com sucesso!" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Erro ao excluir produto: {ex.Message}");
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> AtualizarProduto(string id, [FromBody] ProdutoDTO produtoDto)
    {
        try
        {
            // Garante que as listas nunca sejam nulas
            produtoDto.ImagensUrl ??= new List<string>();
            produtoDto.Tamanhos ??= new List<TamanhoPrecoDTO>();

            // Validação manual básica
            if (string.IsNullOrEmpty(produtoDto.Nome))
                return BadRequest("Nome do produto é obrigatório");

            if (string.IsNullOrEmpty(produtoDto.Categoria))
                return BadRequest("Categoria é obrigatória");

            var produtoAtualizado = await _produtoService.AtualizarProdutoAsync(id, produtoDto);

            return Ok(new
            {
                mensagem = "Produto atualizado com sucesso!",
                produto = produtoAtualizado
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Erro ao atualizar produto: {ex.Message}");
        }
    }


}

