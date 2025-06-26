import React from 'react';
import '../styles/Empresa.css';
import heroDog from '../img/Dog_3.png';
import pawIcon from '../img/paws.png';
import pawPrint from '../img/paws1.png';
import puppyImg from '../img/empresa2.png';
import familyDog from '../img/empresa3.png';

export default function Empresa() {
  // Gerador de patinhas ajustado para não sobrepor conteúdo importante
  const generatePaws = (count) => {
    // Definir zonas de exclusão onde não queremos patinhas
    const exclusionZones = [
      // Zona do texto principal (ajuste conforme necessário)
      { x: [0, 60], y: [0, 60] },  // Canto superior esquerdo (texto)
      // Zona da imagem do cachorro (se estiver à direita)
      { x: [60, 100], y: [20, 80] },
      // Zona central inferior (botões)
      { x: [20, 80], y: [60, 100] }
    ];
    
    // Função para verificar se uma posição está em uma zona de exclusão
    const isPositionValid = (x, y) => {
      return !exclusionZones.some(zone => 
        x >= zone.x[0] && x <= zone.x[1] && 
        y >= zone.y[0] && y <= zone.y[1]
      );
    };
    
    return [...Array(count)].map((_, i) => {
      const size = Math.random() * 15 + 10;
      const rotation = Math.random() * 30 - 15;
      const delay = Math.random() * 5;
      const duration = Math.random() * 3 + 3;
      const opacity = Math.random() * 0.3 + 0.2;
      
      // Tentar encontrar uma posição válida
      let left, top;
      let attempts = 0;
      const maxAttempts = 50;
      
      do {
        left = Math.random() * 90 + 5;
        top = Math.random() * 90 + 5;
        attempts++;
      } while (!isPositionValid(left, top) && attempts < maxAttempts);
      
      // Se não encontrar posição válida, pular esta patinha
      if (attempts >= maxAttempts) return null;
      
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
            animation: `paw-float ${duration}s infinite ease-in-out ${delay}s`,
            opacity: opacity,
            left: `${left}%`,
            top: `${top}%`,
            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))',
            zIndex: 1,
            position: 'absolute'
          }}
        />
      );
    }).filter(Boolean); // Filtrar patinhas nulas
  };

  return (
    <div className="empresa-container">
      {/* SEÇÃO HERO */}
      <section className="empresa-hero" aria-labelledby="hero-heading">
        <div className="paw-decorations">
          {generatePaws(15)} {/* Reduzi para 15 patinhas para menos confusão */}
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
              className="hero-dog-image"
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
                className="servico-image"
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
            <div className="transparent-image-container">
              <img 
                src={familyDog} 
                alt="Família brincando com cachorro" 
                className="info-image-transparent"
                loading="lazy"
                width="400"
                height="300"
              />
            </div>
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