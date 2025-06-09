import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../styles/ProdutoDetalhes.css"; // Crie esse CSS se quiser estilizar

const ProdutoDetalhes = () => {
  const { id } = useParams(); // Pega o ID da URL
  console.log("ID do produto:", id);
  const [produto, setProduto] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduto = async () => {
      try {
        const response = await axios.get(`http://localhost:5005/api/Produtos/${id}`);
        setProduto(response.data);
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
    <div className="produto-detalhes-container">
      <div className="imagem-produto">
        <img src={produto.imagemUrl} alt={produto.nome} />
      </div>
      <div className="info-produto">
        <h2>{produto.nome}</h2>
        <p className="preco">R$ {produto.preco.toFixed(2)}</p>
        <p className="descricao">{produto.descricao || "Sem descrição disponível."}</p>
        <button className="btn-comprar">Adicionar ao carrinho</button>
      </div>
    </div>
  );
};

export default ProdutoDetalhes;
