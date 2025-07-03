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
  faCat
} from '@fortawesome/free-solid-svg-icons';
import '../styles/Home.css';
import dog1 from '../img/img_home.png';
import dogBanner from '../img/banner.jpg';

// Dados mockados
const featuredProducts = [
  {
    id: 1,
    name: "Raçã Premium para Cães Adultos",
    category: "Alimentação",
    price: 129.90,
    oldPrice: 159.90,
    rating: 4.8,
    tag: "Mais Vendido",
    tagClass: "best-seller"
  },
  {
    id: 2,
    name: "Brinquedo Interativo para Gatos",
    category: "Brinquedos",
    price: 59.90,
    rating: 4.9,
    tag: "Novidade",
    tagClass: "new"
  },
  {
    id: 3,
    name: "Kit Higiene Completo",
    category: "Higiene",
    price: 89.90,
    oldPrice: 129.90,
    rating: 4.7,
    tag: "Promoção",
    tagClass: "sale"
  }
];

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
    description: "Raçães, petiscos e suplementos para todas as fases",
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
      <div className="countdown-item">
        <span>{String(timeLeft.days).padStart(2, '0')}</span>
        <small>Dias</small>
      </div>
      <div className="countdown-item">
        <span>{String(timeLeft.hours).padStart(2, '0')}</span>
        <small>Horas</small>
      </div>
      <div className="countdown-item">
        <span>{String(timeLeft.minutes).padStart(2, '0')}</span>
        <small>Min</small>
      </div>
    </div>
  );
};

const ProductCard = ({ product }) => {
  return (
    <div className="featured-card">
      <div className={`product-tag ${product.tagClass}`}>{product.tag}</div>
      <div className="product-image"></div>
      <div className="product-info">
        <h3>{product.name}</h3>
        <div className="product-meta">
          <div className="rating">
            <FontAwesomeIcon icon={faStar} />
            <span>{product.rating}</span>
          </div>
          <div className="category">{product.category}</div>
        </div>
        <div className="price-container">
          <span className="current-price">R$ {product.price.toFixed(2).replace('.', ',')}</span>
          {product.oldPrice && (
            <span className="old-price">R$ {product.oldPrice.toFixed(2).replace('.', ',')}</span>
          )}
        </div>
        <button className="product-button">
          <FontAwesomeIcon icon={faShoppingCart} /> Adicionar ao Carrinho
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
      <div className="testimonial-content">
        <p>{testimonial.content}</p>
      </div>
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

export default function Home() {
  return (
    <div className="home">
      <Helmet>
        <title>PetShop - Produtos Premium para Seu Animal de Estimação</title>
        <meta name="description" content="Encontre os melhores produtos e serviços para o bem-estar do seu pet. Frete grátis em compras acima de R$ 99." />
      </Helmet>

      {/* CABEÇALHO / HERO */}
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
              <button className="btn-primary" aria-label="Comprar produtos agora">
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

      {/* MARCAS PARCEIRAS */}
      <section className="brands-section">
        <h3>Marcas que confiam em nós</h3>
        <div className="brands-carousel">
          {brands.map((brand, index) => (
            <div key={index} className="brand-logo">{brand}</div>
          ))}
        </div>
      </section>

      {/* DESTAQUES */}
      <section className="featured-section">
        <div className="section-header">
          <h2>Nossos <span>Destaques</span></h2>
          <p>Os produtos mais amados pelos nossos clientes</p>
        </div>
        <div className="featured-grid">
          {featuredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* SERVIÇOS / CATEGORIAS */}
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

      {/* DEPOIMENTOS */}
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

      {/* BANNER PROMOCIONAL */}
      <section className="promo-banner">
        <div className="promo-content">
          <h2>Black Pet <span>50% OFF</span></h2>
          <p>Aproveite nossa maior promoção do ano em todos os produtos</p>
          <CountdownTimer />
          <button className="btn-promo">Aproveitar Oferta</button>
        </div>
      </section>

      {/* NOSSA HISTÓRIA */}
      <section className="story-section">
        <div className="story-content">
          <div className="story-text">
            <h2>Nossa <span>História</span></h2>
            <p>Fundada em 2010 por amantes de animais, nossa petshop nasceu da paixão por proporcionar o melhor cuidado para os pets. Começamos como uma pequena loja de bairro e hoje somos referência em qualidade e atendimento.</p>
            <p>Nosso diferencial está na seleção criteriosa de produtos e no atendimento personalizado, onde cada pet é tratado como parte da família.</p>
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
              src={dog1} 
              alt="Equipe da petshop com animais" 
              loading="lazy"
            />
          </div>
        </div>
      </section>
    </div>
  );
}