using Microsoft.AspNetCore.Mvc;
using Pet_shop.DTOs;
using Pet_shop.Services;

namespace Pet_shop.Controllers
{
    /// <summary>
    /// Controller para gerenciar operações do carrinho de compras
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class CarrinhoController : ControllerBase
    {
        private readonly CarrinhoService _carrinhoService;
        private readonly ProdutoService _produtoService;

        /// <summary>
        /// Construtor do CarrinhoController
        /// </summary>
        public CarrinhoController(CarrinhoService carrinhoService, ProdutoService produtoService)
        {
            _carrinhoService = carrinhoService;
            _produtoService = produtoService;
        }

        /// <summary>
        /// Obtém o carrinho de um usuário
        /// </summary>
        [HttpGet("{usuarioId}")]
        public async Task<IActionResult> ObterCarrinho(string usuarioId)
        {
            if (string.IsNullOrWhiteSpace(usuarioId))
                return BadRequest("Usuário inválido.");

            try
            {
                var carrinho = await _carrinhoService.ObterCarrinhoAsync(usuarioId);
                return Ok(carrinho ?? new CarrinhoDTO { UsuarioId = usuarioId });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao buscar carrinho: {ex.Message}");
            }
        }

        /// <summary>
        /// Adiciona um item ao carrinho
        /// </summary>
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

        /// <summary>
        /// Remove um item do carrinho
        /// </summary>
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

        /// <summary>
        /// Atualiza a quantidade de um item no carrinho
        /// </summary>
        [HttpPut("{usuarioId}/atualizar-quantidade")]
        public async Task<IActionResult> AtualizarQuantidade(string usuarioId, [FromBody] ItemCarrinhoDTO item)
        {
            if (string.IsNullOrWhiteSpace(usuarioId)) return BadRequest("Usuário inválido.");
            if (item == null) return BadRequest("Item inválido.");
            if (item.Quantidade <= 0) return BadRequest("A quantidade deve ser maior que zero.");

            try
            {
                await _carrinhoService.AtualizarQuantidadeAsync(usuarioId, item.ProdutoId, item.Tamanho, item.Quantidade);
                return Ok(new { mensagem = "Quantidade atualizada com sucesso." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao atualizar quantidade: {ex.Message}");
            }
        }

        /// <summary>
        /// Atualiza o tamanho de um item no carrinho
        /// </summary>
        [HttpPut("{usuarioId}/atualizar-tamanho")]
        public async Task<IActionResult> AtualizarTamanho(string usuarioId, [FromBody] AtualizarTamanhoDTO atualizarTamanhoDto)
        {
            if (string.IsNullOrWhiteSpace(usuarioId))
                return BadRequest("Usuário inválido.");

            if (atualizarTamanhoDto == null)
                return BadRequest("Dados inválidos.");

            if (string.IsNullOrWhiteSpace(atualizarTamanhoDto.TamanhoAtual) ||
                string.IsNullOrWhiteSpace(atualizarTamanhoDto.NovoTamanho))
                return BadRequest("Tamanhos inválidos.");

            try
            {
                var produto = await _produtoService.ObterProdutoPorIdAsync(atualizarTamanhoDto.ProdutoId);
                var novoTamanhoInfo = produto?.Tamanhos?.FirstOrDefault(t => t.Tamanho == atualizarTamanhoDto.NovoTamanho);

                if (novoTamanhoInfo == null)
                    return BadRequest("Tamanho não disponível para este produto");

                await _carrinhoService.AtualizarTamanhoAsync(
                    usuarioId,
                    atualizarTamanhoDto.ProdutoId,
                    atualizarTamanhoDto.TamanhoAtual,
                    atualizarTamanhoDto.NovoTamanho,
                    novoTamanhoInfo.PrecoTotal);

                return Ok(new
                {
                    mensagem = "Tamanho e preço atualizados com sucesso.",
                    novoPreco = novoTamanhoInfo.PrecoTotal
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao atualizar tamanho: {ex.Message}");
            }
        }

        /// <summary>
        /// Limpa todo o carrinho de um usuário
        /// </summary>
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