namespace Pet_shop.Models
{
    public class Newsletter
    {
        public string Id { get; set; }
        public string Email { get; set; }
        public DateTime DataInscricao { get; set; } = DateTime.Now;
    }
}
