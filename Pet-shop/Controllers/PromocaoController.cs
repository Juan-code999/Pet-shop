using Microsoft.AspNetCore.Mvc;
using Pet_shop.DTOs;
using Pet_shop.Models;
using Pet_shop.Services;

namespace Pet_shop.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PromocaoController : ControllerBase
    {
        private readonly FirebaseService _firebase;

        public PromocaoController(FirebaseService firebase)
        {
            _firebase = firebase;
        }

        [HttpPost("criar")]
        public async Task<IActionResult> Criar([FromBody] PromocaoDTO dto)
        {
            var promocao = new Promocao
            {
                Id = Guid.NewGuid().ToString(),
                Nome = dto.Nome,
                Descricao = dto.Descricao,
                Preco = dto.PrecoPromocional // usamos somente o preço promocional
            };

            await _firebase.AddPromocaoAsync(promocao);
            return Ok(new { Message = "Promoção criada com sucesso." });
        }
    }
}
