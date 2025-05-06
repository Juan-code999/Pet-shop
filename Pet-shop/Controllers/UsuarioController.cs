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

        [HttpPost]
        public async Task<IActionResult> CriarUsuario([FromBody] UsuarioDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = await _usuarioService.SalvarUsuarioAsync(dto);
            return Ok(new { Success = true, Message = "Usuário criado com sucesso!", UserId = userId });
        }

        [HttpPut("promover/{email}")]
        public async Task<IActionResult> PromoverParaAdmin(string email)
        {
            var sucesso = await _usuarioService.PromoverUsuarioParaAdminAsync(email);
            return sucesso
                ? Ok(new { Success = true, Message = "Usuário promovido para admin com sucesso." })
                : NotFound(new { Success = false, Message = "Usuário não encontrado." });
        }

        [HttpGet("buscar/{email}")]
        public async Task<IActionResult> BuscarUsuario(string email)
        {
            var usuario = await _usuarioService.BuscarUsuarioPorEmailAsync(email);
            return usuario != null
                ? Ok(new { Success = true, Data = usuario })
                : NotFound(new { Success = false, Message = "Usuário não encontrado." });
        }

        [HttpGet("listar")]
        public async Task<IActionResult> ListarUsuarios()
        {
            var usuarios = await _usuarioService.ListarUsuariosAsync();
            return usuarios.Any()
                ? Ok(new { Success = true, Data = usuarios })
                : NotFound(new { Success = false, Message = "Nenhum usuário encontrado." });

        }

        [HttpGet("{id}")]
        public async Task<IActionResult> ObterUsuarioPorId(string id)
        {
            var usuario = await _usuarioService.BuscarUsuarioPorIdAsync(id);
            if (usuario == null)
                return NotFound(new { Success = false, Message = "Usuário não encontrado." });

            return Ok(usuario); // Aqui ele deve retornar { Nome, Email, IsAdmin, etc. }
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> AtualizarUsuario(string id, [FromBody] UsuarioDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var sucesso = await _usuarioService.AtualizarUsuarioAsync(id, dto);
            return sucesso
                ? Ok(new { Success = true, Message = "Usuário atualizado com sucesso." })
                : NotFound(new { Success = false, Message = "Usuário não encontrado." });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletarUsuario(string id)
        {
            var sucesso = await _usuarioService.DeletarUsuarioAsync(id);
            return sucesso
                ? Ok(new { Success = true, Message = "Usuário removido com sucesso." })
                : NotFound(new { Success = false, Message = "Usuário não encontrado." });
        }
    }
}
