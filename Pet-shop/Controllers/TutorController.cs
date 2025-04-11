using Microsoft.AspNetCore.Mvc;
using Pet_shop.DTOs;
using Pet_shop.Models;
using Pet_shop.Services;

namespace Pet_shop.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TutorController : ControllerBase
    {
        private readonly FirebaseService _firebase;

        public TutorController(FirebaseService firebase)
        {
            _firebase = firebase;
        }

        // POST - Criar tutor
        [HttpPost]
        public async Task<IActionResult> Criar([FromBody] TutorDTO dto)
        {
            var tutor = new Tutor
            {
                Id = Guid.NewGuid().ToString(),
                Nome = dto.Nome,
                Telefone = dto.Telefone,
                Email = dto.Email
            };

            await _firebase.AddTutorAsync(tutor);
            return Ok(new { Message = "Tutor cadastrado com sucesso.", Id = tutor.Id });
        }

        // GET - Listar todos os tutores
        [HttpGet]
        public async Task<IActionResult> Listar()
        {
            var tutores = await _firebase.ListarTutoresAsync();
            return Ok(tutores);
        }

        // GET - Obter tutor por ID
        [HttpGet("{id}")]
        public async Task<IActionResult> Obter(string id)
        {
            var tutor = await _firebase.GetTutorAsync(id);
            if (tutor == null)
                return NotFound("Tutor não encontrado.");

            return Ok(tutor);
        }

        // PUT - Atualizar tutor
        [HttpPut("{id}")]
        public async Task<IActionResult> Atualizar(string id, [FromBody] TutorDTO dto)
        {
            var existente = await _firebase.GetTutorAsync(id);
            if (existente == null)
                return NotFound("Tutor não encontrado.");

            existente.Nome = dto.Nome;
            existente.Telefone = dto.Telefone;
            existente.Email = dto.Email;

            await _firebase.AddTutorAsync(existente);
            return Ok(new { Message = "Tutor atualizado com sucesso." });
        }

        // DELETE - Remover tutor
        [HttpDelete("{id}")]
        public async Task<IActionResult> Remover(string id)
        {
            var tutor = await _firebase.GetTutorAsync(id);
            if (tutor == null)
                return NotFound("Tutor não encontrado.");

            await _firebase.RemoverTutorAsync(id);
            return Ok(new { Message = "Tutor removido com sucesso." });
        }
    }
}
