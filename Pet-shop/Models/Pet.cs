namespace Pet_shop.Models
{
    public class Pet
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Nome { get; set; }
        public string Especie { get; set; }
        public string Raca { get; set; }
        public int Idade { get; set; }
        public string TutorUid { get; set; } // UID do Firebase Auth
    }
}
