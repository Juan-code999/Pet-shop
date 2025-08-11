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


  // Dados do cartão (se método for cartão)
  const [dadosCartao, setDadosCartao] = useState({

    numeroCartao: "",
    nomeCartao: "",
    validade: "",
    cvv: "",
    cpf: "",
    parcelas: 1,
  });

  const METODOS = [
    { label: "Cartão de Crédito", value: "cartao" },
    { label: "PIX", value: "pix" },
    { label: "Boleto", value: "boleto" },
  ];

  // Obter ID do usuário de forma consistente com Carrinho.jsx
  const usuarioId = localStorage.getItem("usuarioId");


  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    setUsuario(userData);

    const carregarDados = async () => {
      try {
        setCarregandoProdutos(true);


        // Verificar se usuário está logado
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

        // Busca os detalhes completos dos produtos do backend

        const produtosCompletos = await Promise.all(
          dadosCarrinho.items.map(async (item) => {
            try {
              const response = await axios.get(`https://pet-shop-eiab.onrender.com/api/produtos/${item.produtoId}`);
              const produtoAPI = response.data;

              const tamanhoInfo = produtoAPI.tamanhos?.find((t) => t.tamanho === item.tamanho) || {};


              return {
                ...item,
                nome: produtoAPI.nome || item.nome,
                imagem: produtoAPI.imagensUrl?.[0] || item.imagem || "",
                precoUnitario: Number(tamanhoInfo.precoTotal ?? item.precoUnitario ?? 0),
                precoTotal: Number((tamanhoInfo.precoTotal ?? item.precoUnitario ?? 0) * (item.quantidade ?? 1)),
              };
            } catch (error) {
              console.error(`Erro ao buscar produto ${item.produtoId}:`, error);
              return {
                ...item,
                nome: item.nome || "Produto não encontrado",
                imagem: item.imagem || "",
                precoUnitario: Number(item.precoUnitario ?? 0),
                precoTotal: Number((item.precoUnitario ?? 0) * (item.quantidade ?? 1)),
              };
            }
          })
        );

        setProdutos(produtosCompletos);


        // Calcula total somando os preços de cada produto
        const totalCalculado = produtosCompletos.reduce((sum, p) => sum + Number(p.precoTotal || 0), 0);

        // Ajusta o desconto
        let descontoPercentual = 0;
        if (dadosCarrinho.desconto && dadosCarrinho.desconto > 0) {
          if (dadosCarrinho.desconto < 1) {
            descontoPercentual = dadosCarrinho.desconto;
          } else {
            descontoPercentual = dadosCarrinho.desconto / (dadosCarrinho.total || totalCalculado);
          }
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
  }, [usuarioId]); // Adicionado usuarioId como dependência

  const handleDadosCartaoChange = (e) => {
    const { name } = e.target;
    let value = e.target.value;

    if (name === "numeroCartao") {
      value = value.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ").trim();
    } else if (name === "validade") {
      value = value.replace(/\D/g, "").slice(0, 4);
      if (value.length >= 3) value = value.replace(/(\d{2})(\d{0,2})/, "$1/$2");
    } else if (name === "cvv") {
      value = value.replace(/\D/g, "").slice(0, 4);
    } else if (name === "cpf") {
      value = value.replace(/\D/g, "").slice(0, 11);
      value = value
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})/, "$1-$2")
        .replace(/(-\d{2})\d+?$/, "$1");
    } else if (name === "parcelas") {
      value = parseInt(value, 10) || 1;
    }

    setDadosCartao((prev) => ({ ...prev, [name]: value }));
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
    } else {
      setErro("Cupom inválido");
      setDesconto(0);
    }
  };

  const handlePagamento = async () => {

    setErro(null);

    // Verificação consistente do usuário logado
    if (!usuarioId) {
      setErro("Você precisa fazer login para continuar");
      setTimeout(() => navigate('/login', { state: { from: '/pagamento' } }), 1500);
      return;
    }

    // Aplica desconto percentual sobre total para calcular valor final
    const valorFinal = Number(total - total * desconto);
    if (!(valorFinal > 0)) {
      setErro("Valor total inválido.");
      return;
    }

    if (!produtos || produtos.length === 0) {
      setErro("Carrinho vazio.");
      return;
    }

    const metodo = String(metodoPagamento || "").toLowerCase();
    if (!["cartao", "pix", "boleto"].includes(metodo)) {
      setErro("Método de pagamento inválido.");
      return;
    }

    if (metodo === "cartao") {
      const numeroSemEspaco = (dadosCartao.numeroCartao || "").replace(/\s/g, "");
      if (!numeroSemEspaco || numeroSemEspaco.length < 15) {
        setErro("Número do cartão inválido.");
        return;
      }
      if (!dadosCartao.nomeCartao || !dadosCartao.validade || !dadosCartao.cvv) {
        setErro("Preencha todos os dados do cartão.");
        return;
      }
    }

    const itensDto = produtos.map((p) => ({
      ProdutoId: p.produtoId ?? p.id ?? "",
      Tamanho: p.tamanho ?? "",
      Quantidade: Number(p.quantidade ?? 1),
      PrecoUnitario: Number(p.precoUnitario ?? p.preco ?? 0),
      PrecoOriginal: Number(p.precoUnitario ?? p.preco ?? 0),
    }));

    let dadosDto = {};
    if (metodo === "cartao") {
      dadosDto = {
        NumeroCartao: (dadosCartao.numeroCartao || "").replace(/\s/g, ""),
        NomeCartao: dadosCartao.nomeCartao || "",
        Validade: dadosCartao.validade || "",
        CVV: dadosCartao.cvv || "",
        CPF: (dadosCartao.cpf || "").replace(/\D/g, ""),
        Parcelas: Number(dadosCartao.parcelas) || 1,
      };
    }

    const pagamentoDTO = {
      UsuarioId: usuarioId, // Usando o usuarioId obtido consistentemente
      CarrinhoId: `carrinho-${usuarioId}-${Date.now()}`,
      ValorTotal: valorFinal,
      MetodoPagamento: metodo,
      Dados: dadosDto,
      Itens: itensDto,
    };

    console.log("Payload enviado para /api/pagamento/processar:", pagamentoDTO);

    setCarregando(true);

    try {
      const response = await axios.post("http://localhost:5005/api/pagamento/processar", pagamentoDTO);

      console.log("Resposta do backend:", response.data);

      if (response.data?.Success) {
        setSucesso(true);
        localStorage.removeItem("checkoutItems");

        setTimeout(() => {
          navigate("/confirmacao", {
            state: {
              produtos,
              total: valorFinal,
              metodoPagamento: metodo,
              pagamentoId: response.data.PagamentoId,
              status: response.data.Status,
              dadosPagamento: response.data.Dados,
            },
          });
        }, 1200);
      } else {
        const mensagem = response.data?.Mensagem ?? response.data?.Message ?? "Falha ao processar pagamento";
        setErro(mensagem);
      }
    } catch (error) {
      console.error("Erro no pagamento (catch):", error);

      const serverData = error.response?.data;
      let serverMessage = null;

      if (serverData) {
        serverMessage =
          serverData?.Message ||
          serverData?.Mensagem ||
          serverData?.message ||
          serverData?.mensagem ||
          (typeof serverData === "string" ? serverData : null);

        if (!serverMessage) {
          serverMessage = JSON.stringify(serverData);
        }
      } else {
        serverMessage = error.message || "Falha ao processar pagamento";
      }

      setErro(serverMessage);

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
      setImgSrc(
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect fill='%23f5f5f5' width='80' height='80'/%3E%3Ctext fill='%23666' font-family='sans-serif' font-size='10' dy='3' text-anchor='middle' x='40' y='45'%3EProduto%3C/text%3E%3C/svg%3E"
      );
    };

    useEffect(() => {
      setImgSrc(src);
    }, [src]);

    return (
      <img
        src={imgSrc}
        alt={alt}
        onError={handleError}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          borderRadius: 4,
        }}
      />
    );
  };

  const formatarMoeda = (valor) =>
    valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

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
                            <strong>Preço:</strong> {formatarMoeda(produto.precoTotal)}
                            {produto.quantidade > 1 && (
                              <span style={{ fontSize: 12, color: "#666", marginLeft: 5 }}>
                                ({formatarMoeda(produto.precoUnitario)} cada)
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
                    borderRadius: 4,
                  }}
                />
                <button
                  onClick={aplicarCupom}
                  style={{
                    padding: "8px 16px",
                    background: "#333",
                    color: "white",
                    border: "none",
                    borderRadius: 4,
                    cursor: "pointer",
                  }}
                >
                  Aplicar
                </button>
              </div>
              {erro && <p style={{ color: "red", fontSize: 14, marginTop: 5 }}>{erro}</p>}
            </div>

            {/* Métodos de Pagamento */}
            <div style={{ marginTop: 30 }}>
              <h2 style={{ fontSize: 20, marginBottom: 15 }}>Método de Pagamento</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {METODOS.map((metodo) => (
                  <div
                    key={metodo.value}
                    style={{
                      padding: 15,
                      border: `2px solid ${metodoPagamento === metodo.value ? "#007bff" : "#eee"}`,
                      borderRadius: 8,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                    onClick={() => setMetodoPagamento(metodo.value)}
                  >
                    <input type="radio" checked={metodoPagamento === metodo.value} readOnly />
                    <span>{metodo.label}</span>
                  </div>
                ))}
              </div>

              {metodoPagamento === "cartao" && (
                <div style={{ marginTop: 20, border: "1px solid #eee", borderRadius: 8, padding: 20 }}>
                  <h3 style={{ fontSize: 18, marginBottom: 15 }}>Dados do Cartão</h3>

                  <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
                    <div>
                      <label style={{ display: "block", marginBottom: 5, fontSize: 14 }}>
                        Número do Cartão
                      </label>
                      <input
                        type="text"
                        name="numeroCartao"
                        value={dadosCartao.numeroCartao}
                        onChange={handleDadosCartaoChange}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        style={{ width: "100%", padding: "8px 12px", border: "1px solid #ddd", borderRadius: 4 }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", marginBottom: 5, fontSize: 14 }}>
                        Nome no Cartão
                      </label>
                      <input
                        type="text"
                        name="nomeCartao"
                        value={dadosCartao.nomeCartao}
                        onChange={handleDadosCartaoChange}
                        placeholder="Nome como está no cartão"
                        style={{ width: "100%", padding: "8px 12px", border: "1px solid #ddd", borderRadius: 4 }}
                      />
                    </div>

                    <div style={{ display: "flex", gap: 15 }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: "block", marginBottom: 5, fontSize: 14 }}>
                          Validade (MM/AA)
                        </label>
                        <input
                          type="text"
                          name="validade"
                          value={dadosCartao.validade}
                          onChange={handleDadosCartaoChange}
                          placeholder="MM/AA"
                          maxLength={5}
                          style={{ width: "100%", padding: "8px 12px", border: "1px solid #ddd", borderRadius: 4 }}
                        />
                      </div>

                      <div style={{ flex: 1 }}>
                        <label style={{ display: "block", marginBottom: 5, fontSize: 14 }}>
                          CVV
                        </label>
                        <input
                          type="text"
                          name="cvv"
                          value={dadosCartao.cvv}
                          onChange={handleDadosCartaoChange}
                          placeholder="123"
                          maxLength={4}
                          style={{ width: "100%", padding: "8px 12px", border: "1px solid #ddd", borderRadius: 4 }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: "block", marginBottom: 5, fontSize: 14 }}>
                        CPF do Titular
                      </label>
                      <input
                        type="text"
                        name="cpf"
                        value={dadosCartao.cpf}
                        onChange={handleDadosCartaoChange}
                        placeholder="000.000.000-00"
                        maxLength={14}
                        style={{ width: "100%", padding: "8px 12px", border: "1px solid #ddd", borderRadius: 4 }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", marginBottom: 5, fontSize: 14 }}>
                        Parcelas
                      </label>
                      <input
                        type="number"
                        name="parcelas"
                        value={dadosCartao.parcelas}
                        min={1}
                        max={12}
                        onChange={handleDadosCartaoChange}
                        style={{ width: "100%", padding: "8px 12px", border: "1px solid #ddd", borderRadius: 4 }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {(metodoPagamento === "pix" || metodoPagamento === "boleto") && (
                <div style={{ marginTop: 20, padding: 20, border: "1px solid #eee", borderRadius: 8 }}>
                  <p>
                    {metodoPagamento === "pix"
                      ? "Após confirmar, será gerada a chave PIX para pagamento."
                      : "Após confirmar, será gerado o boleto bancário para pagamento."}
                  </p>
                </div>
              )}
            </div>

            {/* Formulário de pagamento específico */}
            {renderFormularioPagamento()}
            
            {/* Informações de contato (comum a todos os métodos) */}
            {renderContato()}
          </div>

          {/* Resumo do Pedido */}
          <div
            style={{
              flex: 1,
              minWidth: 280,
              border: "1px solid #eee",
              borderRadius: 8,
              padding: 20,
              height: "fit-content",
            }}
          >
            <h2 style={{ fontSize: 20, marginBottom: 15 }}>Resumo do Pedido</h2>

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span>Subtotal</span>
              <span>{formatarMoeda(total)}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span>Desconto</span>
              <span>-{formatarMoeda(total * desconto)}</span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 15,
                fontWeight: "bold",
                fontSize: 18,
                borderTop: "1px solid #ddd",
                paddingTop: 10,
              }}
            >
              <span>Total</span>
              <span>{formatarMoeda(total - total * desconto)}</span>
            </div>

            <button
              onClick={handlePagamento}
              disabled={carregando}
              style={{
                marginTop: 30,
                width: "100%",
                background: carregando ? "#aaa" : "#007bff",
                color: "white",
                padding: "12px 0",
                border: "none",
                borderRadius: 6,
                fontSize: 16,
                cursor: carregando ? "not-allowed" : "pointer",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 10,
              }}
            >
              {carregando ? "Processando..." : "Confirmar Pagamento"}
            </button>

            {sucesso && (
              <div
                style={{
                  marginTop: 20,
                  color: "green",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontWeight: "bold",
                }}
              >

                <MdCheckCircle size={24} />
                <span>Pagamento aprovado com sucesso!</span>
              </div>
            )}

            {erro && (
              <div
                style={{
                  marginTop: 20,
                  color: "red",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontWeight: "bold",
                }}
              >
                <MdError size={24} />
                <span>{erro}</span>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export default Pagamento;