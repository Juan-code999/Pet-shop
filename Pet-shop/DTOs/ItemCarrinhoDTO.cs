namespace Pet_shop.DTOs
{
    /// <summary>
    /// DTO que representa um item no carrinho
    /// </summary>
    public class ItemCarrinhoDTO
    {
        /// <summary>
        /// ID do produto
        /// </summary>
        public required string ProdutoId { get; set; }

        /// <summary>
        /// Tamanho selecionado
        /// </summary>
        public required string Tamanho { get; set; }

        /// <summary>
        /// Quantidade do item
        /// </summary>
        public int Quantidade { get; set; }

        /// <summary>
        /// Preço unitário do item
        /// </summary>
        public decimal PrecoUnitario { get; set; }

        /// <summary>
        /// Preço original sem descontos
        /// </summary>
        public decimal PrecoOriginal { get; set; }

        /// <summary>
        /// Data de adição do item ao carrinho
        /// </summary>
        public DateTime DataAdicao { get; set; } = DateTime.UtcNow;
    }
}