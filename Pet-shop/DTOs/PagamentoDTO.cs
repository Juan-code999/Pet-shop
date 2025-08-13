namespace Pet_shop.DTOs
{
    public class PagamentoDTO<TMetodo> where TMetodo : MetodoPagamentoDTO
    {
        public string UsuarioId { get; set; }
        public string CarrinhoId { get; set; }
        public decimal ValorTotal { get; set; }
        public List<ItemCarrinhoDTO> Itens { get; set; }
        public TMetodo Metodo { get; set; }
    }
}