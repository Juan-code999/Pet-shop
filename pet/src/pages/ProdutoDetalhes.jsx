import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const ProdutoDetalhes = () => {
  const { id } = useParams();
  const [produto, setProduto] = useState(null);

  useEffect(() => {
    const fetchProduto = async () => {
      try {
        const response = await axios.get(`http://localhost:5005/api/Produtos/${id}`);
        setProduto(response.data);
      } catch (error) {
        console.error("Erro ao buscar produto:", error);
      }
    };

    if (id) fetchProduto();
  }, [id]);

  if (!produto) return <p>Carregando detalhes do produto...</p>;

  return (
    <div>
      <h1>{produto.nome}</h1>
      <img src={produto.imagemUrl} alt={produto.nome} />
      <p>{produto.descricao}</p>
      <p>Preço: R$ {produto.preco}</p>
    </div>
  );
};

export default ProdutoDetalhes;
