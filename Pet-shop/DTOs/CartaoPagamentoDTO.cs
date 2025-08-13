namespace Pet_shop.DTOs
{
    public class CartaoPagamentoDTO : MetodoPagamentoDTO
    {
        public override string Tipo => "cartao";
        public string NumeroCartao { get; set; }
        public string NomeCartao { get; set; }
        public string Validade { get; set; }
        public string CVV { get; set; }
        public string CPF { get; set; }
        public int Parcelas { get; set; } = 1;
    }

}
