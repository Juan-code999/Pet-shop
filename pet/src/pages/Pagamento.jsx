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
  const [metodoPagamento, setMetodoPagamento] = useState("cartao");
  const [carregando, setCarregando] = useState(false);
  const [carregandoProdutos, setCarregandoProdutos] = useState(true);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState(null);
  const [cupom, setCupom] = useState("");
  const [usuario, setUsuario] = useState(null);

  const [dadosPagamento, setDadosPagamento] = useState({
    // Cartão
    numeroCartao: "",
    nomeCartao: "",
    validade: "",
    cvv: "",
    cpf: "",
    parcelas: 1,
    
    // Contato
    email: "",
    telefone: "",
    
    // PIX
    chavePix: "",
    
    // Boleto
    codigoBoleto: ""
  });

  // Funções de formatação
  const formatarNumeroCartao = (value) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{4})(?=\d)/g, "$1 ")
      .substring(0, 19);
  };

  const formatarValidade = (value) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(?=\d)/g, "$1/")
      .substring(0, 5);
  };

  const formatarCPF = (value) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .substring(0, 14);
  };

  const formatarTelefone = (value) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .substring(0, 15);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    switch (name) {
      case "numeroCartao":
        setDadosPagamento(prev => ({ ...prev, [name]: formatarNumeroCartao(value) }));
        break;
      case "validade":
        setDadosPagamento(prev => ({ ...prev, [name]: formatarValidade(value) }));
        break;
      case "cpf":
        setDadosPagamento(prev => ({ ...prev, [name]: formatarCPF(value) }));
        break;
      case "telefone":
        setDadosPagamento(prev => ({ ...prev, [name]: formatarTelefone(value) }));
        break;
      default:
        setDadosPagamento(prev => ({ ...prev, [name]: value }));
    }
  };

  // Carregar produtos do carrinho
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    setUsuario(userData);

    const carregarDados = async () => {
      try {
        setCarregandoProdutos(true);
        
        const dadosCarrinho = JSON.parse(localStorage.getItem("checkoutItems")) || { 
          items: [], 
          total: 0 
        };

        const produtosCompletos = await Promise.all(
          dadosCarrinho.items.map(async (item) => {
            try {
              const response = await axios.get(`https://pet-shop-eiab.onrender.com/api/produtos/${item.produtoId}`);
              const produtoAPI = response.data;
              
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

  // Validações
  const validarEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validarCPF = (cpf) => {
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11) return false;
    
    // Validação dos dígitos verificadores
    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(9))) return false;

    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(10))) return false;

    return true;
  };

  const validarDadosPagamento = () => {
    // Validações comuns
    if (!dadosPagamento.email || !dadosPagamento.telefone) {
      setErro("Email e telefone são obrigatórios");
      return false;
    }

    if (!validarEmail(dadosPagamento.email)) {
      setErro("Email inválido");
      return false;
    }

    if (dadosPagamento.telefone.replace(/\D/g, '').length < 10) {
      setErro("Telefone inválido");
      return false;
    }

    // Validações específicas por método
    if (metodoPagamento === "cartao") {
      if (!dadosPagamento.nomeCartao || !dadosPagamento.numeroCartao || 
          !dadosPagamento.validade || !dadosPagamento.cvv || !dadosPagamento.cpf) {
        setErro("Todos os dados do cartão são obrigatórios");
        return false;
      }

      if (dadosPagamento.numeroCartao.replace(/\s/g, '').length !== 16) {
        setErro("Número do cartão inválido (deve ter 16 dígitos)");
        return false;
      }

      if (!/^\d{3,4}$/.test(dadosPagamento.cvv)) {
        setErro("CVV inválido (deve ter 3 ou 4 dígitos)");
        return false;
      }

      if (!/^\d{2}\/\d{2}$/.test(dadosPagamento.validade)) {
        setErro("Validade inválida (formato MM/AA)");
        return false;
      }

      if (!validarCPF(dadosPagamento.cpf)) {
        setErro("CPF inválido");
        return false;
      }
    }

    if (metodoPagamento === "pix" && !dadosPagamento.chavePix) {
      setErro("Chave PIX é obrigatória");
      return false;
    }

    return true;
  };

  const handlePagamento = async () => {
    if (!usuario || !usuario.id) {
      setErro("Usuário não autenticado");
      return;
    }

    if (produtos.length === 0) {
      setErro("Nenhum produto no carrinho");
      return;
    }

    if (!validarDadosPagamento()) {
      return;
    }

    setCarregando(true);
    setErro(null);

    try {
      const pagamentoData = {
        usuarioId: usuario.id,
        carrinhoId: localStorage.getItem("carrinhoId") || "temp-cart-" + Date.now(),
        valorTotal: total - desconto,
        metodoPagamento,
        dados: {
          ...dadosPagamento,
          // Limpar formatação antes de enviar
          numeroCartao: metodoPagamento === "cartao" ? 
            dadosPagamento.numeroCartao.replace(/\s/g, '') : undefined,
          cpf: metodoPagamento === "cartao" ? 
            dadosPagamento.cpf.replace(/\D/g, '') : undefined,
          telefone: dadosPagamento.telefone.replace(/\D/g, '')
        },
        itens: produtos.map(p => ({
          produtoId: p.produtoId,
          tamanho: p.tamanho,
          quantidade: p.quantidade,
          precoUnitario: p.precoUnitario,
          precoOriginal: p.precoUnitario
        }))
      };

      const token = localStorage.getItem("token");
      const response = await axios.post(
        "https://pet-shop-eiab.onrender.com/api/pagamento/processar", 
        pagamentoData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.Success) {
        setSucesso(true);
        
        // Limpar carrinho
        localStorage.removeItem("checkoutItems");
        localStorage.removeItem("carrinhoId");

        // Redirecionar para página de confirmação
        setTimeout(() => {
          navigate("/confirmacao", {
            state: { 
              ...response.data,
              produtos,
              total: total - desconto,
              metodoPagamento
            },
          });
        }, 2000);
      } else {
        setErro(response.data.Mensagem || "Falha ao processar pagamento");
      }
    } catch (error) {
      console.error("Erro no pagamento:", error);
      setErro(error.response?.data?.Mensagem || "Falha ao processar pagamento");
    } finally {
      setCarregando(false);
    }
  };

  const renderFormularioPagamento = () => {
    switch (metodoPagamento) {
      case "cartao":
        return (
          <div style={{ marginTop: 20 }}>
            <h3 style={{ fontSize: 18, marginBottom: 15 }}>Dados do Cartão</h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
              <div>
                <label style={{ display: "block", marginBottom: 5 }}>Nome no Cartão</label>
                <input
                  type="text"
                  name="nomeCartao"
                  value={dadosPagamento.nomeCartao}
                  onChange={handleChange}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #ddd", borderRadius: 4 }}
                  required
                />
              </div>
              
              <div>
                <label style={{ display: "block", marginBottom: 5 }}>Número do Cartão</label>
                <input
                  type="text"
                  name="numeroCartao"
                  value={dadosPagamento.numeroCartao}
                  onChange={handleChange}
                  maxLength={19}
                  placeholder="0000 0000 0000 0000"
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #ddd", borderRadius: 4 }}
                  required
                />
              </div>
              
              <div style={{ display: "flex", gap: 15 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", marginBottom: 5 }}>Validade (MM/AA)</label>
                  <input
                    type="text"
                    name="validade"
                    value={dadosPagamento.validade}
                    onChange={handleChange}
                    maxLength={5}
                    placeholder="MM/AA"
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #ddd", borderRadius: 4 }}
                    required
                  />
                </div>
                
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", marginBottom: 5 }}>CVV</label>
                  <input
                    type="text"
                    name="cvv"
                    value={dadosPagamento.cvv}
                    onChange={handleChange}
                    maxLength={4}
                    placeholder="123"
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #ddd", borderRadius: 4 }}
                    required
                  />
                </div>
              </div>
              
              <div>
                <label style={{ display: "block", marginBottom: 5 }}>CPF do Titular</label>
                <input
                  type="text"
                  name="cpf"
                  value={dadosPagamento.cpf}
                  onChange={handleChange}
                  placeholder="000.000.000-00"
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #ddd", borderRadius: 4 }}
                  required
                />
              </div>
              
              <div>
                <label style={{ display: "block", marginBottom: 5 }}>Parcelas</label>
                <select
                  name="parcelas"
                  value={dadosPagamento.parcelas}
                  onChange={handleChange}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #ddd", borderRadius: 4 }}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => (
                    <option key={num} value={num}>
                      {num}x de R$ {((total - desconto) / num).toFixed(2)} {num > 1 ? '(sem juros)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );
      
      case "pix":
        return (
          <div style={{ marginTop: 20 }}>
            <h3 style={{ fontSize: 18, marginBottom: 15 }}>Pagamento via PIX</h3>
            <p style={{ color: "#666", marginBottom: 15 }}>
              Informe sua chave PIX para recebimento:
            </p>
            <div>
              <label style={{ display: "block", marginBottom: 5 }}>Chave PIX</label>
              <input
                type="text"
                name="chavePix"
                value={dadosPagamento.chavePix}
                onChange={handleChange}
                style={{ width: "100%", padding: "8px 12px", border: "1px solid #ddd", borderRadius: 4 }}
                required
              />
            </div>
          </div>
        );
      
      case "boleto":
        return (
          <div style={{ marginTop: 20 }}>
            <h3 style={{ fontSize: 18, marginBottom: 15 }}>Pagamento via Boleto</h3>
            <p style={{ color: "#666", marginBottom: 15 }}>
              O boleto será gerado após a confirmação do pedido.
            </p>
          </div>
        );
      
      default:
        return null;
    }
  };

  const renderContato = () => (
    <div style={{ marginTop: 20 }}>
      <h3 style={{ fontSize: 18, marginBottom: 15 }}>Informações de Contato</h3>
      
      <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
        <div>
          <label style={{ display: "block", marginBottom: 5 }}>Email</label>
          <input
            type="email"
            name="email"
            value={dadosPagamento.email}
            onChange={handleChange}
            style={{ width: "100%", padding: "8px 12px", border: "1px solid #ddd", borderRadius: 4 }}
            required
          />
        </div>
        
        <div>
          <label style={{ display: "block", marginBottom: 5 }}>Telefone</label>
          <input
            type="tel"
            name="telefone"
            value={dadosPagamento.telefone}
            onChange={handleChange}
            placeholder="(00) 00000-0000"
            style={{ width: "100%", padding: "8px 12px", border: "1px solid #ddd", borderRadius: 4 }}
            required
          />
        </div>
      </div>
    </div>
  );

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
          {/* Lista de Produtos e Formulário */}
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

            {/* Formulário de pagamento específico */}
            {renderFormularioPagamento()}
            
            {/* Informações de contato (comum a todos os métodos) */}
            {renderContato()}
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

              {erro && (
                <div style={{ 
                  marginTop: 15,
                  padding: 10,
                  background: "#ffeeee",
                  border: "1px solid #ffcccc",
                  borderRadius: 4,
                  color: "red",
                  display: "flex",
                  alignItems: "center",
                  gap: 5
                }}>
                  <MdError size={18} />
                  <span>{erro}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pagamento;