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

        public async Task<List<Contato>> BuscarTodosContatosAsync()
        {
            var contatos = await _firebase.Child("contatos").OnceAsync<Contato>();
            return contatos.Select(c => c.Object).ToList();
        }



        public async Task<string> SalvarNewsletterAsync(NewsletterDTO dto)
        {
            var existente = await _firebase.Child("newsletters")
                .OrderBy("Email")
                .EqualTo(dto.Email)
                .OnceAsync<Newsletter>();

            if (existente.Any())
                return null;

            var newsletter = new Newsletter
            {
                Email = dto.Email,
                DataInscricao = DateTime.Now
            };

            var refNova = await _firebase.Child("newsletters").PostAsync(newsletter);
            return refNova.Key;
        }

        public async Task<bool> DeletarContatoAsync(string id)
        {
            try
            {
                await _firebase.Child("contatos").Child(id).DeleteAsync();
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> DeletarNewsletterAsync(string id)
        {
            try
            {
                await _firebase.Child("newsletters").Child(id).DeleteAsync();
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<List<Newsletter>> BuscarTodasNewslettersAsync()
        {
            var newsletters = await _firebase.Child("newsletters").OnceAsync<Newsletter>();
            return newsletters.Select(n => new Newsletter
            {
                Id = n.Key,
                Email = n.Object.Email,
                DataInscricao = n.Object.DataInscricao
            }).ToList();
        }
    }
}
