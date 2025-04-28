using Microsoft.AspNetCore.Mvc;
using Pet_shop.DTOs;
using Pet_shop.Models;
using Pet_shop.Services;

namespace Pet_shop.Controllers
{
    [Route("[controller]")]  
    [ApiController]
    public class UsuarioController : ControllerBase
    {
        private readonly FirebaseService _firebaseService;

        public UsuarioController(FirebaseService firebaseService)
        {
            _firebaseService = firebaseService;
        }

        // Método para criar um usuário (POST)
        [HttpPost]
        public async Task<IActionResult> CriarUsuario([FromBody] UsuarioDTO dto)
        {
            if (dto == null)
                return BadRequest("Dados inválidos");

            // Chama o serviço para salvar o usuário no Firebase
            var userId = await _firebaseService.SalvarUsuarioAsync(dto);

            return Ok(new { Message = "Usuário criado com sucesso!", UserId = userId });
        }

        // Método para promover um usuário para admin (PUT)
        [HttpPut("promover/{email}")]
        public async Task<IActionResult> PromoverParaAdmin(string email)
        {
            var sucesso = await _firebaseService.PromoverUsuarioParaAdminAsync(email);

            if (!sucesso)
            {
                return NotFound("Usuário não encontrado.");
            }

            return Ok("Usuário promovido para admin com sucesso.");
        }

        // Método para buscar um usuário por e-mail (GET)
        [HttpGet("buscar/{email}")]
        public async Task<IActionResult> BuscarUsuario(string email)
        {
            var usuario = await _firebaseService.BuscarUsuarioPorEmailAsync(email);

            if (usuario == null)
            {
                return NotFound("Usuário não encontrado.");
            }

            return Ok(usuario);
        }

        // Método para listar todos os usuários (GET)
        [HttpGet("listar")]
        public async Task<IActionResult> ListarUsuarios()
        {
            var usuarios = await _firebaseService.ListarUsuariosAsync();

            if (usuarios == null || usuarios.Count == 0)
            {
                return NotFound("Nenhum usuário encontrado.");
            }

            return Ok(usuarios);
        }
    }
}
