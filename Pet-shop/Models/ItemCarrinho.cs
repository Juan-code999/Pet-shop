using System.ComponentModel.DataAnnotations;

namespace Pet_shop.Models
{
    public class ItemCarrinho
    {
        public string ProdutoId { get; set; }
        public string Tamanho { get; set; }

        public int Quantidade { get; set; }
     
    }
}
