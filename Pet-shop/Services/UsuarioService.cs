using Firebase.Database;
using Firebase.Database.Query;
using Pet_shop.DTOs;
using Pet_shop.Models;

namespace Pet_shop.Services
{
    public class UsuarioService
    {
        private readonly FirebaseClient _firebase;

        public UsuarioService(IConfiguration configuration)
        {
            var url = configuration["Firebase:DatabaseUrl"];
            _firebase = new FirebaseClient(url);
        }

        public async Task<string> SalvarUsuarioAsync(UsuarioDTO dto)
        {
            var usuario = new Usuario
            {
                Nome = dto.Nome,
                Email = dto.Email,
                Senha = BCrypt.Net.BCrypt.HashPassword(dto.Senha),
                Telefone = dto.Telefone,
                Endereco = dto.Endereco,
                IsAdmin = dto.IsAdmin
            };

            var novoRef = await _firebase
                .Child("usuarios")
                .PostAsync(usuario);

            usuario.Id = novoRef.Key;

            await _firebase
                .Child("usuarios")
                .Child(usuario.Id)
                .PutAsync(usuario);

            return usuario.Id;
        }

        public async Task<bool> PromoverUsuarioParaAdminAsync(string email)
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

        public async Task<Usuario> BuscarUsuarioPorEmailAsync(string email)
        {
            var usuarioSnapshot = await _firebase
                .Child("usuarios")
                .OrderBy("Email")
                .EqualTo(email)
                .OnceAsync<Usuario>();

            return usuarioSnapshot.FirstOrDefault()?.Object;
        }

        public async Task<List<Usuario>> ListarUsuariosAsync()
        {
            var usuarios = await _firebase
                .Child("usuarios")
                .OnceAsync<Usuario>();

            return usuarios.Select(u =>
            {
                var obj = u.Object;
                obj.Id = u.Key;
                return obj;
            }).ToList();
        }

        public async Task<bool> AtualizarUsuarioAsync(string id, UsuarioDTO dto)
        {
            var existente = await _firebase
                .Child("usuarios")
                .Child(id)
                .OnceSingleAsync<Usuario>();

            if (existente == null)
                return false;

            var usuarioAtualizado = new Usuario
            {
                Id = id,
                Nome = dto.Nome,
                Email = dto.Email,
                Senha = BCrypt.Net.BCrypt.HashPassword(dto.Senha),
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
        public async Task<Usuario> BuscarUsuarioPorIdAsync(string id)
        {
            var usuarioSnapshot = await _firebase
                .Child("usuarios")
                .Child(id)
                .OnceSingleAsync<Usuario>();

            return usuarioSnapshot;
        }


        public async Task<bool> DeletarUsuarioAsync(string id)
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
    }
}
