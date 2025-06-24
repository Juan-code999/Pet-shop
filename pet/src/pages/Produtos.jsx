import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { FaStar, FaRegStar, FaHeart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../styles/Produtos.css";

const Produtos = () => {
  const [produtos, setProdutos] = useState([]);
  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState([]);
  const [tiposAnimalSelecionados, setTiposAnimalSelecionados] = useState([]);
  const [idadesSelecionadas, setIdadesSelecionadas] = useState([]);
  const [precoMin, setPrecoMin] = useState("");
  const [precoMax, setPrecoMax] = useState("");
  const navigate = useNavigate();

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

  const handleProductClick = (id) => {
    navigate(`/produto/${id}`);
  };

  const handleFavoritar = (e, id) => {
    e.stopPropagation();
    console.log(`Produto ${id} favoritado`);
  };

  const limparFiltros = () => {
    setCategoriasSelecionadas([]);
    setTiposAnimalSelecionados([]);
    setIdadesSelecionadas([]);
    setPrecoMin("");
    setPrecoMax("");
  };

  const toggleSelecao = (valor, array, setArray) => {
    if (array.includes(valor)) {
      setArray(array.filter((item) => item !== valor));
    } else {
      setArray([...array, valor]);
    }
  };

  const removerFiltro = (valor, array, setArray) => {
    setArray(array.filter((item) => item !== valor));
  };

  // ✅ MOVIDO PARA FORA
  const adicionarAoCarrinho = async (produto) => {
    const usuarioId = localStorage.getItem("usuarioId");
    if (!usuarioId) return alert("Você precisa estar logado.");

    const itemCarrinho = {
      UsuarioId: usuarioId,
      Itens: [
        {
          ProdutoId: produto.id,
          Tamanho: produto.tamanhos?.[0]?.tamanho || "Único",
          Quantidade: 1
        }
      ]
    };

    try {
      await axios.post(`https://localhost:5005/api/Carrinho/${usuarioId}/adicionar`, itemCarrinho);
      alert("Produto adicionado ao carrinho!");
    } catch (error) {
      console.error("Erro ao adicionar ao carrinho:", error);
      alert("Erro ao adicionar ao carrinho.");
    }
  };

  const produtosFiltrados = produtos.filter((produto) => {
    const tamanhos = produto.tamanhos || [];

    const atendePrecoMin =
      !precoMin || tamanhos.some((t) => parseFloat(t.precoTotal ?? 0) >= parseFloat(precoMin));

    const atendePrecoMax =
      !precoMax || tamanhos.some((t) => parseFloat(t.precoTotal ?? 0) <= parseFloat(precoMax));

    const atendeCategoria =
      categoriasSelecionadas.length === 0 || categoriasSelecionadas.includes(produto.categoria);

    const atendeAnimal =
      tiposAnimalSelecionados.length === 0 || tiposAnimalSelecionados.includes(produto.especieAnimal);

    const atendeIdade =
      idadesSelecionadas.length === 0 ||
      idadesSelecionadas.includes(produto.idadeRecomendada) ||
      produto.idadeRecomendada === "Todas";

    return (
      atendeCategoria &&
      atendeAnimal &&
      atendeIdade &&
      atendePrecoMin &&
      atendePrecoMax
    );
  });

  return (
    <div className="container-produtos">
      <aside className="sidebar-filtros">
        {/* FILTROS APLICADOS */}
        <div style={{ marginBottom: "20px" }}>
          <strong>FILTROS APLICADOS:</strong>
          <span style={{ marginLeft: 10 }}>
            <button
              onClick={limparFiltros}
              style={{
                fontSize: "0.85rem",
                color: "#007BFF",
                background: "none",
                border: "none",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Limpar tudo
            </button>
          </span>
          <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {categoriasSelecionadas.map((cat) => (
              <span
                key={`filtro-cat-${cat}`}
                style={{
                  backgroundColor: "#e1e4e8",
                  padding: "4px 8px",
                  borderRadius: "5px",
                  fontSize: "0.85rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                {cat}
                <button
                  onClick={() => removerFiltro(cat, categoriasSelecionadas, setCategoriasSelecionadas)}
                  style={{
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    color: "#555",
                    fontWeight: "bold",
                    padding: 0,
                    marginLeft: 2,
                  }}
                  aria-label={`Remover filtro categoria ${cat}`}
                >
                  ×
                </button>
              </span>
            ))}
            {tiposAnimalSelecionados.map((animal) => (
              <span
                key={`filtro-animal-${animal}`}
                style={{
                  backgroundColor: "#e1e4e8",
                  padding: "4px 8px",
                  borderRadius: "5px",
                  fontSize: "0.85rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                {animal}
                <button
                  onClick={() => removerFiltro(animal, tiposAnimalSelecionados, setTiposAnimalSelecionados)}
                  style={{
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    color: "#555",
                    fontWeight: "bold",
                    padding: 0,
                    marginLeft: 2,
                  }}
                  aria-label={`Remover filtro tipo de animal ${animal}`}
                >
                  ×
                </button>
              </span>
            ))}
            {idadesSelecionadas.map((idade) => (
              <span
                key={`filtro-idade-${idade}`}
                style={{
                  backgroundColor: "#e1e4e8",
                  padding: "4px 8px",
                  borderRadius: "5px",
                  fontSize: "0.85rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                {idade}
                <button
                  onClick={() => removerFiltro(idade, idadesSelecionadas, setIdadesSelecionadas)}
                  style={{
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    color: "#555",
                    fontWeight: "bold",
                    padding: 0,
                    marginLeft: 2,
                  }}
                  aria-label={`Remover filtro idade ${idade}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>


        {/* CATEGORIAS */}
        <div className="filtro">
          <h4>CATEGORIAS</h4>
          <ul>
            {[
              "Ração",
              "Brinquedos",
              "Coleiras",
              "Acessórios",
              "Higiene",
              "Petiscos",
              "Medicamentos",
              "Camas",
            ].map((cat, i) => (
              <li key={i}>
                <input
                  type="checkbox"
                  id={`cat-${i}`}
                  checked={categoriasSelecionadas.includes(cat)}
                  onChange={() =>
                    toggleSelecao(cat, categoriasSelecionadas, setCategoriasSelecionadas)
                  }
                />
                <label htmlFor={`cat-${i}`}>{cat}</label>
              </li>
            ))}
          </ul>
        </div>

        {/* TIPO DE ANIMAL */}
        <div className="filtro">
          <h4>TIPO DE ANIMAL</h4>
          <ul>
            {[
              "Cachorro",
              "Gato",
              "Pássaro",
              "Peixe",
              "Roedor",
              "Réptil",
            ].map((animal, i) => (
              <li key={i}>
                <input
                  type="checkbox"
                  id={`animal-${i}`}
                  checked={tiposAnimalSelecionados.includes(animal)}
                  onChange={() =>
                    toggleSelecao(animal, tiposAnimalSelecionados, setTiposAnimalSelecionados)
                  }
                />
                <label htmlFor={`animal-${i}`}>{animal}</label>
              </li>
            ))}
          </ul>
        </div>

        {/* IDADE */}
        <div className="filtro">
          <h4>IDADE</h4>
          <ul>
            {["Filhote", "Adulto", "Sênior"].map((idade, i) => (
              <li key={i}>
                <input
                  type="checkbox"
                  id={`idade-${i}`}
                  checked={idadesSelecionadas.includes(idade)}
                  onChange={() =>
                    toggleSelecao(idade, idadesSelecionadas, setIdadesSelecionadas)
                  }
                />
                <label htmlFor={`idade-${i}`}>{idade}</label>
              </li>
            ))}
          </ul>
        </div>

        {/* FAIXA DE PREÇO */}
        <div className="filtro">
          <h4>FAIXA DE PREÇO</h4>
          <div className="price-range">
            <div className="price-values">
              <span>R$ {precoMin || 0}</span> - <span>R$ {precoMax || 1000}</span>
            </div>
            <div className="price-sliders">
              <input
                type="range"
                min="0"
                max="1000"
                step="10"
                value={precoMin || 0}
                onChange={(e) => {
                  const val = Math.min(Number(e.target.value), precoMax || 1000);
                  setPrecoMin(val);
                }}
              />
              <input
                type="range"
                min="0"
                max="1000"
                step="10"
                value={precoMax || 1000}
                onChange={(e) => {
                  const val = Math.max(Number(e.target.value), precoMin || 0);
                  setPrecoMax(val);
                }}
              />
            </div>
          </div>
        </div>
      </aside>

      {/* PRODUTOS */}
      <section className="produtos-grid">
        {produtosFiltrados.length === 0 ? (
          <p>Nenhum produto encontrado com os filtros selecionados.</p>
        ) : (
          produtosFiltrados.map((produto, index) => (
            <div
              className="card-produto"
              key={index}
              onClick={() => handleProductClick(produto.id)}
            >
              <FaHeart
                className="icon-favorito"
                onClick={(e) => handleFavoritar(e, produto.id)}
              />

              <div className="img-wrapper">
                <img
                  src={produto.imagensUrl?.[0] || "https://via.placeholder.com/150"}
                  alt={produto.nome}
                />
              </div>

              <div className="info-produto">
                <div className="avaliacao">
                  {[1, 2, 3, 4, 5].map((i) =>
                    i <= 4 ? (
                      <FaStar key={i} color="#f5a623" size={14} />
                    ) : (
                      <FaRegStar key={i} color="#ccc" size={14} />
                    )
                  )}
                  <span className="num-avaliacoes">(50)</span>
                </div>

                <h3 className="nome-produto">{produto.nome}</h3>

                <p className="precos">
                  {produto.tamanhos?.[0] ? (
                    <>
                      <span className="preco-atual">
                        R$ {produto.tamanhos[0].precoTotal.toFixed(2)}
                      </span>
                      <span className="preco-original">
                        R$ {(produto.tamanhos[0].precoTotal * 1.25).toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <span>Preço indisponível</span>
                  )}
                </p>

                <button
                  className="btn-cart"
                  onClick={(e) => {
                    e.stopPropagation();
                    adicionarAoCarrinho(produto);
                  }}
                >
                  Adicionar ao carrinho
                </button>

              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
};

export default Produtos;
