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
    }
}
