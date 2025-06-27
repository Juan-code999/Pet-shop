using System.ComponentModel.DataAnnotations;

namespace Pet_shop.DTOs
{
    public class UsuarioUpdateDTO
    {
        public string Id { get; set; }

        [Required]
        public string Nome { get; set; }

        [Required, EmailAddress]
        public string Email { get; set; }

        public string Senha { get; set; }  // ❌ agora não é obrigatório

        [Required]
        public string Telefone { get; set; }

        public string Foto { get; set; }

        [Required]
        public EnderecoDTO Endereco { get; set; }

        public bool IsAdmin { get; set; } = false;
    }
}
