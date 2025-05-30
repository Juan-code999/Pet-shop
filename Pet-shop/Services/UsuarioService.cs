﻿using Firebase.Database;
using Firebase.Database.Query;
using Pet_shop.DTOs;
using Pet_shop.Models;

namespace Pet_shop.Services
{
    public class UsuarioService
    {
        private readonly FirebaseClient _firebase;

        public object JwtBearerDefaults { get; private set; }

        public UsuarioService(IConfiguration configuration)
        {
            var url = configuration["Firebase:DatabaseUrl"];
            _firebase = new FirebaseClient(url);
        }
        // Método para salvar um novo usuário
        public async Task<string> SalvarUsuarioAsync(UsuarioDTO usuarioDTO)
        {
            var usuario = new Usuario
            {
                Nome = usuarioDTO.Nome,
                Email = usuarioDTO.Email.ToLower(),  // força salvar em lowercase
                Senha = usuarioDTO.Senha,
                Telefone = usuarioDTO.Telefone,
                Endereco = usuarioDTO.Endereco,
                IsAdmin = usuarioDTO.IsAdmin
            };

            // Primeiro salva (POST) para gerar um ID
            var novoUsuarioRef = await _firebase.Child("usuarios").PostAsync(usuario);
            var id = novoUsuarioRef.Key;

            // Atualiza o objeto com o ID e salva novamente com PUT
            usuario.Id = id;
            await _firebase.Child("usuarios").Child(id).PutAsync(usuario); // garante que o objeto salva com o campo Id

            return id;
        }





        // Método para promover um usuário para admin
        public async Task<bool> PromoverUsuarioParaAdminAsync(string email)
        {
            try
            {
                var usuarioSnapshot = await _firebase
                    .Child("usuarios")
                    .OrderBy("Email")
                    .EqualTo(email)
                    .OnceAsync<Usuario>();

                if (!usuarioSnapshot.Any())
                    return false;

                var key = usuarioSnapshot.First().Key;

                await _firebase
                    .Child("usuarios")
                    .Child(key)
                    .Child("IsAdmin")
                    .PutAsync(true);

                return true;
            }
            catch
            {
                return false;
            }
        }



        // Método para buscar usuário por e-mail (case insensitive)
        // Seu método no service (já corrigido)
        public async Task<UsuarioDTO> BuscarUsuarioPorEmailAsync(string email)
        {
            var usuarios = await _firebase
                .Child("usuarios")
                .OrderBy("Email")
                .EqualTo(email)
                .OnceAsync<Usuario>();

            var usuarioRegistro = usuarios.FirstOrDefault();

            if (usuarioRegistro != null)
            {
                var usuario = usuarioRegistro.Object;

                return new UsuarioDTO
                {
                    Id = usuarioRegistro.Key,
                    Nome = usuario.Nome,
                    Email = usuario.Email,
                    Telefone = usuario.Telefone,
                    Endereco = usuario.Endereco,
                    IsAdmin = usuario.IsAdmin
                };
            }

            return null;
        }






        // Método para listar todos os usuários
        public async Task<List<UsuarioDTO>> ListarUsuariosAsync()
        {
            try
            {
                var usuarios = await _firebase
                    .Child("usuarios")
                    .OnceAsync<Usuario>();

                return usuarios.Select(u =>
                {
                    var obj = u.Object;
                    obj.Id = u.Key;
                    obj.Senha = null;

                    return new UsuarioDTO
                    {
                        Nome = obj.Nome,
                        Email = obj.Email,
                        Telefone = obj.Telefone,
                        Endereco = obj.Endereco,
                        IsAdmin = obj.IsAdmin
                    };
                }).ToList();
            }
            catch
            {
                return new List<UsuarioDTO>();
            }
        }

        // Método para atualizar um usuário existente
        public async Task<bool> AtualizarUsuarioAsync(string id, UsuarioDTO dto)
        {
            try
            {
                var existente = await _firebase
                    .Child("usuarios")
                    .Child(id)
                    .OnceSingleAsync<Usuario>();

                if (existente == null)
                    return false;

                var senhaHash = string.IsNullOrWhiteSpace(dto.Senha)
                    ? existente.Senha
                    : BCrypt.Net.BCrypt.HashPassword(dto.Senha);

                var usuarioAtualizado = new Usuario
                {
                    Id = id,
                    Nome = dto.Nome,
                    Email = dto.Email,
                    Senha = senhaHash,
                    Telefone = dto.Telefone,
                    Endereco = dto.Endereco,
                    IsAdmin = dto.IsAdmin
                };

                await _firebase
                    .Child("usuarios")
                    .Child(id)
                    .PutAsync(usuarioAtualizado);

                return true;
            }
            catch
            {
                return false;
            }
        }

        // Método para buscar um usuário pelo ID
        public async Task<UsuarioDTO> BuscarUsuarioPorIdAsync(string id)
        {
            try
            {
                var usuarioSnapshot = await _firebase
                    .Child("usuarios")
                    .Child(id)
                    .OnceSingleAsync<Usuario>();

                if (usuarioSnapshot == null)
                    return null;

                usuarioSnapshot.Senha = null;

                return new UsuarioDTO
                {
                    Id = id,  // <-- incluir o ID aqui
                    Nome = usuarioSnapshot.Nome,
                    Email = usuarioSnapshot.Email,
                    Telefone = usuarioSnapshot.Telefone,
                    Endereco = usuarioSnapshot.Endereco,
                    IsAdmin = usuarioSnapshot.IsAdmin
                };
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Erro ao buscar usuário por ID: {ex.Message}");
                return null;
            }
        }


        // Verifica se o usuário com o email informado é admin
        public async Task<bool> VerificarSeUsuarioEhAdminAsync(string email)
        {
            try
            {
                var usuarioSnapshot = await _firebase
                    .Child("usuarios")
                    .OrderBy("Email")
                    .EqualTo(email)
                    .OnceAsync<Usuario>();

                var usuario = usuarioSnapshot.FirstOrDefault()?.Object;

                if (usuario == null)
                    return false;

                return usuario.IsAdmin;
            }
            catch
            {
                return false;
            }
        }



        // Método para deletar um usuário
        public async Task<bool> DeletarUsuarioAsync(string id)
        {
            try
            {
                var existente = await _firebase
                    .Child("usuarios")
                    .Child(id)
                    .OnceSingleAsync<Usuario>();

                if (existente == null)
                    return false;

                await _firebase
                    .Child("usuarios")
                    .Child(id)
                    .DeleteAsync();

                return true;
            }
            catch
            {
                return false;
            }
        }
    }
}
