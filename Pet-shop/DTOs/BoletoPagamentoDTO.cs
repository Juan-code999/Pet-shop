namespace Pet_shop.DTOs
{
    public class BoletoPagamentoDTO : MetodoPagamentoDTO
    {
        public override string Tipo => "boleto";
        public string CPF { get; set; }
    }
}
