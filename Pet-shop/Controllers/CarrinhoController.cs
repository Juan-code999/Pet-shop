using Microsoft.AspNetCore.Mvc;
using Pet_shop.DTOs;
using Pet_shop.Models;
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

        // Adicionar ou atualizar um carrinho
        [HttpPost("adicionar-ou-atualizar")]
        public async Task<IActionResult> AdicionarOuAtualizar([FromBody] CarrinhoDTO dto)
        {
            if (dto == null)
                return BadRequest("Dados inválidos.");

            try
            {
                var carrinho = new Carrinho
                {
                    UsuarioId = dto.UsuarioId,
                    ProdutoId = dto.ProdutoId,
                    Quantidade = dto.Quantidade
                };

                var id = await _carrinhoService.AdicionarOuAtualizarCarrinhoAsync(carrinho);
                return Ok(new { Message = "Carrinho adicionado ou atualizado", CarrinhoId = id });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Erro interno no servidor", Error = ex.Message });
            }
        }

        // Listar todos os carrinhos de um usuário
        [HttpGet("listar/{usuarioId}")]
        public async Task<IActionResult> ListarCarrinhos(string usuarioId)
        {
            try
            {
                var carrinhos = await _carrinhoService.ListarCarrinhosAsync(usuarioId);
                return Ok(carrinhos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Erro interno no servidor", Error = ex.Message });
            }
        }
    }
}
