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

public async Task SalvarPetAsync(Pet pet)
        {
            await _firebase
                .Child("pets")
                .Child(pet.Id)
                .PutAsync(pet);
        }

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