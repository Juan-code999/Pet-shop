namespace Pet_shop.DTOs
{
    public class DadosPagamentoDTO
    {
        public string NumeroCartao { get; set; }
        public string NomeCartao { get; set; }
        public string Validade { get; set; }
        public string CVV { get; set; }
        public string CPF { get; set; }
        public int Parcelas { get; set; }
        public string ChavePix { get; set; }
        public string CodigoBoleto { get; set; }
        public DateTime? DataVencimento { get; set; }
    }
}