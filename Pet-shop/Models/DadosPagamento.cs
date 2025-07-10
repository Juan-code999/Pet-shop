namespace Pet_shop.Models
{
    public class DadosPagamento
    {
        // Para cartão de crédito
        public string NumeroCartao { get; set; }
        public string NomeCartao { get; set; }
        public string Validade { get; set; }
        public string CVV { get; set; }
        public string CPF { get; set; }
        public int Parcelas { get; set; }

        // Para PIX
        public string ChavePix { get; set; }

        // Para boleto
        public string CodigoBoleto { get; set; }
        public DateTime? DataVencimento { get; set; }
    }
}