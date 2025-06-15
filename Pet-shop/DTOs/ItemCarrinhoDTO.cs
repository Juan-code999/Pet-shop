namespace Pet_shop.DTOs
{
    public class ItemCarrinhoDTO
    {
        public string ProdutoId { get; set; }
        public string NomeProduto { get; set; }
        public string Tamanho { get; set; }
        public int Quantidade { get; set; }
        public decimal PrecoUnitario { get; set; }
        public string ImagemUrl { get; set; }
    }
}
