namespace Pet_shop.DTOs
{
    /// <summary>
    /// DTO para atualização de tamanho de item no carrinho
    /// </summary>
    public class AtualizarTamanhoDTO
    {
        /// <summary>
        /// ID do produto
        /// </summary>
        public required string ProdutoId { get; set; }

        /// <summary>
        /// Tamanho atual do item
        /// </summary>
        public required string TamanhoAtual { get; set; }

        /// <summary>
        /// Novo tamanho para o item
        /// </summary>
        public required string NovoTamanho { get; set; }
    }
}