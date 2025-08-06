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
            var existente = await BuscarUsuarioPorEmailAsync(usuarioDTO.Email);
            if (existente != null)
                return null;

            var usuario = new Usuario
            {
                Nome = usuarioDTO.Nome,
                Email = usuarioDTO.Email.ToLower(),
                Senha = BCrypt.Net.BCrypt.HashPassword(usuarioDTO.Senha),
                Telefone = usuarioDTO.Telefone,
                Foto = usuarioDTO.Foto,
                Endereco = new Endereco
                {
                    Rua = usuarioDTO.Endereco.Rua,
                    Numero = usuarioDTO.Endereco.Numero,
                    Complemento = usuarioDTO.Endereco.Complemento,
                    Bairro = usuarioDTO.Endereco.Bairro,
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
        public async Task<bool> AtualizarUsuarioAsync(string id, UsuarioUpdateDTO dto)
        {
            try
            {
                var existente = await _firebase.Child("usuarios").Child(id).OnceSingleAsync<Usuario>();
                if (existente == null) return false;

                // Atualiza apenas os campos fornecidos
                if (!string.IsNullOrWhiteSpace(dto.Nome)) existente.Nome = dto.Nome;
                if (!string.IsNullOrWhiteSpace(dto.Email)) existente.Email = dto.Email.ToLower();
                if (!string.IsNullOrWhiteSpace(dto.Telefone)) existente.Telefone = dto.Telefone;
                if (dto.Foto != null) existente.Foto = dto.Foto;

                // Senha só é atualizada se for fornecida e não vazia
                if (!string.IsNullOrWhiteSpace(dto.Senha))
                {
                    existente.Senha = BCrypt.Net.BCrypt.HashPassword(dto.Senha);
                }

                // Atualização de endereço
                if (dto.Endereco != null)
                {
                    existente.Endereco ??= new Endereco();

                    if (!string.IsNullOrWhiteSpace(dto.Endereco.Rua)) existente.Endereco.Rua = dto.Endereco.Rua;
                    if (!string.IsNullOrWhiteSpace(dto.Endereco.Numero)) existente.Endereco.Numero = dto.Endereco.Numero;
                    if (dto.Endereco.Complemento != null) existente.Endereco.Complemento = dto.Endereco.Complemento;
                    if (!string.IsNullOrWhiteSpace(dto.Endereco.Bairro)) existente.Endereco.Bairro = dto.Endereco.Bairro;
                    if (!string.IsNullOrWhiteSpace(dto.Endereco.Cidade)) existente.Endereco.Cidade = dto.Endereco.Cidade;
                    if (!string.IsNullOrWhiteSpace(dto.Endereco.Estado)) existente.Endereco.Estado = dto.Endereco.Estado;
                    if (!string.IsNullOrWhiteSpace(dto.Endereco.Cep)) existente.Endereco.Cep = dto.Endereco.Cep;
                }

                await _firebase.Child("usuarios").Child(id).PutAsync(existente);
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
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
                    Foto = usuario.Foto,
                    Endereco = new EnderecoDTO
                    {
                        Rua = usuario.Endereco?.Rua,
                        Complemento = usuario.Endereco.Complemento,
                        Bairro = usuario.Endereco.Bairro,
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
                    Foto = usuario.Foto,
                    Endereco = new EnderecoDTO
                    {
                        Rua = usuario.Endereco?.Rua,
                        Complemento = usuario.Endereco.Complemento,
                        Bairro = usuario.Endereco.Bairro,
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
                        Foto = obj.Foto,
                        Endereco = new EnderecoDTO
                        {
                            Rua = obj.Endereco?.Rua,
                            Complemento = obj.Endereco.Complemento,
                            Bairro = obj.Endereco.Bairro,
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
