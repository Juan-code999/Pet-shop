using System.Threading.Tasks;
using Pet_shop.DTOs;
using Pet_shop.Models;

namespace Pet_shop.Services
{
    public interface IPagamentoService
    {
        Task<Pagamento> ProcessarPagamentoAsync<T>(PagamentoDTO<T> pagamentoDto) where T : MetodoPagamentoDTO;
        Task<Pagamento> ObterPagamentoAsync(string pagamentoId);
        Task<Pagamento> AtualizarStatusPagamentoAsync(string pagamentoId, string status);
    }
}