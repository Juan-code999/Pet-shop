using Microsoft.AspNetCore.Mvc;
using Pet_shop.DTOs;
using Pet_shop.Services;

namespace Pet_shop.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ContatoController : ControllerBase
    {
        private readonly ContatoService _contatoService;

        public ContatoController(ContatoService contatoService)
        {
            _contatoService = contatoService;
        }

        [HttpPost("mensagem")]
        public async Task<IActionResult> EnviarMensagem([FromBody] ContatoDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var id = await _contatoService.SalvarContatoAsync(dto);

            return Ok(new { id, message = "Mensagem enviada com sucesso!" });
        }

        [HttpGet("todos")]
        public async Task<IActionResult> ObterTodosContatos()
        {
            var contatos = await _contatoService.BuscarTodosContatosAsync();
            return Ok(contatos);
        }


        [HttpPost("newsletter")]
        public async Task<IActionResult> AssinarNewsletter([FromBody] NewsletterDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var id = await _contatoService.SalvarNewsletterAsync(dto);
            if (id == null)
                return Conflict(new { message = "Email já cadastrado!" });

            return Ok(new { id, message = "Assinatura realizada com sucesso!" });
        }

        [HttpDelete("mensagem/{id}")]
        public async Task<IActionResult> DeletarMensagem(string id)
        {
            try
            {
                var result = await _contatoService.DeletarContatoAsync(id);
                if (!result)
                    return NotFound(new { message = "Mensagem não encontrada" });

                return Ok(new { message = "Mensagem deletada com sucesso" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro ao deletar mensagem", error = ex.Message });
            }
        }

        [HttpDelete("newsletter/{id}")]
        public async Task<IActionResult> DeletarInscricao(string id)
        {
            try
            {
                var result = await _contatoService.DeletarNewsletterAsync(id);
                if (!result)
                    return NotFound(new { message = "Inscrição não encontrada" });

                return Ok(new { message = "Inscrição removida com sucesso" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro ao remover inscrição", error = ex.Message });
            }
        }

        [HttpGet("newsletters")]
        public async Task<IActionResult> ObterTodasNewsletters()
        {
            var newsletters = await _contatoService.BuscarTodasNewslettersAsync();
            return Ok(newsletters);
        }
    }
}
