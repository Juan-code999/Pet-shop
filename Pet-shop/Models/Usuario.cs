﻿namespace Pet_shop.Models
{
    public class Usuario
    {

        public string Nome { get; set; }
        public string Email { get; set; }
        public string Senha { get; set; }
        public string Telefone { get; set; }
        public string Endereco { get; set; }

        public bool IsAdmin { get; set; } // Campo para verificar se é admin
    }

}
