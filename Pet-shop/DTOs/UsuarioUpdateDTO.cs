using System.ComponentModel.DataAnnotations;

namespace Pet_shop.DTOs
{
    public class UsuarioUpdateDTO
    {

        public string Nome { get; set; }

        [EmailAddress]
        public string Email { get; set; }

        [MinLength(6)]
        public string Senha { get; set; }

        public string Telefone { get; set; }
        public string Foto { get; set; }

        [Required]
        public EnderecoDTO Endereco { get; set; }

        public bool IsAdmin { get; set; } = false;
    }
}
