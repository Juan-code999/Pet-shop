namespace Pet_shop.Models
{
    public class DadosPagamento
    {
        // Cartão
        public string NumeroCartao { get; set; }
        public string NomeCartao { get; set; }
        public string Validade { get; set; }
        public string CVV { get; set; }
        public string CPF { get; set; }
        public int? Parcelas { get; set; }

        // PIX
        public string ChavePix { get; set; }

        // Boleto
        public string CodigoBoleto { get; set; }
        public DateTime? DataVencimento { get; set; }
    }
}
