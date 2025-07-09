namespace Pet_shop.DTOs
{
    public class ConfirmacaoPagamentoDTO
    {
        public string PagamentoId { get; set; }
        public string Status { get; set; }
        public string CodigoTransacao { get; set; }
        public string Mensagem { get; set; }
    }
}
