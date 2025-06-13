import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
      <div className="breadcrumb">Home / {produto.categoria || 'Produtos'} / {produto.nome}</div>

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
                  className={`tamanho-opcao ${tamanhoSelecionado?.tamanho === tamanho.tamanho ? "tamanho-selecionado" : ""}`}
                  onClick={() => setTamanhoSelecionado(tamanho)}
                >
                  <span>{tamanho.tamanho}</span>
                  <span>R${tamanho.precoTotal.toFixed(2)}</span>
                  <span className="preco-kg">(R${tamanho.precoPorKg.toFixed(2)}/kg)</span>
                </div>
              ))}
            </div>
          </div>

          <div className="estoque-fisico">
            <button className="btn-consultar">Consultar estoque nas lojas físicas</button>
          </div>
        </div>

        {/* Resumo do Pedido - Lateral Direita */}
        <div className="resumo-pedido">
          <div className="precos">
            <div className="preco-recorencia">
              <span className="valor">R$ {calcularPrecoRecorrente()}</span>
              <span className="label">Comprar com recorrência</span>
              <div className="beneficios">
                <span className="beneficio">✔ Ganhe 10% OFF em todos produtos</span>
                <span className="beneficio">✔ Cancele quando quiser, sem taxas</span>
              </div>
            </div>
            
            <div className="preco-normal">
              <span className="valor">R$ {calcularPrecoTotal()}</span>
            </div>
          </div>

          <div className="quantidade-container">
            <label>Quantas unidades?</label>
            <select 
              value={quantidade}
              onChange={(e) => setQuantidade(parseInt(e.target.value))}
              className="quantidade-select"
            >
              {[1, 2, 3, 4, 5].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>

          <button className="btn-comprar">
            ADICIONAR AO CARRINHO POR R$ {calcularPrecoTotal()}
          </button>

          <div className="clube-descontos">
            <span>Clube de Descontos</span>
            <p>Ganhe 15% OFF neste item</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProdutoDetalhes;