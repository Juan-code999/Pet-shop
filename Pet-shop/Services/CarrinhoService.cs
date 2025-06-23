using Firebase.Database;
using Firebase.Database.Query;
using Pet_shop.DTOs;

namespace Pet_shop.Services
{
    public class CarrinhoService
    {
        private readonly FirebaseClient _firebase;

        public CarrinhoService(IConfiguration configuration)
        {
            var databaseUrl = configuration["Firebase:DatabaseUrl"];
            _firebase = new FirebaseClient(databaseUrl);
        }

        public async Task<bool> SalvarCarrinhoAsync(string usuarioId, CarrinhoDTO dto)
        {
            dto.DataAtualizacao = DateTime.UtcNow;

            await _firebase
                .Child("carrinhos")
                .Child(usuarioId)
                .PutAsync(dto);

            return true;
        }

        public async Task<CarrinhoDTO> ObterCarrinhoAsync(string usuarioId)
        {
            return await _firebase
                .Child("carrinhos")
                .Child(usuarioId)
                .OnceSingleAsync<CarrinhoDTO>();
        }
    }
}
