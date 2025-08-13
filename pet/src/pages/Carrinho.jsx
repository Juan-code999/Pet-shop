import React, { useEffect, useState } from "react";
import { 
  FaShoppingCart, 
  FaTrash, 
  FaCheck, 
  FaExclamationTriangle,
  FaSpinner,
  FaArrowLeft,
  FaExchangeAlt
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [newSize, setNewSize] = useState('');
  const [priceDifference, setPriceDifference] = useState(null);
  
  const usuarioId = localStorage.getItem("usuarioId");
  const navigate = useNavigate();

  // Carrega dados do carrinho e produtos
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

  // Seleção de itens
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

  // Remoção de itens
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

  // Atualização de quantidade
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

  // Cálculos de preço
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

  // Cupom de desconto
  async function aplicarCupom() {
    if (!cupom.trim()) {
      setErro("Digite um código de cupom");
      return;
    }

    setIsApplyingCoupon(true);
    
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

  // Finalização da compra
  async function finalizarCompra() {
    if (selectedItems.length === 0) {
      setErro("Selecione pelo menos um item para finalizar a compra");
      return;
    }

    const subtotal = calcularSubtotal();
    const selectedProducts = carrinho.itens.filter(item => 
      selectedItems.includes(`${item.produtoId}-${item.tamanho}`)
    ).map(item => {
      const produto = produtos.find(p => p.id === item.produtoId);
      const tamanhoDetalhe = produto?.tamanhos?.find(t => t.tamanho === item.tamanho);
      const preco = tamanhoDetalhe?.precoTotal ?? 0;
      
      return {
        id: item.produtoId,
        name: produto?.nome || "Produto não encontrado",
        price: preco,
        quantity: item.quantidade,
        size: item.tamanho,
        image: produto?.imagensUrl?.[0] || ''
      };
    });

    const checkoutData = {
      items: selectedProducts,
      total: calcularTotal(),
      discount: subtotal * desconto
    };

    localStorage.setItem('cart', JSON.stringify(checkoutData));
    navigate('/pagamento');
  }

  // Edição de tamanho
  const handleOpenEditModal = (item) => {
    setItemToEdit(item);
    setNewSize(item.tamanho);
    setPriceDifference(null);
    setShowEditModal(true);
  };

  const handleSizeChange = (tamanho) => {
    setNewSize(tamanho);
    if (itemToEdit && tamanho !== itemToEdit.tamanho) {
      const produto = produtos.find(p => p.id === itemToEdit.produtoId);
      const tamanhoDetalhe = produto?.tamanhos?.find(t => t.tamanho === tamanho);
      const novoPreco = tamanhoDetalhe?.precoTotal || 0;
      const diferenca = novoPreco - (itemToEdit.precoUnitario || 0);
      setPriceDifference(diferenca);
    } else {
      setPriceDifference(null);
    }
  };

  async function atualizarTamanho() {
    if (!itemToEdit || !newSize || newSize === itemToEdit.tamanho) return;
    
    try {
      const response = await fetch(`http://localhost:5005/api/Carrinho/${usuarioId}/atualizar-tamanho`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          produtoId: itemToEdit.produtoId, 
          tamanhoAtual: itemToEdit.tamanho, 
          novoTamanho: newSize
        })
      });
      
      if (!response.ok) throw new Error('Erro ao atualizar tamanho');
      
      await carregarDados();
      setShowEditModal(false);
      
      const oldKey = `${itemToEdit.produtoId}-${itemToEdit.tamanho}`;
      const newKey = `${itemToEdit.produtoId}-${newSize}`;
      if (selectedItems.includes(oldKey)) {
        setSelectedItems(prev => [
          ...prev.filter(id => id !== oldKey),
          newKey
        ]);
      }
    } catch (error) {
      setErro(error.message);
    }
  }

  // Renderização condicional
  if (loading) return (
    <motion.div className="loading-container">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
        <FaSpinner className="loading-spinner" />
      </motion.div>
      <p>Carregando seu carrinho...</p>
    </motion.div>
  );
  
  if (erro) return (
    <motion.div className="error-container">
      <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: 2, duration: 0.3 }}>
        <FaExclamationTriangle />
      </motion.div>
      <p>{erro}</p>
      <motion.button onClick={carregarDados} className="retry-btn">
        Tentar novamente
      </motion.button>
    </motion.div>
  );
  
  if (!carrinho || carrinho.itens.length === 0) return (
    <motion.div className="empty-cart-container">
      <motion.div animate={{ y: [0, -10, 0], scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
        <FaShoppingCart />
      </motion.div>
      <h2>Seu carrinho está vazio</h2>
      <p>Parece que você ainda não adicionou nenhum item</p>
      <motion.div whileHover={{ x: -5 }}>
        <Link to="/produtos" className="continue-shopping-btn">
          <FaArrowLeft style={{ marginRight: '8px' }} />
          Continuar comprando
        </Link>
      </motion.div>
    </motion.div>
  );

  // Cálculos finais
  const subtotal = calcularSubtotal();
  const valorDesconto = subtotal * desconto;
  const total = calcularTotal();
  const selectedCount = selectedItems.length;

  return (
    <motion.div className="cart-container">
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
            <div className="header-select-all" onClick={toggleSelectAll}>
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
              <button className="remove-selected-btn" onClick={removerItensSelecionados}>
                <FaTrash style={{ marginRight: '5px' }} />
                Remover selecionados
              </button>
            )}
          </div>
          
          <div className="cart-items">
            <AnimatePresence>
              {carrinho.itens.map((item) => {
                const produto = produtos.find((p) => p.id === item.produtoId);
                const isSelected = isItemSelected(item.produtoId, item.tamanho);
                const tamanhoDetalhe = produto?.tamanhos?.find((t) => t.tamanho === item.tamanho);
                const preco = tamanhoDetalhe?.precoTotal ?? 0;
                const descontoProduto = produto?.desconto || 0;

                if (!produto) {
                  return (
                    <motion.div key={`${item.produtoId}-${item.tamanho}`} className={`cart-item ${isSelected ? 'selected' : ''}`}>
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
                          </div>
                        </div>
                      </div>
                      <div className="item-actions">
                        <button className="remove-btn" onClick={() => removerItem(item.produtoId, item.tamanho)}>
                          <FaTrash />
                        </button>
                      </div>
                    </motion.div>
                  );
                }

                return (
                  <motion.div key={`${item.produtoId}-${item.tamanho}`} className={`cart-item ${isSelected ? 'selected' : ''}`}>
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
                          <img src={produto.imagensUrl[0]} alt={produto.nome} />
                        )}
                      </div>
                      
                      <div className="item-details">
                        <p className="item-name">{produto.nome}</p>
                        <div className="item-attributes">
                          <span className="attribute">Tamanho: {item.tamanho}</span>
                          {descontoProduto > 0 && (
                            <span className="attribute discount-badge">
                              Desconto: {descontoProduto}%
                            </span>
                          )}
                        </div>
                        
                        <div className="quantity-control">
                          <button 
                            className="qty-btn minus"
                            onClick={() => atualizarQuantidade(item.produtoId, item.tamanho, item.quantidade - 1)}
                            disabled={item.quantidade <= 1}
                          >
                            −
                          </button>
                          <span className="qty-value">{item.quantidade}</span>
                          <button 
                            className="qty-btn plus"
                            onClick={() => atualizarQuantidade(item.produtoId, item.tamanho, item.quantidade + 1)}
                          >
                            +
                          </button>
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
                    
                    <div className="item-actions">
                      <button 
                        className="edit-btn"
                        onClick={() => handleOpenEditModal(item)}
                      >
                        <FaExchangeAlt />
                      </button>
                      <button 
                        className="remove-btn"
                        onClick={() => removerItem(item.produtoId, item.tamanho)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
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
                  disabled={isApplyingCoupon}
                >
                  {isApplyingCoupon ? 'Aplicando...' : 'Aplicar'}
                </button>
              </div>
            </div>
            
            <div className="summary-divider" />
            <div className="summary-row total">
              <span>Total</span>
              <span className="total-price">R$ {total.toFixed(2)}</span>
            </div>
          </div>
          
          <button 
            className={`checkout-btn ${selectedCount === 0 ? 'disabled' : ''}`}
            onClick={finalizarCompra}
            disabled={selectedCount === 0 || isCheckingOut}
          >
            {isCheckingOut ? (
              <>
                <FaSpinner style={{ marginRight: '8px' }} />
                Processando...
              </>
            ) : (
              <>
                <FaCheck style={{ marginRight: '8px' }} />
                Finalizar Compra
                <span className="selected-count">({selectedCount})</span>
              </>
            )}
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

      {/* Modal de confirmação de exclusão */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="delete-modal-overlay">
            <div className="delete-modal">
              <h3>Confirmar exclusão</h3>
              <p>
                {itemToDelete 
                  ? "Tem certeza que deseja remover este item do carrinho?"
                  : "Tem certeza que deseja remover os itens selecionados?"}
              </p>
              <div className="modal-buttons">
                <button className="cancel-btn" onClick={() => setShowDeleteModal(false)}>
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
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de edição de tamanho */}
      <AnimatePresence>
        {showEditModal && itemToEdit && (
          <div className="edit-modal-overlay">
            <div className="edit-modal">
              <h3>Alterar Tamanho</h3>
              <p>Selecione o novo tamanho para {produtos.find(p => p.id === itemToEdit.produtoId)?.nome}</p>
              
              <div className="size-options">
                {produtos.find(p => p.id === itemToEdit.produtoId)?.tamanhos?.map(t => (
                  <button
                    key={t.tamanho}
                    className={`size-option ${newSize === t.tamanho ? 'selected' : ''}`}
                    onClick={() => handleSizeChange(t.tamanho)}
                  >
                    <div className="size-label">{t.tamanho}</div>
                    <div className="size-price">R$ {t.precoTotal.toFixed(2)}</div>
                  </button>
                ))}
              </div>

              {priceDifference !== null && (
                <div className={`price-difference ${priceDifference >= 0 ? 'positive' : 'negative'}`}>
                  {priceDifference >= 0 ? (
                    <span>+R$ {priceDifference.toFixed(2)}</span>
                  ) : (
                    <span>-R$ {Math.abs(priceDifference).toFixed(2)}</span>
                  )}
                </div>
              )}
              
              <div className="modal-buttons">
                <button className="cancel-btn" onClick={() => setShowEditModal(false)}>
                  Cancelar
                </button>
                <button 
                  className="confirm-btn"
                  onClick={atualizarTamanho}
                  disabled={!newSize || newSize === itemToEdit.tamanho}
                >
                  Confirmar Alteração
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}