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
  const [contato, setContato] = useState({
    email: "",
    telefone: ""
  });

  // Dados do cartão
  const [dadosCartao, setDadosCartao] = useState({
    numeroCartao: "",
    nomeCartao: "",
    validade: "",
    cvv: "",
    cpf: "",
    parcelas: 1,
  });

  // Dados do PIX
  const [dadosPix, setDadosPix] = useState({
    chavePix: "",
    cpf: ""
  });

  // Dados do Boleto
  const [dadosBoleto, setDadosBoleto] = useState({
    cpf: ""
  });

  const METODOS = [
    { label: "Cartão de Crédito", value: "cartao" },
    { label: "PIX", value: "pix" },
    { label: "Boleto", value: "boleto" },
  ];

  const usuarioId = localStorage.getItem("usuarioId");
  const API_URL = "https://pet-shop-eiab.onrender.com";

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setCarregandoProdutos(true);
        setErro(null);

        // Carrega dados do usuário
        const userData = JSON.parse(localStorage.getItem("user"));
        setUsuario(userData);
        if (userData) {
          setContato({
            email: userData.email || "",
            telefone: userData.telefone || ""
          });
        }

        // Verifica se usuário está logado
        if (!usuarioId) {
          setErro("Usuário não está logado");
          setCarregandoProdutos(false);
          return;
        }

        // Pega carrinho do localStorage
        const dadosCarrinho = JSON.parse(localStorage.getItem("checkoutItems")) || {
          items: [],
          total: 0,
          desconto: 0,
        };

        // Busca detalhes dos produtos
        const produtosCompletos = await Promise.all(
          dadosCarrinho.items.map(async (item) => {
            try {
              const response = await axios.get(`${API_URL}/api/produtos/${item.produtoId}`);
              const produtoAPI = response.data;
              const tamanhoInfo = produtoAPI.tamanhos?.find((t) => t.tamanho === item.tamanho) || {};

              return {
                ...item,
                nome: produtoAPI.nome || item.nome,
                imagem: produtoAPI.imagensUrl?.[0] || item.imagem || "",
                precoUnitario: Number(tamanhoInfo.precoTotal ?? item.precoUnitario ?? 0),
                precoOriginal: Number(tamanhoInfo.precoTotal ?? item.precoUnitario ?? 0),
                precoTotal: Number((tamanhoInfo.precoTotal ?? item.precoUnitario ?? 0) * (item.quantidade ?? 1)),
              };
            } catch (error) {
              console.error(`Erro ao buscar produto ${item.produtoId}:`, error);
              return {
                ...item,
                nome: item.nome || "Produto não encontrado",
                imagem: item.imagem || "",
                precoUnitario: Number(item.precoUnitario ?? 0),
                precoOriginal: Number(item.precoUnitario ?? 0),
                precoTotal: Number((item.precoUnitario ?? 0) * (item.quantidade ?? 1)),
              };
            }
          })
        );

        setProdutos(produtosCompletos);

        // Calcula totais
        const totalCalculado = produtosCompletos.reduce((sum, p) => sum + Number(p.precoTotal || 0), 0);
        let descontoPercentual = 0;
        
        if (dadosCarrinho.desconto && dadosCarrinho.desconto > 0) {
          descontoPercentual = dadosCarrinho.desconto < 1 
            ? dadosCarrinho.desconto 
            : dadosCarrinho.desconto / (dadosCarrinho.total || totalCalculado);
        }

        setTotal(dadosCarrinho.total > 0 ? Number(dadosCarrinho.total) : totalCalculado);
        setDesconto(descontoPercentual);
      } catch (error) {
        console.error("Erro ao carregar carrinho:", error);
        setErro("Erro ao carregar itens do carrinho");
      } finally {
        setCarregandoProdutos(false);
      }
    };

    carregarDados();
  }, [usuarioId]);

  const formatarTelefone = (telefone) => {
    const nums = telefone.replace(/\D/g, "").slice(0, 11);
    if (nums.length <= 2) return nums;
    if (nums.length <= 6) return `(${nums.slice(0, 2)}) ${nums.slice(2)}`;
    if (nums.length <= 10) return `(${nums.slice(0, 2)}) ${nums.slice(2, 6)}-${nums.slice(6)}`;
    return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7, 11)}`;
  };

  const handleDadosCartaoChange = (e) => {
    const { name, value } = e.target;
    let valorFormatado = value;

    switch (name) {
      case "numeroCartao":
        valorFormatado = value.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ").trim();
        break;
      case "validade":
        valorFormatado = value.replace(/\D/g, "").slice(0, 4);
        if (valorFormatado.length >= 3) valorFormatado = valorFormatado.replace(/(\d{2})(\d{0,2})/, "$1/$2");
        break;
      case "cvv":
        valorFormatado = value.replace(/\D/g, "").slice(0, 4);
        break;
      case "cpf":
        valorFormatado = value.replace(/\D/g, "").slice(0, 11)
          .replace(/(\d{3})(\d)/, "$1.$2")
          .replace(/(\d{3})(\d)/, "$1.$2")
          .replace(/(\d{3})(\d{1,2})/, "$1-$2")
          .replace(/(-\d{2})\d+?$/, "$1");
        break;
      case "parcelas":
        valorFormatado = Math.max(1, Math.min(12, parseInt(value, 10) || 1));
        break;
      default:
        valorFormatado = value;
    }

    setDadosCartao(prev => ({ ...prev, [name]: valorFormatado }));
  };

  const handlePixChange = (e) => {
    const { name, value } = e.target;
    setDadosPix(prev => ({ ...prev, [name]: value }));
  };

  const handleBoletoChange = (e) => {
    const { name, value } = e.target;
    setDadosBoleto(prev => ({ ...prev, [name]: value }));
  };

  const handleContatoChange = (e) => {
    const { name, value } = e.target;
    if (name === "telefone") {
      setContato(prev => ({ ...prev, [name]: formatarTelefone(value) }));
    } else {
      setContato(prev => ({ ...prev, [name]: value }));
    }
  };

  const aplicarCupom = () => {
    setErro(null);
    const code = cupom.trim().toUpperCase();
    
    if (!code) {
      setErro("Informe um cupom");
      return;
    }

    if (code === "DESCONTO10") {
      setDesconto(0.1);
      setErro(null);
    } else {
      setErro("Cupom inválido");
      setDesconto(0);
    }
  };

  const validarEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

const handlePagamento = async () => {
  setErro(null);
  setSucesso(false);

  // Validações básicas
  if (!usuarioId) {
    setErro("Você precisa fazer login para continuar");
    setTimeout(() => navigate('/login', { state: { from: '/pagamento' } }), 1500);
    return;
  }

  if (!produtos || produtos.length === 0) {
    setErro("O pagamento deve conter itens");
    return;
  }

  const valorFinal = Number(total);
  if (!(valorFinal > 0)) {
    setErro("Valor total deve ser maior que zero");
    return;
  }

  const metodo = String(metodoPagamento || "").toLowerCase();
  if (!["cartao", "pix", "boleto"].includes(metodo)) {
    setErro("Método de pagamento inválido");
    return;
  }

  // Monta o objeto de pagamento
  const pagamentoDTO = {
    usuarioId,
    carrinhoId: `carrinho-${usuarioId}-${Date.now()}`,
    valorTotal: valorFinal,
    itens: produtos.map(p => ({
      produtoId: p.produtoId ?? p.id ?? "",
      tamanho: p.tamanho ?? "",
      quantidade: Number(p.quantidade ?? 1),
      precoUnitario: Number(p.precoUnitario ?? p.preco ?? 0),
      precoOriginal: Number(p.precoOriginal ?? p.precoUnitario ?? p.preco ?? 0),
      dataAdicao: new Date().toISOString()
    })),
    metodo: (() => {
      switch (metodo) {
        case "cartao":
          return {
            tipo: "cartao",
            numeroCartao: (dadosCartao.numeroCartao || "").replace(/\s/g, ""),
            nomeCartao: dadosCartao.nomeCartao || "",
            validade: dadosCartao.validade || "",
            cvv: dadosCartao.cvv || "",
            cpf: (dadosCartao.cpf || "").replace(/\D/g, ""),
            parcelas: Number(dadosCartao.parcelas) || 1
          };
        case "pix":
          return {
            tipo: "pix",
            chavePix: dadosPix.chavePix || "",
            cpf: (dadosPix.cpf || "").replace(/\D/g, "")
          };
        case "boleto":
          return {
            tipo: "boleto",
            cpf: (dadosBoleto.cpf || "").replace(/\D/g, "")
          };
      }
    })()
  };

  try {
    console.log("Enviando pagamentoDTO:", pagamentoDTO);

    // Envia como string JSON
    const response = await axios.post(
      "https://pet-shop-eiab.onrender.com/api/Pagamento/processar",
      JSON.stringify(pagamentoDTO),
      {
        headers: { "Content-Type": "application/json" }
      }
    );

    console.log("Pagamento aprovado:", response.data);
    setSucesso(true);
  } catch (err) {
    console.error("Erro no pagamento:", err);
    setErro("Erro ao processar pagamento");
  }
};















  // Renderização do componente
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
              margin: "0 auto 20px",
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
                  {produtos.map((produto) => (
                    <div
                      key={`${produto.produtoId ?? produto.id}-${produto.tamanho ?? ""}`}
                      style={{
                        display: "flex",
                        gap: 15,
                        paddingBottom: 15,
                        borderBottom: "1px solid #f5f5f5",
                      }}
                    >
                      <div
                        style={{
                          width: 80,
                          height: 80,
                          flexShrink: 0,
                          backgroundColor: "#f5f5f5",
                          borderRadius: 4,
                          overflow: "hidden",
                        }}
                      >
                        <img
                          src={produto.imagem || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect fill='%23f5f5f5' width='80' height='80'/%3E%3Ctext fill='%23666' font-family='sans-serif' font-size='10' dy='3' text-anchor='middle' x='40' y='45'%3EProduto%3C/text%3E%3C/svg%3E"}
                          alt={produto.nome}
                          onError={(e) => {
                            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect fill='%23f5f5f5' width='80' height='80'/%3E%3Ctext fill='%23666' font-family='sans-serif' font-size='10' dy='3' text-anchor='middle' x='40' y='45'%3EProduto%3C/text%3E%3C/svg%3E";
                          }}
                          style={{ width: "100%", height: "100%", objectFit: "contain" }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontWeight: "bold", fontSize: 16 }}>{produto.nome}</p>
                        <p style={{ margin: "4px 0" }}>Tamanho: {produto.tamanho}</p>
                        <p style={{ margin: 0 }}>Quantidade: {produto.quantidade}</p>
                      </div>
                      <div style={{ minWidth: 90, textAlign: "right", fontWeight: "bold", fontSize: 16 }}>
                        R$ {Number(produto.precoTotal).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Formulário de pagamento */}
          <div style={{ flex: 1, minWidth: 300 }}>
            <h2 style={{ fontSize: 20, marginBottom: 15 }}>Detalhes do Pagamento</h2>

            <div style={{ marginBottom: 15 }}>
              <label style={{ fontWeight: "bold" }}>Email:</label>
              <input
                type="email"
                name="email"
                value={contato.email}
                onChange={handleContatoChange}
                style={{ width: "100%", padding: 8, marginTop: 5 }}
              />
            </div>

            <div style={{ marginBottom: 15 }}>
              <label style={{ fontWeight: "bold" }}>Telefone:</label>
              <input
                type="text"
                name="telefone"
                value={contato.telefone}
                onChange={handleContatoChange}
                placeholder="(00) 00000-0000"
                style={{ width: "100%", padding: 8, marginTop: 5 }}
              />
            </div>

            <div style={{ marginBottom: 15 }}>
              <label style={{ fontWeight: "bold" }}>Método de Pagamento:</label>
              <select
                value={metodoPagamento}
                onChange={(e) => setMetodoPagamento(e.target.value)}
                style={{ width: "100%", padding: 8, marginTop: 5 }}
              >
                {METODOS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Campos dinâmicos por método */}
            {metodoPagamento === "cartao" && (
              <>
                <div style={{ marginBottom: 15 }}>
                  <label>Número do Cartão:</label>
                  <input
                    type="text"
                    name="numeroCartao"
                    value={dadosCartao.numeroCartao}
                    onChange={handleDadosCartaoChange}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    style={{ width: "100%", padding: 8, marginTop: 5 }}
                  />
                </div>

                <div style={{ marginBottom: 15 }}>
                  <label>Nome no Cartão:</label>
                  <input
                    type="text"
                    name="nomeCartao"
                    value={dadosCartao.nomeCartao}
                    onChange={handleDadosCartaoChange}
                    placeholder="João Gabriel Cunha"
                    style={{ width: "100%", padding: 8, marginTop: 5 }}
                  />
                </div>

                <div style={{ display: "flex", gap: 15, marginBottom: 15 }}>
                  <div style={{ flex: 1 }}>
                    <label>Validade (MM/AA):</label>
                    <input
                      type="text"
                      name="validade"
                      value={dadosCartao.validade}
                      onChange={handleDadosCartaoChange}
                      placeholder="12/27"
                      maxLength={5}
                      style={{ width: "100%", padding: 8, marginTop: 5 }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label>CVV:</label>
                    <input
                      type="text"
                      name="cvv"
                      value={dadosCartao.cvv}
                      onChange={handleDadosCartaoChange}
                      placeholder="123"
                      maxLength={4}
                      style={{ width: "100%", padding: 8, marginTop: 5 }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: 15 }}>
                  <label>CPF:</label>
                  <input
                    type="text"
                    name="cpf"
                    value={dadosCartao.cpf}
                    onChange={handleDadosCartaoChange}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    style={{ width: "100%", padding: 8, marginTop: 5 }}
                  />
                </div>

                <div style={{ marginBottom: 15 }}>
                  <label>Parcelas:</label>
                  <input
                    type="number"
                    name="parcelas"
                    value={dadosCartao.parcelas}
                    onChange={handleDadosCartaoChange}
                    min={1}
                    max={12}
                    style={{ width: "100%", padding: 8, marginTop: 5 }}
                  />
                </div>
              </>
            )}

            {metodoPagamento === "pix" && (
              <>
                <div style={{ marginBottom: 15 }}>
                  <label>Chave PIX (opcional):</label>
                  <input
                    type="text"
                    name="chavePix"
                    value={dadosPix.chavePix}
                    onChange={handlePixChange}
                    placeholder="exemplo@pix.com ou seu CPF/CNPJ"
                    style={{ width: "100%", padding: 8, marginTop: 5 }}
                  />
                </div>
                <div style={{ marginBottom: 15 }}>
                  <label>CPF:</label>
                  <input
                    type="text"
                    name="cpf"
                    value={dadosPix.cpf}
                    onChange={handlePixChange}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    style={{ width: "100%", padding: 8, marginTop: 5 }}
                  />
                </div>
              </>
            )}

            {metodoPagamento === "boleto" && (
              <div style={{ marginBottom: 15 }}>
                <label>CPF:</label>
                <input
                  type="text"
                  name="cpf"
                  value={dadosBoleto.cpf}
                  onChange={handleBoletoChange}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  style={{ width: "100%", padding: 8, marginTop: 5 }}
                />
                <p style={{ marginTop: 10, fontSize: 14, color: "#666" }}>
                  O boleto será gerado após a confirmação do pedido.
                </p>
              </div>
            )}

            <div style={{ marginBottom: 15 }}>
              <label>Cupom de Desconto:</label>
              <div style={{ display: "flex", gap: 10 }}>
                <input
                  type="text"
                  value={cupom}
                  onChange={(e) => setCupom(e.target.value)}
                  placeholder="Digite seu cupom"
                  style={{ flex: 1, padding: 8 }}
                />
                <button 
                  onClick={aplicarCupom}
                  style={{
                    padding: "8px 15px",
                    backgroundColor: "#f0f0f0",
                    border: "1px solid #ddd",
                    borderRadius: 4,
                    cursor: "pointer"
                  }}
                >
                  Aplicar
                </button>
              </div>
            </div>

            <div style={{ 
              backgroundColor: "#f9f9f9",
              padding: 15,
              borderRadius: 8,
              marginBottom: 15 
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span>Subtotal:</span>
                <span>R$ {total.toFixed(2)}</span>
              </div>
              {desconto > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <span>Desconto ({desconto * 100}%):</span>
                  <span>- R$ {(total * desconto).toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: 18 }}>
                <span>Total:</span>
                <span>R$ {(total - total * desconto).toFixed(2)}</span>
              </div>
            </div>

            {erro && (
              <div
                style={{
                  backgroundColor: "#f8d7da",
                  color: "#842029",
                  padding: 10,
                  borderRadius: 5,
                  marginBottom: 15,
                  display: "flex",
                  alignItems: "center",
                  gap: 8
                }}
              >
                <MdError size={20} />
                <span>{erro}</span>
              </div>
            )}

            {sucesso && (
              <div
                style={{
                  backgroundColor: "#d1e7dd",
                  color: "#0f5132",
                  padding: 10,
                  borderRadius: 5,
                  marginBottom: 15,
                  display: "flex",
                  alignItems: "center",
                  gap: 8
                }}
              >
                <MdCheckCircle size={20} />
                <span>Pagamento realizado com sucesso!</span>
              </div>
            )}

            <button
              onClick={handlePagamento}
              disabled={carregando}
              style={{
                width: "100%",
                padding: 15,
                backgroundColor: "#007bff",
                border: "none",
                borderRadius: 5,
                color: "#fff",
                fontWeight: "bold",
                cursor: carregando ? "not-allowed" : "pointer",
                opacity: carregando ? 0.7 : 1,
                transition: "opacity 0.2s"
              }}
            >
              {carregando ? (
                <>
                  <span style={{ verticalAlign: "middle" }}>Processando...</span>
                </>
              ) : (
                "Finalizar Pagamento"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pagamento;