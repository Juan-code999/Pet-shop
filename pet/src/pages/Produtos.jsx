import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaStar, FaRegStar, FaHeart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../styles/Produtos.css";

const Produtos = () => {
  const [produtos, setProdutos] = useState([]);

  // Agora arrays para múltipla seleção
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

  // Função para limpar filtros
  const limparFiltros = () => {
    setCategoriasSelecionadas([]);
    setTiposAnimalSelecionados([]);
    setIdadesSelecionadas([]);
    setPrecoMin("");
    setPrecoMax("");
  };

  // Função para alterar múltipla seleção: adiciona ou remove da lista
  const toggleSelecao = (valor, array, setArray) => {
    if (array.includes(valor)) {
      setArray(array.filter((item) => item !== valor));
    } else {
      setArray([...array, valor]);
    }
  };

  const produtosFiltrados = produtos.filter((produto) => {
    const preco = produto.Tamanhos?.[0]?.PrecoTotal || 0;

    // Se vazio, aceita todos
    const atendeCategoria =
      categoriasSelecionadas.length === 0 ||
      categoriasSelecionadas.includes(produto.categoria);

    const atendeAnimal =
      tiposAnimalSelecionados.length === 0 ||
      tiposAnimalSelecionados.includes(produto.especieAnimal);

    // Aqui considera "Todas" como válido se o produto tem IdadeRecomendada == "Todas"
    const atendeIdade =
      idadesSelecionadas.length === 0 ||
      idadesSelecionadas.includes(produto.idadeRecomendada) ||
      produto.IdadeRecomendada === "Todas";

    const atendePrecoMin = !precoMin || produto.Tamanhos?.some(t => t.PrecoTotal >= parseFloat(precoMin));
    const atendePrecoMax = !precoMax || produto.Tamanhos?.some(t => t.PrecoTotal <= parseFloat(precoMax));


    return (
      atendeCategoria &&
      atendeAnimal &&
      atendeIdade &&
      atendePrecoMin &&
      atendePrecoMax
    );
  });

  // Função para exibir texto das opções selecionadas
  const exibirSelecionados = (array) =>
    array.length === 0 ? "Todos" : array.join(", ");

  return (
    <div className="container-produtos">
      <aside className="sidebar-filtros">
        <div style={{ marginBottom: "15px" }}>
          <button onClick={limparFiltros} className="btn-limpar-filtros">
            Limpar filtros
          </button>
        </div>

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
                  const val = Math.max(Number(e.target.value), precoMin || 1000);
                  setPrecoMax(val);
                }}
              />
            </div>
          </div>
        </div>

        <div className="filtro">
          <h4>CATEGORIAS</h4>
          <p>Selecionado: {exibirSelecionados(categoriasSelecionadas)}</p>
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

        <div className="filtro">
          <h4>TIPO DE ANIMAL</h4>
          <p>Selecionado: {exibirSelecionados(tiposAnimalSelecionados)}</p>
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

        <div className="filtro">
          <h4>IDADE</h4>
          <p>Selecionado: {exibirSelecionados(idadesSelecionadas)}</p>
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
      </aside>

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
                    // Lógica para adicionar ao carrinho
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
