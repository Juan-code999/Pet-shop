using System.ComponentModel.DataAnnotations;

namespace Pet_shop.DTOs
{
    public class AgendamentoDTO
    {

<<<<<<< HEAD
        public string NomePet { get; set; }
        public DateTime DataAgendamento { get; set; }
        public TimeSpan HoraAgendamento { get; set; }

=======
        public string PetId { get; set; }
        public DateTime DataHora { get; set; }
        public List<string> Servicos { get; set; }
>>>>>>> 8a9e0db70a78c586f3098988e31aea8f2741c144
    }
}

