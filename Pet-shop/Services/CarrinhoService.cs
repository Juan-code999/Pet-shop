using Firebase.Database;
using Firebase.Database.Query;
using Pet_shop.DTOs;

public class CarrinhoService
{
    private readonly FirebaseClient _firebase;

    // Recebe o token do usuário autenticado para usar nas requisições Firebase
    public CarrinhoService(string databaseUrl, string token)
    {
        _firebase = new FirebaseClient(
            databaseUrl,
            new FirebaseOptions
            {
                AuthTokenAsyncFactory = () => Task.FromResult(token)
            });
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
        var carrinho = await _firebase
            .Child("carrinhos")
            .Child(usuarioId)
            .OnceSingleAsync<CarrinhoDTO>();

        return carrinho;
    }
}
