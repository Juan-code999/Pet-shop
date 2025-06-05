import React, { useEffect, useState } from "react";
import axios from "axios";

const Produtos = () => {
  const [produtos, setProdutos] = useState([]);

  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        const response = await axios.get("http://localhost:5005/api/Produtos");
        setProdutos(response.data);
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
      }
    };

    fetchProdutos();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Produtos</h1>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {produtos.map((produto, index) => (
          <div
            key={index}
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "10px",
              width: "200px",
            }}
          >
            <img
              src={produto.imagemUrl}
              alt={produto.nome}
              style={{ width: "100%", borderRadius: "6px" }}
            />
            <h3>{produto.nome}</h3>
            <p>{produto.descricao}</p>
            <p>Categoria: {produto.categoria}</p>
            <p><strong>R$ {produto.preco.toFixed(2)}</strong></p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Produtos;
