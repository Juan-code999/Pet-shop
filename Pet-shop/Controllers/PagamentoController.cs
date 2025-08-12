using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Pet_shop.DTOs;
using Pet_shop.Services;
using System;
using System.Threading.Tasks;

namespace Pet_shop.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PagamentoController : ControllerBase
    {
        private readonly IPagamentoService _pagamentoService;
        private readonly ILogger<PagamentoController> _logger;

        public PagamentoController(IPagamentoService pagamentoService, ILogger<PagamentoController> logger)
        {
            _pagamentoService = pagamentoService;
            _logger = logger;
        }
        [HttpPost("processar")]
        public async Task<IActionResult> ProcessarPagamento([FromBody] PagamentoDTO pagamentoDto)
        {
            try
            {
                _logger.LogInformation("Recebido PagamentoDTO: {@PagamentoDto}", pagamentoDto);

                // Validação manual adicional
                if (pagamentoDto.ValorTotal <= 0)
                {
                    return BadRequest(new
                    {
                        Success = false,
                        Mensagem = "Valor total deve ser maior que zero"
                    });
                }

                if (pagamentoDto.MetodoPagamento == "pix" && string.IsNullOrEmpty(pagamentoDto.Dados.ChavePix))
                {
                    return BadRequest(new
                    {
                        Success = false,
                        Mensagem = "Chave PIX é obrigatória para pagamento com PIX"
                    });
                }

                var pagamento = await _pagamentoService.ProcessarPagamentoAsync(pagamentoDto);

                _logger.LogInformation($"Pagamento {pagamento.Id} processado com status {pagamento.Status}");

                return Ok(new
                {
                    Success = true,
                    PagamentoId = pagamento.Id,
                    Status = pagamento.Status,
                    Metodo = pagamento.MetodoPagamento,
                    Dados = new
                    {
                        pagamento.Dados.ChavePix,
                        pagamento.Dados.CodigoBoleto,
                        pagamento.Dados.DataVencimento
                    }
                });
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Erro de validação no pagamento");
                return BadRequest(new
                {
                    Success = false,
                    Mensagem = ex.Message,
                    Errors = ModelState.Values.SelectMany(v => v.Errors)
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao processar pagamento");
                return StatusCode(500, new
                {
                    Success = false,
                    Mensagem = "Erro interno ao processar pagamento",
                    ErroDetalhado = ex.Message
                });
            }
        }

        [HttpGet("{pagamentoId}")]
        public async Task<IActionResult> ObterStatusPagamento(string pagamentoId)
        {
            try
            {
                var pagamento = await _pagamentoService.ObterPagamentoAsync(pagamentoId);

                return Ok(new
                {
                    Success = true,
                    pagamento.Status,
                    pagamento.DataCriacao,
                    pagamento.DataAtualizacao,
                    pagamento.ValorTotal,
                    pagamento.MetodoPagamento
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { Success = false, Mensagem = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Erro ao buscar pagamento {pagamentoId}");
                return StatusCode(500, new { Success = false, Mensagem = ex.Message });
            }
        }

        [HttpPost("webhook")]
        public async Task<IActionResult> ReceberWebhook([FromBody] ConfirmacaoPagamentoDTO confirmacaoDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(new { Success = false, Mensagem = "Dados inválidos" });

                _logger.LogInformation($"Atualizando status do pagamento {confirmacaoDto.PagamentoId} para {confirmacaoDto.Status}");

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
            catch (ArgumentException ex)
            {
                return BadRequest(new { Success = false, Mensagem = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Erro no webhook para pagamento {confirmacaoDto?.PagamentoId}");
                return StatusCode(500, new { Success = false, Mensagem = ex.Message });
            }
        }
    }
}
