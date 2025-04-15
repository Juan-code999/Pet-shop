﻿using Microsoft.AspNetCore.Mvc;
using Pet_shop.DTOs;
using Pet_shop.Models;
using Pet_shop.Services;

namespace Pet_shop.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class UsuarioController : ControllerBase
    {
        private readonly FirebaseService _firebaseService;

        public UsuarioController(FirebaseService firebaseService)
        {
            _firebaseService = firebaseService;
        }

        [HttpPost]
        public async Task<IActionResult> CriarUsuario([FromBody] UsuarioDTO dto)
        {
            if (dto == null)
                return BadRequest("Dados inválidos");

            // Chama o serviço para salvar o usuário no Firebase
            await _firebaseService.SalvarUsuarioAsync(dto);

            return Ok(new { Message = "Usuário criado com sucesso!" });
        }
    }
}
