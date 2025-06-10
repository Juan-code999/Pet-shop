namespace Pet_shop.Models
{
    public class Produto
    {
        public string Id { get; set; }
        public string Nome { get; set; }
        public string Descricao { get; set; }
        public string Categoria { get; set; } // Ex: "Ração", "Brinquedo", "Higiene"
        public string EspecieAnimal { get; set; } // Ex: "Gato", "Cachorro"
        public string Marca { get; set; }
        public List<string> ImagensUrl { get; set; }

        public List<TamanhoPreco> Tamanhos { get; set; } // Ver estrutura abaixo

        public string IdadeRecomendada { get; set; } // Ex: "Filhote", "Adulto"
        public string PorteAnimal { get; set; } // Ex: "Pequeno", "Médio", "Grande"

        public bool Destaque { get; set; }
        public decimal? Desconto { get; set; } // Ex: 10.00 (10% OFF)
        public bool Disponivel { get; set; }

        public DateTime DataCadastro { get; set; }
    }

}

