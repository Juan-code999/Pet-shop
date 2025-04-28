using System.ComponentModel.DataAnnotations;

namespace Pet_shop.DTOs
{
    public class AgendamentoDTO
    {
        public string NomePet { get; set; }
        public DateTime DataAgendamento { get; set; }
        public TimeSpan HoraAgendamento { get; set; }
        public string PetId { get; set; }
        public DateTime DataHora { get; set; }
        public List<string> Servicos { get; set; }
    }
}

