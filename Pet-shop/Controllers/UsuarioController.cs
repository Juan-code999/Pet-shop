using Microsoft.AspNetCore.Mvc;
using Pet_shop.DTOs;
using Pet_shop.Services;

namespace Pet_shop.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsuarioController : ControllerBase
    {
        private readonly UsuarioService _firebaseService;

        public UsuarioController(UsuarioService usuarioService)
        {
            _firebaseService = usuarioService;
        }

        [HttpPost]
        public async Task<IActionResult> CriarUsuario([FromBody] UsuarioDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = await _firebaseService.SalvarUsuarioAsync(dto);
            return Ok(new { Success = true, Message = "Usuário criado com sucesso!", UserId = userId });
        }

        [HttpPut("promover/{email}")]
        public async Task<IActionResult> PromoverParaAdmin(string email)
        {
            var sucesso = await _firebaseService.PromoverUsuarioParaAdminAsync(email);
            if (!sucesso)
                return NotFound(new { Success = false, Message = "Usuário não encontrado." });

            return Ok(new { Success = true, Message = "Usuário promovido para admin com sucesso." });
        }

        [HttpGet("buscar/{email}")]
        public async Task<IActionResult> BuscarUsuario(string email)
        {
            var usuario = await _firebaseService.BuscarUsuarioPorEmailAsync(email);
            if (usuario == null)
                return NotFound(new { Success = false, Message = "Usuário não encontrado." });

            return Ok(new { Success = true, Data = usuario });
        }

        [HttpGet("listar")]
        public async Task<IActionResult> ListarUsuarios()
        {
            var usuarios = await _firebaseService.ListarUsuariosAsync();
            if (usuarios == null || usuarios.Count == 0)
                return NotFound(new { Success = false, Message = "Nenhum usuário encontrado." });

            return Ok(new { Success = true, Data = usuarios });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> AtualizarUsuario(string id, [FromBody] UsuarioDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var sucesso = await _firebaseService.AtualizarUsuarioAsync(id, dto);
            if (!sucesso)
                return NotFound(new { Success = false, Message = "Usuário não encontrado." });

            return Ok(new { Success = true, Message = "Usuário atualizado com sucesso." });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletarUsuario(string id)
        {
            var sucesso = await _firebaseService.DeletarUsuarioAsync(id);
            if (!sucesso)
                return NotFound(new { Success = false, Message = "Usuário não encontrado." });

            return Ok(new { Success = true, Message = "Usuário removido com sucesso." });
        }
    }
}
