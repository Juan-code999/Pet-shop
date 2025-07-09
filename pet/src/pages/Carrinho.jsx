import React, { useEffect, useState } from "react";
import { 
  FaShoppingCart, 
  FaTrash, 
  FaCheck, 
  FaExclamationTriangle,
  FaSpinner,
  FaArrowLeft
} from "react-icons/fa";
import { 
  FaCcVisa, 
  FaCcMastercard, 
  FaCcAmex,
  FaBarcode,
  FaPix
} from "react-icons/fa6";
import { BiSolidDiscount } from "react-icons/bi";
import { Link } from "react-router-dom";
import "../styles/Carrinho.css";

export default function Carrinho() {
  const [carrinho, setCarrinho] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [cupom, setCupom] = useState("");
  const [desconto, setDesconto] = useState(0);
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

  const toggleSelectAll = () => {
    if (!carrinho) return;
    
    if (selectedItems.length === carrinho.itens.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(carrinho.itens.map(item => `${item.produtoId}-${item.tamanho}`));
    }
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
      setSelectedItems(prev => prev.filter(id => id !== `${produtoId}-${tamanho}`));
    } catch (error) {
      setErro(error.message);
    }
  }

  async function removerItensSelecionados() {
    if (selectedItems.length === 0) {
      setErro("Selecione pelo menos um item para remover");
      return;
    }

    try {
      const promises = selectedItems.map(itemKey => {
        const [produtoId, tamanho] = itemKey.split('-');
        return removerItem(produtoId, tamanho);
      });

      await Promise.all(promises);
      setSelectedItems([]);
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

  function calcularSubtotal() {
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

  function aplicarCupom() {
    // Simulação de aplicação de cupom
    if (cupom.toUpperCase() === "DESCONTO10") {
      setDesconto(0.1); // 10% de desconto
      alert("Cupom aplicado com sucesso! 10% de desconto.");
    } else if (cupom.toUpperCase() === "DESCONTO20") {
      setDesconto(0.2); // 20% de desconto
      alert("Cupom aplicado com sucesso! 20% de desconto.");
    } else {
      setDesconto(0);
      setErro("Cupom inválido");
    }
  }

  function calcularTotal() {
    const subtotal = calcularSubtotal();
    const valorDesconto = subtotal * desconto;
    return subtotal - valorDesconto;
  }

  async function finalizarCompra() {
    if (selectedItems.length === 0) {
      setErro("Selecione pelo menos um item para finalizar a compra");
      return;
    }

    try {
      // Aqui você faria a chamada para a API de checkout/pagamento
      // Por enquanto, apenas simulamos a finalização
      
      // Remove os itens do carrinho após a compra
      const promises = selectedItems.map(itemKey => {
        const [produtoId, tamanho] = itemKey.split('-');
        return removerItem(produtoId, tamanho);
      });

      await Promise.all(promises);
      setSelectedItems([]);
      setDesconto(0);
      setCupom("");
      
      alert('Compra finalizada com sucesso! Obrigado por sua compra.');
    } catch (error) {
      setErro(error.message);
    }
  }

  if (loading) return (
    <div className="loading-container">
      <FaSpinner className="loading-spinner" />
      <p>Carregando seu carrinho...</p>
    </div>
  );
  
  if (erro) return (
    <div className="error-container">
      <div className="error-icon"><FaExclamationTriangle /></div>
      <p>{erro}</p>
      <button onClick={carregarDados} className="retry-btn">Tentar novamente</button>
    </div>
  );
  
  if (!carrinho || carrinho.itens.length === 0) return (
    <div className="empty-cart-container">
      <div className="empty-cart-icon"><FaShoppingCart /></div>
      <h2>Seu carrinho está vazio</h2>
      <p>Parece que você ainda não adicionou nenhum item</p>
      <Link to="/produtos" className="continue-shopping-btn">
        <FaArrowLeft style={{ marginRight: '8px' }} />
        Continuar comprando
      </Link>
    </div>
  );

  const subtotal = calcularSubtotal();
  const valorDesconto = subtotal * desconto;
  const total = calcularTotal();
  const selectedCount = selectedItems.length;

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h1 className="cart-title">Meu Carrinho</h1>
        <div className="cart-steps">
          <span className="step active">Carrinho</span>
          <span className="divider">›</span>
          <span className="step">Pagamento</span>
          <span className="divider">›</span>
          <span className="step">Confirmação</span>
        </div>
      </div>
      
      <div className="cart-content">
        <div className="cart-items-container">
          <div className="cart-items-header">
            <div className="header-select-all">
              <label className="custom-checkbox">
                <input
                  type="checkbox"
                  checked={selectedItems.length === carrinho.itens.length && carrinho.itens.length > 0}
                  onChange={toggleSelectAll}
                />
                <span className="checkmark"></span>
              </label>
              <span>Selecionar todos ({carrinho.itens.length} itens)</span>
            </div>
            
            {selectedCount > 0 && (
              <button 
                className="remove-selected-btn"
                onClick={removerItensSelecionados}
              >
                <FaTrash style={{ marginRight: '5px' }} />
                Remover selecionados
              </button>
            )}
          </div>
          
          <div className="cart-items">
            {carrinho.itens.map((item) => {
              const produto = produtos.find((p) => p.id === item.produtoId);
              const isSelected = isItemSelected(item.produtoId, item.tamanho);

              if (!produto) {
                return (
                  <div key={`${item.produtoId}-${item.tamanho}`} className={`cart-item ${isSelected ? 'selected' : ''}`}>
                    <div className="item-select">
                      <label className="custom-checkbox">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleItemSelection(item.produtoId, item.tamanho)}
                        />
                        <span className="checkmark"></span>
                      </label>
                    </div>
                    <div className="item-content">
                      <div className="item-image unavailable">
                        <span>Produto indisponível</span>
                      </div>
                      <div className="item-details">
                        <p className="item-name">Produto não disponível</p>
                        <div className="item-attributes">
                          <span className="attribute">Tamanho: {item.tamanho}</span>
                          <span className="attribute">Quantidade: {item.quantidade}</span>
                        </div>
                      </div>
                    </div>
                    <div className="item-actions">
                      <button 
                        className="remove-btn"
                        onClick={() => removerItem(item.produtoId, item.tamanho)}
                        title="Remover item"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                );
              }

              const tamanhoDetalhe = produto.tamanhos?.find((t) => t.tamanho === item.tamanho);
              const preco = tamanhoDetalhe?.precoTotal ?? 0;
              const subtotal = preco * item.quantidade;

              return (
                <div key={`${item.produtoId}-${item.tamanho}`} className={`cart-item ${isSelected ? 'selected' : ''}`}>
                  <div className="item-select">
                    <label className="custom-checkbox">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleItemSelection(item.produtoId, item.tamanho)}
                      />
                      <span className="checkmark"></span>
                    </label>
                  </div>
                  
                  <div className="item-content">
                    <div className="item-image">
                      {produto.imagensUrl && produto.imagensUrl.length > 0 && (
                        <img
                          src={produto.imagensUrl[0]}
                          alt={produto.nome}
                          loading="lazy"
                        />
                      )}
                    </div>
                    
                    <div className="item-details">
                      <p className="item-name">{produto.nome}</p>
                      <div className="item-attributes">
                        <span className="attribute">Tamanho: {item.tamanho}</span>
                        <span className="attribute">Cor: {produto.cor || 'Única'}</span>
                      </div>
                      
                      <div className="quantity-control">
                        <button 
                          className="qty-btn minus"
                          onClick={() => atualizarQuantidade(item.produtoId, item.tamanho, item.quantidade - 1)}
                          disabled={item.quantidade <= 1}
                          title="Diminuir quantidade"
                        >
                          −
                        </button>
                        <span className="qty-value">{item.quantidade}</span>
                        <button 
                          className="qty-btn plus"
                          onClick={() => atualizarQuantidade(item.produtoId, item.tamanho, item.quantidade + 1)}
                          title="Aumentar quantidade"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="item-price">
                    <p className="price-unit">R$ {preco.toFixed(2)}</p>
                    <p className="subtotal">R$ {subtotal.toFixed(2)}</p>
                  </div>
                  
                  <div className="item-actions">
                    <button 
                      className="remove-btn"
                      onClick={() => removerItem(item.produtoId, item.tamanho)}
                      title="Remover item"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="cart-summary">
          <h3 className="summary-title">Resumo do Pedido</h3>
          <div className="summary-content">
            <div className="summary-row">
              <span>Itens selecionados</span>
              <span>{selectedCount}</span>
            </div>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>R$ {subtotal.toFixed(2)}</span>
            </div>
            
            {desconto > 0 && (
              <div className="summary-row discount">
                <span>Desconto</span>
                <span className="discount-value">- R$ {valorDesconto.toFixed(2)}</span>
              </div>
            )}
            
            <div className="summary-row">
              <span>Frete</span>
              <span className="free-shipping">Grátis</span>
            </div>
            
            <div className="coupon-section">
              <div className="coupon-input">
                <BiSolidDiscount className="coupon-icon" />
                <input
                  type="text"
                  placeholder="Código de cupom"
                  value={cupom}
                  onChange={(e) => setCupom(e.target.value)}
                />
                <button 
                  className="apply-coupon-btn"
                  onClick={aplicarCupom}
                >
                  Aplicar
                </button>
              </div>
            </div>
            
            <div className="summary-divider"></div>
            <div className="summary-row total">
              <span>Total</span>
              <span className="total-price">R$ {total.toFixed(2)}</span>
            </div>
          </div>
          
          <button 
            className={`checkout-btn ${selectedCount === 0 ? 'disabled' : ''}`}
            onClick={finalizarCompra}
            disabled={selectedCount === 0}
          >
            <FaCheck style={{ marginRight: '8px' }} />
            Finalizar Compra
            <span className="selected-count">({selectedCount})</span>
          </button>
          
          <div className="payment-methods">
            <p>Métodos de pagamento:</p>
            <div className="payment-icons">
              <FaCcVisa className="payment-icon" title="Visa" />
              <FaCcMastercard className="payment-icon" title="Mastercard" />
              <FaCcAmex className="payment-icon" title="American Express" />
              <FaPix className="payment-icon" title="PIX" />
              <FaBarcode className="payment-icon" title="Boleto" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}