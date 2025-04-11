namespace Pet_shop.Models
{
    public class Promocao
    {
        public string Id { get; set; } = Guid.NewGuid().ToString(); // Identificador único
        public string Nome { get; set; } = string.Empty;            // Nome da promoção (ex: "Banho + Tosa")
        public string Descricao { get; set; } = string.Empty;       // Detalhes da promoção
        public decimal Preco { get; set; }                  // Valor Original

    }
}
