namespace Pet_shop.Models
{
    public class Pagamento
    {
        public string Id { get; set; }
        public string UsuarioId { get; set; }
        public string CarrinhoId { get; set; }
        public decimal ValorTotal { get; set; }
        public string MetodoPagamento { get; set; } // "cartao", "pix", "boleto"
        public DadosPagamento Dados { get; set; }
        public string Status { get; set; } // "pendente", "processando", "aprovado", "recusado", "cancelado"
        public DateTime DataCriacao { get; set; } = DateTime.UtcNow;
        public DateTime DataAtualizacao { get; set; } = DateTime.UtcNow;
    }
}
