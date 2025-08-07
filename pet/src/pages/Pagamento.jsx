import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaRegCreditCard, FaBarcode } from "react-icons/fa";
import { FaPix } from "react-icons/fa6";
import { motion } from "framer-motion";
import { MdCheckCircle, MdError } from "react-icons/md";

const SafeImage = ({ src, alt, ...props }) => {
  const [imgSrc, setImgSrc] = useState(src);

  const handleError = () => {
    setImgSrc(
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect fill='%23f5f5f5' width='80' height='80'/%3E%3Ctext fill='%23666' font-family='sans-serif' font-size='10' dy='3' text-anchor='middle' x='40' y='45'%3EProduto%3C/text%3E%3C/svg%3E"
    );
  };

  return <img src={imgSrc} alt={alt} onError={handleError} {...props} />;
};

const Pagamento = () => {
  const navigate = useNavigate();
  const [produtos, setProdutos] = useState([]);
  const [total, setTotal] = useState(0);
  const [desconto, setDesconto] = useState(0);
  const [metodoPagamento, setMetodoPagamento] = useState("credito");
  const [carregando, setCarregando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState(null);
  const [cupom, setCupom] = useState("");

  useEffect(() => {
    try {
      const dadosCheckout = JSON.parse(localStorage.getItem("checkoutItems")) || {
        items: [],
        total: 0,
        desconto: 0,
      };

      const produtosNormalizados = dadosCheckout.items.map(item => ({
        id: item.produtoId || Math.random().toString(36).substr(2, 9),
        nome: item.nome || "Produto",
        imagem: item.imagensUrl?.[0] || null,
        tamanho: item.tamanho || "Único",
        quantidade: item.quantidade || 1,
        preco: item.precoUnitario || item.preco || 0,
      }));

      setProdutos(produtosNormalizados);
      setTotal(dadosCheckout.total);
      setDesconto(dadosCheckout.desconto || 0);
    } catch (error) {
      console.error("Erro ao carregar dados do carrinho:", error);
      setErro("Erro ao carregar itens do carrinho");
    }
  }, []);

  const handlePagamento = async () => {
    setCarregando(true);
    setErro(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSucesso(true);
      localStorage.removeItem("checkoutItems");
      
      setTimeout(() => {
        navigate("/confirmacao", {
          state: { 
            produtos,
            total: total - desconto,
            metodoPagamento 
          },
        });
      }, 2000);
    } catch (error) {
      console.error("Erro ao processar pagamento:", error);
      setErro("Erro ao processar pagamento. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 1200, margin: "0 auto", padding: 20 }}>
      <div style={{ marginBottom: 30 }}>
        <h1 style={{ fontSize: 28, marginBottom: 10 }}>Finalizar Compra</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: "#666" }}>Carrinho</span>
          <span style={{ color: "#666" }}>›</span>
          <span style={{ fontWeight: "bold" }}>Pagamento</span>
          <span style={{ color: "#666" }}>›</span>
          <span style={{ color: "#666" }}>Confirmação</span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 30, flexWrap: "wrap" }}>
        <div style={{ flex: 2, minWidth: 300 }}>
          <h2 style={{ fontSize: 20, marginBottom: 15 }}>Seus Produtos</h2>
          
          <div style={{ 
            border: "1px solid #eee", 
            borderRadius: 8,
            padding: 20
          }}>
            {produtos.length === 0 ? (
              <p style={{ textAlign: "center", color: "#666" }}>
                Nenhum produto encontrado
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
                {produtos.map((produto) => (
                  <div 
                    key={produto.id}
                    style={{
                      display: "flex",
                      gap: 15,
                      paddingBottom: 15,
                      borderBottom: "1px solid #f5f5f5"
                    }}
                  >
                    <div style={{ width: 80, height: 80, flexShrink: 0 }}>
                      <SafeImage
                        src={produto.imagem}
                        alt={produto.nome}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: 4
                        }}
                      />
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: 0, marginBottom: 5 }}>{produto.nome}</h3>
                      <div style={{ color: "#666", fontSize: 14 }}>
                        <p style={{ margin: "3px 0" }}>Tamanho: {produto.tamanho}</p>
                        <p style={{ margin: "3px 0" }}>Quantidade: {produto.quantidade}</p>
                        <p style={{ margin: "3px 0", fontWeight: "bold", color: "#000" }}>
                          R$ {(produto.preco * produto.quantidade).toFixed(2)}
                          {produto.quantidade > 1 && (
                            <span style={{ fontSize: 12, color: "#666", marginLeft: 5 }}>
                              (R$ {produto.preco.toFixed(2)} cada)
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ marginTop: 20 }}>
            <h3 style={{ fontSize: 18, marginBottom: 10 }}>Cupom de Desconto</h3>
            <div style={{ display: "flex", gap: 10 }}>
              <input
                type="text"
                placeholder="Digite seu cupom"
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  border: "1px solid #ddd",
                  borderRadius: 4
                }}
                onChange={(e) => {
                  setCupom(e.target.value);
                  setErro(null);
                }}
              />
              <button
                style={{
                  padding: "8px 16px",
                  background: "#333",
                  color: "white",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer"
                }}
                onClick={() => {
                  if (cupom?.toUpperCase() === "DESCONTO10") {
                    setDesconto(total * 0.1);
                    setErro(null);
                  } else {
                    setErro("Cupom inválido ou expirado");
                  }
                }}
              >
                Aplicar
              </button>
            </div>
            {erro && (
              <p style={{ color: "red", fontSize: 14, marginTop: 5 }}>{erro}</p>
            )}
          </div>

          <div style={{ marginTop: 30 }}>
            <h2 style={{ fontSize: 20, marginBottom: 15 }}>Método de Pagamento</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {["Cartão de Crédito", "PIX", "Boleto"].map((metodo) => (
                <div
                  key={metodo}
                  style={{
                    padding: 15,
                    border: `2px solid ${metodoPagamento === metodo.toLowerCase().replace(" ", "") ? "#007bff" : "#eee"}`,
                    borderRadius: 8,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 10
                  }}
                  onClick={() => setMetodoPagamento(metodo.toLowerCase().replace(" ", ""))}
                >
                  <input
                    type="radio"
                    checked={metodoPagamento === metodo.toLowerCase().replace(" ", "")}
                    readOnly
                  />
                  <span>{metodo}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 300 }}>
          <div style={{ 
            border: "1px solid #eee",
            borderRadius: 8,
            padding: 20,
            position: "sticky",
            top: 20
          }}>
            <h2 style={{ fontSize: 20, marginBottom: 20 }}>Resumo do Pedido</h2>
            
            <div style={{ marginBottom: 15 }}>
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between",
                marginBottom: 10
              }}>
                <span>Subtotal:</span>
                <span>R$ {total.toFixed(2)}</span>
              </div>
              
              {desconto > 0 && (
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between",
                  marginBottom: 10,
                  color: "green"
                }}>
                  <span>Desconto:</span>
                  <span>-R$ {desconto.toFixed(2)}</span>
                </div>
              )}
              
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between",
                marginBottom: 10,
                fontWeight: "bold"
              }}>
                <span>Frete:</span>
                <span>Grátis</span>
              </div>
              
              <div style={{ 
                height: 1, 
                background: "#eee", 
                margin: "15px 0" 
              }} />
              
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between",
                fontSize: 18,
                fontWeight: "bold"
              }}>
                <span>Total:</span>
                <span>R$ {(total - desconto).toFixed(2)}</span>
              </div>
            </div>
            
            <button
              style={{
                width: "100%",
                padding: 12,
                background: "#007bff",
                color: "white",
                border: "none",
                borderRadius: 4,
                fontSize: 16,
                cursor: "pointer",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 10
              }}
              onClick={handlePagamento}
              disabled={carregando || produtos.length === 0}
            >
              {carregando ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    style={{ width: 20, height: 20 }}
                  >
                    <div style={{
                      width: "100%",
                      height: "100%",
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTopColor: "white",
                      borderRadius: "50%"
                    }} />
                  </motion.div>
                  Processando...
                </>
              ) : sucesso ? (
                <>
                  <MdCheckCircle size={20} />
                  Pagamento realizado!
                </>
              ) : (
                "Confirmar Pagamento"
              )}
            </button>
            
            {sucesso && (
              <p style={{ 
                color: "green",
                textAlign: "center",
                marginTop: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 5
              }}>
                <MdCheckCircle /> Redirecionando...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pagamento;