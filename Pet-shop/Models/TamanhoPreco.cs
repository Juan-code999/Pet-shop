using System.ComponentModel.DataAnnotations;

namespace Pet_shop.Models
{
    /// <summary>
    /// Modelo que representa um tamanho e seu preço associado
    /// </summary>
    public class TamanhoPreco
    {
        /// <summary>
        /// Tamanho do produto (P, M, G, etc)
        /// </summary>
        [Required(ErrorMessage = "O tamanho é obrigatório")]
        public string Tamanho { get; set; } = string.Empty;

        /// <summary>
        /// Preço por quilograma do produto
        /// </summary>
        [Range(0.01, double.MaxValue, ErrorMessage = "O preço por kg deve ser maior que zero")]
        public decimal PrecoPorKg { get; set; }

        /// <summary>
        /// Preço total calculado para o tamanho
        /// </summary>
        [Range(0.01, double.MaxValue, ErrorMessage = "O preço total deve ser maior que zero")]
        public decimal PrecoTotal { get; set; }
    }
}