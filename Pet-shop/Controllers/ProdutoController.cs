using Microsoft.AspNetCore.Mvc;
using Pet_shop.DTOs;
using Pet_shop.Services;

namespace Pet_shop.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class ProdutoController : ControllerBase
    {
        private readonly ProdutoService _firebaseService;

        public ProdutoController(ProdutoService firebaseService)
        {
            _firebaseService = firebaseService;
        }

        [HttpPost]
        public async Task<IActionResult> Criar([FromBody] ProdutoDTO dto)
        {
            if (dto == null) return BadRequest("Dados inválidos");
            var id = await _firebaseService.CriarProdutoAsync(dto);
            return Ok(new { Message = "Produto criado", ProdutoId = id });
        }

        [HttpGet("listar")]
        public async Task<IActionResult> Listar()
        {
            var produtos = await _firebaseService.ListarTodosAsync();
            return Ok(produtos);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Buscar(string id)
        {
            var produto = await _firebaseService.BuscarPorIdAsync(id);
            if (produto == null) return NotFound("Produto não encontrado");
            return Ok(produto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Atualizar(string id, [FromBody] ProdutoDTO dto)
        {
            var sucesso = await _firebaseService.AtualizarAsync(id, dto);
            if (!sucesso) return NotFound("Produto não encontrado");
            return Ok("Produto atualizado com sucesso");
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Deletar(string id)
        {
            var sucesso = await _firebaseService.RemoverAsync(id);
            if (!sucesso) return NotFound("Produto não encontrado");
            return Ok("Produto removido com sucesso");
        }
    }
}
