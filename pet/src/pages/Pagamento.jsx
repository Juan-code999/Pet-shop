import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaRegCreditCard, FaBarcode } from "react-icons/fa";
import { FaPix } from "react-icons/fa6";
import { motion } from "framer-motion";
import { MdCheckCircle, MdError } from "react-icons/md";

const Pagamento = () => {
  const navigate = useNavigate();
  const [produtos, setProdutos] = useState([]);
  const [total, setTotal] = useState(0);
  const [desconto, setDesconto] = useState(0);
  const [metodoPagamento, setMetodoPagamento] = useState("credito");
  const [numeroCartao, setNumeroCartao] = useState("");
  const [nomeTitular, setNomeTitular] = useState("");
  const [dataValidade, setDataValidade] = useState("");
  const [codigoSeguranca, setCodigoSeguranca] = useState("");
  const [cpf, setCpf] = useState("");
  const [parcelas, setParcelas] = useState(1);
  const [cupom, setCupom] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    const dadosCheckout = JSON.parse(localStorage.getItem("checkoutItems")) || {
      items: [],
      total: 0,
      desconto: 0,
    };
    setProdutos(dadosCheckout.items);
    setTotal(dadosCheckout.total);
    setDesconto(dadosCheckout.desconto || 0);
  }, []);

  const aplicarCupom = () => {
    if (cupom.toUpperCase() === "DESCONTO10") {
      setDesconto(total * 0.1);
      setErro(null);
    } else {
      setErro("Cupom inválido");
      setDesconto(0);
    }
  };

  const handlePagamento = async () => {
    setCarregando(true);
    setErro(null);
    try {
      for (const produto of produtos) {
        await axios.post("http://localhost:5005/api/pedidos", {
          produtoId: produto.produtoId,
          quantidade: produto.quantidade,
          tamanho: produto.tamanho,
          preco: produto.preco,
          metodoPagamento,
          parcelas,
        });
      }
      setSucesso(true);
      setTimeout(() => {
        navigate("/confirmacao", {
          state: { produtos, total, metodoPagamento },
        });
      }, 2000);
    } catch (error) {
      console.error("Erro ao processar pagamento:", error);
      setErro("Erro ao processar pagamento. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  const handleInputChange = (setter) => (e) => {
    let value = e.target.value;
    if (setter === setNumeroCartao) {
      // Formatar número do cartão: 1234 5678 9012 3456
      value = value.replace(/\D/g, "").slice(0, 16);
      value = value.replace(/(\d{4})(?=\d)/g, "$1 ");
    } else if (setter === setDataValidade) {
      // Formatar validade: MM/AA
      value = value.replace(/\D/g, "").slice(0, 4);
      if (value.length > 2) {
        value = value.replace(/(\d{2})(\d+)/, "$1/$2");
      }
    } else if (setter === setCpf) {
      // Formatar CPF: 000.000.000-00
      value = value.replace(/\D/g, "").slice(0, 11);
      value = value
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    }
    setter(value);
  };

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h1 className="cart-title">Pagamento</h1>
        <div className="cart-steps">
          <span className="step">Carrinho</span>
          <span className="divider">›</span>
          <span className="step active">Pagamento</span>
          <span className="divider">›</span>
          <span className="step">Confirmação</span>
        </div>
      </div>

      <div className="cart-content">
        <div className="payment-form-container">
          <h2 className="payment-title">Resumo do Pedido</h2>

          <div className="selected-items-section">
            <ul className="items-list">
              {produtos.map((produto, index) => {
                // Debug para conferir dados do produto
                console.log("Produto no resumo:", produto);

                // Monta URL da imagem - ajuste conforme seu dado
                const imageUrl = produto.imagem
                  ? `https://res.cloudinary.com/dnuwa7gs2/image/upload/${produto.imagem}`
                  : "https://via.placeholder.com/80";

                const preco = Number(produto.preco) || 0;
                const quantidade = Number(produto.quantidade) || 1;
                const precoTotal = (preco * quantidade).toFixed(2);

                return (
                  <li key={index} className="cart-item">
                    <div className="item-image-container">
                      <img
                        src={imageUrl}
                        alt={produto.nome || "Produto"}
                        className="item-image"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/80";
                        }}
                      />
                    </div>
                    <div className="item-details">
                      <h4>{produto.nome || "Produto"}</h4>
                      <p>Quantidade: {quantidade}</p>
                      <p>Tamanho: {produto.tamanho || "N/A"}</p>
                    </div>
                    <div className="item-price">R$ {precoTotal}</div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="coupon-section">
            <h3 className="form-group label">Cupom de Desconto</h3>
            <div className="coupon-input">
              <input
                type="text"
                placeholder="Digite o cupom"
                value={cupom}
                onChange={(e) => {
                  setCupom(e.target.value);
                  setErro(null);
                  setDesconto(0);
                }}
              />
              <button onClick={aplicarCupom} className="apply-coupon-btn">
                Aplicar
              </button>
            </div>
          </div>

          <h2 className="payment-title">Método de Pagamento</h2>
          <div className="payment-methods-selector">
            <div
              className={`payment-method ${metodoPagamento === "credito" ? "active" : ""}`}
              onClick={() => setMetodoPagamento("credito")}
            >
              <div className="method-header">
                <div className="method-radio">
                  <input type="radio" checked={metodoPagamento === "credito"} readOnly />
                </div>
                <span>Cartão de Crédito</span>
                <div className="card-icons">
                  <FaRegCreditCard />
                </div>
              </div>

              {metodoPagamento === "credito" && (
                <div className="card-form">
                  <div className="form-group">
                    <label>Número do cartão</label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={numeroCartao}
                      onChange={handleInputChange(setNumeroCartao)}
                      maxLength={19}
                    />
                  </div>

                  <div className="form-group">
                    <label>Nome do titular</label>
                    <input
                      type="text"
                      placeholder="Como no cartão"
                      value={nomeTitular}
                      onChange={(e) => setNomeTitular(e.target.value)}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Validade (MM/AA)</label>
                      <input
                        type="text"
                        placeholder="MM/AA"
                        value={dataValidade}
                        onChange={handleInputChange(setDataValidade)}
                        maxLength={5}
                      />
                    </div>

                    <div className="form-group">
                      <label>CVV</label>
                      <input
                        type="text"
                        placeholder="123"
                        value={codigoSeguranca}
                        onChange={(e) => setCodigoSeguranca(e.target.value.replace(/\D/g, "").slice(0, 3))}
                        maxLength={3}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>CPF do titular</label>
                    <input
                      type="text"
                      placeholder="000.000.000-00"
                      value={cpf}
                      onChange={handleInputChange(setCpf)}
                      maxLength={14}
                    />
                  </div>

                  <div className="form-group">
                    <label>Parcelas</label>
                    <select value={parcelas} onChange={(e) => setParcelas(Number(e.target.value))}>
                      {[...Array(12)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}x de R$ {(total / (i + 1)).toFixed(2)}
                          {i > 0 ? " (sem juros)" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div
              className={`payment-method ${metodoPagamento === "pix" ? "active" : ""}`}
              onClick={() => setMetodoPagamento("pix")}
            >
              <div className="method-header">
                <div className="method-radio">
                  <input type="radio" checked={metodoPagamento === "pix"} readOnly />
                </div>
                <span>PIX</span>
                <div className="pix-icon">
                  <FaPix />
                </div>
              </div>

              {metodoPagamento === "pix" && (
                <div className="pix-info">
                  <p>
                    Você será redirecionado para realizar o pagamento via PIX após confirmar o pedido.
                  </p>
                  <p>O processamento é instantâneo e seu pedido será liberado imediatamente.</p>
                </div>
              )}
            </div>

            <div
              className={`payment-method ${metodoPagamento === "boleto" ? "active" : ""}`}
              onClick={() => setMetodoPagamento("boleto")}
            >
              <div className="method-header">
                <div className="method-radio">
                  <input type="radio" checked={metodoPagamento === "boleto"} readOnly />
                </div>
                <span>Boleto Bancário</span>
                <div className="barcode-icon">
                  <FaBarcode />
                </div>
              </div>

              {metodoPagamento === "boleto" && (
                <div className="boleto-info">
                  <p>O boleto será gerado após a confirmação do pedido.</p>
                  <p>O prazo para pagamento é de 3 dias úteis.</p>
                  <p>Seu pedido será enviado após a confirmação do pagamento.</p>
                </div>
              )}
            </div>
          </div>

          {erro && (
            <div className="error-message">
              <MdError /> {erro}
            </div>
          )}

          {sucesso && (
            <div className="success-message">
              <MdCheckCircle /> Pagamento realizado com sucesso!
            </div>
          )}

          <div className="form-actions">
            <button onClick={() => navigate(-1)} className="back-btn">
              Voltar
            </button>
            <button
              onClick={handlePagamento}
              className={`confirm-payment-btn ${carregando ? "loading" : ""}`}
              disabled={carregando}
            >
              {carregando ? (
                <motion.div
                  className="loading-spinner"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              ) : (
                "Confirmar Pagamento"
              )}
            </button>
          </div>
        </div>

        <div className="cart-summary">
          <h2 className="summary-title">Resumo do Pedido</h2>
          <div className="summary-content">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>R$ {total.toFixed(2)}</span>
            </div>

            {desconto > 0 && (
              <div className="summary-row discount">
                <span>Desconto:</span>
                <span className="discount-value">-R$ {desconto.toFixed(2)}</span>
              </div>
            )}

            <div className="summary-divider"></div>

            <div className="summary-row total">
              <span>Total:</span>
              <span className="total-price">R$ {(total - desconto).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pagamento;
