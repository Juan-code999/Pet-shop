import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "./Carrinho.css";

function Carrinho() {
  const [itensCarrinho, setItensCarrinho] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [selecionados, setSelecionados] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const email = localStorage.getItem("email");
  const navigate = useNavigate();


  useEffect(() => {
    const carregarDados = async () => {
      try {
        const resUsuario = await fetch(`https://localhost:7294/Usuario/por-email/${email}`);
        const usuario = await resUsuario.json();

        const resCarrinho = await fetch("https://localhost:7294/Carrinho");
        const carrinho = await resCarrinho.json();

        const carrinhoUsuario = carrinho.filter(item => item.idUsuario === usuario.id);
        setItensCarrinho(carrinhoUsuario);

        const estadoInicialSelecionados = {};
        carrinhoUsuario.forEach(item => {
          estadoInicialSelecionados[item.id] = false;
        });
        setSelecionados(estadoInicialSelecionados);

        const resProdutos = await fetch("https://localhost:7294/Produto");
        const listaProdutos = await resProdutos.json();
        setProdutos(listaProdutos);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      } finally {
        setIsLoading(false);
      }
    };

    carregarDados();
  }, [email]);

  useEffect(() => {
    const selecionadosIds = Object.entries(selecionados)
      .filter(([_, valor]) => valor)
      .map(([id]) => id);

    localStorage.setItem("itensSelecionados", JSON.stringify(selecionadosIds));
  }, [selecionados]);

  const getProduto = (idProduto) => produtos.find(p => p.id === idProduto) || {};

  const alterarQuantidade = async (item, novaQtd) => {
    if (novaQtd <= 0) return;

    await fetch(`https://localhost:7294/Carrinho/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idUsuario: item.idUsuario,
        idProduto: item.idProduto,
        quantidade: novaQtd
      })
    });

    setItensCarrinho(prev =>
      prev.map(i => (i.id === item.id ? { ...i, quantidade: novaQtd } : i))
    );
  };

  const removerItem = async (id) => {
    await fetch(`https://localhost:7294/Carrinho/${id}`, { method: "DELETE" });
    setItensCarrinho(prev => prev.filter(item => item.id !== id));
    setSelecionados(prev => {
      const novoSelecionados = { ...prev };
      delete novoSelecionados[id];
      return novoSelecionados;
    });
  };

  const toggleSelecionado = (id) => {
    setSelecionados(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleFinalizarPedido = () => {
    const selecionadosIds = Object.values(selecionados).filter(Boolean);
    if (selecionadosIds.length === 0) {
      alert("Você precisa selecionar pelo menos um item para continuar.");
      return;
    }

    navigate("/FinalizarPedido");
  };


  const totalSelecionado = itensCarrinho.reduce((total, item) => {
    if (!selecionados[item.id]) return total;
    const produto = getProduto(item.idProduto);
    return total + (produto.preco || 0) * item.quantidade;
  }, 0);

  if (isLoading) {
    return <div className="loading">Carregando carrinho...</div>;
  }

  if (itensCarrinho.length === 0) {
    return (
      <div className="carrinho-null">
        <h2 className="title-null">Carrinho</h2>
        <p className="text-null">Seu carrinho está vazio <i className="fa-solid fa-circle-exclamation"></i></p>
        <span><i className="fa-solid fa-cart-shopping"></i></span>
        <div className="btns-null">
          <Link to="/">
            <button>Ver Produtos</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="carrinho-container">
      <div className="lista-carrinho">
        <h1>Meu Carrinho</h1>

        {itensCarrinho.map(item => {
          const produto = getProduto(item.idProduto);
          return (
            <div key={item.id} className="item-carrinho">
              <input
                type="checkbox"
                checked={selecionados[item.id] || false}
                onChange={() => toggleSelecionado(item.id)}
              />

              <img
                className="img-item"
                src={
                  Array.isArray(produto.urlImagens) && produto.urlImagens.length > 0 && produto.urlImagens[0] !== "string"
                    ? produto.urlImagens[0]
                    : "https://placeholde.co/300x200.png?text=Produto+sem+imagem"
                }
                alt={produto.nome}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://placeholde.co/300x200.png?text=Produto+sem+imagem";
                }}
              />

              <div className="atributos-carrinho">
                <div className="items-imp">
                  <p>{produto.nome}</p>
                </div>
                <div className="items-atributos">
                  <p>R$ {produto.preco?.toFixed(2)}</p>
                </div>
                <div className="items-atributos">
                  <label>
                    Quantidade:
                    <input
                      type="number"
                      value={item.quantidade}
                      onChange={e => alterarQuantidade(item, parseInt(e.target.value))}
                      min={1}
                    />
                  </label>
                </div>
                <div className="items-atributos">
                  <p>Subtotal: R$ {(produto.preco * item.quantidade).toFixed(2)}</p>
                </div>
                <button onClick={() => removerItem(item.id)}>Remover</button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="resumo">
        <h1>Resumo</h1>
        <div className="items-count-carrinho">
          <p>Itens selecionados: {Object.values(selecionados).filter(Boolean).length}</p>
        </div>
        <div className="frete">
          <h2>Frete:</h2>
          <select>
            <option value="">Azure - 10,00</option>
            <option value="">Mounts - 30,00</option>
            <option value="">Nousy - 8,00</option>
          </select>
        </div>
        <div className="cupon">
          <h2>Digite seu cupom:</h2>
          <input type="text" />
        </div>
        <div className="total">
          <h3>Total da Compra: R$ {totalSelecionado.toFixed(2)}</h3>
        </div>
        <div className="btn-compra">
          <button onClick={handleFinalizarPedido} className="botao-comprar">
            Comprar
          </button>
        </div>
      </div>
    </div>
  );
}

export default Carrinho;
