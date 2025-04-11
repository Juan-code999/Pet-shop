using System.ComponentModel.DataAnnotations;

namespace Pet_shop.DTOs
{
    public class PromocaoDTO
    {
       
        public string Nome { get; set; }


        public string Descricao { get; set; }

       
        public decimal PrecoPromocional { get; set; }

        public decimal? PrecoOriginal { get; set; }

        public DateTime DataInicio { get; set; }

       
        public DateTime DataFim { get; set; }

        public bool Ativa { get; set; } = true;
    }
}
