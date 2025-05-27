using Firebase.Database;
using Firebase.Database.Query;
using Pet_shop.DTOs;
using Pet_shop.Models;

namespace Pet_shop.Services
{
    public class ContatoService
    {
        private readonly FirebaseClient _firebase;

        public ContatoService(IConfiguration configuration)
        {
            _firebase = new FirebaseClient(configuration["Firebase:DatabaseUrl"]);
        }

        public async Task<string> SalvarContatoAsync(ContatoDTO dto)
        {
            var contato = new Contato
            {
                UsuarioId = dto.UsuarioId,   // <--- pega o Id do usuário, se houver
                Email = dto.Email,
                Telefone = dto.Telefone,
                Nome = dto.Nome,
                Mensagem = dto.Mensagem,
                DataEnvio = DateTime.Now
            };

            var contatoRef = await _firebase.Child("contatos").PostAsync(contato);
            return contatoRef.Key;
        }


        public async Task<string> SalvarNewsletterAsync(NewsletterDTO dto)
        {
            // opcional: verificar duplicidade
            var existente = await _firebase.Child("newsletters")
                .OrderBy("Email")
                .EqualTo(dto.Email)
                .OnceAsync<Newsletter>();

            if (existente.Any())
                return null; // já cadastrado

            var newsletter = new Newsletter { Email = dto.Email };
            var refNova = await _firebase.Child("newsletters").PostAsync(newsletter);
            return refNova.Key;
        }
    }
}
