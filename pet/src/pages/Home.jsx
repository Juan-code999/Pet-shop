import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { FaStar, FaRegStar, FaHeart, FaShoppingCart } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/Home.css';
import dogBanner from '../img/banner.jpg';
import teamImage from '../img/cat.jpeg';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favoritos, setFavoritos] = useState([]);
  const navigate = useNavigate();

  // Mock data for when API fails
  const mockProducts = [
    {
      id: 1,
      nome: "Ração Premium para Cães",
      descricao: "Ração super premium para todas as raças",
      marca: "Royal Canin",
      imagensUrl: ["/placeholder-produto.jpg"],
      tamanhos: [{ tamanho: "5kg", precoTotal: 120.90 }],
      desconto: 10,
      especieAnimal: "Cachorro",
      avaliacaoMedia: 4.8,
      numAvaliacoes: 42
    },
    {
      id: 2,
      nome: "Brinquedo para Gatos",
      descricao: "Brinquedo interativo com penas",
      marca: "PetGames",
      imagensUrl: ["/placeholder-produto.jpg"],
      tamanhos: [{ tamanho: "Único", precoTotal: 45.50 }],
      desconto: 0,
      especieAnimal: "Gato",
      avaliacaoMedia: 4.5,
      numAvaliacoes: 36
    }
  ];

  // Other mock data
  const testimonials = [
    {
      id: 1,
      name: "Ana Carolina",
      rating: 5,
      content: "Meu cachorro adorou a ração premium que comprei aqui. Notamos diferença na pelagem e energia dele em poucas semanas!",
      pet: "Thor, Golden Retriever",
    },
    {
      id: 2,
      name: "Ricardo Almeida",
      rating: 5,
      content: "Atendimento excepcional e entrega super rápida. Meus gatos estão viciados nos brinquedos que comprei.",
      pet: "Luna e Loki, Gatos Siameses",
    }
  ];

  const categories = [
    {
      id: 1,
      name: "Alimentação",
      description: "Rações, petiscos e suplementos para todas as fases",
      icon: "paw"
    },
    {
      id: 2,
      name: "Brinquedos",
      description: "Diversão e entretenimento para seu companheiro",
      icon: "dog"
    },
    {
      id: 3,
      name: "Higiene",
      description: "Produtos para manter seu pet limpo e cheiroso",
      icon: "hand-paper"
    },
    {
      id: 4,
      name: "Produtos Naturais",
      description: "Alternativas saudáveis para cuidados especiais",
      icon: "leaf"
    }
  ];

  const brands = ["Royal Canin", "Premier", "Pedigree", "Whiskas", "Golden"];

  useEffect(() => {
  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);
      
      // Default to mock data initially
      let productsData = mockProducts;
      
      try {
        const response = await axios.get('https://pet-shop-eiab.onrender.com/api/Produtos/destaques');
        
        // Handle different response formats
        if (Array.isArray(response.data)) {
          productsData = response.data; // Direct array response
        } else if (response.data && Array.isArray(response.data.data)) {
          productsData = response.data.data; // Object with data array
        } else if (response.data && Array.isArray(response.data.produtos)) {
          productsData = response.data.produtos; // Object with produtos array
        }
        
        console.log('Products data:', productsData); // Debug log
      } catch (apiError) {
        console.warn('API request failed, using mock data', apiError);
      }
      
      // Process the products data
      const produtosFormatados = productsData.map(produto => {
        const tamanhos = produto.tamanhos || [];
        const precoBase = tamanhos[0]?.precoTotal || 0;
        const desconto = parseFloat(produto.desconto) || 0;
        const precoFinal = desconto > 0 ? precoBase * (1 - desconto / 100) : precoBase;

        return {
          id: produto.id || produto._id || Math.random().toString(36).substr(2, 9),
          nome: produto.nome || 'Produto sem nome',
          descricao: produto.descricao || '',
          marca: produto.marca || '',
          especie: produto.especieAnimal || 'Cachorro',
          idade: produto.idadeRecomendada || '',
          porte: produto.porteAnimal || '',
          imagens: produto.imagensUrl || produto.imagens || ["/placeholder-produto.jpg"],
          tamanhos: tamanhos,
          desconto: desconto,
          preco: precoFinal,
          precoOriginal: desconto > 0 ? precoBase : null,
          avaliacaoMedia: produto.avaliacaoMedia || (4 + Math.random()).toFixed(1),
          numAvaliacoes: produto.numAvaliacoes || Math.floor(Math.random() * 100) + 1
        };
      });

      setFeaturedProducts(produtosFormatados);
      setError(null);
    } catch (error) {
      console.error('Error processing products:', error);
      setError('Erro ao carregar produtos. Mostrando dados de exemplo.');
      setFeaturedProducts(mockProducts);
    } finally {
      setLoading(false);
    }
  };

  fetchFeaturedProducts();
}, []);

  useEffect(() => {
    const favs = JSON.parse(localStorage.getItem('favoritos')) || [];
    setFavoritos(favs);
  }, []);

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
    
    toast.success(
      favoritos.includes(id) 
        ? 'Removido dos favoritos' 
        : 'Adicionado aos favoritos',
      {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
      }
    );
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
      navigate('/login', { state: { from: '/' } });
      return;
    }

    if (!produto.tamanhos?.length) {
      toast.warning("Este produto não possui tamanhos disponíveis");
      return;
    }

    const btn = e.target;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<FaShoppingCart /> Adicionando...';
    btn.disabled = true;

    const itemCarrinho = {
      produtoId: produto.id,
      tamanho: produto.tamanhos[0].tamanho,
      quantidade: 1,
    };

    try {
      await axios.post(`/api/Carrinho/${usuarioId}/adicionar`, itemCarrinho);
      
      btn.innerHTML = '<FaShoppingCart /> Adicionado!';
      btn.style.backgroundColor = '#28a745';
      
      toast.success("Produto adicionado ao carrinho com sucesso!", {
        autoClose: 2000,
        closeOnClick: true,
      });

      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.backgroundColor = '';
        btn.disabled = false;
      }, 2000);
    } catch (error) {
      console.error("Erro ao adicionar ao carrinho:", error);
      
      btn.innerHTML = '<FaShoppingCart /> Erro!';
      btn.style.backgroundColor = '#dc3545';
      
      toast.error(error.response?.data?.message || "Erro ao adicionar ao carrinho");

      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.backgroundColor = '';
        btn.disabled = false;
      }, 2000);
    }
  };



  const TestimonialCard = ({ testimonial }) => {
    return (
      <div className="testimonial-card">
        <div className="testimonial-header">
          <div className="user-avatar"></div>
          <div className="user-info">
            <h4>{testimonial.name}</h4>
            <div className="user-rating">
              {[...Array(5)].map((_, i) => (
                <FaStar 
                  key={i} 
                  className={i < testimonial.rating ? 'filled' : ''} 
                />
              ))}
            </div>
          </div>
        </div>
        <p className="testimonial-content">{testimonial.content}</p>
        <div className="pet-info">
          <span>{testimonial.pet}</span>
        </div>
      </div>
    );
  };

  const CategoryCard = ({ category }) => {
    return (
      <div className="category-card">
        <div className="category-icon">
          {category.icon === 'paw' && <span>🐾</span>}
          {category.icon === 'dog' && <span>🐶</span>}
          {category.icon === 'hand-paper' && <span>✋</span>}
          {category.icon === 'leaf' && <span>🍃</span>}
        </div>
        <h3>{category.name}</h3>
        <p>{category.description}</p>
        <a href={`/produtos?categoria=${category.name}`} className="category-link">
          Ver produtos →
        </a>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="home loading-container">
        <div className="loading-spinner"></div>
        <p>Carregando produtos em destaque...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home error-container">
        <p className="error-message">{error}</p>
        <button onClick={() => window.location.reload()} className="btn-reload">
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="home">
      <Helmet>
        <title>PetShop - Produtos Premium para Seu Animal de Estimação</title>
        <meta name="description" content="Encontre os melhores produtos e serviços para o bem-estar do seu pet. Frete grátis em compras acima de R$ 99." />
      </Helmet>

      {/* Hero Section */}
      <header className="header">
        <div className="header-overlay"></div>
        <div className="header-content">
          <div className="header-text">
            <h1>
              <span className="highlight">Amor</span> e qualidade<br />
              para o seu <span className="pet-text">pet</span>
            </h1>
            <p className="subtitle">
              Os melhores produtos e serviços para o bem-estar do seu companheiro.
              <br />Frete grátis em compras acima de R$ 99.
            </p>
            <div className="cta-buttons">
              <button className="btn-primary" onClick={() => navigate('/produtos')}>
                <FaShoppingCart /> Comprar Agora
              </button>
              <button className="btn-secondary"onClick={() => navigate('/empresa')}>Nossos Serviços</button>
            </div>
            <div className="trust-badges">
              <div className="badge">
                <FaStar />
                <span>Avaliação 4.9/5</span>
              </div>
              <div className="badge">
                <span>🚚</span>
                <span>Entrega Rápida</span>
              </div>
              <div className="badge">
                <span>🛡️</span>
                <span>Compra Segura</span>
              </div>
            </div>
          </div>
          <div className="header-image">
            <img 
              src={dogBanner} 
              alt="Cachorro feliz com produtos do petshop" 
              loading="lazy"
            />
            <div className="promo-bubble">
              <div className="bubble-text">Ofertas <span>Especiais</span></div>
              <div className="bubble-percent">-20%</div>
            </div>
          </div>
        </div>
      </header>

      {/* Brands Section */}
      <section className="brands-section">
        <h3>Marcas que confiam em nós</h3>
        <div className="brands-carousel">
          {brands.map((brand, index) => (
            <div key={index} className="brand-logo">{brand}</div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-section">
        <div className="section-header">
          <h2>Nossos <span>Destaques</span></h2>
          <p>Os produtos mais amados pelos nossos clientes</p>
        </div>
        
        <div className="featured-grid">
          {featuredProducts.map(produto => {
            const isFavorito = favoritos.includes(produto.id);
            const imagemPrincipal = produto.imagens?.[0] || "/placeholder-produto.jpg";

            return (
              <div 
                key={produto.id} 
                className="card-produto"
                onClick={() => handleProductClick(produto.id)}
              >
                <button 
                  className={`icon-favorito ${isFavorito ? 'favoritado' : ''}`}
                  onClick={(e) => handleFavoritar(e, produto.id)}
                >
                  <FaHeart />
                </button>
                {produto.desconto > 0 && (
                  <span className="badge-desconto">-{produto.desconto}%</span>
                )}
                <div className="img-wrapper">
                  <img 
                    src={imagemPrincipal}
                    alt={produto.nome} 
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/placeholder-produto.jpg";
                    }}
                  />
                </div>
                <div className="info-produto">
                  <div className="avaliacao">
                    {[1, 2, 3, 4, 5].map((i) => 
                      i <= Math.floor(produto.avaliacaoMedia) ? 
                        <FaStar key={i} /> : 
                        <FaRegStar key={i} />
                    )}
                    <span className="num-avaliacoes">({produto.numAvaliacoes})</span>
                  </div>
                  <h3 className="nome-produto">{produto.nome}</h3>
                  <p className="marca-produto">{produto.marca}</p>
                  <p className="precos">
                    {produto.preco > 0 ? (
                      <>
                        <span className="preco-atual">
                          R$ {produto.preco.toFixed(2).replace('.', ',')}
                        </span>
                        {produto.precoOriginal && (
                          <span className="preco-original">
                            R$ {produto.precoOriginal.toFixed(2).replace('.', ',')}
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
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <div className="section-header">
          <h2>Explore nossas <span>Categorias</span></h2>
          <p>Tudo que seu pet precisa em um só lugar</p>
        </div>
        <div className="categories-grid">
          {categories.map(category => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="section-header">
          <h2>O que dizem <span>nossos clientes</span></h2>
          <p>A satisfação dos pets e seus donos é nossa maior recompensa</p>
        </div>
        <div className="testimonials-container">
          {testimonials.map(testimonial => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
      </section>


      {/* Story Section */}
      <section className="story-section">
        <div className="story-content">
          <div className="story-text">
            <h2>Nossa <span>História</span></h2>
            <p>Fundada em 2010 por amantes de animais, nossa petshop nasceu da paixão por proporcionar o melhor cuidado para os pets.</p>
            <div className="stats-container">
              <div className="stat-item">
                <span>😊</span>
                <div>
                  <span>+5.000</span>
                  <small>Clientes Satisfeitos</small>
                </div>
              </div>
              <div className="stat-item">
                <span>🐾</span>
                <div>
                  <span>+10.000</span>
                  <small>Pets Felizes</small>
                </div>
              </div>
            </div>
          </div>
          <div className="story-image">
            <img 
              src={teamImage} 
              alt="Equipe da petshop com animais" 
              loading="lazy"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;