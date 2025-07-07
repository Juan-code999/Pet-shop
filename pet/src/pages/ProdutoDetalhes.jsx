import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiShoppingCart } from "react-icons/fi";
import { FaMinus, FaPlus, FaHome, FaStar, FaRegStar, FaStarHalfAlt } from 'react-icons/fa';
import { BiCart } from "react-icons/bi";
import axios from "axios";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "../styles/ProdutoDetalhes.css";

const ProdutoDetalhes = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [produto, setProduto] = useState(null);
  const [imagemPrincipal, setImagemPrincipal] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantidade, setQuantidade] = useState(1);
  const [tamanhoSelecionado, setTamanhoSelecionado] = useState(null);
  const [adicionandoAoCarrinho, setAdicionandoAoCarrinho] = useState(false);
  const [descricaoExpandida, setDescricaoExpandida] = useState(false);

  const fetchProduto = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`http://localhost:5005/api/Produtos/${id}`);
      const dadosProduto = response.data;

      if (!dadosProduto) throw new Error("Produto não encontrado");

      if (dadosProduto.tamanhos) {
        dadosProduto.tamanhos = dadosProduto.tamanhos.map(tamanho => ({
          ...tamanho,
          precoTotal: parseFloat(tamanho.precoTotal) || 0,
          precoPorKg: parseFloat(tamanho.precoPorKg) || 0,
          tamanho: tamanho.tamanho.trim()
        }));
      }

      setProduto(dadosProduto);
      setImagemPrincipal(dadosProduto.imagensUrl?.[0] || "");
      setTamanhoSelecionado(dadosProduto.tamanhos?.[0] || null);
    } catch (err) {
      console.error("Erro ao buscar o produto:", err);
      setError(err.message || "Erro ao carregar o produto");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduto();
  }, [fetchProduto]);

  const calcularPrecoComDesconto = useCallback(() => {
    if (!tamanhoSelecionado || !produto) return (0).toFixed(2);
    const desconto = produto.desconto || 0;
    const precoSemDesconto = tamanhoSelecionado.precoTotal * quantidade;
    const precoComDesconto = precoSemDesconto * (1 - desconto / 100);
    return precoComDesconto.toFixed(2);
  }, [tamanhoSelecionado, produto, quantidade]);

  const calcularPrecoTotal = useCallback(() => {
    if (!tamanhoSelecionado) return (0).toFixed(2);
    return (tamanhoSelecionado.precoTotal * quantidade).toFixed(2);
  }, [tamanhoSelecionado, quantidade]);

  const renderAvaliacao = (nota) => {
    const estrelas = [];
    const notaArredondada = Math.round(nota * 2) / 2;

    for (let i = 1; i <= 5; i++) {
      if (i <= notaArredondada) {
        estrelas.push(<FaStar key={i} className="estrela-cheia" />);
      } else if (i - 0.5 === notaArredondada) {
        estrelas.push(<FaStarHalfAlt key={i} className="estrela-metade" />);
      } else {
        estrelas.push(<FaRegStar key={i} className="estrela-vazia" />);
      }
    }

    return estrelas;
  };

  const adicionarAoCarrinho = async () => {
    const usuarioId = localStorage.getItem("usuarioId");
    if (!usuarioId) {
      toast.info("Você precisa estar logado para adicionar itens ao carrinho", {
        autoClose: 3000,
        closeOnClick: true,
        pauseOnHover: true,
      });
      navigate('/login', { state: { from: `/produtos/${id}` } });
      return;
    }

    if (!tamanhoSelecionado) {
      toast.warning("Por favor, selecione um tamanho antes de adicionar ao carrinho");
      return;
    }

    setAdicionandoAoCarrinho(true);

    const itemCarrinho = {
      produtoId: produto.id,
      tamanho: tamanhoSelecionado.tamanho,
      quantidade: Number(quantidade),
    };

    try {
      await axios.post(`http://localhost:5005/api/Carrinho/${usuarioId}/adicionar`, itemCarrinho);
      toast.success("Produto adicionado ao carrinho com sucesso!", {
        autoClose: 2000,
        closeOnClick: true,
      });
    } catch (error) {
      console.error("Erro ao adicionar ao carrinho:", error);
      toast.error(error.response?.data?.message || "Erro ao adicionar ao carrinho");
    } finally {
      setAdicionandoAoCarrinho(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Carregando produto...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">!</div>
        <p className="error-message">{error}</p>
        <button onClick={fetchProduto} className="error-retry">Tentar novamente</button>
      </div>
    );
  }

  if (!produto) {
    return (
      <div className="error-container">
        <div className="error-icon">!</div>
        <p className="error-message">Produto não encontrado</p>
        <Link to="/produtos" className="error-retry">Voltar para produtos</Link>
      </div>
    );
  }

  return (
    <div className="produto-detalhes-wrapper">
      <nav aria-label="Navegação do breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/" className="breadcrumb-link" aria-label="Página inicial">
              <FaHome size={14} aria-hidden="true" />
            </Link>
          </li>
          <li className="breadcrumb-item">
            <Link to="/produtos" className="breadcrumb-link">Produtos</Link>
          </li>
          {produto.categoria && (
            <li className="breadcrumb-item">
              <Link to={`/produtos?categoria=${encodeURIComponent(produto.categoria)}`} className="breadcrumb-link">
                {produto.categoria}
              </Link>
            </li>
          )}
          <li className="breadcrumb-item active" aria-current="page">
            {produto.nome}
          </li>
        </ol>
      </nav>

      <div className="produto-detalhes-container">
        <div className="produto-galeria">
          <div className="miniaturas-vertical" role="list">
            {produto.imagensUrl?.map((url, i) => (
              <button
                key={i}
                className={`miniatura-wrapper ${imagemPrincipal === url ? "miniatura-ativa" : ""}`}
                onClick={() => setImagemPrincipal(url)}
                aria-label={`Visualizar imagem ${i + 1} do produto`}
                role="listitem"
              >
                <img src={url} alt={`Miniatura ${i + 1}`} className="miniatura" loading="lazy" />
              </button>
            ))}
          </div>
          <div className="imagem-principal-container">
            <img
              className="imagem-principal"
              src={imagemPrincipal || "https://via.placeholder.com/500"}
              alt={produto.nome}
              loading="eager"
              aria-label="Imagem principal do produto"
            />
          </div>
        </div>

        <div className="produto-info-central">
          <h1>{produto.nome}</h1>

          <div className="avaliacao" aria-label={`Avaliação: ${produto.avaliacao?.toFixed(1) || "4.9"} de 5 estrelas`}>
            <div className="estrelas" aria-hidden="true">
              {renderAvaliacao(produto.avaliacao || 4.9)}
            </div>
            <span className="nota">{produto.avaliacao?.toFixed(1) || "4.9"}</span>
            <span className="reviews">({produto.numeroAvaliacoes || 25} reviews)</span>
          </div>

          <div className="descricao-container">
            <div
              className={`descricao ${descricaoExpandida ? 'expandida' : 'recolhida'}`}
              dangerouslySetInnerHTML={{ __html: produto.descricao || 'Descrição não disponível' }}
              aria-label="Descrição do produto"
            />
            {produto.descricao && produto.descricao.length > 200 && (
              <button
                className="btn-expandir-descricao"
                onClick={() => setDescricaoExpandida(!descricaoExpandida)}
                aria-expanded={descricaoExpandida}
              >
                {descricaoExpandida ? 'Mostrar menos' : 'Continuar lendo...'}
              </button>
            )}
          </div>

          {produto.tamanhos?.length > 0 && (
            <div className="tamanhos-container">
              <h3>Tamanhos disponíveis</h3>
              <div className="tamanhos-grid" role="group" aria-labelledby="tamanhos-label">
                {produto.tamanhos.map((tamanho, index) => (
                  <button
                    key={`${tamanho.tamanho}-${index}`}
                    className={`tamanho-opcao ${tamanhoSelecionado?.tamanho === tamanho.tamanho ? "tamanho-selecionado" : ""}`}
                    onClick={() => setTamanhoSelecionado(tamanho)}
                    aria-pressed={tamanhoSelecionado?.tamanho === tamanho.tamanho}
                    aria-label={`Tamanho ${tamanho.tamanho} - R$${tamanho.precoTotal.toFixed(2)}`}
                  >
                    <span className="tamanho-nome">{tamanho.tamanho}</span>
                    <span className="tamanho-preco">R$ {tamanho.precoTotal.toFixed(2)}</span>
                    {tamanho.precoPorKg > 0 && (
                      <span className="tamanho-preco-kg">(R$ {tamanho.precoPorKg.toFixed(2)})</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="resumo-pedido" aria-label="Resumo do pedido">
          <div className="precos">
            {produto.desconto > 0 && (
              <div className="preco-original-wrapper">
                <span className="preco-original">R$ {calcularPrecoTotal()}</span>
                <span className="selo-desconto">-{produto.desconto}%</span>
              </div>
            )}
            <div className="preco-atual">
              <span className="preco-desconto">R$ {calcularPrecoComDesconto()}</span>
            </div>
          </div>

          <div className="quantidade-container">
            <label htmlFor="quantidade-input" className="quantidade-label">Quantidade</label>
            <div className="quantidade-control">
              <button
                className="quantidade-btn"
                onClick={() => setQuantidade(prev => Math.max(1, prev - 1))}
                aria-label="Reduzir quantidade"
                disabled={quantidade <= 1}
              >
                <FaMinus />
              </button>
              <input
                id="quantidade-input"
                type="number"
                min="1"
                max="100"
                value={quantidade}
                onChange={(e) => {
                  const value = Math.max(1, Math.min(100, parseInt(e.target.value) || 1));
                  setQuantidade(value);
                }}
                className="quantidade-input"
                aria-label="Quantidade do produto"
              />
              <button
                className="quantidade-btn"
                onClick={() => setQuantidade(prev => prev + 1)}
                aria-label="Aumentar quantidade"
                disabled={quantidade >= 100}
              >
                <FaPlus />
              </button>
            </div>
          </div>

          <button
            className="btn-add-carrinho"
            onClick={adicionarAoCarrinho}
            disabled={adicionandoAoCarrinho || !tamanhoSelecionado}
            aria-label="Adicionar ao carrinho"
          >
            <BiCart size={20} aria-hidden="true" />
            {adicionandoAoCarrinho ? 'Adicionando...' : 'Adicionar ao carrinho'}
          </button>

          <button className="btn-comprar" aria-label="Comprar agora">
            <FiShoppingCart size={18} aria-hidden="true" />
            <span>Comprar agora</span>
          </button>

          <div className="recorrencia-info">
            <ul>
              <li>• Frete grátis para assinantes</li>
              <li>• Entrega programada</li>
              <li>• Cancelamento fácil</li>
            </ul>
            <p className="nota">Descontos não cumulativos. O maior desconto elegível será aplicado no carrinho.</p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ProdutoDetalhes;
