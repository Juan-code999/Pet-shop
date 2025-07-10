using Microsoft.AspNetCore.Mvc;
using Pet_shop.DTOs;
using Pet_shop.Services;
using System;
using System.Threading.Tasks;

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
            try
            {
                var pagamento = await _pagamentoService.ProcessarPagamentoAsync(pagamentoDto);

                return Ok(new
                {
                    Success = true,
                    PagamentoId = pagamento.Id,
                    Status = pagamento.Status,
                    Metodo = pagamento.MetodoPagamento,
                    Dados = new
                    {
                        ChavePix = pagamento.Dados?.ChavePix,
                        CodigoBoleto = pagamento.Dados?.CodigoBoleto,
                        DataVencimento = pagamento.Dados?.DataVencimento
                    }
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Success = false, Mensagem = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Success = false, Mensagem = $"Erro ao processar pagamento: {ex.Message}" });
            }
        }

        [HttpGet("{pagamentoId}")]
        public async Task<IActionResult> ObterStatusPagamento(string pagamentoId)
        {
            try
            {
                var pagamento = await _pagamentoService.ObterPagamentoAsync(pagamentoId);
                if (pagamento == null)
                    return NotFound(new { Success = false, Mensagem = "Pagamento não encontrado" });

                return Ok(new
                {
                    Success = true,
                    Status = pagamento.Status,
                    DataCriacao = pagamento.DataCriacao,
                    DataAtualizacao = pagamento.DataAtualizacao,
                    ValorTotal = pagamento.ValorTotal,
                    MetodoPagamento = pagamento.MetodoPagamento
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Success = false, Mensagem = $"Erro ao obter status do pagamento: {ex.Message}" });
            }
        }

        [HttpPost("webhook")]
        public async Task<IActionResult> ReceberWebhook([FromBody] ConfirmacaoPagamentoDTO confirmacaoDto)
        {
            try
            {
                if (confirmacaoDto == null || string.IsNullOrEmpty(confirmacaoDto.PagamentoId))
                    return BadRequest(new { Success = false, Mensagem = "Dados de confirmação inválidos" });

                var pagamento = await _pagamentoService.AtualizarStatusPagamentoAsync(
                    confirmacaoDto.PagamentoId,
                    confirmacaoDto.Status);

                return Ok(new
                {
                    Success = true,
                    PagamentoId = pagamento.Id,
                    NovoStatus = pagamento.Status,
                    Mensagem = "Status atualizado com sucesso"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Success = false, Mensagem = $"Erro ao atualizar status do pagamento: {ex.Message}" });
            }
        }
    }
}