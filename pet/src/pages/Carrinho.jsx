import React, { useEffect, useState } from "react";
import "../styles/Carrinho.css"; // Arquivo CSS separado

export default function Carrinho() {
  const [carrinho, setCarrinho] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  // Pega o usuário logado do localStorage
  const usuarioId = localStorage.getItem("usuarioId");

  async function carregarDados() {
    if (!usuarioId) {
      setErro("Usuário não está logado");
      setLoading(false);
      return;
    }

    setLoading(true);
    setErro(null);
    try {
      // Busca carrinho do usuário
      const resCarrinho = await fetch(`http://localhost:5005/api/Carrinho/${usuarioId}`);
      if (!resCarrinho.ok) throw new Error("Erro ao buscar carrinho");
      const carrinhoJson = await resCarrinho.json();

      // Busca todos os produtos
      const resProdutos = await fetch("http://localhost:5005/api/Produtos");
      if (!resProdutos.ok) throw new Error("Erro ao buscar produtos");
      const produtosJson = await resProdutos.json();

      setCarrinho(carrinhoJson);
      setProdutos(produtosJson);
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, [usuarioId]);

  async function removerItem(produtoId, tamanho) {
    if (!carrinho) return;
    
    try {
      const response = await fetch(`http://localhost:5005/api/Carrinho/${usuarioId}/itens`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ produtoId, tamanho })
      });
      
      if (!response.ok) throw new Error('Erro ao remover item');
      
      // Atualiza o carrinho localmente após remoção bem-sucedida
      const novosItens = carrinho.itens.filter(
        (item) => !(item.produtoId === produtoId && item.tamanho === tamanho)
      );
      setCarrinho({ ...carrinho, itens: novosItens });
    } catch (error) {
      setErro(error.message);
    }
  }

  async function atualizarQuantidade(produtoId, tamanho, novaQuantidade) {
    if (!carrinho || novaQuantidade < 1) return;
    
    try {
      const response = await fetch(`http://localhost:5005/api/Carrinho/${usuarioId}/itens`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ produtoId, tamanho, quantidade: novaQuantidade })
      });
      
      if (!response.ok) throw new Error('Erro ao atualizar quantidade');
      
      // Atualiza o carrinho localmente após atualização bem-sucedida
      const novosItens = carrinho.itens.map(item => 
        item.produtoId === produtoId && item.tamanho === tamanho 
          ? { ...item, quantidade: novaQuantidade } 
          : item
      );
      setCarrinho({ ...carrinho, itens: novosItens });
    } catch (error) {
      setErro(error.message);
    }
  }

  function calcularTotal() {
    if (!carrinho || carrinho.itens.length === 0) return 0;
    
    return carrinho.itens.reduce((total, item) => {
      const produto = produtos.find(p => p.id === item.produtoId);
      if (!produto) return total;
      
      const tamanhoDetalhe = produto.tamanhos?.find(t => t.tamanho === item.tamanho);
      const preco = tamanhoDetalhe?.precoTotal ?? 0;
      
      return total + (preco * item.quantidade);
    }, 0);
  }
  
  if (loading) return <div className="loading">Carregando carrinho...</div>;
  if (erro) return <div className="error">Erro: {erro}</div>;
  if (!carrinho || carrinho.itens.length === 0) return <div className="empty-cart">Seu carrinho está vazio.</div>;

  const total = calcularTotal();

  return (
    <div className="cart-container">
      <h1 className="cart-title">Meu Carrinho</h1>
      
      <div className="cart-items">
        {carrinho.itens.map((item) => {
          const produto = produtos.find((p) => p.id === item.produtoId);

          if (!produto) {
            return (
              <div key={`${item.produtoId}-${item.tamanho}`} className="cart-item">
                <p className="item-name"><strong>Produto não disponível</strong></p>
                <div className="item-details">
                  <p>Tamanho: {item.tamanho}</p>
                  <p>Quantidade: {item.quantidade}</p>
                </div>
                <button 
                  className="remove-btn"
                  onClick={() => removerItem(item.produtoId, item.tamanho)}
                >
                  Remover
                </button>
              </div>
            );
          }

          const tamanhoDetalhe = produto.tamanhos?.find((t) => t.tamanho === item.tamanho);
          const preco = tamanhoDetalhe?.precoTotal ?? 0;
          const subtotal = preco * item.quantidade;

          return (
            <div key={`${item.produtoId}-${item.tamanho}`} className="cart-item">
              <div className="item-image">
                {produto.imagensUrl && produto.imagensUrl.length > 0 && (
                  <img
                    src={produto.imagensUrl[0]}
                    alt={produto.nome}
                  />
                )}
              </div>
              
              <div className="item-info">
                <h3 className="item-name">{produto.nome}</h3>
                <div className="item-details">
                  <p><strong>Tamanho:</strong> {item.tamanho}</p>
                  <p><strong>Preço unitário:</strong> R$ {preco.toFixed(2)}</p>
                  
                  <div className="quantity-control">
                    <button 
                      onClick={() => atualizarQuantidade(item.produtoId, item.tamanho, item.quantidade - 1)}
                      disabled={item.quantidade <= 1}
                    >
                      -
                    </button>
                    <span>{item.quantidade}</span>
                    <button 
                      onClick={() => atualizarQuantidade(item.produtoId, item.tamanho, item.quantidade + 1)}
                    >
                      +
                    </button>
                  </div>
                  
                  <p className="subtotal"><strong>Subtotal:</strong> R$ {subtotal.toFixed(2)}</p>
                </div>
              </div>
              
              <button 
                className="remove-btn"
                onClick={() => removerItem(item.produtoId, item.tamanho)}
              >
                Remover
              </button>
            </div>
          );
        })}
      </div>
      
      <div className="cart-summary">
        <h3>Resumo do Pedido</h3>
        <div className="summary-row">
          <span>Total:</span>
          <span>R$ {total.toFixed(2)}</span>
        </div>
        <button className="checkout-btn">Finalizar Compra</button>
      </div>
    </div>
   );
}