using System.ComponentModel.DataAnnotations;

namespace Pet_shop.DTOs
{
    public class PetDTO
    {

        public string Nome { get; set; }
        public string Especie { get; set; }
        public string Raca { get; set; }
        public int Idade { get; set; }
        public string TutorUid { get; set; }
    }
}
