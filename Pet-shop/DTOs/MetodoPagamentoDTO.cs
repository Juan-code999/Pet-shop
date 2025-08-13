namespace Pet_shop.DTOs
{
    public class MetodoPagamentoDTO
    {
        public string Tipo { get; set; } = string.Empty; // cartao, pix, boleto
        public string? NumeroCartao { get; set; }
        public string? NomeCartao { get; set; }
        public string? Validade { get; set; }
        public string? CVV { get; set; }
        public string? CPF { get; set; }
        public int? Parcelas { get; set; }
        public string? ChavePix { get; set; }
    }
}
