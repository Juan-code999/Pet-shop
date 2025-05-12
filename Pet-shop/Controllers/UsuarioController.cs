using Microsoft.AspNetCore.Mvc;
using Pet_shop.DTOs;
using Pet_shop.Services;

namespace Pet_shop.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsuarioController : ControllerBase
    {
        private readonly UsuarioService _usuarioService;

        public UsuarioController(UsuarioService usuarioService)
        {
            _usuarioService = usuarioService;
        }

        // POST: api/Usuario
        [HttpPost]
        public async Task<IActionResult> SalvarUsuario([FromBody] UsuarioDTO usuarioDTO)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var id = await _usuarioService.SalvarUsuarioAsync(usuarioDTO);

            if (id == null)
                return StatusCode(500, "Erro ao salvar usuário");

            return Ok(new { id = id, usuario = usuarioDTO });
        }



        // PUT: api/Usuario/5
        [HttpPut("{id}")]
        public async Task<IActionResult> AtualizarUsuario(string id, [FromBody] UsuarioDTO usuarioDTO)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var usuarioAtualizado = await _usuarioService.AtualizarUsuarioAsync(id, usuarioDTO);
            if (!usuarioAtualizado)
                return NotFound();

            return NoContent();
        }

        // GET: api/Usuario/5
        [HttpGet("{id}")]
        public async Task<IActionResult> BuscarUsuarioPorId(string id)
        {
            var usuario = await _usuarioService.BuscarUsuarioPorIdAsync(id);
            if (usuario == null)
                return NotFound();

            return Ok(usuario);
        }

        // GET: api/Usuario/email
        [HttpGet("email/{email}")]
        public async Task<IActionResult> BuscarUsuarioPorEmail(string email)
        {
            var usuario = await _usuarioService.BuscarUsuarioPorEmailAsync(email);
            if (usuario == null)
                return NotFound();

            return Ok(usuario);
        }

        // GET: api/Usuario
        [HttpGet]
        public async Task<IActionResult> ListarUsuarios()
        {
            var usuarios = await _usuarioService.ListarUsuariosAsync();
            return Ok(usuarios);
        }

        // DELETE: api/Usuario/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletarUsuario(string id)
        {
            var deletado = await _usuarioService.DeletarUsuarioAsync(id);
            if (!deletado)
                return NotFound();

            return NoContent();
        }

        // POST: api/Usuario/promover
        [HttpPost("promover")]
        public async Task<IActionResult> PromoverUsuario([FromBody] string email)
        {
            var promovido = await _usuarioService.PromoverUsuarioParaAdminAsync(email);
            if (!promovido)
                return NotFound();

            return NoContent();
        }


    }
}
