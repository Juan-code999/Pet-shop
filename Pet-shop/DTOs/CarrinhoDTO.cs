namespace Pet_shop.DTOs
{
    public class CarrinhoDTO
    {
        public string UsuarioId { get; set; }     // ID do usuário que está comprando
        public string ProdutoId { get; set; }     // ID do produto no banco
        public int Quantidade { get; set; }       // Quantidade desejada
    }
}
