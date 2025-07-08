import React, { useEffect, useState } from "react";
import "../styles/Carrinho.css";

export default function Carrinho() {
  const [carrinho, setCarrinho] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
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
      const [resCarrinho, resProdutos] = await Promise.all([
        fetch(`http://localhost:5005/api/Carrinho/${usuarioId}`),
        fetch("http://localhost:5005/api/Produtos")
      ]);

      if (!resCarrinho.ok) throw new Error("Erro ao buscar carrinho");
      if (!resProdutos.ok) throw new Error("Erro ao buscar produtos");

      const [carrinhoJson, produtosJson] = await Promise.all([
        resCarrinho.json(),
        resProdutos.json()
      ]);

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

  const toggleItemSelection = (produtoId, tamanho) => {
    const itemKey = `${produtoId}-${tamanho}`;
    setSelectedItems(prev =>
      prev.includes(itemKey)
        ? prev.filter(id => id !== itemKey)
        : [...prev, itemKey]
    );
  };

  const isItemSelected = (produtoId, tamanho) => {
    return selectedItems.includes(`${produtoId}-${tamanho}`);
  };

  async function removerItem(produtoId, tamanho) {
    if (!carrinho) return;
    
    try {
      const response = await fetch(`http://localhost:5005/api/Carrinho/${usuarioId}/remover`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ produtoId, tamanho })
      });
      
      if (!response.ok) throw new Error('Erro ao remover item');
      await carregarDados();
      // Remove from selected items if it was there
      setSelectedItems(prev => prev.filter(id => id !== `${produtoId}-${tamanho}`));
    } catch (error) {
      setErro(error.message);
    }
  }

  async function atualizarQuantidade(produtoId, tamanho, novaQuantidade) {
    if (!carrinho || novaQuantidade < 1) return;
    
    try {
      const response = await fetch(`http://localhost:5005/api/Carrinho/${usuarioId}/atualizar-quantidade`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ produtoId, tamanho, quantidade: novaQuantidade })
      });
      
      if (!response.ok) throw new Error('Erro ao atualizar quantidade');
      await carregarDados();
    } catch (error) {
      setErro(error.message);
    }
  }

  function calcularTotal() {
    if (!carrinho || carrinho.itens.length === 0 || selectedItems.length === 0) return 0;
    
    return carrinho.itens.reduce((total, item) => {
      if (!isItemSelected(item.produtoId, item.tamanho)) return total;
      
      const produto = produtos.find(p => p.id === item.produtoId);
      if (!produto) return total;
      
      const tamanhoDetalhe = produto.tamanhos?.find(t => t.tamanho === item.tamanho);
      const preco = tamanhoDetalhe?.precoTotal ?? 0;
      
      return total + (preco * item.quantidade);
    }, 0);
  }

  async function finalizarCompra() {
    if (selectedItems.length === 0) {
      setErro("Selecione pelo menos um item para finalizar a compra");
      return;
    }

    try {
      // Aqui você implementaria a lógica de finalização de compra
      // Por exemplo, criar um pedido com os itens selecionados
      
      // Após finalizar, podemos remover os itens comprados
      const promises = selectedItems.map(itemKey => {
        const [produtoId, tamanho] = itemKey.split('-');
        return removerItem(produtoId, tamanho);
      });

      await Promise.all(promises);
      setSelectedItems([]);
      alert('Compra finalizada com sucesso!');
    } catch (error) {
      setErro(error.message);
    }
  }

  if (loading) return <div className="loading">Carregando carrinho...</div>;
  if (erro) return <div className="error">Erro: {erro}</div>;
  if (!carrinho || carrinho.itens.length === 0) return <div className="empty-cart">Seu carrinho está vazio.</div>;

  const total = calcularTotal();
  const selectedCount = selectedItems.length;

  return (
    <div className="cart-container">
      <h1 className="cart-title">Meu Carrinho</h1>
      
      <div className="cart-content">
        <div className="cart-items-container">
          <div className="cart-items-header">
            <div className="header-select-all">
              <input
                type="checkbox"
                checked={selectedItems.length === carrinho.itens.length && carrinho.itens.length > 0}
                onChange={() => {
                  if (selectedItems.length === carrinho.itens.length) {
                    setSelectedItems([]);
                  } else {
                    setSelectedItems(carrinho.itens.map(item => `${item.produtoId}-${item.tamanho}`));
                  }
                }}
              />
              <span>Selecionar todos ({carrinho.itens.length})</span>
            </div>
          </div>
          
          <div className="cart-items">
            {carrinho.itens.map((item) => {
              const produto = produtos.find((p) => p.id === item.produtoId);
              const isSelected = isItemSelected(item.produtoId, item.tamanho);

              if (!produto) {
                return (
                  <div key={`${item.produtoId}-${item.tamanho}`} className={`cart-item ${isSelected ? 'selected' : ''}`}>
                    <div className="item-select">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleItemSelection(item.produtoId, item.tamanho)}
                      />
                    </div>
                    <div className="item-content">
                      <p className="item-name"><strong>Produto não disponível</strong></p>
                      <div className="item-details">
                        <p>Tamanho: {item.tamanho}</p>
                        <p>Quantidade: {item.quantidade}</p>
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
              }

              const tamanhoDetalhe = produto.tamanhos?.find((t) => t.tamanho === item.tamanho);
              const preco = tamanhoDetalhe?.precoTotal ?? 0;
              const subtotal = preco * item.quantidade;

              return (
                <div key={`${item.produtoId}-${item.tamanho}`} className={`cart-item ${isSelected ? 'selected' : ''}`}>
                  <div className="item-select">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleItemSelection(item.produtoId, item.tamanho)}
                    />
                  </div>
                  
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
                    </div>
                  </div>
                  
                  <div className="item-price">
                    <p className="subtotal"><strong>R$ {subtotal.toFixed(2)}</strong></p>
                    <button 
                      className="remove-btn"
                      onClick={() => removerItem(item.produtoId, item.tamanho)}
                    >
                      Remover
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="cart-summary">
          <h3>Resumo do Pedido</h3>
          <div className="summary-row">
            <span>Itens selecionados:</span>
            <span>{selectedCount}</span>
          </div>
          <div className="summary-row total">
            <span>Total:</span>
            <span className="total-price">R$ {total.toFixed(2)}</span>
          </div>
          <button 
            className="checkout-btn"
            onClick={finalizarCompra}
            disabled={selectedCount === 0}
          >
            Finalizar Compra ({selectedCount})
          </button>
        </div>
      </div>
    </div>
  );
}