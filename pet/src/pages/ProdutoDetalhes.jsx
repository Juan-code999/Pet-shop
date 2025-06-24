import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import { FiShoppingCart } from "react-icons/fi";
import { FaMinus, FaPlus, FaHome  } from 'react-icons/fa';
import { BiCart } from "react-icons/bi"
import axios from "axios";
import "../styles/ProdutoDetalhes.css";

const ProdutoDetalhes = () => {
  const { id } = useParams();
  const [produto, setProduto] = useState(null);
  const [imagemPrincipal, setImagemPrincipal] = useState("");
  const [loading, setLoading] = useState(true);
  const [quantidade, setQuantidade] = useState(1);
  const [tamanhoSelecionado, setTamanhoSelecionado] = useState(null);

  useEffect(() => {
    const fetchProduto = async () => {
      try {
        const response = await axios.get(`http://localhost:5005/api/Produtos/${id}`);
        const dadosProduto = response.data;

        // Garantir que os preços são números
        if (dadosProduto.tamanhos) {
          dadosProduto.tamanhos = dadosProduto.tamanhos.map(tamanho => ({
            ...tamanho,
            precoTotal: parseFloat(tamanho.precoTotal) || 0,
            precoPorKg: parseFloat(tamanho.precoPorKg) || 0,
            tamanho: tamanho.tamanho.trim()
          }));
        }

        // Definir preço recorrente padrão (10% de desconto)
        if (dadosProduto.tamanhos?.[0]?.precoTotal) {
          dadosProduto.precoRecorrente = dadosProduto.tamanhos[0].precoTotal * 0.9;
        }

        setProduto(dadosProduto);

        if (dadosProduto.imagensUrl?.length > 0) {
          setImagemPrincipal(dadosProduto.imagensUrl[0]);
        }
        if (dadosProduto.tamanhos?.length > 0) {
          setTamanhoSelecionado(dadosProduto.tamanhos[0]);
        }
      } catch (error) {
        console.error("Erro ao buscar o produto:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduto();
  }, [id]);

  const calcularPrecoComDesconto = () => {
    if (!tamanhoSelecionado || !produto) return (0).toFixed(2);

    const desconto = produto.desconto || 0; // usa o valor do banco, ou 0 se não houver
    const precoSemDesconto = tamanhoSelecionado.precoTotal * quantidade;
    const precoComDesconto = precoSemDesconto * (1 - desconto / 100);

    return precoComDesconto.toFixed(2);
  };

  const calcularPrecoTotal = () => {
    if (!tamanhoSelecionado) return (0).toFixed(2);
    return (tamanhoSelecionado.precoTotal * quantidade).toFixed(2);
  };

  const calcularPrecoRecorrente = () => {
    if (!tamanhoSelecionado) return (0).toFixed(2);
    return (tamanhoSelecionado.precoTotal * quantidade * 0.9).toFixed(2);
  };

  if (loading) return <div className="carregando">Carregando produto...</div>;
  if (!produto) return <div className="nao-encontrado">Produto não encontrado.</div>;

  return (
    <div className="produto-detalhes-wrapper">
      <div className="breadcrumb">
  <Link to="/" className="breadcrumb-link">
    <FaHome size={14} style={{ marginBottom: "-2px" }} />
  </Link>
  <span className="breadcrumb-separator">›</span>

  <Link to="/produtos" className="breadcrumb-link">Produtos</Link>
  <span className="breadcrumb-separator">›</span>

  <Link to="/produtos" className="breadcrumb-link">
    {produto.categoria || "Categoria"}
  </Link>
  <span className="breadcrumb-separator">›</span>
--
  <Link to="/produtos" className="breadcrumb-link">
    {produto.nome || "Produto"}
  </Link>
</div>
      <div className="produto-detalhes-container">
        {/* Galeria de Imagens - Lateral Esquerda */}
        <div className="produto-galeria">
          <div className="miniaturas-vertical">
            {produto.imagensUrl?.map((url, i) => (
              <div
                key={i}
                className={`miniatura-wrapper ${imagemPrincipal === url ? "miniatura-ativa" : ""}`}
                onClick={() => setImagemPrincipal(url)}
              >
                <img src={url} alt={`Miniatura ${i}`} className="miniatura" />
              </div>
            ))}
          </div>
          <div className="imagem-principal-container">
            <img
              className="imagem-principal"
              src={imagemPrincipal || "https://via.placeholder.com/500"}
              alt={produto.nome}
            />
          </div>
        </div>

        {/* Informações do Produto - Parte Central */}
        <div className="produto-info-central">
          <h1>{produto.nome}</h1>

          <div className="avaliacao">
            <span className="estrelas">★★★★★</span>
            <span className="nota">{produto.avaliacao?.toFixed(1) || "4.9"}</span>
            <span className="reviews">({produto.numeroAvaliacoes || 25} reviews)</span>
          </div>

          <div className="descricao" dangerouslySetInnerHTML={{ __html: produto.descricao || 'Descrição não disponível' }} />

          <div className="tamanhos-container">
            <h3>Tamanhos</h3>
            <div className="tamanhos-grid">
              {produto.tamanhos?.map((tamanho, index) => (
                <div
                  key={index}
                  className={`tamanho-opcao ${tamanhoSelecionado?.tamanho === tamanho.tamanho &&
                      tamanhoSelecionado?.precoPorKg === tamanho.precoPorKg
                      ? "tamanho-selecionado"
                      : ""
                    }`}
                  onClick={() => setTamanhoSelecionado(tamanho)}
                >
                  <span>{tamanho.tamanho}</span>
                  <span className="preco-kg">(R${tamanho.precoPorKg.toFixed(2)})</span>
                </div>
              ))}

              -
            </div>
          </div>
        </div>

        {/* Resumo do Pedido - Lateral Direita */}
        <div className="resumo-pedido">
          <div className="btn-comprar">
            <FiShoppingCart size={24} color="#000" />
            <span>Comprar</span>
          </div>

          <div className="precos">
            <div className="preco-normal">
              <span className="preco-original">R$ {calcularPrecoTotal()}</span>
              <span className="preco-desconto">R$ {calcularPrecoComDesconto()}</span>
              <span className="selo-desconto">-{produto.desconto || 0}%</span>
            </div>

          </div>

          <div className="quantidade-container">
            <div className="quantidade-control">
              <span className="quantidade-label">Quantidade</span>

              <button
                className="quantidade-btn"
                onClick={() => setQuantidade(prev => Math.max(1, prev - 1))}
              >
                <FaMinus />
              </button>

              <span className="quantidade-display">{quantidade}</span>

              <button
                className="quantidade-btn"
                onClick={() => setQuantidade(prev => prev + 1)}
              >
                <FaPlus />
              </button>
            </div>
          </div>
          <button className="btn-add-carrinho">
            <BiCart size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Adicionar ao carrinho
          </button>

          <div className="recorrencia-info">
            <p>• Escolha a frequência de entrega.</p>
            <p>• Altere ou cancele, sem taxas.</p>
            <p className="nota">Descontos não cumulativos. O maior desconto elegível será aplicado no carrinho.</p>
          </div>
        </div>

      </div>
    </div >
  );
};

export default ProdutoDetalhes;