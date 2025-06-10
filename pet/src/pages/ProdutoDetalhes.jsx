import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../styles/ProdutoDetalhes.css";

const ProdutoDetalhes = () => {
  const { id } = useParams();
  const [produto, setProduto] = useState(null);
  const [imagemPrincipal, setImagemPrincipal] = useState("");
  const [loading, setLoading] = useState(true);

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
          <p className="descricao-secundaria">
            2 lugares • Estrutura em metal • Tecido premium
          </p>

          {produto.tamanhos?.[0] ? (
            <p className="preco">R$ {produto.tamanhos[0].precoTotal.toFixed(2)}</p>
          ) : (
            <p className="preco">Preço indisponível</p>
          )}

          <button className="btn-comprar">ADICIONAR AO CARRINHO</button>

          <ul className="beneficios">
            <li>✔ Frete grátis em todos os pedidos</li>
            <li>✔ Devolução grátis em até 30 dias</li>
            <li>✔ 2 almofadas grátis (código: PILLOWFIGHT)</li>
            <li>⭐ 4.5 de 5 no Trustpilot</li>
          </ul>

          <div className="entrega-info">
            <div><strong>Entrega:</strong> 1–2 semanas</div>
            <div><strong>Showroom:</strong> Veja em nossa loja</div>
            <div><strong>Tecido grátis:</strong> Peça uma amostra</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProdutoDetalhes;
