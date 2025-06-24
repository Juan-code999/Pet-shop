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

        // POST: api/Carrinho/{usuarioId}/adicionar
        [HttpPost("{usuarioId}/adicionar")]
        public async Task<IActionResult> AdicionarItem(string usuarioId, [FromBody] ItemCarrinhoDTO item)
        {
            if (string.IsNullOrWhiteSpace(usuarioId) || item == null)
                return BadRequest("Dados inválidos.");

            if (item.Quantidade <= 0)
                return BadRequest("A quantidade deve ser maior que zero.");

            await _carrinhoService.AdicionarItemAsync(usuarioId, item);
            return Ok(new { mensagem = "Item adicionado ao carrinho." });
        }
    }
}
