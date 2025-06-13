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

  useEffect(() => {
    const fetchProduto = async () => {
      try {
        const response = await axios.get(`http://localhost:5005/api/Produtos/${id}`);
        setProduto(response.data);
        if (response.data.imagensUrl && response.data.imagensUrl.length > 0) {
          setImagemPrincipal(response.data.imagensUrl[0]);
        }
      } catch (error) {
        console.error("Erro ao buscar o produto:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduto();
  }, [id]);

  if (loading) return <p>Carregando produto...</p>;
  if (!produto) return <p>Produto não encontrado.</p>;

  return (
    <div className="produto-detalhes-wrapper">
      <div className="breadcrumb">Home / {produto.nome}</div>

      <div className="produto-detalhes-container">
        <div className="produto-galeria">
          <img
            className="imagem-principal"
            src={imagemPrincipal || "https://via.placeholder.com/300"}
            alt={produto.nome}
          />

          <div className="miniaturas">
            {produto.imagensUrl?.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`Miniatura ${i}`}
                onClick={() => setImagemPrincipal(url)}
                className={imagemPrincipal === url ? "miniatura-ativa" : ""}
              />
            ))}
          </div>
        </div>

        <div className="produto-info">
          <h1>{produto.nome}</h1>
          
          <div className="avaliacao">
            <span className="estrelas">★★★★★</span>
            <span className="nota">4.9</span>
            <span className="reviews">(25 reviews)</span>
          </div>
          
          <p className="descricao">
            Inspirada no amor que sentimos por eles, a {produto.nome} foi desenvolvida para oferecer a melhor alimentação para os nossos pets. {produto.nome} é a escolha do seu gato.
          </p>

          <div className="precos">
            <div className="preco-recorencia">
              <span className="valor">R$ {produto.precoRecorrente?.toFixed(2) || "69,21"}</span>
              <span className="label">Comprar com recorrência</span>
              <span className="beneficio">Ganhe 10% OFF em todos produtos</span>
              <span className="beneficio">Cancele quando quiser, sem taxas</span>
            </div>
            
            <div className="preco-normal">
              <span className="valor">R$ {produto.preco?.toFixed(2) || "76,90"}</span>
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
            ADICIONAR AO CARRINHO POR R$ {(produto.preco * quantidade).toFixed(2)}
          </button>

          <div className="clube-descontos">
            <span>Clube de Descontos</span>
            <p>Ganhe 15% OFF neste item</p>
          </div>

          <div className="tamanhos-container">
            <h3>Tamanhos</h3>
            <div className="tamanhos-grid">
              <div className="tamanho-opcao">
                <span>1 Kg</span>
                <span>R$76,90/kg</span>
              </div>
              <div className="tamanho-opcao">
                <span>7 Kg</span>
                <span>R$42,84/kg</span>
              </div>
            </div>
          </div>

          <div className="estoque-fisico">
            <span>Estoque das lojas físicas</span>
            <button className="btn-consultar">Consultar estoque</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProdutoDetalhes;