namespace Pet_shop.Models
{
    public class Carrinho
    {
        public string Id { get; set; }
        public string UsuarioId { get; set; }  // ID do usuário (dono)
        public string ProdutoId { get; set; }  // Produto adicionado
        public int Quantidade { get; set; }    // Quantidade desejada
    }
}
