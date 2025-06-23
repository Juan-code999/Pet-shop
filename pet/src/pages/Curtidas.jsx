import React, { useEffect, useState } from "react";
import axios from "axios";

function Curtidas({ usuarioId }) {
  const [produtosCurtidos, setProdutosCurtidos] = useState([]);
  const [todosProdutos, setTodosProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // Busca produtos curtidos
  const buscarCurtidas = async () => {
    try {
      const res = await axios.get(`https://localhost:7294/api/curtida/usuario/${usuarioId}`);
      setProdutosCurtidos(res.data);
    } catch (error) {
      console.error("Erro ao buscar produtos curtidos", error);
    }
  };

  // Busca todos os produtos (para listar e permitir curtir/descurtir)
  const buscarTodosProdutos = async () => {
    try {
      const res = await axios.get("https://localhost:7294/api/produto");
      setTodosProdutos(res.data);
    } catch (error) {
      console.error("Erro ao buscar produtos", error);
    }
  };

  useEffect(() => {
    const carregarDados = async () => {
      setCarregando(true);
      await Promise.all([buscarCurtidas(), buscarTodosProdutos()]);
      setCarregando(false);
    };
    carregarDados();
  }, [usuarioId]);

  // Função para curtir produto
  const curtirProduto = async (produtoId) => {
    try {
      await axios.post(`https://localhost:7294/api/curtida/${usuarioId}/${produtoId}`);
      await buscarCurtidas();
    } catch (error) {
      console.error("Erro ao curtir produto", error);
    }
  };

  // Função para descurtir produto
  const descurtirProduto = async (produtoId) => {
    try {
      await axios.delete(`https://localhost:7294/api/curtida/${usuarioId}/${produtoId}`);
      await buscarCurtidas();
    } catch (error) {
      console.error("Erro ao descurtir produto", error);
    }
  };

  // Verifica se produto está curtido
  const estaCurtido = (produtoId) => {
    return produtosCurtidos.some(p => p.id === produtoId);
  };

  if (carregando) return <p>Carregando...</p>;

  return (
    <div>
      <h2>Meus Produtos Curtidos</h2>
      {produtosCurtidos.length === 0 && <p>Você ainda não curtiu nenhum produto.</p>}

      <ul>
        {todosProdutos.map(produto => {
          const curtido = estaCurtido(produto.id);
          return (
            <li key={produto.id}>
              <span>{produto.nome}</span>
              {curtido ? (
                <button onClick={() => descurtirProduto(produto.id)}>Descurtir</button>
              ) : (
                <button onClick={() => curtirProduto(produto.id)}>Curtir</button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default Curtidas;
