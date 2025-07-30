using System.ComponentModel.DataAnnotations;

namespace Pet_shop.DTOs
{
    /// <summary>
    /// DTO que representa um carrinho de compras
    /// </summary>
    public class CarrinhoDTO
    {
        /// <summary>
        /// ID do usuário dono do carrinho
        /// </summary>
        [Required]
        public string UsuarioId { get; set; } = string.Empty;

        /// <summary>
        /// Lista de itens no carrinho
        /// </summary>
        public List<ItemCarrinhoDTO> Itens { get; set; } = new List<ItemCarrinhoDTO>();

        /// <summary>
        /// Data da última atualização do carrinho
        /// </summary>
        public DateTime DataAtualizacao { get; set; } = DateTime.UtcNow;
    }
}