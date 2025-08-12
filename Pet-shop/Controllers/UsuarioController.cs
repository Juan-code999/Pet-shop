using Microsoft.AspNetCore.Mvc;
using Pet_shop.DTOs;
using Pet_shop.Models;
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

            // Atribui o ID ao DTO
            usuarioDTO.Id = id;

            return Ok(new { id = id, usuario = usuarioDTO });
        }




        // PUT: api/Usuario/5
        [HttpPut("profile/{id}")]
        public async Task<IActionResult> AtualizarPerfil(string id, [FromBody] UsuarioProfileUpdateDTO usuarioDTO)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                // Converter para UsuarioUpdateDTO sem senha
                var updateDto = new UsuarioUpdateDTO
                {
                    Nome = usuarioDTO.Nome,
                    Email = usuarioDTO.Email,
                    Telefone = usuarioDTO.Telefone,
                    Foto = usuarioDTO.Foto,
                    Endereco = usuarioDTO.Endereco
                };

                var usuarioAtualizado = await _usuarioService.AtualizarUsuarioAsync(id, updateDto);

                if (!usuarioAtualizado)
                    return NotFound(new { Message = "Usuário não encontrado" });

                return Ok(new
                {
                    Message = "Perfil atualizado com sucesso",
                    Usuario = await _usuarioService.BuscarUsuarioPorIdAsync(id)
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Erro interno no servidor", Details = ex.Message });
            }
        }



        // GET: api/Usuario/{Id}
        [HttpGet("{id}")]
        public async Task<IActionResult> BuscarUsuarioPorId(string id)
        {
            var usuario = await _usuarioService.BuscarUsuarioPorIdAsync(id);
            if (usuario == null)
                return NotFound();

            return Ok(usuario);
        }


        // GET: api/Usuario/admincheck/email/{email}
        [HttpGet("email/{email}")]
        public async Task<IActionResult> BuscarUsuarioPorEmail(string email)
        {
            var usuario = await _usuarioService.BuscarUsuarioPorEmailAsync(email);
            if (usuario == null)
            {
                return NotFound(new { mensagem = "Usuário não encontrado no banco de dados." });
            }
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
            if (string.IsNullOrEmpty(id))
            {
                return BadRequest(new { Message = "ID do usuário não fornecido" });
            }

            var deletado = await _usuarioService.DeletarUsuarioAsync(id);
            if (!deletado)
                return NotFound(new { Message = "Usuário não encontrado" });

            return Ok(new { Message = "Usuário excluído com sucesso" });
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

        [HttpPost("admin-status")]
        public async Task<IActionResult> AlterarAdminStatus([FromBody] AdminStatusRequest request)
        {
            var promovido = await _usuarioService.AlterarAdminStatusAsync(request.Email, request.IsAdmin);
            if (!promovido)
                return NotFound();

            return NoContent();
        }




    }
}
