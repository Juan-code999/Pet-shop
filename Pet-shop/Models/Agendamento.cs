namespace Pet_shop.Models
{
    public class Agendamento
    {
        public string Id { get; set; }
        public string PetId { get; set; }
        public DateTime DataHora { get; set; }
        public List<string> Servicos { get; set; } = new();
        public string Status { get; set; }
    }
}
