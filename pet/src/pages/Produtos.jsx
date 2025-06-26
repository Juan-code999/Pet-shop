import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaStar, FaRegStar, FaHeart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../styles/Produtos.css";

const Produtos = () => {
  const [produtos, setProdutos] = useState([]);
  const [produtosFiltrados, setProdutosFiltrados] = useState([]);
  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState([]);
  const [tiposAnimalSelecionados, setTiposAnimalSelecionados] = useState([]);
  const [idadesSelecionadas, setIdadesSelecionadas] = useState([]);
  const [precoMin, setPrecoMin] = useState("");
  const [precoMax, setPrecoMax] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const produtosPorPagina = 12;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        const response = await axios.get("http://localhost:5005/api/Produtos");
        setProdutos(response.data);
        setProdutosFiltrados(response.data);
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
      }
    };
    fetchProdutos();
  }, []);

  const totalPaginas = Math.ceil(produtosFiltrados.length / produtosPorPagina);

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
    setPaginaAtual(1);
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

  useEffect(() => {
    const filtrados = produtos.filter((produto) => {
      const tamanhos = produto.tamanhos || [];
      const atendePrecoMin = !precoMin || tamanhos.some((t) => parseFloat(t.precoTotal ?? 0) >= parseFloat(precoMin));
      const atendePrecoMax = !precoMax || tamanhos.some((t) => parseFloat(t.precoTotal ?? 0) <= parseFloat(precoMax));
      const atendeCategoria = categoriasSelecionadas.length === 0 || categoriasSelecionadas.includes(produto.categoria);
      const atendeAnimal = tiposAnimalSelecionados.length === 0 || tiposAnimalSelecionados.includes(produto.especieAnimal);
      const atendeIdade = idadesSelecionadas.length === 0 || idadesSelecionadas.includes(produto.idadeRecomendada) || produto.idadeRecomendada === "Todas";

      return atendeCategoria && atendeAnimal && atendeIdade && atendePrecoMin && atendePrecoMax;
    });

    setProdutosFiltrados(filtrados);
    setPaginaAtual(1);
  }, [produtos, categoriasSelecionadas, tiposAnimalSelecionados, idadesSelecionadas, precoMin, precoMax]);

  const indiceInicial = (paginaAtual - 1) * produtosPorPagina;
  const indiceFinal = indiceInicial + produtosPorPagina;
  const produtosPaginaAtual = produtosFiltrados.slice(indiceInicial, indiceFinal);

  const mudarPagina = (pagina) => {
    if (pagina >= 1 && pagina <= totalPaginas) {
      setPaginaAtual(pagina);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const renderPaginacao = () => {
    if (produtosFiltrados.length <= produtosPorPagina) return null;

    const paginas = [];
    const maxPaginasVisiveis = 3;
    
    let inicio = 1;
    let fim = Math.min(maxPaginasVisiveis, totalPaginas);
    
    if (paginaAtual > totalPaginas - 1) {
      inicio = Math.max(1, totalPaginas - 2);
      fim = totalPaginas;
    } else if (paginaAtual > 1) {
      inicio = paginaAtual - 1;
      fim = Math.min(paginaAtual + 1, totalPaginas);
    }

    return (
      <div className="pagination-container">
        <div className="pagination-info">
          Mostrando {indiceInicial + 1}-{Math.min(indiceFinal, produtosFiltrados.length)} de {produtosFiltrados.length} produtos
        </div>
        <div className="pagination-controls">
          <button 
            onClick={() => mudarPagina(paginaAtual - 1)} 
            disabled={paginaAtual === 1}
            className="pagination-button"
          >
            &lt;
          </button>
          
          {Array.from({ length: fim - inicio + 1 }, (_, i) => inicio + i).map((pagina) => (
            <button
              key={pagina}
              onClick={() => mudarPagina(pagina)}
              className={`pagination-button ${paginaAtual === pagina ? 'active' : ''}`}
            >
              {pagina}
            </button>
          ))}
          
          <button 
            onClick={() => mudarPagina(paginaAtual + 1)} 
            disabled={paginaAtual === totalPaginas}
            className="pagination-button"
          >
            &gt;
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="container-produtos">
      <div className="produtos-content-wrapper">
        <aside className="sidebar-filtros">
          <div className="filtros-aplicados-container">
            <strong>FILTROS APLICADOS:</strong>
            <button onClick={limparFiltros} className="btn-limpar-tudo">
              Limpar tudo
            </button>
            <div className="filtros-aplicados-tags">
              {categoriasSelecionadas.map((cat) => (
                <span key={`filtro-cat-${cat}`} className="filtro-tag">
                  {cat}
                  <button
                    onClick={() => removerFiltro(cat, categoriasSelecionadas, setCategoriasSelecionadas)}
                    className="btn-remover-filtro"
                  >
                    ×
                  </button>
                </span>
              ))}
              {tiposAnimalSelecionados.map((animal) => (
                <span key={`filtro-animal-${animal}`} className="filtro-tag">
                  {animal}
                  <button
                    onClick={() => removerFiltro(animal, tiposAnimalSelecionados, setTiposAnimalSelecionados)}
                    className="btn-remover-filtro"
                  >
                    ×
                  </button>
                </span>
              ))}
              {idadesSelecionadas.map((idade) => (
                <span key={`filtro-idade-${idade}`} className="filtro-tag">
                  {idade}
                  <button
                    onClick={() => removerFiltro(idade, idadesSelecionadas, setIdadesSelecionadas)}
                    className="btn-remover-filtro"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="filtro">
            <h4>CATEGORIAS</h4>
            <ul>
              {["Ração", "Brinquedos", "Coleiras", "Acessórios", "Higiene", "Petiscos", "Medicamentos", "Camas"].map((cat, i) => (
                <li key={i}>
                  <input
                    type="checkbox"
                    id={`cat-${i}`}
                    checked={categoriasSelecionadas.includes(cat)}
                    onChange={() => toggleSelecao(cat, categoriasSelecionadas, setCategoriasSelecionadas)}
                  />
                  <label htmlFor={`cat-${i}`}>{cat}</label>
                </li>
              ))}
            </ul>
          </div>

          <div className="filtro">
            <h4>TIPO DE ANIMAL</h4>
            <ul>
              {["Cachorro", "Gato", "Pássaro", "Peixe", "Roedor", "Réptil"].map((animal, i) => (
                <li key={i}>
                  <input
                    type="checkbox"
                    id={`animal-${i}`}
                    checked={tiposAnimalSelecionados.includes(animal)}
                    onChange={() => toggleSelecao(animal, tiposAnimalSelecionados, setTiposAnimalSelecionados)}
                  />
                  <label htmlFor={`animal-${i}`}>{animal}</label>
                </li>
              ))}
            </ul>
          </div>

          <div className="filtro">
            <h4>IDADE</h4>
            <ul>
              {["Filhote", "Adulto", "Sênior"].map((idade, i) => (
                <li key={i}>
                  <input
                    type="checkbox"
                    id={`idade-${i}`}
                    checked={idadesSelecionadas.includes(idade)}
                    onChange={() => toggleSelecao(idade, idadesSelecionadas, setIdadesSelecionadas)}
                  />
                  <label htmlFor={`idade-${i}`}>{idade}</label>
                </li>
              ))}
            </ul>
          </div>

          {/* Improved Price Range Filter */}
          <div className="filtro">
            <h4>FAIXA DE PREÇO</h4>
            <div className="price-range">
              <div className="price-inputs">
                <div className="price-input-group">
                  <label htmlFor="preco-min">Mínimo</label>
                  <div className="input-currency">
                    <span>R$</span>
                    <input
                      type="number"
                      id="preco-min"
                      min="0"
                      max="1000"
                      step="10"
                      value={precoMin}
                      onChange={(e) => {
                        const val = Math.min(Number(e.target.value), precoMax || 1000);
                        setPrecoMin(val || "");
                      }}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="price-separator">-</div>
                <div className="price-input-group">
                  <label htmlFor="preco-max">Máximo</label>
                  <div className="input-currency">
                    <span>R$</span>
                    <input
                      type="number"
                      id="preco-max"
                      min="0"
                      max="1000"
                      step="10"
                      value={precoMax}
                      onChange={(e) => {
                        const val = Math.max(Number(e.target.value), precoMin || 0);
                        setPrecoMax(val || "");
                      }}
                      placeholder="1000"
                    />
                  </div>
                </div>
              </div>
              <div className="price-slider-container">
                <div className="price-slider">
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
                    className="slider-min"
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
                    className="slider-max"
                  />
                </div>
                <div className="price-limits">
                  <span>R$ 0</span>
                  <span>R$ 1000</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div className="produtos-main-content">
          <section className="produtos-grid">
            {produtosPaginaAtual.length === 0 ? (
              <p className="nenhum-produto">Nenhum produto encontrado com os filtros selecionados.</p>
            ) : (
              produtosPaginaAtual.map((produto) => (
                <div 
                  key={produto.id} 
                  className="card-produto"
                  onClick={() => handleProductClick(produto.id)}
                >
                  <FaHeart
                    className="icon-favorito"
                    onClick={(e) => handleFavoritar(e, produto.id)}
                  />
                  <div className="img-wrapper">
                    <img src={produto.imagensUrl?.[0] || "https://via.placeholder.com/150"} alt={produto.nome} />
                  </div>
                  <div className="info-produto">
                    <div className="avaliacao">
                      {[1, 2, 3, 4, 5].map((i) => 
                        i <= 4 ? <FaStar key={i} color="#f5a623" size={14} /> : <FaRegStar key={i} color="#ccc" size={14} />
                      )}
                      <span className="num-avaliacoes">(50)</span>
                    </div>
                    <h3 className="nome-produto">{produto.nome}</h3>
                    <p className="precos">
                      {produto.tamanhos?.[0] ? (
                        <>
                          <span className="preco-atual">R$ {produto.tamanhos[0].precoTotal.toFixed(2)}</span>
                          <span className="preco-original">R$ {(produto.tamanhos[0].precoTotal * 1.25).toFixed(2)}</span>
                        </>
                      ) : <span>Preço indisponível</span>}
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

          {renderPaginacao()}
        </div>
      </div>
    </div>
  );
};

export default Produtos;