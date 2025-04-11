using Microsoft.AspNetCore.Mvc;
using Pet_shop.DTOs;
using Pet_shop.Models;
using Pet_shop.Services;

namespace Pet_shop.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AgendamentoController : ControllerBase
    {
        private readonly FirebaseService _firebaseService;

        public AgendamentoController(FirebaseService firebaseService)
        {
            _firebaseService = firebaseService;
        }

        // 🔹 POST - Criar agendamento
        [HttpPost]
        public async Task<IActionResult> CriarAgendamento([FromBody] AgendamentoDTO agendamentoDto)
        {
            if (agendamentoDto == null)
                return BadRequest("Dados do agendamento inválidos.");

            var agendamento = new Agendamento
            {
                Id = Guid.NewGuid().ToString(),
                PetId = agendamentoDto.PetId,
                DataHora = agendamentoDto.DataHora,
                Servicos = agendamentoDto.Servicos ?? new List<string>(),
                Status = "Agendado"
            };

            await _firebaseService.AddAgendamentoAsync(agendamento);
            return Ok(new { Message = "Agendamento criado com sucesso.", Id = agendamento.Id });
        }

        // 🔹 GET - Listar todos os agendamentos
        [HttpGet]
        public async Task<IActionResult> ListarAgendamentos()
        {
            var agendamentos = await _firebaseService.ListarAgendamentosAsync();
            return Ok(agendamentos);
        }

        // 🔹 GET - Obter agendamento por ID
        [HttpGet("{id}")]
        public async Task<IActionResult> ObterAgendamento(string id)
        {
            var agendamento = await _firebaseService.GetAgendamentoAsync(id);
            if (agendamento == null)
                return NotFound("Agendamento não encontrado.");

            return Ok(agendamento);
        }

        // 🔹 PUT - Atualizar agendamento
        [HttpPut("{id}")]
        public async Task<IActionResult> AtualizarAgendamento(string id, [FromBody] AgendamentoDTO agendamentoDto)
        {
            var agendamentoExistente = await _firebaseService.GetAgendamentoAsync(id);
            if (agendamentoExistente == null)
                return NotFound("Agendamento não encontrado.");

            agendamentoExistente.PetId = agendamentoDto.PetId;
            agendamentoExistente.DataHora = agendamentoDto.DataHora;
            agendamentoExistente.Servicos = agendamentoDto.Servicos ?? new List<string>();

            await _firebaseService.AddAgendamentoAsync(agendamentoExistente);
            return Ok(new { Message = "Agendamento atualizado com sucesso." });
        }

        // 🔹 DELETE - Cancelar agendamento
        [HttpDelete("{id}")]
        public async Task<IActionResult> CancelarAgendamento(string id)
        {
            var agendamento = await _firebaseService.GetAgendamentoAsync(id);
            if (agendamento == null)
                return NotFound("Agendamento não encontrado.");

            await _firebaseService.CancelarAgendamentoAsync(id);
            return Ok(new { Message = "Agendamento cancelado com sucesso." });
        }
    }
}
