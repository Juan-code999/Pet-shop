namespace Pet_shop.DTOs
{
    public class PixPagamentoDTO : MetodoPagamentoDTO
    {
        public override string Tipo => "pix";
        public string ChavePix { get; set; }
        public string CPF { get; set; }
    }
}
