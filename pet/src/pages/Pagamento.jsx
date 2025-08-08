import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MdCheckCircle, MdError } from "react-icons/md";
import axios from "axios";

const Pagamento = () => {
  const navigate = useNavigate();
  const [produtos, setProdutos] = useState([]);
  const [total, setTotal] = useState(0);
  const [desconto, setDesconto] = useState(0);
  const [metodoPagamento, setMetodoPagamento] = useState("credito");
  const [carregando, setCarregando] = useState(false);
  const [carregandoProdutos, setCarregandoProdutos] = useState(true);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState(null);
  const [cupom, setCupom] = useState("");

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setCarregandoProdutos(true);
        
        // 1. Primeiro carrega os itens do carrinho do localStorage
        const dadosCarrinho = JSON.parse(localStorage.getItem("checkoutItems")) || { 
          items: [], 
          total: 0 
        };

        // 2. Busca os detalhes completos de cada produto na API
        const produtosCompletos = await Promise.all(
          dadosCarrinho.items.map(async (item) => {
            try {
              const response = await axios.get(`https://pet-shop-eiab.onrender.com/api/produtos/${item.produtoId}`);
              const produtoAPI = response.data;
              
              // Encontra o preço específico para o tamanho selecionado
              const tamanhoInfo = produtoAPI.tamanhos?.find(t => t.tamanho === item.tamanho) || {};
              
              return {
                ...item,
                nome: produtoAPI.nome || item.nome,
                imagem: produtoAPI.imagensUrl?.[0] || item.imagem,
                precoUnitario: tamanhoInfo.precoTotal || item.precoUnitario || 0,
                precoTotal: (tamanhoInfo.precoTotal || item.precoUnitario || 0) * (item.quantidade || 1)
              };
            } catch (error) {
              console.error(`Erro ao buscar produto ${item.produtoId}:`, error);
              return {
                ...item,
                nome: item.nome || "Produto não encontrado",
                precoUnitario: item.precoUnitario || 0,
                precoTotal: (item.precoUnitario || 0) * (item.quantidade || 1)
              };
            }
          })
        );

        setProdutos(produtosCompletos);
        
        // 3. Calcula o total baseado nos preços atualizados
        const totalCalculado = produtosCompletos.reduce((sum, p) => sum + p.precoTotal, 0);
        setTotal(dadosCarrinho.total > 0 ? dadosCarrinho.total : totalCalculado);
        setDesconto(dadosCarrinho.desconto || 0);

      } catch (error) {
        console.error("Erro ao carregar carrinho:", error);
        setErro("Erro ao carregar itens do carrinho");
      } finally {
        setCarregandoProdutos(false);
      }
    };

    carregarDados();
  }, []);

  const handlePagamento = async () => {
    if (produtos.length === 0) {
      setErro("Nenhum produto no carrinho");
      return;
    }

    setCarregando(true);
    setErro(null);

    try {
      // Simulação de processamento
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
      console.error("Erro no pagamento:", error);
      setErro("Falha ao processar pagamento");
    } finally {
      setCarregando(false);
    }
  };

  const ImagemProduto = ({ src, alt }) => {
    const [imgSrc, setImgSrc] = useState(src);

    const handleError = () => {
      setImgSrc("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect fill='%23f5f5f5' width='80' height='80'/%3E%3Ctext fill='%23666' font-family='sans-serif' font-size='10' dy='3' text-anchor='middle' x='40' y='45'%3EProduto%3C/text%3E%3C/svg%3E");
    };

    return (
      <img 
        src={imgSrc} 
        alt={alt}
        onError={handleError}
        style={{ 
          width: "100%", 
          height: "100%", 
          objectFit: "cover", 
          borderRadius: 4 
        }}
      />
    );
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 20 }}>
      {/* Cabeçalho */}
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

      {carregandoProdutos ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            style={{ 
              width: 40, 
              height: 40, 
              border: "4px solid #eee",
              borderTopColor: "#007bff",
              borderRadius: "50%",
              margin: "0 auto 20px"
            }}
          />
          <p>Carregando seus produtos...</p>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 30, flexWrap: "wrap" }}>
          {/* Lista de Produtos */}
          <div style={{ flex: 2, minWidth: 300 }}>
            <h2 style={{ fontSize: 20, marginBottom: 15 }}>Seus Produtos</h2>
            
            <div style={{ border: "1px solid #eee", borderRadius: 8, padding: 20 }}>
              {produtos.length === 0 ? (
                <p style={{ textAlign: "center", color: "#666" }}>Seu carrinho está vazio</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
                  {produtos.map(produto => (
                    <div 
                      key={`${produto.produtoId}-${produto.tamanho}`} 
                      style={{ 
                        display: "flex", 
                        gap: 15, 
                        paddingBottom: 15, 
                        borderBottom: "1px solid #f5f5f5" 
                      }}
                    >
                      <div style={{ 
                        width: 80, 
                        height: 80, 
                        flexShrink: 0, 
                        backgroundColor: "#f5f5f5", 
                        borderRadius: 4,
                        overflow: "hidden"
                      }}>
                        <ImagemProduto src={produto.imagem} alt={produto.nome} />
                      </div>
                      
                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: 0, marginBottom: 5 }}>{produto.nome}</h3>
                        <div style={{ color: "#666", fontSize: 14 }}>
                          <p style={{ margin: "4px 0" }}>
                            <strong>Tamanho:</strong> {produto.tamanho}
                          </p>
                          <p style={{ margin: "4px 0" }}>
                            <strong>Quantidade:</strong> {produto.quantidade}
                          </p>
                          <p style={{ margin: "4px 0", fontWeight: "bold", color: "#000" }}>
                            <strong>Preço:</strong> R$ {produto.precoTotal.toFixed(2)}
                            {produto.quantidade > 1 && (
                              <span style={{ fontSize: 12, color: "#666", marginLeft: 5 }}>
                                (R$ {produto.precoUnitario.toFixed(2)} cada)
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

            {/* Cupom de Desconto */}
            <div style={{ marginTop: 20 }}>
              <h3 style={{ fontSize: 18, marginBottom: 10 }}>Cupom de Desconto</h3>
              <div style={{ display: "flex", gap: 10 }}>
                <input
                  type="text"
                  placeholder="Digite seu cupom"
                  value={cupom}
                  onChange={(e) => setCupom(e.target.value)}
                  style={{ 
                    flex: 1, 
                    padding: "8px 12px", 
                    border: "1px solid #ddd", 
                    borderRadius: 4 
                  }}
                />
                <button
                  onClick={() => {
                    if (cupom.trim().toUpperCase() === "DESCONTO10") {
                      setDesconto(total * 0.1);
                      setErro(null);
                    } else {
                      setErro("Cupom inválido");
                      setDesconto(0);
                    }
                  }}
                  style={{ 
                    padding: "8px 16px", 
                    background: "#333", 
                    color: "white", 
                    border: "none", 
                    borderRadius: 4, 
                    cursor: "pointer" 
                  }}
                >
                  Aplicar
                </button>
              </div>
              {erro && (
                <p style={{ color: "red", fontSize: 14, marginTop: 5 }}>{erro}</p>
              )}
            </div>

            {/* Métodos de Pagamento */}
            <div style={{ marginTop: 30 }}>
              <h2 style={{ fontSize: 20, marginBottom: 15 }}>Método de Pagamento</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {["Cartão de Crédito", "PIX", "Boleto"].map(metodo => {
                  const metodoFormatado = metodo.toLowerCase().replace(" ", "");
                  return (
                    <div
                      key={metodo}
                      style={{
                        padding: 15,
                        border: `2px solid ${metodoPagamento === metodoFormatado ? "#007bff" : "#eee"}`,
                        borderRadius: 8,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 10
                      }}
                      onClick={() => setMetodoPagamento(metodoFormatado)}
                    >
                      <input
                        type="radio"
                        checked={metodoPagamento === metodoFormatado}
                        readOnly
                      />
                      <span>{metodo}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Resumo do Pedido */}
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
                onClick={handlePagamento}
                disabled={carregando || produtos.length === 0}
                style={{
                  width: "100%",
                  padding: 12,
                  background: produtos.length === 0 ? "#ccc" : "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: 4,
                  fontSize: 16,
                  cursor: produtos.length === 0 ? "not-allowed" : "pointer",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 10
                }}
              >
                {carregando ? (
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
                ) : sucesso ? (
                  <>
                    <MdCheckCircle size={20} />
                    Sucesso!
                  </>
                ) : (
                  "Finalizar Compra"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pagamento;