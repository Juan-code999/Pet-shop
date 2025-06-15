namespace Pet_shop.Models
{
    public class ItemCarrinho
    {

        public string ProdutoId { get; set; }
        public string NomeProduto { get; set; }
        public string Tamanho { get; set; }
        public int Quantidade { get; set; }
        public decimal PrecoUnitario { get; set; }
        public string ImagemUrl { get; set; }
    }
}
