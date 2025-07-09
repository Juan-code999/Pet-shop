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
        [HttpPost("{usuarioId}/adicionar")]
        public async Task<IActionResult> AdicionarItem(string usuarioId, [FromBody] ItemCarrinhoDTO item)
        {
            if (string.IsNullOrWhiteSpace(usuarioId)) return BadRequest("Usuário inválido.");
            if (item == null) return BadRequest("Item inválido.");
            if (item.Quantidade <= 0) return BadRequest("A quantidade deve ser maior que zero.");

            try
            {
                await _carrinhoService.AdicionarItemAsync(usuarioId, item);
                return Ok(new { mensagem = "Item adicionado ao carrinho." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao adicionar item: {ex.Message}");
            }
        }

        [HttpGet("{usuarioId}")]
        public async Task<IActionResult> ObterCarrinho(string usuarioId)
        {
            if (string.IsNullOrWhiteSpace(usuarioId))
                return BadRequest("Usuário inválido.");

            try
            {
                var carrinho = await _carrinhoService.ObterCarrinhoAsync(usuarioId);

                if (carrinho == null)
                {
                    carrinho = new CarrinhoDTO
                    {
                        UsuarioId = usuarioId,
                        Itens = new List<ItemCarrinhoDTO>(),
                        DataAtualizacao = DateTime.UtcNow
                    };
                }

                return Ok(carrinho);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao buscar carrinho: {ex.Message}");
            }
        }

        [HttpDelete("{usuarioId}/remover")]
        public async Task<IActionResult> RemoverItem(string usuarioId, [FromBody] ItemCarrinhoDTO item)
        {
            if (string.IsNullOrWhiteSpace(usuarioId)) return BadRequest("Usuário inválido.");
            if (item == null) return BadRequest("Item inválido.");

            try
            {
                await _carrinhoService.RemoverItemAsync(usuarioId, item.ProdutoId, item.Tamanho);
                return Ok(new { mensagem = "Item removido do carrinho." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao remover item: {ex.Message}");
            }
        }

        [HttpPut("{usuarioId}/atualizar-quantidade")]
        public async Task<IActionResult> AtualizarQuantidade(string usuarioId, [FromBody] ItemCarrinhoDTO item)
        {
            if (string.IsNullOrWhiteSpace(usuarioId)) return BadRequest("Usuário inválido.");
            if (item == null) return BadRequest("Item inválido.");
            if (item.Quantidade <= 0) return BadRequest("A quantidade deve ser maior que zero.");

            try
            {
                await _carrinhoService.AtualizarQuantidadeAsync(
                    usuarioId,
                    item.ProdutoId,
                    item.Tamanho,
                    item.Quantidade);

                return Ok(new { mensagem = "Quantidade atualizada com sucesso." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao atualizar quantidade: {ex.Message}");
            }
        }

        [HttpDelete("{usuarioId}/limpar")]
        public async Task<IActionResult> LimparCarrinho(string usuarioId)
        {
            if (string.IsNullOrWhiteSpace(usuarioId))
                return BadRequest("Usuário inválido.");

            try
            {
                await _carrinhoService.LimparCarrinhoAsync(usuarioId);
                return Ok(new { mensagem = "Carrinho limpo com sucesso." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao limpar carrinho: {ex.Message}");
            }
        }
    }
}