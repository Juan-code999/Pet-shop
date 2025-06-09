namespace Pet_shop.Models
{
    public class Produto
    {
        public string Id { get; set; } // Será a key do Firebase, string
        public string Nome { get; set; }
        public string Descricao { get; set; }
        public decimal Preco { get; set; }
        public string Categoria { get; set; }
        public List<string> ImagensUrl { get; set; }
    }
}

