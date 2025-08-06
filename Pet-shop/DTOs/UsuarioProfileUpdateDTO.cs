namespace Pet_shop.DTOs
{
    public class UsuarioProfileUpdateDTO
    {
        public string Nome { get; set; }
        public string Email { get; set; }
        public string Telefone { get; set; }
        public string Foto { get; set; }
        public EnderecoDTO Endereco { get; set; }
    }
}
