using Firebase.Database;
using Firebase.Database.Query;
using Pet_shop.DTOs;
using Pet_shop.Models;

namespace Pet_shop.Services
{
    /// <summary>
    /// Serviço para gerenciar operações do carrinho
    /// </summary>
    public class CarrinhoService
    {
        private readonly FirebaseClient _firebase;

        /// <summary>
        /// Construtor do CarrinhoService
        /// </summary>
        public CarrinhoService(IConfiguration configuration)
        {
            var databaseUrl = configuration["Firebase:DatabaseUrl"] ?? throw new ArgumentNullException("Firebase:DatabaseUrl");
            _firebase = new FirebaseClient(databaseUrl);
        }

        /// <summary>
        /// Adiciona um item ao carrinho
        /// </summary>
        public async Task AdicionarItemAsync(string usuarioId, ItemCarrinhoDTO novoItem)
        {
            var carrinho = await ObterCarrinhoAsync(usuarioId) ?? new CarrinhoDTO
            {
                UsuarioId = usuarioId,
                Itens = new List<ItemCarrinhoDTO>()
            };

            var itemExistente = carrinho.Itens.FirstOrDefault(i =>
                i.ProdutoId == novoItem.ProdutoId && i.Tamanho == novoItem.Tamanho);

            if (itemExistente != null)
                itemExistente.Quantidade += novoItem.Quantidade;
            else
                carrinho.Itens.Add(novoItem);

            carrinho.DataAtualizacao = DateTime.UtcNow;

            await _firebase
                .Child("carrinhos")
                .Child(usuarioId)
                .PutAsync(carrinho);
        }

        /// <summary>
        /// Obtém o carrinho de um usuário
        /// </summary>
        public async Task<CarrinhoDTO?> ObterCarrinhoAsync(string usuarioId)
        {
            try
            {
                return await _firebase
                    .Child("carrinhos")
                    .Child(usuarioId)
                    .OnceSingleAsync<CarrinhoDTO>();
            }
            catch
            {
                return null;
            }
        }

        /// <summary>
        /// Remove um item do carrinho
        /// </summary>
        public async Task RemoverItemAsync(string usuarioId, string produtoId, string tamanho)
        {
            var carrinho = await ObterCarrinhoAsync(usuarioId);
            if (carrinho == null) return;

            carrinho.Itens.RemoveAll(i => i.ProdutoId == produtoId && i.Tamanho == tamanho);
            carrinho.DataAtualizacao = DateTime.UtcNow;

            await _firebase
                .Child("carrinhos")
                .Child(usuarioId)
                .PutAsync(carrinho);
        }

        /// <summary>
        /// Atualiza a quantidade de um item no carrinho
        /// </summary>
        public async Task AtualizarQuantidadeAsync(string usuarioId, string produtoId, string tamanho, int novaQuantidade)
        {
            if (novaQuantidade <= 0)
            {
                await RemoverItemAsync(usuarioId, produtoId, tamanho);
                return;
            }

            var carrinho = await ObterCarrinhoAsync(usuarioId);
            if (carrinho == null) return;

            var item = carrinho.Itens.FirstOrDefault(i => i.ProdutoId == produtoId && i.Tamanho == tamanho);
            if (item != null)
            {
                item.Quantidade = novaQuantidade;
                carrinho.DataAtualizacao = DateTime.UtcNow;

                await _firebase
                    .Child("carrinhos")
                    .Child(usuarioId)
                    .PutAsync(carrinho);
            }
        }

        /// <summary>
        /// Atualiza o tamanho de um item no carrinho
        /// </summary>
        public async Task AtualizarTamanhoAsync(
            string usuarioId,
            string produtoId,
            string tamanhoAtual,
            string novoTamanho,
            decimal novoPreco)
        {
            if (tamanhoAtual == novoTamanho)
                return;

            var carrinho = await ObterCarrinhoAsync(usuarioId);
            if (carrinho == null)
                throw new Exception("Carrinho não encontrado");

            var itemAtual = carrinho.Itens.FirstOrDefault(i =>
                i.ProdutoId == produtoId && i.Tamanho == tamanhoAtual);

            if (itemAtual == null)
                throw new Exception("Item não encontrado no carrinho");

            var itemExistente = carrinho.Itens.FirstOrDefault(i =>
                i.ProdutoId == produtoId && i.Tamanho == novoTamanho);

            if (itemExistente != null)
            {
                itemExistente.Quantidade += itemAtual.Quantidade;
                carrinho.Itens.Remove(itemAtual);
            }
            else
            {
                itemAtual.Tamanho = novoTamanho;
                itemAtual.PrecoUnitario = novoPreco;
            }

            carrinho.DataAtualizacao = DateTime.UtcNow;

            await _firebase
                .Child("carrinhos")
                .Child(usuarioId)
                .PutAsync(carrinho);
        }

        /// <summary>
        /// Limpa todo o carrinho de um usuário
        /// </summary>
        public async Task LimparCarrinhoAsync(string usuarioId)
        {
            await _firebase
                .Child("carrinhos")
                .Child(usuarioId)
                .DeleteAsync();
        }
    }
}