namespace Pet_shop.DTOs
{
    public class ProdutoDTO
    {
        public string Nome { get; set; }
        public string Descricao { get; set; }
        public string Categoria { get; set; } // Ex: "Ração", "Brinquedo", etc.
        public string EspecieAnimal { get; set; } // Ex: "Gato", "Cachorro", "Todos"
        public string Marca { get; set; }
        public List<string> ImagensUrl { get; set; }

        public List<TamanhoPrecoDTO> Tamanhos { get; set; }

        public string IdadeRecomendada { get; set; } // Ex: "Filhote", "Adulto"
        public string PorteAnimal { get; set; } // Ex: "Pequeno", "Médio", "Grande"

        public bool Destaque { get; set; } = false;
        public decimal? Desconto { get; set; } // Em porcentagem (%)
        public bool Disponivel { get; set; } = true;
    }

}

