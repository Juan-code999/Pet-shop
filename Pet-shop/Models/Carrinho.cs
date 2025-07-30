using System.ComponentModel.DataAnnotations;

namespace Pet_shop.Models
{
    /// <summary>
    /// Modelo que representa um carrinho de compras
    /// </summary>
    public class Carrinho
    {
        /// <summary>
        /// ID do carrinho
        /// </summary>
        [Key]
        public required string Id { get; set; }

        /// <summary>
        /// ID do usuário dono do carrinho
        /// </summary>
        [Required]
        public required string UsuarioId { get; set; }

        /// <summary>
        /// Lista de itens no carrinho
        /// </summary>
        public List<ItemCarrinho> Itens { get; set; } = new List<ItemCarrinho>();

        /// <summary>
        /// Data da última atualização do carrinho
        /// </summary>
        public DateTime DataAtualizacao { get; set; } = DateTime.UtcNow;
    }
}