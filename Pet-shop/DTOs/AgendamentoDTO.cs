using System.ComponentModel.DataAnnotations;

namespace Pet_shop.DTOs
{
    public class AgendamentoDTO
    {
        
        public string PetId { get; set; }
        
        public DateTime DataHora { get; set; }
        
        public List<string> Servicos { get; set; } = new();
    }
}

