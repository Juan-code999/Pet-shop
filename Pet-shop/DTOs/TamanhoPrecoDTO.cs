namespace Pet_shop.DTOs
{
    public class TamanhoPrecoDTO
    {
        public string Tamanho { get; set; } // Ex: "2,5 Kg"
        public decimal PrecoPorKg { get; set; }
        public decimal PrecoTotal { get; set; }
    }

}
