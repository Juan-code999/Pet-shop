using System.ComponentModel.DataAnnotations;

namespace Pet_shop.Models
{
    /// <summary>
    /// Modelo que representa um item no carrinho de compras
    /// </summary>
    public class ItemCarrinho
    {
        /// <summary>
        /// ID do produto
        /// </summary>
        [Required(ErrorMessage = "O ID do produto é obrigatório")]
        public string ProdutoId { get; set; } = string.Empty;

        /// <summary>
        /// Tamanho selecionado do produto
        /// </summary>
        [Required(ErrorMessage = "O tamanho é obrigatório")]
        public string Tamanho { get; set; } = string.Empty;

        /// <summary>
        /// Quantidade do item no carrinho
        /// </summary>
        [Range(1, int.MaxValue, ErrorMessage = "A quantidade deve ser pelo menos 1")]
        public int Quantidade { get; set; } = 1;

        /// <summary>
        /// Preço unitário do item
        /// </summary>
        [Range(0.01, double.MaxValue, ErrorMessage = "O preço unitário deve ser maior que zero")]
        public decimal PrecoUnitario { get; set; }

        /// <summary>
        /// Data de adição do item ao carrinho
        /// </summary>
        public DateTime DataAdicao { get; set; } = DateTime.UtcNow;
    }
}