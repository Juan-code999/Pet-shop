using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Pet_shop.DTOs;

[ApiController]
[Route("api/[controller]")]
public class CarrinhoController : ControllerBase
{
    private readonly IConfiguration _configuration;

    public CarrinhoController(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    // POST api/Carrinho/{usuarioId}
    [HttpPost("{usuarioId}")]
    public async Task<IActionResult> SalvarCarrinho(string usuarioId, [FromBody] CarrinhoDTO dto)
    {
        // Extrai token do header Authorization (espera "Bearer <token>")
        var authHeader = Request.Headers["Authorization"].ToString();
        if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
            return Unauthorized("Token de autenticação não fornecido.");

        var token = authHeader.Replace("Bearer ", "");

        // Verifique se o usuarioId do caminho confere com dto.UsuarioId (evita alterar outro carrinho)
        if (usuarioId != dto.UsuarioId)
            return BadRequest("Usuário inválido.");

        // Cria serviço com o token para autenticar no Firebase
        var carrinhoService = new CarrinhoService(_configuration["Firebase:DatabaseUrl"], token);

        await carrinhoService.SalvarCarrinhoAsync(usuarioId, dto);

        return Ok(new { mensagem = "Carrinho salvo com sucesso" });
    }

    // GET api/Carrinho/{usuarioId}
    [HttpGet("{usuarioId}")]
    public async Task<IActionResult> ObterCarrinho(string usuarioId)
    {
        var authHeader = Request.Headers["Authorization"].ToString();
        if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
            return Unauthorized("Token de autenticação não fornecido.");

        var token = authHeader.Replace("Bearer ", "");

        var carrinhoService = new CarrinhoService(_configuration["Firebase:DatabaseUrl"], token);

        var carrinho = await carrinhoService.ObterCarrinhoAsync(usuarioId);
        if (carrinho == null)
            return NotFound();

        return Ok(carrinho);
    }
}
