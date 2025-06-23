using Microsoft.AspNetCore.Mvc;
using Pet_shop.DTOs;
using Pet_shop.Services;

namespace Pet_shop.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CarrinhoController : ControllerBase
    {
        private readonly CarrinhoService _carrinhoService;

        public CarrinhoController(CarrinhoService carrinhoService)
        {
            _carrinhoService = carrinhoService;
        }

        // POST: api/Carrinho/{usuarioId}
        [HttpPost("{usuarioId}")]
        public async Task<IActionResult> SalvarCarrinho(string usuarioId, [FromBody] CarrinhoDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (dto == null || dto.Itens == null || dto.Itens.Count == 0)
                return BadRequest("Carrinho vazio ou inválido.");

            if (usuarioId != dto.UsuarioId)
                return BadRequest("ID do usuário não corresponde.");

            await _carrinhoService.SalvarCarrinhoAsync(usuarioId, dto);

            return Ok(new { mensagem = "Carrinho salvo com sucesso." });
        }

        // GET: api/Carrinho/{usuarioId}
        [HttpGet("{usuarioId}")]
        public async Task<IActionResult> ObterCarrinho(string usuarioId)
        {
            if (string.IsNullOrWhiteSpace(usuarioId))
                return BadRequest("ID do usuário é obrigatório.");

            var carrinho = await _carrinhoService.ObterCarrinhoAsync(usuarioId);

            if (carrinho == null || carrinho.Itens == null || carrinho.Itens.Count == 0)
                return NotFound("Carrinho não encontrado ou vazio.");

            return Ok(carrinho);
        }
    }
}
