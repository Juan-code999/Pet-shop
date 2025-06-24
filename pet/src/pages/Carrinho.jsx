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
        const carrinhoRes = await fetch(`http://localhost:5005/api/Carrinho/${usuarioId}`);
        if (carrinhoRes.ok) {
          const dados = await carrinhoRes.json();
          setCarrinho(dados);
        } else {
          setCarrinho({ Itens: [] });
        }

        const produtosRes = await fetch("http://localhost:5005/api/Produtos");
        if (produtosRes.ok) {
          const lista = await produtosRes.json();
          setProdutos(lista);
        } else {
          setProdutos([]);
        }
      } catch (error) {
        console.error("Erro ao carregar carrinho:", error);
        setCarrinho({ Itens: [] });
        setProdutos([]);
      } finally {
        setLoading(false);
      }
    };

    if (usuarioId) {
      fetchDados();
    } else {
      setLoading(false);
      setCarrinho({ Itens: [] });
    }
  }, [usuarioId]);

  const getProduto = (id) =>
    produtos.find((p) => p.Id === id || p.id === id) || {};

  const adicionarItem = async (item) => {
    try {
      const res = await fetch(`http://localhost:5005/api/Carrinho/${usuarioId}/adicionar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      if (!res.ok) throw new Error("Erro ao adicionar item.");
    } catch (err) {
      console.error("Erro ao adicionar item ao carrinho:", err);
      alert("Erro ao adicionar item ao carrinho.");
    }
  };

  const alterarQuantidade = async (produtoId, novaQtd) => {
    if (novaQtd < 1) return;

    const novoCarrinho = { ...carrinho };
    const item = novoCarrinho.Itens.find((i) => i.ProdutoId === produtoId);
    if (item) {
      item.Quantidade = novaQtd;
      setCarrinho(novoCarrinho);

      await adicionarItem({
        produtoId: item.ProdutoId,
        tamanho: item.Tamanho,
        quantidade: novaQtd,
      });
    }
  };

  const removerItem = (produtoId) => {
    const novoCarrinho = {
      ...carrinho,
      Itens: carrinho.Itens.filter((i) => i.ProdutoId !== produtoId),
    };
    setCarrinho(novoCarrinho);
    // OBS: isso remove apenas localmente — se quiser que remova no back-end, posso incluir esse endpoint e código também.
  };

  const finalizar = () => {
    navigate("/FinalizarPedido");
  };

  const total =
    carrinho?.Itens?.reduce((acc, item) => {
      const produto = getProduto(item.ProdutoId);
      return acc + (produto.preco || 0) * item.Quantidade;
    }, 0) || 0;

  if (loading) return <div className="loading">Carregando...</div>;

  if (!carrinho || !carrinho.Itens || carrinho.Itens.length === 0) {
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
                src={
                  produto.urlImagens?.[0] ||
                  produto.urlImagem ||
                  "https://placehold.co/200x150?text=Produto"
                }
                alt={produto.nome || "Produto"}
              />
              <div className="info">
                <h3>{produto.nome || "Produto desconhecido"}</h3>
                <p>Tamanho: {item.Tamanho || "Único"}</p>
                <p>Preço: R$ {produto.preco?.toFixed(2) || "0,00"}</p>
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
                <p>
                  Subtotal: R$ {(produto.preco * item.Quantidade || 0).toFixed(2)}
                </p>
                <button onClick={() => removerItem(item.ProdutoId)}>
                  Remover
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="resumo">
        <h2>Resumo</h2>
        <p>
          Total: <strong>R$ {total.toFixed(2)}</strong>
        </p>
        <button onClick={finalizar}>Finalizar Pedido</button>
      </div>
    </div>
  );
}

export default Carrinho;
