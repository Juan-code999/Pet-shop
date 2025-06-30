namespace Pet_shop.Models
{
    public class Carrinho
    {
        public string Id { get; set; }
        public string UsuarioId { get; set; }
        public List<ItemCarrinho> Itens { get; set; } = new();
        public DateTime DataAtualizacao { get; set; } = DateTime.UtcNow;

    }
}
