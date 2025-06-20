﻿using Pet_shop.Models;
using System.ComponentModel.DataAnnotations;

namespace Pet_shop.DTOs
{
    public class UsuarioDTO
    {
        public string Id { get; set; }

        [Required]
        public string Nome { get; set; }

        [Required, EmailAddress]
        public string Email { get; set; }

        [Required, MinLength(6)]
        public string Senha { get; set; }

        [Required]
        public string Telefone { get; set; }

        public string Foto { get; set; } // <-- isso aqui

        [Required]
        public EnderecoDTO Endereco { get; set; }  // aqui mudou

        public bool IsAdmin { get; set; } = false;
    }


}
