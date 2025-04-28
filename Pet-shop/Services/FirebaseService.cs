using Firebase.Database;
using Firebase.Database.Query;
using Pet_shop.DTOs;
using Pet_shop.Models;

namespace Pet_shop.Services
{
    public class FirebaseService
    {
        private readonly FirebaseClient _firebase;

        public FirebaseService(IConfiguration configuration)
        {
            var url = configuration["Firebase:DatabaseUrl"];
            _firebase = new FirebaseClient(url);
        }

        public FirebaseClient GetDatabase() => _firebase;

        // 🔸 Agendamento

        // Salvar agendamento no Firebase
        public async Task SalvarAgendamentoAsync(Agendamento agendamento)
        {
            await _firebase
                .Child("agendamentos")
                .PostAsync(agendamento);
        }

        // Listar agendamentos (opcional)
        public async Task<List<Agendamento>> ListarAgendamentosAsync()
        {
            var agendamentos = await _firebase
                .Child("agendamentos")
                .OnceAsync<Agendamento>();

            return agendamentos
                .Select(a => new Agendamento
                {
                    Id = a.Key,
                    NomePet = a.Object.NomePet,
                    DataAgendamento = a.Object.DataAgendamento,
                    HoraAgendamento = a.Object.HoraAgendamento
                })
                .ToList();
        }

        // 🔸 Pet

        // Salvar pet no Firebase
        public async Task SalvarPetAsync(Pet pet)
        {
            await _firebase
                .Child("pets")
                .Child(pet.Id)
                .PutAsync(pet);
        }

        // Obter lista de pets de um tutor específico
        public async Task<List<Pet>> ObterPetsDoTutorAsync(string tutorUid)
        {
            var pets = await _firebase
                .Child("pets")
                .OnceAsync<Pet>();

            return pets
                .Select(p => p.Object)
                .Where(p => p.TutorUid == tutorUid)
                .ToList();
        }

        // 🔸 Usuarios

        // Método para salvar o usuário no Firebase com IsAdmin
        public async Task<string> SalvarUsuarioAsync(UsuarioDTO usuarioDTO)
        {
            var usuario = new Usuario
            {
                Id = "",
                Nome = usuarioDTO.Nome,
                Email = usuarioDTO.Email,
                Senha = usuarioDTO.Senha,
                Telefone = usuarioDTO.Telefone,
                Endereco = usuarioDTO.Endereco,
                IsAdmin = usuarioDTO.IsAdmin // Salva a informação do admin
            };

            var novoUsuarioRef = await _firebase
                .Child("usuarios")
                .PostAsync(new
                {
                    usuario.Id,
                    usuario.Nome,
                    usuario.Email,
                    usuario.Senha,
                    usuario.Telefone,
                    usuario.Endereco,
                    usuario.IsAdmin
                });

            usuario.Id = novoUsuarioRef.Key;

            await _firebase
                .Child("usuarios")
                .Child(usuario.Id)
                .PutAsync(usuario);
            return novoUsuarioRef.Key; // Retorna o ID gerado automaticamente pelo Firebase
        }

        // Método para promover um usuário para admin
        public async Task<bool> PromoverUsuarioParaAdminAsync(string email)
        {
            var usuarioRef = _firebase
                .Child("usuarios")
                .OrderBy("Email")
                .EqualTo(email);

            var usuarioSnapshot = await usuarioRef.OnceAsync<Usuario>();

            if (usuarioSnapshot.Count == 0)
            {
                return false; // Usuário não encontrado
            }

            var usuario = usuarioSnapshot.First().Object;
            await _firebase
                .Child("usuarios")
                .Child(usuarioSnapshot.First().Key)
                .Child("IsAdmin")
                .PutAsync(true); // Atualiza o campo IsAdmin para true

            return true; // Sucesso
        }

        // Método para buscar um usuário por e-mail
        public async Task<Usuario> BuscarUsuarioPorEmailAsync(string email)
        {
            var usuarioRef = _firebase
                .Child("usuarios")
                .OrderBy("Email")
                .EqualTo(email);

            var usuarioSnapshot = await usuarioRef.OnceAsync<Usuario>();

            if (usuarioSnapshot.Count == 0)
            {
                return null; // Não encontrado
            }

            return usuarioSnapshot.First().Object;
        }

        // Método para listar todos os usuários (opcional)
        public async Task<List<Usuario>> ListarUsuariosAsync()
        {
            var usuarios = await _firebase
                .Child("usuarios")
                .OnceAsync<Usuario>();

            return usuarios
                .Select(u => u.Object)
                .ToList();
        }
    }
}
