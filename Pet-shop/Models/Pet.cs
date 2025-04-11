namespace Pet_shop.Models
{
    public class Pet
    {
        public string Id { get; set; }
        public string Nome { get; set; }
        public string Raca { get; set; }
        public int Idade { get; set; }
        public string TutorId { get; internal set; }
    }
}
