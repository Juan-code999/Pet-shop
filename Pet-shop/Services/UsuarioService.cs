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

        // Salvar novo usuário
        public async Task<string> SalvarUsuarioAsync(UsuarioDTO usuarioDTO)
        {
            var usuario = new Usuario
            {
                Nome = usuarioDTO.Nome,
                Email = usuarioDTO.Email.ToLower(),
                Senha = usuarioDTO.Senha,
                Telefone = usuarioDTO.Telefone,
                Endereco = new Endereco
                {
                    Rua = usuarioDTO.Endereco.Rua,
                    Numero = usuarioDTO.Endereco.Numero,
                    Cidade = usuarioDTO.Endereco.Cidade,
                    Estado = usuarioDTO.Endereco.Estado,
                    Cep = usuarioDTO.Endereco.Cep
                },
                IsAdmin = usuarioDTO.IsAdmin
            };

            var novoUsuarioRef = await _firebase.Child("usuarios").PostAsync(usuario);
            var id = novoUsuarioRef.Key;

            usuario.Id = id;
            await _firebase.Child("usuarios").Child(id).PutAsync(usuario);

            return id;
        }

        // Atualizar usuário existente
        public async Task<bool> AtualizarUsuarioAsync(string id, UsuarioDTO dto)
        {
            try
            {
                var existente = await _firebase.Child("usuarios").Child(id).OnceSingleAsync<Usuario>();

                if (existente == null)
                    return false;

                var senhaHash = string.IsNullOrWhiteSpace(dto.Senha)
                    ? existente.Senha
                    : BCrypt.Net.BCrypt.HashPassword(dto.Senha);

                var usuarioAtualizado = new Usuario
                {
                    Id = id,
                    Nome = dto.Nome,
                    Email = dto.Email.ToLower(),
                    Senha = senhaHash,
                    Telefone = dto.Telefone,
                    Endereco = new Endereco
                    {
                        Rua = dto.Endereco.Rua,
                        Numero = dto.Endereco.Numero,
                        Cidade = dto.Endereco.Cidade,
                        Estado = dto.Endereco.Estado,
                        Cep = dto.Endereco.Cep
                    },
                    IsAdmin = dto.IsAdmin
                };

                await _firebase.Child("usuarios").Child(id).PutAsync(usuarioAtualizado);
                return true;
            }
            catch
            {
                return false;
            }
        }

        // Buscar usuário por ID
        public async Task<UsuarioDTO> BuscarUsuarioPorIdAsync(string id)
        {
            try
            {
                var usuario = await _firebase.Child("usuarios").Child(id).OnceSingleAsync<Usuario>();

                if (usuario == null)
                    return null;

                return new UsuarioDTO
                {
                    Id = id,
                    Nome = usuario.Nome,
                    Email = usuario.Email,
                    Telefone = usuario.Telefone,
                    Endereco = new EnderecoDTO
                    {
                        Rua = usuario.Endereco?.Rua,
                        Numero = usuario.Endereco?.Numero,
                        Cidade = usuario.Endereco?.Cidade,
                        Estado = usuario.Endereco?.Estado,
                        Cep = usuario.Endereco?.Cep
                    },
                    IsAdmin = usuario.IsAdmin
                };
            }
            catch
            {
                return null;
            }
        }

        // Buscar usuário por e-mail
        public async Task<UsuarioDTO> BuscarUsuarioPorEmailAsync(string email)
        {
            var usuarios = await _firebase
                .Child("usuarios")
                .OrderBy("Email")
                .EqualTo(email.ToLower())
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
                    Endereco = new EnderecoDTO
                    {
                        Rua = usuario.Endereco?.Rua,
                        Numero = usuario.Endereco?.Numero,
                        Cidade = usuario.Endereco?.Cidade,
                        Estado = usuario.Endereco?.Estado,
                        Cep = usuario.Endereco?.Cep
                    },
                    IsAdmin = usuario.IsAdmin
                };
            }

            return null;
        }

        // Listar todos os usuários
        public async Task<List<UsuarioDTO>> ListarUsuariosAsync()
        {
            try
            {
                var usuarios = await _firebase.Child("usuarios").OnceAsync<Usuario>();

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
                        Endereco = new EnderecoDTO
                        {
                            Rua = obj.Endereco?.Rua,
                            Numero = obj.Endereco?.Numero,
                            Cidade = obj.Endereco?.Cidade,
                            Estado = obj.Endereco?.Estado,
                            Cep = obj.Endereco?.Cep
                        },
                        IsAdmin = obj.IsAdmin
                    };
                }).ToList();
            }
            catch
            {
                return new List<UsuarioDTO>();
            }
        }

        // Deletar usuário
        public async Task<bool> DeletarUsuarioAsync(string id)
        {
            try
            {
                var existente = await _firebase.Child("usuarios").Child(id).OnceSingleAsync<Usuario>();

                if (existente == null)
                    return false;

                await _firebase.Child("usuarios").Child(id).DeleteAsync();

                return true;
            }
            catch
            {
                return false;
            }
        }

        // Promover usuário para admin
        public async Task<bool> PromoverUsuarioParaAdminAsync(string email)
        {
            try
            {
                var usuarioSnapshot = await _firebase
                    .Child("usuarios")
                    .OrderBy("Email")
                    .EqualTo(email.ToLower())
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

        // Verifica se usuário é admin
        public async Task<bool> VerificarSeUsuarioEhAdminAsync(string email)
        {
            try
            {
                var usuarioSnapshot = await _firebase
                    .Child("usuarios")
                    .OrderBy("Email")
                    .EqualTo(email.ToLower())
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
    }
}
