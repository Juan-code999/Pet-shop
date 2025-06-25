import React from 'react';
import '../styles/Empresa.css';
import heroDog from '../img/Dog_3.png';
import pawIcon from '../img/paws.png';
import pawPrint from '../img/paws.png';
import puppyImg from '../img/Dog_3.png';
import familyDog from '../img/Dog_3.png';

export default function Empresa() {
  // Gerador de patinhas dinâmicas
  const generatePaws = (count) => {
    return [...Array(count)].map((_, i) => {
      const size = Math.random() * 20 + 15;
      const rotation = Math.random() * 30 - 15;
      const delay = Math.random() * 3;
      const left = Math.random() * 90 + 5;
      const top = Math.random() * 90 + 5;
      
      return (
        <img 
          key={`paw-${i}`}
          src={i % 2 === 0 ? pawIcon : pawPrint}
          className="paw"
          alt=""
          aria-hidden="true"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            transform: `rotate(${rotation}deg)`,
            animationDelay: `${delay}s`,
            opacity: 0.7 - (i * 0.03),
            left: `${left}%`,
            top: `${top}%`
          }}
        />
      );
    });
  };

  return (
    <div className="empresa-container">
      {/* SEÇÃO HERO */}
      <section className="empresa-hero" aria-labelledby="hero-heading">
        <div className="paw-decorations">
          {generatePaws(15)}
        </div>

        <div className="empresa-hero-content">
          <div className="empresa-hero-text">
            <h1 id="hero-heading">
              <span className="highlight">Especialistas</span><br />
              em Cuidado Animal
            </h1>
            <p className="hero-description">
              Somos apaixonados por pets! Na nossa loja, você encontra tudo o que seu melhor amigo precisa.
            </p>
            <div className="empresa-buttons">
              <button className="empresa-btn-primary">Conheça Agora</button>
              <button className="empresa-btn-secondary">Fale Conosco</button>
            </div>
          </div>
          <div className="empresa-hero-image">
            <img 
              src={heroDog} 
              alt="Cachorro sorrindo" 
              loading="lazy"
              width="500"
              height="500"
            />
          </div>
        </div>
      </section>

      {/* SEÇÃO SERVIÇOS */}
      <section className="empresa-servicos" aria-labelledby="services-heading">
        <div className="servicos-container">
          <header className="servicos-header">
            <h2 id="services-heading">Mais que uma loja, um cuidado especial</h2>
            <p className="servicos-subtitle">
              Nosso compromisso vai além da venda. Queremos proporcionar bem-estar e felicidade para o seu pet.
            </p>
          </header>

          <div className="empresa-servicos-grid">
            <div className="empresa-servico-img">
              <img 
                src={puppyImg} 
                alt="Filhote de cachorro feliz" 
                loading="lazy"
                width="300"
                height="300"
              />
            </div>

            <article className="empresa-servico-card">
              <h3>Produtos de Qualidade</h3>
              <p>
                Selecionamos os melhores itens do mercado, com foco na saúde e segurança dos animais.
              </p>
              <button className="servico-card-btn">Ver Produtos</button>
            </article>

            <article className="empresa-servico-card">
              <h3>Atendimento Especializado</h3>
              <p>
                Nossa equipe é treinada para ajudar você a escolher o melhor para seu companheiro.
              </p>
              <button className="servico-card-btn">Fale com um Especialista</button>
            </article>
          </div>
        </div>
      </section>

      {/* SEÇÃO INFORMAÇÕES */}
      <section className="empresa-info" aria-labelledby="info-heading">
        <div className="info-container">
          <article className="empresa-info-texto">
            <h2 id="info-heading">Por que escolher a nossa Petshop?</h2>
            <p className="info-description">
              Somos apaixonados por pets e nossa missão é garantir o melhor cuidado para seu animal.
            </p>
            <ul className="info-list">
              <li className="info-list-item">Quem somos</li>
              <li className="info-list-item">Adoção de pets</li>
              <li className="info-list-item">Serviços exclusivos</li>
            </ul>
            <img 
              src={familyDog} 
              alt="Família brincando com cachorro" 
              className="info-image"
              loading="lazy"
              width="400"
              height="300"
            />
          </article>

          <aside className="empresa-info-cta" aria-labelledby="cta-heading">
            <h3 id="cta-heading">Atendimento com Amor e Responsabilidade</h3>
            <p className="cta-description">
              Conte com uma equipe dedicada, pronta para orientar você em cada etapa.
            </p>
            <button className="cta-button">Entre em Contato</button>
          </aside>
        </div>
      </section>
    </div>
  );
}