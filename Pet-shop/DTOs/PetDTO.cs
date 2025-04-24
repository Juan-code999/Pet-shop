
using System.ComponentModel.DataAnnotations;

namespace Pet_shop.DTOs
{
    public class PetDTO
    {
      
        public string Nome { get; set; }

      
        public string Raca { get; set; }

        
        public string Tipo { get; set; } // Ex: "Cachorro", "Gato"

       
        public string TutorId { get; set; }

        public int Idade { get; set; } = 0;
    }
}
