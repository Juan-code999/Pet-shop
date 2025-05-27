namespace Pet_shop.Models
{
    public class Contato
    {
        public string Id { get; set; }
        public string UsuarioId { get; set; } // <-- Adicione isso
        public string Email { get; set; }
        public string Telefone { get; set; }
        public string Nome { get; set; }
        public string Mensagem { get; set; }
        public DateTime DataEnvio { get; set; } = DateTime.Now;
    }
}
