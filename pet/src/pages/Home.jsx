import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHandPaper,
  faDog,
  faPaw,
  faLeaf,
  faShoppingCart,
  faStar,
  faTruck,
  faShieldAlt,
  faSmile,
  faCat,
  faHeart
} from '@fortawesome/free-solid-svg-icons';
import '../styles/Home.css';
import dogBanner from '../img/banner.jpg';
import teamImage from '../img/dog.jpg';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock data for other sections
  const testimonials = [
    {
      id: 1,
      name: "Ana Carolina",
      rating: 5,
      content: "Meu cachorro adorou a ração premium que comprei aqui. Notamos diferença na pelagem e energia dele em poucas semanas!",
      pet: "Thor, Golden Retriever",
      petIcon: faDog
    },
    {
      id: 2,
      name: "Ricardo Almeida",
      rating: 5,
      content: "Atendimento excepcional e entrega super rápida. Meus gatos estão viciados nos brinquedos que comprei.",
      pet: "Luna e Loki, Gatos Siameses",
      petIcon: faCat
    }
  ];

  const categories = [
    {
      id: 1,
      name: "Alimentação",
      description: "Rações, petiscos e suplementos para todas as fases",
      icon: faPaw
    },
    {
      id: 2,
      name: "Brinquedos",
      description: "Diversão e entretenimento para seu companheiro",
      icon: faDog
    },
    {
      id: 3,
      name: "Higiene",
      description: "Produtos para manter seu pet limpo e cheiroso",
      icon: faHandPaper
    },
    {
      id: 4,
      name: "Produtos Naturais",
      description: "Alternativas saudáveis para cuidados especiais",
      icon: faLeaf
    }
  ];

  const brands = ["Royal Canin", "Premier", "Pedigree", "Whiskas", "Golden"];

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await fetch('http://localhost:5005/api/Produtos');
        
        if (!response.ok) {
          throw new Error('Erro ao carregar produtos');
        }
        
        const data = await response.json();
        console.log('Dados brutos da API:', data);
        
        // Filtro melhorado para produtos em destaque
        const featuredProducts = data.filter(produto => {
          const isFeatured = 
            produto.Destaque === true || 
            produto.destaque === true || 
            produto.isFeatured === true ||
            produto.featured === true;
          
          const isAvailable = 
            produto.Disponivel !== false && 
            produto.available !== false;
          
          return isFeatured && isAvailable;
        });
        
        console.log('Produtos em destaque filtrados:', featuredProducts);
        
        const produtosFormatados = featuredProducts.map(produto => {
          const mainImage = 
            produto.ImagensUrl?.[0] || 
            produto.imagens?.[0] || 
            produto.Imagem || 
            produto.image || 
            '';
          
          const sizes = produto.Tamanhos || produto.sizes || [];
          const formattedSizes = sizes.map(size => ({
            size: size.Tamanho || size.size || 'Único',
            price: size.PrecoTotal || size.price || 0,
            unitPrice: size.PrecoUnitario || size.unitPrice
          }));
          
          const basePrice = formattedSizes[0]?.price || 0;
          const discount = produto.Desconto || produto.discount || 0;
          const finalPrice = discount > 0 ? 
            basePrice * (1 - discount / 100) : basePrice;
          
          return {
            id: produto.Id || produto.id || Math.random().toString(36).substr(2, 9),
            name: produto.Nome || produto.name || 'Produto sem nome',
            description: produto.Descricao || produto.description || 'Descrição não disponível',
            brand: produto.Marca || produto.brand || 'Marca não especificada',
            species: produto.EspecieAnimal || produto.species || 'Cachorro',
            age: produto.IdadeRecomendada || produto.age || 'Todas as idades',
            size: produto.PorteAnimal || produto.size || 'Todos os portes',
            images: [mainImage].filter(Boolean),
            available: true,
            
            sizes: formattedSizes,
            discount: discount,
            
            price: finalPrice,
            oldPrice: discount > 0 ? basePrice : null,
            
            rating: 4.5 + Math.random() * 0.5,
            tag: discount > 0 ? `Promoção ${discount}%` : "Destaque",
            tagClass: discount > 0 ? "sale" : "best-seller"
          };
        });
        
        setFeaturedProducts(produtosFormatados);
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        setError(`Erro ao carregar produtos: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const CountdownTimer = () => {
    const [timeLeft, setTimeLeft] = useState({
      days: 2,
      hours: 12,
      minutes: 45,
      seconds: 0
    });

    useEffect(() => {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          const { days, hours, minutes, seconds } = prev;
          
          if (seconds > 0) return { ...prev, seconds: seconds - 1 };
          if (minutes > 0) return { ...prev, minutes: minutes - 1, seconds: 59 };
          if (hours > 0) return { ...prev, hours: hours - 1, minutes: 59, seconds: 59 };
          if (days > 0) return { ...prev, days: days - 1, hours: 23, minutes: 59, seconds: 59 };
          
          clearInterval(timer);
          return prev;
        });
      }, 1000);

      return () => clearInterval(timer);
    }, []);

    return (
      <div className="countdown">
        {Object.entries(timeLeft).map(([unit, value]) => (
          unit !== 'seconds' && (
            <div key={unit} className="countdown-item">
              <span>{String(value).padStart(2, '0')}</span>
              <small>
                {unit === 'days' ? 'Dias' : 
                 unit === 'hours' ? 'Horas' : 'Min'}
              </small>
            </div>
          )
        ))}
      </div>
    );
  };

  const ProductCard = ({ product }) => {
    const [isFavorite, setIsFavorite] = useState(false);
    const [selectedSize, setSelectedSize] = useState(
      product.sizes[0]?.size || 'Único'
    );

    const currentSize = product.sizes.find(s => s.size === selectedSize) || product.sizes[0];
    const currentPrice = currentSize?.price || product.price;
    const currentOldPrice = product.discount > 0 ? 
      currentPrice / (1 - (product.discount / 100)) : null;

    return (
      <div className="featured-card">
        <div className={`product-tag ${product.tagClass}`}>{product.tag}</div>
        <button 
          className={`favorite-button ${isFavorite ? 'active' : ''}`}
          onClick={() => setIsFavorite(!isFavorite)}
          aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        >
          <FontAwesomeIcon icon={faHeart} />
        </button>
        
        <div className="product-image">
          {product.images[0] ? (
            <img 
              src={product.images[0]} 
              alt={product.name}
              loading="lazy"
            />
          ) : (
            <div className="image-placeholder">
              <FontAwesomeIcon icon={product.species === 'Gato' ? faCat : faDog} />
            </div>
          )}
        </div>
        
        <div className="product-info">
          <h3>{product.name}</h3>
          <div className="product-meta">
            <div className="brand">{product.brand}</div>
            <div className="rating">
              <FontAwesomeIcon icon={faStar} />
              <span>{product.rating.toFixed(1)}</span>
            </div>
          </div>
          
          <p className="description">{product.description}</p>
          
          <div className="specs">
            <span>Espécie: {product.species}</span>
            <span>Idade: {product.age}</span>
            {product.size && <span>Porte: {product.size}</span>}
          </div>
          
          {product.sizes.length > 0 && (
            <div className="size-selector">
              <label>Tamanho/Opção:</label>
              <select 
                value={selectedSize} 
                onChange={(e) => setSelectedSize(e.target.value)}
              >
                {product.sizes.map((size, index) => (
                  <option key={index} value={size.size}>
                    {size.size} - R$ {size.price.toFixed(2).replace('.', ',')}
                    {size.unitPrice && ` (${size.unitPrice.toFixed(2).replace('.', ',')}/kg)`}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div className="price-container">
            <span className="current-price">
              R$ {currentPrice.toFixed(2).replace('.', ',')}
            </span>
            {currentOldPrice && (
              <span className="old-price">
                R$ {currentOldPrice.toFixed(2).replace('.', ',')}
              </span>
            )}
          </div>
          
          <button className="product-button">
            <FontAwesomeIcon icon={faShoppingCart} /> 
            Adicionar ao Carrinho
          </button>
        </div>
      </div>
    );
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
                <FontAwesomeIcon 
                  key={i} 
                  icon={faStar} 
                  className={i < testimonial.rating ? 'filled' : ''} 
                />
              ))}
            </div>
          </div>
        </div>
        <p className="testimonial-content">{testimonial.content}</p>
        <div className="pet-info">
          <FontAwesomeIcon icon={testimonial.petIcon} />
          <span>{testimonial.pet}</span>
        </div>
      </div>
    );
  };

  const CategoryCard = ({ category }) => {
    return (
      <div className="category-card">
        <div className="category-icon">
          <FontAwesomeIcon icon={category.icon} />
        </div>
        <h3>{category.name}</h3>
        <p>{category.description}</p>
        <a href="#!" className="category-link">Ver produtos →</a>
      </div>
    );
  };

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
              <button className="btn-primary">
                <FontAwesomeIcon icon={faShoppingCart} /> Comprar Agora
              </button>
              <button className="btn-secondary">Nossos Serviços</button>
            </div>
            <div className="trust-badges">
              <div className="badge">
                <FontAwesomeIcon icon={faStar} />
                <span>Avaliação 4.9/5</span>
              </div>
              <div className="badge">
                <FontAwesomeIcon icon={faTruck} />
                <span>Entrega Rápida</span>
              </div>
              <div className="badge">
                <FontAwesomeIcon icon={faShieldAlt} />
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
        
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Carregando produtos...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="btn-primary">
              Tentar novamente
            </button>
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="featured-grid">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="no-products">
            <p>Nenhum produto em destaque no momento</p>
            <p className="debug-info">
              (Verifique se existem produtos marcados como "Destaque" no banco de dados)
            </p>
          </div>
        )}
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

      {/* Promo Banner */}
      <section className="promo-banner">
        <div className="promo-content">
          <h2>Black Pet <span>50% OFF</span></h2>
          <p>Aproveite nossa maior promoção do ano em todos os produtos</p>
          <CountdownTimer />
          <button className="btn-promo">Aproveitar Oferta</button>
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
                <FontAwesomeIcon icon={faSmile} />
                <div>
                  <span>+5.000</span>
                  <small>Clientes Satisfeitos</small>
                </div>
              </div>
              <div className="stat-item">
                <FontAwesomeIcon icon={faDog} />
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