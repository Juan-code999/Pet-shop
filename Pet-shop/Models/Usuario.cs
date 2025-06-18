namespace Pet_shop.Models
{
    public class Usuario
    {
        public string Id { get; set; }
        public string Nome { get; set; }
        public string Email { get; set; }
        public string Senha { get; set; }
        public string Telefone { get; set; }
        public string Foto { get; set; } // <-- isso aqui
        public Endereco Endereco { get; set; }   // mudou de string para objeto Endereco
        public bool IsAdmin { get; set; }
    }
}
