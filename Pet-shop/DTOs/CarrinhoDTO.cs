
namespace Pet_shop.DTOs
{
    public class CarrinhoDTO
    {
        public string UsuarioId { get; set; }
        public List<ItemCarrinhoDTO> Itens { get; set; }
        public DateTime DataAtualizacao { get; internal set; }
    }
}
