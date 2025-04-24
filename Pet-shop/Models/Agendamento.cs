namespace Pet_shop.Models
{
    public class Agendamento
    {
        public string Id { get; set; } // Esse ID pode ser gerado automaticamente
        public string NomePet { get; set; }
        public DateTime DataAgendamento { get; set; }
        public TimeSpan HoraAgendamento { get; set; }
        public string UsuarioId { get; set; } // Para associar o agendamento ao usuário (se necessário)
    }
}
