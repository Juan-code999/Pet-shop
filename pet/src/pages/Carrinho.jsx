import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Carrinho.css";

function Carrinho() {
  const [carrinho, setCarrinho] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const usuarioId = localStorage.getItem("usuarioId");

  useEffect(() => {
    const fetchDados = async () => {
      try {
        const carrinhoRes = await fetch(`https://localhost:7294/api/Carrinho/${usuarioId}`);
        if (carrinhoRes.ok) {
          const dados = await carrinhoRes.json();
          setCarrinho(dados);
        } else {
          setCarrinho({ Itens: [] });
        }

        const produtosRes = await fetch("https://localhost:7294/api/Produto");
        const lista = await produtosRes.json();
        setProdutos(lista);
      } catch (error) {
        console.error("Erro ao carregar carrinho:", error);
      } finally {
        setLoading(false);
      }
    };

    if (usuarioId) fetchDados();
  }, [usuarioId]);

  const getProduto = (id) => produtos.find((p) => p.id === id) || {};

  const alterarQuantidade = (produtoId, novaQtd) => {
    const novoCarrinho = { ...carrinho };
    const item = novoCarrinho.Itens.find((i) => i.ProdutoId === produtoId);
    if (item) item.Quantidade = novaQtd;
    setCarrinho(novoCarrinho);
  };

  const removerItem = (produtoId) => {
    const novoCarrinho = {
      ...carrinho,
      Itens: carrinho.Itens.filter((i) => i.ProdutoId !== produtoId),
    };
    setCarrinho(novoCarrinho);
  };

  const salvarCarrinho = async () => {
    try {
      await fetch(`https://localhost:7294/api/Carrinho/${usuarioId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(carrinho),
      });
      alert("Carrinho atualizado!");
    } catch (err) {
      console.error("Erro ao salvar carrinho:", err);
    }
  };

  const finalizar = () => {
    salvarCarrinho();
    navigate("/FinalizarPedido");
  };

  const total = carrinho?.Itens?.reduce((acc, item) => {
    const produto = getProduto(item.ProdutoId);
    return acc + (produto.preco || 0) * item.Quantidade;
  }, 0) || 0;

  if (loading) return <div className="loading">Carregando...</div>;

  if (!carrinho || carrinho.Itens.length === 0) {
    return (
      <div className="carrinho-vazio">
        <h2>Seu carrinho está vazio 😕</h2>
        <button onClick={() => navigate("/")}>Voltar às compras</button>
      </div>
    );
  }

  return (
    <div className="carrinho-container">
      <h1>Meu Carrinho</h1>

      <div className="itens">
        {carrinho.Itens.map((item) => {
          const produto = getProduto(item.ProdutoId);
          return (
            <div key={item.ProdutoId} className="item-carrinho">
              <img
                src={produto.urlImagens?.[0] || "https://placehold.co/200x150?text=Produto"}
                alt={produto.nome}
              />
              <div className="info">
                <h3>{produto.nome}</h3>
                <p>Tamanho: {item.Tamanho}</p>
                <p>Preço: R$ {produto.preco?.toFixed(2)}</p>
                <label>
                  Quantidade:
                  <input
                    type="number"
                    value={item.Quantidade}
                    min={1}
                    onChange={(e) =>
                      alterarQuantidade(item.ProdutoId, parseInt(e.target.value))
                    }
                  />
                </label>
                <p>Subtotal: R$ {(produto.preco * item.Quantidade).toFixed(2)}</p>
                <button onClick={() => removerItem(item.ProdutoId)}>Remover</button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="resumo">
        <h2>Resumo</h2>
        <p>Total: <strong>R$ {total.toFixed(2)}</strong></p>
        <button onClick={finalizar}>Finalizar Pedido</button>
      </div>
    </div>
  );
}

export default Carrinho;
