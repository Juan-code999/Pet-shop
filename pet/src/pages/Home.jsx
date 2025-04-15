import React, { useRef } from "react";
import "../styles/Home.css";
import { Link } from "react-router-dom";
import {
  FaRocket,
  FaClipboardList,
  FaDog,
  FaShieldAlt,
  FaBath,
  FaHeart,
  FaSyringe,
  FaArrowLeft,
  FaArrowRight
} from "react-icons/fa";

const Home = () => {
  const scrollRef = useRef(null);

  const scrollLeft = () => {
    scrollRef.current.scrollBy({ left: -320, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollRef.current.scrollBy({ left: 320, behavior: "smooth" });
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-overlay">
          <div className="hero-text">
            <h1>Cuidado, Carinho e Confiança para seu Pet</h1>
            <p>
              Oferecemos banho, tosa e serviços personalizados para deixar seu pet sempre feliz e saudável.
            </p>
            <div className="cta-buttons">
              <Link className="cta-button" to="/agendar">
                <FaRocket className="button-icon" />
                Agendar Serviço
              </Link>
              <Link className="cta-button secondary" to="/servicos">
                <FaClipboardList className="button-icon" />
                Ver Serviços
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Cuidados Section */}
      <div className="cuidados">
        <h2 className="titulo">Cuidados com seu Pet</h2>
        <div className="nav-btns">
          <button className="btn-nav" onClick={scrollLeft}>
            <FaArrowLeft />
          </button>
          <button className="btn-nav purple" onClick={scrollRight}>
            <FaArrowRight />
          </button>
        </div>

        <div className="cards-container" ref={scrollRef}>
          <div className="card">
            <div className="cabecalho">
              <FaBath />
              Higiene
            </div>
            <div className="card-title">Banhos Regulares</div>
            <div className="descricao">Mantenha seu pet limpinho com banhos especiais para cada tipo de pelagem.</div>
            <button className="btn-agendar">Agendar Banho</button>
            <button className="btn-saiba">Saiba Mais</button>
          </div>

          <div className="card">
            <div className="cabecalho">
              <FaDog />
              Tosa
            </div>
            <div className="card-title">Tosa com estilo</div>
            <div className="descricao">Tosa higiênica, na tesoura ou estilizada para manter seu pet confortável e lindo.</div>
            <button className="btn-agendar">Agendar Tosa</button>
            <button className="btn-saiba">Saiba Mais</button>
          </div>

          <div className="card">
            <div className="cabecalho">
              <FaShieldAlt />
              Proteção
            </div>
            <div className="card-title">Produtos de Qualidade</div>
            <div className="descricao">Usamos shampoos, perfumes e produtos dermatologicamente testados e seguros.</div>
            <button className="btn-agendar">Ver Produtos</button>
            <button className="btn-saiba">Saiba Mais</button>
          </div>

          <div className="card">
            <div className="cabecalho">
              <FaSyringe />
              Vacinação
            </div>
            <div className="card-title">Vacinas em dia</div>
            <div className="descricao">Manter a vacinação em dia é essencial para a saúde do seu pet.</div>
            <button className="btn-agendar">Ver Calendário</button>
            <button className="btn-saiba">Saiba Mais</button>
          </div>

          <div className="card">
            <div className="cabecalho">
              <FaHeart />
              Bem-estar
            </div>
            <div className="card-title">Amor e atenção</div>
            <div className="descricao">Cuidamos do seu pet como se fosse da nossa família, com carinho e responsabilidade.</div>
            <button className="btn-agendar">Agendar Visita</button>
            <button className="btn-saiba">Saiba Mais</button>
          </div>
        </div>

        {/* Botão Agendamentos */}
        <div className="btn-agendamentos-wrapper">
          <Link to="/agendamentos" className="btn-agendamentos">
            Ver Agendamentos
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
