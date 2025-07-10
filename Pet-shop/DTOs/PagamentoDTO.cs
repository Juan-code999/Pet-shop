namespace Pet_shop.DTOs
{
    public class PagamentoDTO
    {
        public string UsuarioId { get; set; }
        public string CarrinhoId { get; set; }
        public decimal ValorTotal { get; set; }
        public string MetodoPagamento { get; set; }
        public DadosPagamentoDTO Dados { get; set; }
        public List<ItemCarrinhoDTO> Itens { get; set; }
    }
}