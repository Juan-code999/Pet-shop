using Microsoft.AspNetCore.Mvc;
using Pet_shop.DTOs;
using Pet_shop.Services;

namespace Pet_shop.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PagamentoController : ControllerBase
    {
        private readonly IPagamentoService _pagamentoService;

        public PagamentoController(IPagamentoService pagamentoService)
        {
            _pagamentoService = pagamentoService;
        }

        [HttpPost("processar")]
        public async Task<IActionResult> ProcessarPagamento([FromBody] PagamentoDTO pagamentoDto)
        {
            if (pagamentoDto == null)
                return BadRequest("Dados de pagamento inválidos");

            try
            {
                var pagamento = await _pagamentoService.ProcessarPagamentoAsync(pagamentoDto);

                return Ok(new
                {
                    PagamentoId = pagamento.Id,
                    Status = pagamento.Status,
                    Metodo = pagamento.MetodoPagamento,
                    Dados = new
                    {
                        ChavePix = pagamento.Dados.ChavePix,
                        CodigoBoleto = pagamento.Dados.CodigoBoleto,
                        DataVencimento = pagamento.Dados.DataVencimento
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao processar pagamento: {ex.Message}");
            }
        }

        [HttpGet("{pagamentoId}")]
        public async Task<IActionResult> ObterStatusPagamento(string pagamentoId)
        {
            try
            {
                var pagamento = await _pagamentoService.ObterPagamentoAsync(pagamentoId);
                if (pagamento == null)
                    return NotFound("Pagamento não encontrado");

                return Ok(new
                {
                    Status = pagamento.Status,
                    DataCriacao = pagamento.DataCriacao,
                    DataAtualizacao = pagamento.DataAtualizacao,
                    ValorTotal = pagamento.ValorTotal,
                    MetodoPagamento = pagamento.MetodoPagamento
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao obter status do pagamento: {ex.Message}");
            }
        }

        [HttpPost("webhook")]
        public async Task<IActionResult> ReceberWebhook([FromBody] ConfirmacaoPagamentoDTO confirmacaoDto)
        {
            if (confirmacaoDto == null || string.IsNullOrEmpty(confirmacaoDto.PagamentoId))
                return BadRequest("Dados de confirmação inválidos");

            try
            {
                var pagamento = await _pagamentoService.AtualizarStatusPagamentoAsync(
                    confirmacaoDto.PagamentoId,
                    confirmacaoDto.Status);

                return Ok(new
                {
                    PagamentoId = pagamento.Id,
                    NovoStatus = pagamento.Status,
                    Mensagem = "Status atualizado com sucesso"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao atualizar status do pagamento: {ex.Message}");
            }
        }
    }
}

