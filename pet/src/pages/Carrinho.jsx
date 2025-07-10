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
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/Carrinho.css";

export default function Carrinho() {
  const [carrinho, setCarrinho] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [cupom, setCupom] = useState("");
  const [desconto, setDesconto] = useState(0);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  
  const usuarioId = localStorage.getItem("usuarioId");
  const navigate = useNavigate();

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

  async function removerItem(produtoId, tamanho, confirmado = false) {
    if (!confirmado) {
      setItemToDelete({ produtoId, tamanho });
      setShowDeleteModal(true);
      return;
    }

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
      setShowDeleteModal(false);
    } catch (error) {
      setErro(error.message);
    }
  }

  async function removerItensSelecionados() {
    if (selectedItems.length === 0) {
      setErro("Selecione pelo menos um item para remover");
      return;
    }

    setItemToDelete(null);
    setShowDeleteModal(true);
  }

  async function confirmarRemocaoMultipla() {
    try {
      const promises = selectedItems.map(itemKey => {
        const [produtoId, tamanho] = itemKey.split('-');
        return fetch(`http://localhost:5005/api/Carrinho/${usuarioId}/remover`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ produtoId, tamanho })
        });
      });

      await Promise.all(promises);
      await carregarDados();
      setSelectedItems([]);
      setShowDeleteModal(false);
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

  async function aplicarCupom() {
    if (!cupom.trim()) {
      setErro("Digite um código de cupom");
      return;
    }

    setIsApplyingCoupon(true);
    
    // Simula o processamento do cupom
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (cupom.toUpperCase() === "DESCONTO10") {
      setDesconto(0.1);
      setErro(null);
    } else if (cupom.toUpperCase() === "DESCONTO20") {
      setDesconto(0.2);
      setErro(null);
    } else {
      setDesconto(0);
      setErro("Cupom inválido");
    }
    
    setIsApplyingCoupon(false);
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

    // Salva os itens selecionados para a página de pagamento
    const selectedProducts = carrinho.itens.filter(item => 
      selectedItems.includes(`${item.produtoId}-${item.tamanho}`)
    );
    
    localStorage.setItem('checkoutItems', JSON.stringify({
      items: selectedProducts,
      total: calcularTotal(),
      desconto: subtotal * desconto
    }));

    navigate('/pagamento');
  }

  if (loading) return (
    <motion.div 
      className="loading-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      >
        <FaSpinner className="loading-spinner" />
      </motion.div>
      <p>Carregando seu carrinho...</p>
    </motion.div>
  );
  
  if (erro) return (
    <motion.div 
      className="error-container"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100 }}
    >
      <motion.div 
        className="error-icon"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ repeat: 2, duration: 0.3 }}
      >
        <FaExclamationTriangle />
      </motion.div>
      <p>{erro}</p>
      <motion.button 
        onClick={carregarDados} 
        className="retry-btn"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Tentar novamente
      </motion.button>
    </motion.div>
  );
  
  if (!carrinho || carrinho.itens.length === 0) return (
    <motion.div 
      className="empty-cart-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="empty-cart-icon"
        animate={{ 
          y: [0, -10, 0],
          scale: [1, 1.05, 1]
        }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <FaShoppingCart />
      </motion.div>
      <h2>Seu carrinho está vazio</h2>
      <p>Parece que você ainda não adicionou nenhum item</p>
      <motion.div
        whileHover={{ x: -5 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <Link to="/produtos" className="continue-shopping-btn">
          <FaArrowLeft style={{ marginRight: '8px' }} />
          Continuar comprando
        </Link>
      </motion.div>
    </motion.div>
  );

  const subtotal = calcularSubtotal();
  const valorDesconto = subtotal * desconto;
  const total = calcularTotal();
  const selectedCount = selectedItems.length;

  return (
    <motion.div 
      className="cart-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="cart-header">
        <motion.h1 
          className="cart-title"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          Meu Carrinho
        </motion.h1>
        <motion.div 
          className="cart-steps"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.span 
            className="step active"
            whileHover={{ scale: 1.05 }}
          >
            Carrinho
          </motion.span>
          <span className="divider">›</span>
          <span className="step">Pagamento</span>
          <span className="divider">›</span>
          <span className="step">Confirmação</span>
        </motion.div>
      </div>
      
      <div className="cart-content">
        <div className="cart-items-container">
          <motion.div 
            className="cart-items-header"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div 
              className="header-select-all"
              onClick={toggleSelectAll}
              style={{ cursor: 'pointer' }}
            >
              <label className="custom-checkbox" onClick={(e) => e.stopPropagation()}>
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
              <motion.button 
                className="remove-selected-btn"
                onClick={removerItensSelecionados}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <FaTrash style={{ marginRight: '5px' }} />
                Remover selecionados
              </motion.button>
            )}
          </motion.div>
          
          <motion.div 
            className="cart-items"
            layout
          >
            <AnimatePresence>
              {carrinho.itens.map((item) => {
                const produto = produtos.find((p) => p.id === item.produtoId);
                const isSelected = isItemSelected(item.produtoId, item.tamanho);
                const tamanhoDetalhe = produto?.tamanhos?.find((t) => t.tamanho === item.tamanho);
                const preco = tamanhoDetalhe?.precoTotal ?? 0;
                const descontoProduto = produto?.desconto || 0;
                const subtotal = preco * item.quantidade;

                if (!produto) {
                  return (
                    <motion.div 
                      key={`${item.produtoId}-${item.tamanho}`} 
                      className={`cart-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => toggleItemSelection(item.produtoId, item.tamanho)}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ type: "spring", stiffness: 200 }}
                      layout
                    >
                      <div className="item-select">
                        <label className="custom-checkbox" onClick={(e) => e.stopPropagation()}>
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
                          </div>
                        </div>
                      </div>
                      <div className="item-actions" onClick={(e) => e.stopPropagation()}>
                        <motion.button 
                          className="remove-btn"
                          onClick={() => removerItem(item.produtoId, item.tamanho)}
                          title="Remover item"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <FaTrash />
                        </motion.button>
                      </div>
                    </motion.div>
                  );
                }

                return (
                  <motion.div 
                    key={`${item.produtoId}-${item.tamanho}`} 
                    className={`cart-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleItemSelection(item.produtoId, item.tamanho)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    whileHover={{ scale: 1.005 }}
                    layout
                  >
                    <div className="item-select">
                      <label className="custom-checkbox" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleItemSelection(item.produtoId, item.tamanho)}
                        />
                        <span className="checkmark"></span>
                      </label>
                    </div>
                    
                    <div className="item-content">
                      <motion.div 
                        className="item-image"
                        whileHover={{ scale: 1.05 }}
                      >
                        {produto.imagensUrl && produto.imagensUrl.length > 0 && (
                          <img
                            src={produto.imagensUrl[0]}
                            alt={produto.nome}
                            loading="lazy"
                          />
                        )}
                      </motion.div>
                      
                      <div className="item-details">
                        <p className="item-name">{produto.nome}</p>
                        <div className="item-attributes">
                          <span className="attribute">Tamanho: {item.tamanho}</span>
                          {descontoProduto > 0 && (
                            <motion.span 
                              className="attribute discount-badge"
                              initial={{ scale: 0.8 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              Desconto: {descontoProduto}%
                            </motion.span>
                          )}
                        </div>
                        
                        <div className="quantity-control" onClick={(e) => e.stopPropagation()}>
                          <motion.button 
                            className="qty-btn minus"
                            onClick={() => atualizarQuantidade(item.produtoId, item.tamanho, item.quantidade - 1)}
                            disabled={item.quantidade <= 1}
                            title="Diminuir quantidade"
                            whileTap={{ scale: 0.9 }}
                          >
                            −
                          </motion.button>
                          <motion.span 
                            className="qty-value"
                            key={`qty-${item.quantidade}`}
                            initial={{ scale: 1.2 }}
                            animate={{ scale: 1 }}
                          >
                            {item.quantidade}
                          </motion.span>
                          <motion.button 
                            className="qty-btn plus"
                            onClick={() => atualizarQuantidade(item.produtoId, item.tamanho, item.quantidade + 1)}
                            title="Aumentar quantidade"
                            whileTap={{ scale: 0.9 }}
                          >
                            +
                          </motion.button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="item-price">
                      {descontoProduto > 0 && (
                        <p className="original-price">
                          De: R$ {(preco / (1 - descontoProduto/100)).toFixed(2)}
                        </p>
                      )}
                      <p className="price-unit">
                        {descontoProduto > 0 ? 'Por: ' : ''}R$ {preco.toFixed(2)}
                      </p>
                    </div>
                    
                    <div className="item-actions" onClick={(e) => e.stopPropagation()}>
                      <motion.button 
                        className="remove-btn"
                        onClick={() => removerItem(item.produtoId, item.tamanho)}
                        title="Remover item"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <FaTrash />
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </div>
        
        <motion.div 
          className="cart-summary"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="summary-title">Resumo do Pedido</h3>
          <div className="summary-content">
            <motion.div 
              className="summary-row"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <span>Itens selecionados</span>
              <span>{selectedCount}</span>
            </motion.div>
            <motion.div 
              className="summary-row"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.55 }}
            >
              <span>Subtotal</span>
              <span>R$ {subtotal.toFixed(2)}</span>
            </motion.div>
            
            {desconto > 0 && (
              <motion.div 
                className="summary-row discount"
                initial={{ scale: 1.05 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <span>Desconto</span>
                <span className="discount-value">- R$ {valorDesconto.toFixed(2)}</span>
              </motion.div>
            )}
            
            <motion.div 
              className="summary-row"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <span>Frete</span>
              <span className="free-shipping">Grátis</span>
            </motion.div>
            
            <motion.div 
              className="coupon-section"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.65 }}
            >
              <div className="coupon-input">
                <BiSolidDiscount className="coupon-icon" />
                <input
                  type="text"
                  placeholder="Código de cupom"
                  value={cupom}
                  onChange={(e) => setCupom(e.target.value)}
                />
                <motion.button 
                  className="apply-coupon-btn"
                  onClick={aplicarCupom}
                  disabled={isApplyingCoupon}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isApplyingCoupon ? (
                    <motion.span
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      Aplicando...
                    </motion.span>
                  ) : (
                    "Aplicar"
                  )}
                </motion.button>
              </div>
            </motion.div>
            
            <motion.div 
              className="summary-divider"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.7 }}
            />
            <motion.div 
              className="summary-row total"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75 }}
            >
              <span>Total</span>
              <motion.span 
                className="total-price"
                key={`total-${total}`}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
              >
                R$ {total.toFixed(2)}
              </motion.span>
            </motion.div>
          </div>
          
          <motion.button 
            className={`checkout-btn ${selectedCount === 0 ? 'disabled' : ''}`}
            onClick={finalizarCompra}
            disabled={selectedCount === 0 || isCheckingOut}
            whileHover={selectedCount === 0 || isCheckingOut ? {} : { scale: 1.03 }}
            whileTap={selectedCount === 0 || isCheckingOut ? {} : { scale: 0.97 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            {isCheckingOut ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  style={{ marginRight: '8px' }}
                >
                  <FaSpinner />
                </motion.div>
                Processando...
              </>
            ) : (
              <>
                <FaCheck style={{ marginRight: '8px' }} />
                Finalizar Compra
                <span className="selected-count">({selectedCount})</span>
              </>
            )}
          </motion.button>
          
          <motion.div 
            className="payment-methods"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <p style={{ marginBottom: '8px' }}>Métodos de pagamento:</p>
            <div className="payment-icons">
              <motion.div whileHover={{ y: -3 }}>
                <FaCcVisa className="payment-icon" title="Visa" />
              </motion.div>
              <motion.div whileHover={{ y: -3 }}>
                <FaCcMastercard className="payment-icon" title="Mastercard" />
              </motion.div>
              <motion.div whileHover={{ y: -3 }}>
                <FaCcAmex className="payment-icon" title="American Express" />
              </motion.div>
              <motion.div whileHover={{ y: -3 }}>
                <FaPix className="payment-icon" title="PIX" />
              </motion.div>
              <motion.div whileHover={{ y: -3 }}>
                <FaBarcode className="payment-icon" title="Boleto" />
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Modal de confirmação */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div 
            className="delete-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div 
              className="delete-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>Confirmar exclusão</h3>
              <p>
                {itemToDelete 
                  ? "Tem certeza que deseja remover este item do carrinho?"
                  : "Tem certeza que deseja remover os itens selecionados?"}
              </p>
              <div className="modal-buttons">
                <button 
                  className="cancel-btn"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancelar
                </button>
                <button 
                  className="confirm-btn"
                  onClick={itemToDelete 
                    ? () => removerItem(itemToDelete.produtoId, itemToDelete.tamanho, true)
                    : confirmarRemocaoMultipla
                  }
                >
                  Confirmar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}