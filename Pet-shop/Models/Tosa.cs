namespace Pet_shop.Models
{
    public class Tosa
    {
        public string Id { get; set; } = Guid.NewGuid().ToString(); // Identificador único
        public string PetId { get; set; } = string.Empty;            // Pet que vai fazer tosa
        public string TutorId { get; set; } = string.Empty;          // Tutor responsável (opcional)
        public DateTime Data { get; set; }                           // Data e hora da tosa
        public string TipoTosa { get; set; } = string.Empty;         // Ex: "Higiênica", "Completa", "Estética"
        public decimal Preco { get; set; }                           // Valor do serviço
        public string Observacoes { get; set; } = string.Empty;      // Observações gerais 
        public bool Finalizado { get; set; } = false;                // Status do serviço
        public object Nome { get; internal set; }
        public object Descricao { get; internal set; }
    }
}
