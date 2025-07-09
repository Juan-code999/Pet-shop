import React, { useEffect, useState } from "react";
import { 
  FaShoppingCart, 
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
import "../styles/Pagamento.css";

export default function Pagamento() {
  const [carrinho, setCarrinho] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [cupom, setCupom] = useState("");
  const [desconto, setDesconto] = useState(0);
  const [metodoPagamento, setMetodoPagamento] = useState("");
  const [dadosPagamento, setDadosPagamento] = useState({
    numeroCartao: "",
    nomeCartao: "",
    validade: "",
    cvv: "",
    cpf: "",
    parcelas: "1"
  });
  const [processando, setProcessando] = useState(false);
  const usuarioId = localStorage.getItem("usuarioId");
  const navigate = useNavigate();

  // Carrega os dados do carrinho e produtos
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

  // Calcula o subtotal do carrinho
  function calcularSubtotal() {
    if (!carrinho || carrinho.itens.length === 0) return 0;
    
    return carrinho.itens.reduce((total, item) => {
      const produto = produtos.find(p => p.id === item.produtoId);
      if (!produto) return total;
      
      const tamanhoDetalhe = produto.tamanhos?.find(t => t.tamanho === item.tamanho);
      const preco = tamanhoDetalhe?.precoTotal ?? 0;
      
      return total + (preco * item.quantidade);
    }, 0);
  }

  // Aplica cupom de desconto
  function aplicarCupom() {
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
  }

  // Calcula o valor total com desconto
  function calcularTotal() {
    const subtotal = calcularSubtotal();
    const valorDesconto = subtotal * desconto;
    return subtotal - valorDesconto;
  }

  // Manipula mudanças nos inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Formatação automática para campos específicos
    let formattedValue = value;
    
    if (name === "numeroCartao") {
      formattedValue = value
        .replace(/\D/g, '')
        .replace(/(\d{4})(?=\d)/g, '$1 ');
    }
    
    if (name === "validade") {
      formattedValue = value
        .replace(/\D/g, '')
        .replace(/(\d{2})(?=\d)/g, '$1/');
    }
    
    if (name === "cpf") {
      formattedValue = value
        .replace(/\D/g, '')
        .replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    
    if (name === "cvv") {
      formattedValue = value.replace(/\D/g, '').substring(0, 3);
    }
    
    setDadosPagamento(prev => ({
      ...prev,
      [name]: formattedValue
    }));
  };

  // Envia o formulário de pagamento
  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessando(true);
    setErro(null);
    
    if (!metodoPagamento) {
      setErro("Selecione um método de pagamento");
      setProcessando(false);
      return;
    }

    // Validações específicas para cartão
    if (metodoPagamento === "cartao") {
      const numeroCartaoLimpo = dadosPagamento.numeroCartao.replace(/\s/g, '');
      const validadeLimpa = dadosPagamento.validade.replace(/\//g, '');
      const cpfLimpo = dadosPagamento.cpf.replace(/\D/g, '');
      
      if (numeroCartaoLimpo.length !== 16) {
        setErro("Número do cartão inválido (deve ter 16 dígitos)");
        setProcessando(false);
        return;
      }
      
      if (validadeLimpa.length !== 4) {
        setErro("Data de validade inválida (formato MM/AA)");
        setProcessando(false);
        return;
      }
      
      if (dadosPagamento.cvv.length !== 3) {
        setErro("CVV inválido (deve ter 3 dígitos)");
        setProcessando(false);
        return;
      }
      
      if (cpfLimpo.length !== 11) {
        setErro("CPF inválido (deve ter 11 dígitos)");
        setProcessando(false);
        return;
      }
    }

    try {
      const total = calcularTotal();
      const pagamentoDto = {
        usuarioId,
        carrinhoId: carrinho.id,
        valorTotal: total,
        metodoPagamento,
        dados: metodoPagamento === "cartao" ? {
          ...dadosPagamento,
          numeroCartao: dadosPagamento.numeroCartao.replace(/\s/g, ''),
          validade: dadosPagamento.validade.replace(/\//g, ''),
          cpf: dadosPagamento.cpf.replace(/\D/g, '')
        } : null
      };

      const response = await fetch("http://localhost:5005/api/Pagamento/processar", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pagamentoDto)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao processar pagamento");
      }

      const resultado = await response.json();

      // Limpar carrinho após pagamento aprovado
      if (resultado.status === "aprovado") {
        await fetch(`http://localhost:5005/api/Carrinho/${usuarioId}/limpar`, {
          method: 'DELETE'
        });
        
        // Redirecionar para página de confirmação
        navigate("/confirmacao", { 
          state: { 
            pagamentoId: resultado.pagamentoId,
            metodoPagamento: resultado.metodo,
            dadosPagamento: resultado.dados,
            valorTotal: total
          } 
        });
      } else {
        setErro("Pagamento recusado. Por favor, tente outro método de pagamento.");
      }
    } catch (error) {
      setErro(error.message);
    } finally {
      setProcessando(false);
    }
  };

  // Estado de carregamento
  if (loading) return (
    <div className="loading-container">
      <FaSpinner className="loading-spinner" />
      <p>Carregando seu carrinho...</p>
    </div>
  );
  
  // Estado de erro
  if (erro) return (
    <div className="error-container">
      <div className="error-icon"><FaExclamationTriangle /></div>
      <p>{erro}</p>
      <button onClick={carregarDados} className="retry-btn">Tentar novamente</button>
    </div>
  );
  
  // Carrinho vazio
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

  // Cálculos finais
  const subtotal = calcularSubtotal();
  const valorDesconto = subtotal * desconto;
  const total = calcularTotal();

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h1 className="cart-title">Finalizar Compra</h1>
        <div className="cart-steps">
          <Link to="/carrinho" className="step">Carrinho</Link>
          <span className="divider">›</span>
          <span className="step active">Pagamento</span>
          <span className="divider">›</span>
          <span className="step">Confirmação</span>
        </div>
      </div>
      
      <div className="cart-content">
        {/* Seção de métodos de pagamento */}
        <div className="payment-form-container">
          <h2 className="payment-title">Método de Pagamento</h2>
          
          <div className="payment-methods-selector">
            {/* Método: Cartão de Crédito */}
            <div 
              className={`payment-method ${metodoPagamento === "cartao" ? "active" : ""}`}
              onClick={() => setMetodoPagamento("cartao")}
            >
              <div className="method-header">
                <div className="method-radio">
                  <input 
                    type="radio" 
                    name="payment-method" 
                    checked={metodoPagamento === "cartao"}
                    onChange={() => setMetodoPagamento("cartao")}
                  />
                </div>
                <span>Cartão de Crédito</span>
                <div className="card-icons">
                  <FaCcVisa className="card-icon" />
                  <FaCcMastercard className="card-icon" />
                  <FaCcAmex className="card-icon" />
                </div>
              </div>
              
              {metodoPagamento === "cartao" && (
                <div className="card-form">
                  <div className="form-group">
                    <label>Número do Cartão</label>
                    <input 
                      type="text" 
                      name="numeroCartao"
                      value={dadosPagamento.numeroCartao}
                      onChange={handleInputChange}
                      placeholder="0000 0000 0000 0000"
                      maxLength="19"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Nome no Cartão</label>
                    <input 
                      type="text" 
                      name="nomeCartao"
                      value={dadosPagamento.nomeCartao}
                      onChange={handleInputChange}
                      placeholder="Como no cartão"
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Validade</label>
                      <input 
                        type="text" 
                        name="validade"
                        value={dadosPagamento.validade}
                        onChange={handleInputChange}
                        placeholder="MM/AA"
                        maxLength="5"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>CVV</label>
                      <input 
                        type="text" 
                        name="cvv"
                        value={dadosPagamento.cvv}
                        onChange={handleInputChange}
                        placeholder="000"
                        maxLength="3"
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>CPF do Titular</label>
                    <input 
                      type="text" 
                      name="cpf"
                      value={dadosPagamento.cpf}
                      onChange={handleInputChange}
                      placeholder="000.000.000-00"
                      maxLength="14"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Parcelamento</label>
                    <select 
                      name="parcelas"
                      value={dadosPagamento.parcelas}
                      onChange={handleInputChange}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => (
                        <option key={num} value={num}>
                          {num}x de R$ {(total / num).toFixed(2)} {num > 1 ? "(sem juros)" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
            
            {/* Método: PIX */}
            <div 
              className={`payment-method ${metodoPagamento === "pix" ? "active" : ""}`}
              onClick={() => setMetodoPagamento("pix")}
            >
              <div className="method-header">
                <div className="method-radio">
                  <input 
                    type="radio" 
                    name="payment-method" 
                    checked={metodoPagamento === "pix"}
                    onChange={() => setMetodoPagamento("pix")}
                  />
                </div>
                <span>PIX</span>
                <FaPix className="pix-icon" />
              </div>
              
              {metodoPagamento === "pix" && (
                <div className="pix-info">
                  <p>Você será redirecionado para a página do PIX após confirmar a compra.</p>
                  <p>Pagamento instantâneo e sem taxas.</p>
                </div>
              )}
            </div>
            
            {/* Método: Boleto Bancário */}
            <div 
              className={`payment-method ${metodoPagamento === "boleto" ? "active" : ""}`}
              onClick={() => setMetodoPagamento("boleto")}
            >
              <div className="method-header">
                <div className="method-radio">
                  <input 
                    type="radio" 
                    name="payment-method" 
                    checked={metodoPagamento === "boleto"}
                    onChange={() => setMetodoPagamento("boleto")}
                  />
                </div>
                <span>Boleto Bancário</span>
                <FaBarcode className="barcode-icon" />
              </div>
              
              {metodoPagamento === "boleto" && (
                <div className="boleto-info">
                  <p>O boleto será gerado após a confirmação da compra.</p>
                  <p>O prazo para pagamento é de 2 dias úteis.</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Formulário de envio */}
          <form onSubmit={handleSubmit} className="payment-form">
            {erro && (
              <div className="error-message" style={{ color: '#e74c3c', marginBottom: '15px' }}>
                <FaExclamationTriangle style={{ marginRight: '5px' }} />
                {erro}
              </div>
            )}
            
            <div className="form-actions">
              <Link to="/carrinho" className="back-btn">
                <FaArrowLeft style={{ marginRight: '8px' }} />
                Voltar ao Carrinho
              </Link>
              <button 
                type="submit" 
                className="confirm-payment-btn"
                disabled={processando}
              >
                {processando ? (
                  <>
                    <FaSpinner className="spinner" />
                    Processando...
                  </>
                ) : (
                  <>
                    <FaCheck style={{ marginRight: '8px' }} />
                    Confirmar Pagamento
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
        
        {/* Resumo do pedido */}
        <div className="cart-summary">
          <h3 className="summary-title">Resumo do Pedido</h3>
          <div className="summary-content">
            <div className="summary-row">
              <span>Itens ({carrinho.itens.length})</span>
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
                  type="button"
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
          
          <div className="payment-methods-info">
            <p>Métodos de pagamento aceitos:</p>
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