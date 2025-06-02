namespace Pet_shop.Models
{
    public class Produto
    {
        public string Id { get; set; } // Será a key do Firebase, string
        public string Name { get; set; }
        public decimal Price { get; set; }
        public decimal OldPrice { get; set; }
        public string Tag { get; set; }
        public string ImageUrl { get; set; }
    }



}
