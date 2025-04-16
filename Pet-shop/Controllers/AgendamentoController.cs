using Microsoft.AspNetCore.Mvc;
using Pet_shop.DTOs;
using Pet_shop.Models;
using Pet_shop.Services;

namespace Pet_shop.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class AgendamentoController : ControllerBase
    {
        private readonly FirebaseService _firebaseService;

        public AgendamentoController(FirebaseService firebaseService)
        {
            _firebaseService = firebaseService;
        }

        // Criar agendamento
        [HttpPost]
        public async Task<IActionResult> CriarAgendamento([FromBody] AgendamentoDTO agendamentoDTO)
        {
            if (agendamentoDTO == null)
            {
                return BadRequest("Dados inválidos.");
            }

            var agendamento = new Agendamento
            {
                NomePet = agendamentoDTO.NomePet,
                DataAgendamento = agendamentoDTO.DataAgendamento,
                HoraAgendamento = agendamentoDTO.HoraAgendamento,
            };

            await _firebaseService.SalvarAgendamentoAsync(agendamento); // Método de salvar no Firebase

            return Ok(new { message = "Agendamento criado com sucesso!" });
        }

        // Listar agendamentos (opcional)
        [HttpGet]
        public async Task<IActionResult> GetAgendamentos()
        {
            var agendamentos = await _firebaseService.ListarAgendamentosAsync();
            return Ok(agendamentos);
        }
    }
}

