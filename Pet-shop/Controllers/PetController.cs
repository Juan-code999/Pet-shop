using Microsoft.AspNetCore.Mvc;
using Pet_shop.DTOs;
using Pet_shop.Models;
using Pet_shop.Services;

namespace Pet_shop.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class PetController : ControllerBase
    {
        private readonly FirebaseService _firebaseService;

        public PetController(FirebaseService firebaseService)
        {
            _firebaseService = firebaseService;
        }

        [HttpPost]
        public async Task<IActionResult> CriarPet([FromBody] PetDTO dto)
        {
            if (dto == null || string.IsNullOrEmpty(dto.TutorUid))
                return BadRequest("Dados inválidos");

            var pet = new Pet
            {
                Nome = dto.Nome,
                Especie = dto.Especie,
                Raca = dto.Raca,
                Idade = dto.Idade,
                TutorUid = dto.TutorUid
            };

            await _firebaseService.SalvarPetAsync(pet);
            return Ok(new { Message = "Pet cadastrado com sucesso!" });
        }

        [HttpGet("{tutorUid}")]
        public async Task<IActionResult> ListarPetsDoTutor(string tutorUid)
        {
            var pets = await _firebaseService.ObterPetsDoTutorAsync(tutorUid);
            return Ok(pets);
        }
    }
}
