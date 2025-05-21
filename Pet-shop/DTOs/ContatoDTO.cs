using System.ComponentModel.DataAnnotations;

namespace Pet_shop.DTOs
{
    public class ContatoDTO
    {
        [Required, EmailAddress]
        public string Email { get; set; }

        [Required]
        public string Telefone { get; set; }

        [Required]
        public string Nome { get; set; }

        [Required]
        public string Mensagem { get; set; }
    }
}
