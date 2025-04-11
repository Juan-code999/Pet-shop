using Microsoft.AspNetCore.Mvc;
using Pet_shop.DTOs;
using Pet_shop.Models;
using Pet_shop.Services;

namespace Pet_shop.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PetController : ControllerBase
    {
        private readonly FirebaseService _firebase;

        public PetController(FirebaseService firebase)
        {
            _firebase = firebase;
        }

        // POST - Criar pet
        [HttpPost]
        public async Task<IActionResult> Criar([FromBody] PetDTO dto)
        {
            var pet = new Pet
            {
                Id = Guid.NewGuid().ToString(),
                Nome = dto.Nome,
                Raca = dto.Raca,
                Idade = dto.Idade,
                TutorId = dto.TutorId
            };

            await _firebase.AddPetAsync(pet);
            return Ok(new { Message = "Pet cadastrado com sucesso.", Id = pet.Id });
        }

        // GET - Listar todos os pets
        [HttpGet]
        public async Task<IActionResult> Listar()
        {
            var pets = await _firebase.ListarPetsAsync();
            return Ok(pets);
        }

        // GET - Buscar pet por ID
        [HttpGet("{id}")]
        public async Task<IActionResult> Obter(string id)
        {
            var pet = await _firebase.GetPetAsync(id);
            if (pet == null)
                return NotFound("Pet não encontrado.");

            return Ok(pet);
        }

        // PUT - Atualizar pet
        [HttpPut("{id}")]
        public async Task<IActionResult> Atualizar(string id, [FromBody] PetDTO dto)
        {
            var existente = await _firebase.GetPetAsync(id);
            if (existente == null)
                return NotFound("Pet não encontrado.");

            existente.Nome = dto.Nome;
            existente.Raca = dto.Raca;
            existente.Idade = dto.Idade;
            existente.TutorId = dto.TutorId;

            await _firebase.AddPetAsync(existente);
            return Ok(new { Message = "Pet atualizado com sucesso." });
        }

        // DELETE - Remover pet
        [HttpDelete("{id}")]
        public async Task<IActionResult> Remover(string id)
        {
            var pet = await _firebase.GetPetAsync(id);
            if (pet == null)
                return NotFound("Pet não encontrado.");

            await _firebase.RemoverPetAsync(id);
            return Ok(new { Message = "Pet removido com sucesso." });
        }
    }
}
