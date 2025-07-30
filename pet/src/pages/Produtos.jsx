import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { FaStar, FaRegStar, FaHeart, FaShoppingCart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import debounce from "lodash.debounce";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "../styles/Produtos.css";

const Produtos = () => {
  // Estados
  const [produtos, setProdutos] = useState([]);
  const [produtosFiltrados, setProdutosFiltrados] = useState([]);
  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState([]);
  const [tiposAnimalSelecionados, setTiposAnimalSelecionados] = useState([]);
  const [idadesSelecionadas, setIdadesSelecionadas] = useState([]);
  const [precoMin, setPrecoMin] = useState("");
  const [precoMax, setPrecoMax] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favoritos, setFavoritos] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const produtosPorPagina = 12;
  const navigate = useNavigate();

  // Opções de filtro fixas
  const categoriasFixas = ["Ração", "Brinquedos", "Coleiras", "Acessórios", "Higiene", "Petiscos", "Medicamentos", "Camas"];
  const tiposAnimaisFixos = ["Cachorro", "Gato", "Pássaro", "Peixe", "Roedor", "Réptil"];
  const idadesFixas = ["Filhote", "Adulto", "Sênior"];

  // Verificar se é mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 992);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Buscar produtos
  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        setLoading(true);
        const response = await axios.get("https://pet-shop-eiab.onrender.com/api/Produtos");
        setProdutos(response.data);
        setProdutosFiltrados(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
        setError("Erro ao carregar produtos. Tente novamente mais tarde.");
        setLoading(false);
      }
    };
    fetchProdutos();
  }, []);

  // Carregar favoritos do localStorage
  useEffect(() => {
    const favs = JSON.parse(localStorage.getItem('favoritos')) || [];
    setFavoritos(favs);
  }, []);

  // Filtragem com debounce para melhor performance
  const aplicarFiltros = useCallback(debounce((produtos, filtros) => {
    const { categorias, animais, idades, min, max } = filtros;
    
    const filtrados = produtos.filter((produto) => {
      const tamanhos = produto.tamanhos || [];
      const atendePrecoMin = !min || tamanhos.some((t) => parseFloat(t.precoTotal ?? 0) >= parseFloat(min));
      const atendePrecoMax = !max || tamanhos.some((t) => parseFloat(t.precoTotal ?? 0) <= parseFloat(max));
      const atendeCategoria = categorias.length === 0 || categorias.includes(produto.categoria);
      const atendeAnimal = animais.length === 0 || animais.includes(produto.especieAnimal);
      const atendeIdade = idades.length === 0 || idades.includes(produto.idadeRecomendada);

      return atendeCategoria && atendeAnimal && atendeIdade && atendePrecoMin && atendePrecoMax;
    });

    setProdutosFiltrados(filtrados);
    setPaginaAtual(1);
  }, 300), []);

  // Aplicar filtros quando mudar
  useEffect(() => {
    aplicarFiltros(produtos, {
      categorias: categoriasSelecionadas,
      animais: tiposAnimalSelecionados,
      idades: idadesSelecionadas,
      min: precoMin,
      max: precoMax
    });
  }, [produtos, categoriasSelecionadas, tiposAnimalSelecionados, idadesSelecionadas, precoMin, precoMax, aplicarFiltros]);

  // Manipuladores de eventos
  const handleProductClick = (id) => {
    navigate(`/produto/${id}`);
  };

  const handleFavoritar = (e, id) => {
    e.stopPropagation();
    const newFavoritos = favoritos.includes(id) 
      ? favoritos.filter(favId => favId !== id)
      : [...favoritos, id];
    
    setFavoritos(newFavoritos);
    localStorage.setItem('favoritos', JSON.stringify(newFavoritos));
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

  const adicionarAoCarrinho = async (e, produto) => {
    e.stopPropagation();
    const usuarioId = localStorage.getItem("usuarioId");
    
    if (!usuarioId) {
      toast.info("Você precisa estar logado para adicionar itens ao carrinho", {
        autoClose: 3000,
        closeOnClick: true,
        pauseOnHover: true,
      });
      navigate('/login', { state: { from: '/produtos' } });
      return;
    }

    if (!produto.tamanhos?.length) {
      toast.warning("Este produto não possui tamanhos disponíveis");
      return;
    }

    // Feedback visual de carregamento
    const btn = e.target;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<FaShoppingCart /> Adicionando...';
    btn.disabled = true;

    const itemCarrinho = {
      produtoId: produto.id,
      tamanho: produto.tamanhos[0].tamanho, // Pega o primeiro tamanho disponível
      quantidade: 1,
    };

    try {
      await axios.post(`https://pet-shop-eiab.onrender.com/api/Carrinho/${usuarioId}/adicionar`, itemCarrinho);
      
      // Feedback visual de sucesso
      btn.innerHTML = '<FaShoppingCart /> Adicionado!';
      btn.style.backgroundColor = '#28a745';
      
      toast.success("Produto adicionado ao carrinho com sucesso!", {
        autoClose: 2000,
        closeOnClick: true,
      });

      // Reset do botão após 2 segundos
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.backgroundColor = '';
        btn.disabled = false;
      }, 2000);
    } catch (error) {
      console.error("Erro ao adicionar ao carrinho:", error);
      
      // Feedback visual de erro
      btn.innerHTML = '<FaShoppingCart /> Erro!';
      btn.style.backgroundColor = '#dc3545';
      
      toast.error(error.response?.data?.message || "Erro ao adicionar ao carrinho");

      // Reset do botão após 2 segundos
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.backgroundColor = '';
        btn.disabled = false;
      }, 2000);
    }
  };

  // Paginação
  const totalPaginas = Math.ceil(produtosFiltrados.length / produtosPorPagina);
  const indiceInicial = (paginaAtual - 1) * produtosPorPagina;
  const indiceFinal = indiceInicial + produtosPorPagina;
  const produtosPaginaAtual = produtosFiltrados.slice(indiceInicial, indiceFinal);

  const mudarPagina = (pagina) => {
    if (pagina >= 1 && pagina <= totalPaginas) {
      setPaginaAtual(pagina);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Renderização condicional
  const renderPaginacao = () => {
    if (produtosFiltrados.length <= produtosPorPagina) return null;

    const paginas = [];
    const maxPaginasVisiveis = 3;
    
    let inicio = Math.max(1, paginaAtual - 1);
    let fim = Math.min(paginaAtual + 1, totalPaginas);
    
    if (paginaAtual === 1) {
      fim = Math.min(3, totalPaginas);
    } else if (paginaAtual === totalPaginas) {
      inicio = Math.max(1, totalPaginas - 2);
    }

    return (
      <div className="pagination-container">
        <div className="pagination-info">
          Mostrando {indiceInicial + 1}-{Math.min(indiceFinal, produtosFiltrados.length)} de {produtosFiltrados.length} produtos
        </div>
        <div className="pagination-controls">
          <button 
            onClick={() => mudarPagina(1)} 
            disabled={paginaAtual === 1}
            className="pagination-button"
            aria-label="Primeira página"
          >
            &laquo;
          </button>
          <button 
            onClick={() => mudarPagina(paginaAtual - 1)} 
            disabled={paginaAtual === 1}
            className="pagination-button"
            aria-label="Página anterior"
          >
            &lt;
          </button>
          
          {inicio > 1 && <span className="pagination-ellipsis">...</span>}
          
          {Array.from({ length: fim - inicio + 1 }, (_, i) => inicio + i).map((pagina) => (
            <button
              key={pagina}
              onClick={() => mudarPagina(pagina)}
              className={`pagination-button ${paginaAtual === pagina ? 'active' : ''}`}
              aria-label={`Página ${pagina}`}
            >
              {pagina}
            </button>
          ))}
          
          {fim < totalPaginas && <span className="pagination-ellipsis">...</span>}
          
          <button 
            onClick={() => mudarPagina(paginaAtual + 1)} 
            disabled={paginaAtual === totalPaginas}
            className="pagination-button"
            aria-label="Próxima página"
          >
            &gt;
          </button>
          <button 
            onClick={() => mudarPagina(totalPaginas)} 
            disabled={paginaAtual === totalPaginas}
            className="pagination-button"
            aria-label="Última página"
          >
            &raquo;
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container-produtos loading-container">
        <div className="loading-spinner"></div>
        <p>Carregando produtos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-produtos error-container">
        <p className="error-message">{error}</p>
        <button onClick={() => window.location.reload()} className="btn-reload">
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="container-produtos">
      <div className="produtos-content-wrapper">
        {/* Sidebar de Filtros (oculto em mobile e mostrado via botão) */}
        <input type="checkbox" id="filtros-toggle" className="filtros-toggle" />
        <label htmlFor="filtros-toggle" className="filtros-mobile-toggle">
          {categoriasSelecionadas.length + tiposAnimalSelecionados.length + idadesSelecionadas.length > 0 ? (
            <span className="filtros-badge">
              {categoriasSelecionadas.length + tiposAnimalSelecionados.length + idadesSelecionadas.length}
            </span>
          ) : null}
          Filtros
        </label>
        
        <aside className="sidebar-filtros">
          <div className="filtros-header">
            <h3>Filtrar Produtos</h3>
            <label htmlFor="filtros-toggle" className="fechar-filtros">
              &times;
            </label>
          </div>

          <div className="filtros-aplicados-container">
            <div className="filtros-aplicados-header">
              <strong>Filtros aplicados:</strong>
              <button onClick={limparFiltros} className="btn-limpar-tudo">
                Limpar tudo
              </button>
            </div>
            <div className="filtros-aplicados-tags">
              {categoriasSelecionadas.map((cat) => (
                <span key={`filtro-cat-${cat}`} className="filtro-tag">
                  {cat}
                  <button
                    onClick={() => removerFiltro(cat, categoriasSelecionadas, setCategoriasSelecionadas)}
                    className="btn-remover-filtro"
                    aria-label={`Remover filtro ${cat}`}
                  >
                    &times;
                  </button>
                </span>
              ))}
              {tiposAnimalSelecionados.map((animal) => (
                <span key={`filtro-animal-${animal}`} className="filtro-tag">
                  {animal}
                  <button
                    onClick={() => removerFiltro(animal, tiposAnimalSelecionados, setTiposAnimalSelecionados)}
                    className="btn-remover-filtro"
                    aria-label={`Remover filtro ${animal}`}
                  >
                    &times;
                  </button>
                </span>
              ))}
              {idadesSelecionadas.map((idade) => (
                <span key={`filtro-idade-${idade}`} className="filtro-tag">
                  {idade}
                  <button
                    onClick={() => removerFiltro(idade, idadesSelecionadas, setIdadesSelecionadas)}
                    className="btn-remover-filtro"
                    aria-label={`Remover filtro ${idade}`}
                  >
                    &times;
                  </button>
                </span>
              ))}
              {(precoMin || precoMax) && (
                <span className="filtro-tag">
                  Preço: R$ {precoMin || 0} - {precoMax ? `R$ ${precoMax}` : '∞'}
                  <button
                    onClick={() => {
                      setPrecoMin("");
                      setPrecoMax("");
                    }}
                    className="btn-remover-filtro"
                    aria-label="Remover filtro de preço"
                  >
                    &times;
                  </button>
                </span>
              )}
            </div>
          </div>

          {/* Filtro de Categorias */}
          <div className={`filtro ${!isMobile ? 'aberto' : ''}`}>
            <h4>
              <button 
                className="filtro-toggle"
                onClick={(e) => e.currentTarget.closest('.filtro').classList.toggle('aberto')}
                aria-expanded={!isMobile}
              >
                CATEGORIAS
                <svg className="filtro-seta" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
            </h4>
            <ul>
              {categoriasFixas.map((cat, i) => (
                <li key={`cat-${i}`}>
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

          {/* Filtro de Tipo de Animal */}
          <div className={`filtro ${!isMobile ? 'aberto' : ''}`}>
            <h4>
              <button 
                className="filtro-toggle"
                onClick={(e) => e.currentTarget.closest('.filtro').classList.toggle('aberto')}
                aria-expanded={!isMobile}
              >
                TIPO DE ANIMAL
                <svg className="filtro-seta" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
            </h4>
            <ul>
              {tiposAnimaisFixos.map((animal, i) => (
                <li key={`animal-${i}`}>
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

          {/* Filtro de Idade */}
          <div className={`filtro ${!isMobile ? 'aberto' : ''}`}>
            <h4>
              <button 
                className="filtro-toggle"
                onClick={(e) => e.currentTarget.closest('.filtro').classList.toggle('aberto')}
                aria-expanded={!isMobile}
              >
                IDADE
                <svg className="filtro-seta" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
            </h4>
            <ul>
              {idadesFixas.map((idade, i) => (
                <li key={`idade-${i}`}>
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

          {/* Filtro de Faixa de Preço */}
          <div className={`filtro ${!isMobile ? 'aberto' : ''}`}>
            <h4>
              <button 
                className="filtro-toggle"
                onClick={(e) => e.currentTarget.closest('.filtro').classList.toggle('aberto')}
                aria-expanded={!isMobile}
              >
                FAIXA DE PREÇO
                <svg className="filtro-seta" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
            </h4>
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
                      step="1"
                      value={precoMin}
                      onChange={(e) => {
                        const val = e.target.value === '' ? '' : Math.min(Number(e.target.value), precoMax || 1000);
                        setPrecoMin(val);
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
                      step="1"
                      value={precoMax}
                      onChange={(e) => {
                        const val = e.target.value === '' ? '' : Math.max(Number(e.target.value), precoMin || 0);
                        setPrecoMax(val);
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
                    onChange={(e) => setPrecoMin(Number(e.target.value))}
                    className="slider-min"
                  />
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="10"
                    value={precoMax || 1000}
                    onChange={(e) => setPrecoMax(Number(e.target.value))}
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
          {produtosFiltrados.length === 0 && !loading ? (
            <div className="nenhum-produto">
              <p>Nenhum produto encontrado com os filtros selecionados.</p>
              <button onClick={limparFiltros} className="btn-limpar-filtros">
                Limpar filtros
              </button>
            </div>
          ) : (
            <>
              <section className="produtos-grid">
                {produtosPaginaAtual.map((produto) => {
                  const preco = produto.tamanhos?.[0]?.precoTotal || 0;
                  const precoOriginal = preco * 1.25;
                  const isFavorito = favoritos.includes(produto.id);

                  return (
                    <div 
                      key={produto.id} 
                      className="card-produto"
                      onClick={() => handleProductClick(produto.id)}
                      aria-label={`Produto ${produto.nome}`}
                    >
                      <button 
                        className={`icon-favorito ${isFavorito ? 'favoritado' : ''}`}
                        onClick={(e) => handleFavoritar(e, produto.id)}
                        aria-label={isFavorito ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                      >
                        <FaHeart />
                      </button>
                      {produto.desconto && (
                        <span className="badge-desconto">-{produto.desconto}%</span>
                      )}
                      <div className="img-wrapper">
                        <img 
                          src={produto.imagensUrl?.[0] || "/placeholder-produto.jpg"} 
                          alt={produto.nome} 
                          loading="lazy"
                        />
                      </div>
                      <div className="info-produto">
                        <div className="avaliacao">
                          {[1, 2, 3, 4, 5].map((i) => 
                            i <= Math.floor(produto.avaliacaoMedia || 4) ? 
                              <FaStar key={i} /> : 
                              <FaRegStar key={i} />
                          )}
                          <span className="num-avaliacoes">({produto.numAvaliacoes || 50})</span>
                        </div>
                        <h3 className="nome-produto">{produto.nome}</h3>
                        <p className="precos">
                          {preco > 0 ? (
                            <>
                              <span className="preco-atual">
                                R$ {preco.toFixed(2).replace('.', ',')}
                              </span>
                              {precoOriginal > preco && (
                                <span className="preco-original">
                                  R$ {precoOriginal.toFixed(2).replace('.', ',')}
                                </span>
                              )}
                            </>
                          ) : <span className="preco-indisponivel">Preço indisponível</span>}
                        </p>
                        <button 
                          className="btn-cart"
                          onClick={(e) => adicionarAoCarrinho(e, produto)}
                          disabled={!produto.tamanhos?.length}
                        >
                          <FaShoppingCart /> Adicionar ao carrinho
                        </button>
                      </div>
                    </div>
                  );
                })}
              </section>

              {renderPaginacao()}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Produtos;