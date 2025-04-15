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

        public async Task AddAgendamentoAsync(Agendamento agendamento)
        {
            await _firebase
                .Child("agendamentos")
                .Child(agendamento.Id)
                .PutAsync(agendamento);
        }

        public async Task<Agendamento?> GetAgendamentoAsync(string id)
        {
            return await _firebase
                .Child("agendamentos")
                .Child(id)
                .OnceSingleAsync<Agendamento>();
        }

        public async Task CancelarAgendamentoAsync(string id)
        {
            await _firebase
                .Child("agendamentos")
                .Child(id)
                .DeleteAsync();
        }

        public async Task<List<Agendamento>> ListarAgendamentosAsync()
        {
            var result = await _firebase
                .Child("agendamentos")
                .OnceAsync<Agendamento>();

            return result.Select(item => item.Object).ToList();
        }

        // 🔸 Pet

        public async Task AddPetAsync(Pet pet)
        {
            await _firebase
                .Child("pets")
                .Child(pet.Id)
                .PutAsync(pet);
        }

        public async Task<Pet?> GetPetAsync(string id)
        {
            return await _firebase
                .Child("pets")
                .Child(id)
                .OnceSingleAsync<Pet>();
        }

        public async Task<List<Pet>> ListarPetsAsync()
        {
            var result = await _firebase
                .Child("pets")
                .OnceAsync<Pet>();

            return result.Select(item => item.Object).ToList();
        }

        public async Task RemoverPetAsync(string id)
        {
            await _firebase
                .Child("pets")
                .Child(id)
                .DeleteAsync();
        }

        // 🔸 Tutor

        public async Task AddTutorAsync(Tutor tutor)
        {
            await _firebase
                .Child("tutores")
                .Child(tutor.Id)
                .PutAsync(tutor);
        }

        public async Task<Tutor?> GetTutorAsync(string id)
        {
            try
            {
                return await _firebase
                    .Child("tutores")
                    .Child(id)
                    .OnceSingleAsync<Tutor>();
            }
            catch
            {
                return null;
            }
        }

        public async Task<List<Tutor>> ListarTutoresAsync()
        {
            var result = await _firebase
                .Child("tutores")
                .OnceAsync<Tutor>();

            return result.Select(item => item.Object).ToList();
        }

        public async Task RemoverTutorAsync(string id)
        {
            await _firebase
                .Child("tutores")
                .Child(id)
                .DeleteAsync();
        }

        // 🔸 Usuarios

        public async Task SalvarUsuarioAsync(UsuarioDTO usuarioDTO)
        {
            // Mapeia o UsuarioDTO para o modelo Usuario
            var usuario = new Usuario
            {
                Nome = usuarioDTO.Nome,
                Email = usuarioDTO.Email,
                Senha = usuarioDTO.Senha,
                Telefone = usuarioDTO.Telefone,
                Endereco = usuarioDTO.Endereco
            };

            // Gerando um ID único automaticamente no Firebase
            var novoUsuarioRef = await _firebase
                .Child("usuarios")  // Referência para o nó "usuarios" no Realtime Database
                .PostAsync(new
                {
                    usuario.Nome,
                    usuario.Email,
                    usuario.Senha,
                    usuario.Telefone,
                    usuario.Endereco
                });

            // Pega o ID gerado automaticamente pelo Firebase
            var novoId = novoUsuarioRef.Key;

            // Se precisar salvar o ID gerado no próprio modelo de Usuario (não necessário aqui, mas se precisar)
            // usuario.Id = novoId;
        }


    }
}