using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Pet_shop.DTOs;
using Pet_shop.Services;
using System;
using System.Text.Json;
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
        public async Task<IActionResult> ProcessarPagamento([FromBody] JsonElement body)
        {
            try
            {
                if (!body.TryGetProperty("metodo", out var metodoElement) ||
                    !metodoElement.TryGetProperty("tipo", out var tipoElement))
                {
                    return BadRequest(new { Success = false, Message = "Método de pagamento não especificado" });
                }

                var tipoPagamento = tipoElement.GetString().ToLower();
                dynamic pagamentoDto = tipoPagamento switch
                {
                    "pix" => JsonSerializer.Deserialize<PagamentoDTO<PixPagamentoDTO>>(body.GetRawText()),
                    "cartao" => JsonSerializer.Deserialize<PagamentoDTO<CartaoPagamentoDTO>>(body.GetRawText()),
                    "boleto" => JsonSerializer.Deserialize<PagamentoDTO<BoletoPagamentoDTO>>(body.GetRawText()),
                    _ => throw new ArgumentException("Método de pagamento inválido")
                };

                if (pagamentoDto.ValorTotal <= 0)
                    return BadRequest(new { Success = false, Message = "Valor total deve ser maior que zero" });

                if (pagamentoDto.Itens == null || !pagamentoDto.Itens.Any())
                    return BadRequest(new { Success = false, Message = "O pagamento deve conter itens" });

                var pagamento = await _pagamentoService.ProcessarPagamentoAsync(pagamentoDto);

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
                        DataVencimento = pagamento.Dados.DataVencimento?.ToString("yyyy-MM-dd")
                    }
                });
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Erro de validação no pagamento");
                return BadRequest(new { Success = false, Message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao processar pagamento");
                return StatusCode(500, new { Success = false, Message = "Erro interno ao processar pagamento" });
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
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Erro ao buscar pagamento {pagamentoId}");
                return BadRequest(new { Success = false, Message = ex.Message });
            }
        }

        [HttpPost("webhook")]
        public async Task<IActionResult> ReceberWebhook([FromBody] ConfirmacaoPagamentoDTO confirmacaoDto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(confirmacaoDto?.PagamentoId) ||
                    string.IsNullOrWhiteSpace(confirmacaoDto?.Status))
                {
                    return BadRequest(new { Success = false, Message = "Dados inválidos" });
                }

                var pagamento = await _pagamentoService.AtualizarStatusPagamentoAsync(
                    confirmacaoDto.PagamentoId,
                    confirmacaoDto.Status);

                return Ok(new
                {
                    Success = true,
                    PagamentoId = pagamento.Id,
                    NovoStatus = pagamento.Status,
                    Message = "Status atualizado com sucesso"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Erro no webhook para pagamento {confirmacaoDto?.PagamentoId}");
                return StatusCode(500, new { Success = false, Message = ex.Message });
            }
        }
    }

}