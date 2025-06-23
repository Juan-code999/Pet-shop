using Microsoft.AspNetCore.Mvc;
using Pet_shop.Services;

namespace Pet_shop.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CurtidaController : ControllerBase
    {
        private readonly CurtidaService _curtidaService;
        private readonly ProdutoService _produtoService;

        public CurtidaController(CurtidaService curtidaService, ProdutoService produtoService)
        {
            _curtidaService = curtidaService;
            _produtoService = produtoService;
        }

        // POST api/curtida/{usuarioId}/{produtoId}
        [HttpPost("{usuarioId}/{produtoId}")]
        public async Task<IActionResult> CurtirProduto(string usuarioId, string produtoId)
        {
            await _curtidaService.AdicionarCurtidaAsync(usuarioId, produtoId);
            return Ok(new { message = "Produto curtido com sucesso." });
        }

        // DELETE api/curtida/{usuarioId}/{produtoId}
        [HttpDelete("{usuarioId}/{produtoId}")]
        public async Task<IActionResult> DescurtirProduto(string usuarioId, string produtoId)
        {
            await _curtidaService.RemoverCurtidaAsync(usuarioId, produtoId);
            return Ok(new { message = "Curtida removida com sucesso." });
        }

        // GET api/curtida/usuario/{usuarioId}
        [HttpGet("usuario/{usuarioId}")]
        public async Task<IActionResult> GetProdutosCurtidos(string usuarioId)
        {
            var idsCurtidos = await _curtidaService.ObterProdutosCurtidosAsync(usuarioId);
            var todosProdutos = await _produtoService.ObterTodosAsync();

            var produtosCurtidos = todosProdutos
                .Where(p => idsCurtidos.Contains(p.Id))
                .ToList();

            return Ok(produtosCurtidos);
        }

        // Opcional: verifica se o usuário curtiu um produto específico
        // GET api/curtida/usuario/{usuarioId}/produto/{produtoId}
        [HttpGet("usuario/{usuarioId}/produto/{produtoId}")]
        public async Task<IActionResult> VerificarCurtida(string usuarioId, string produtoId)
        {
            bool curtiu = await _curtidaService.UsuarioCurtiuProdutoAsync(usuarioId, produtoId);
            return Ok(new { curtiu });
        }
    }
}
