import React from 'react';
import '../styles/Empresa.css';
import heroDog from '../img/dog_empresa.png';
import pawIcon from '../img/paws.png';

export default function Empresa() {
  return (
    <div className="empresa-container">
      {/* HERO - SOBRE A EMPRESA */}
      <section className="empresa-hero">
        <div className="empresa-hero-text">
          <h1><span>Especialistas</span><br />em Cuidado Animal</h1>
          <p>
            Somos apaixonados por pets! Na nossa loja, você encontra tudo o que seu melhor amigo precisa: carinho, produtos de qualidade e atendimento diferenciado.
          </p>
          <div className="empresa-buttons">
            <button className="empresa-btn-orange">Conheça Agora</button>
            <button className="empresa-btn-white">Fale Conosco</button>
          </div>
        </div>
        <div className="empresa-hero-image">
          <img src={heroDog} alt="Cães felizes" />
          <img className="empresa-paw paw1" src={pawIcon} alt="Patinha" />
          <img className="empresa-paw paw2" src={pawIcon} alt="Patinha" />
          <img className="empresa-paw paw3" src={pawIcon} alt="Patinha" />
        </div>
      </section>

      {/* SERVIÇOS / MISSÃO DA EMPRESA */}
      <section className="empresa-servicos">
        <h2>Mais que uma loja, um cuidado especial</h2>
        <p>Nosso compromisso vai além da venda. Queremos proporcionar bem-estar e felicidade para o seu pet todos os dias.</p>

        <div className="empresa-servicos-grid">
          <div className="empresa-servico-img">
            <img src="/images/puppy2.png" alt="Filhote feliz" />
          </div>

          <div className="empresa-servico-card">
            <h3>Produtos de Qualidade</h3>
            <p>Selecionamos os melhores itens do mercado, com foco na saúde e segurança dos animais.</p>
            <button>Ver Produtos</button>
          </div>

          <div className="empresa-servico-card">
            <h3>Atendimento Especializado</h3>
            <p>Nossa equipe é treinada para ajudar você a escolher o melhor para seu companheiro de quatro patas.</p>
            <button>Fale com um Especialista</button>
          </div>
        </div>
      </section>

      {/* INFORMAÇÕES ADICIONAIS */}
      <section className="empresa-info">
        <div className="empresa-info-texto">
          <h2>Por que escolher a nossa Petshop?</h2>
          <p>Somos apaixonados por pets e nossa missão é garantir que cada animal receba o cuidado e carinho que merece.</p>
          <ul>
            <li>Quem somos</li>
            <li>Adoção de pets</li>
            <li>Serviços e produtos exclusivos</li>
          </ul>
          <img src="/images/family-dog.png" alt="Família com cachorro" />
        </div>

        <div className="empresa-info-cta">
          <h3>Atendimento com Amor e Responsabilidade</h3>
          <p>
            Seja na escolha da ração ideal, em um acessório novo ou nos nossos serviços de cuidados, estamos prontos para ajudar.
            Conte com uma equipe dedicada, pronta para orientar você em cada etapa. Venha nos visitar ou entre em contato online!
          </p>
          <button>Entre em Contato</button>
        </div>
      </section>
    </div>
  );
}
