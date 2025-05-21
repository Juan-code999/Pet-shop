import React from 'react';
import '../styles/Home.css';
import dog1 from '../img/img_home.png';
import dogBanner from '../img/banner.jpg';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHandPaper,
  faDog,
  faPaw,
  faLeaf
} from '@fortawesome/free-solid-svg-icons';

export default function Home() {
  return (
    <div className="home">
      {/* CABEÇALHO / HERO */}
      <header className="header">
        <div className="header-text">
          <h1>Cuidamos do seu pet<br />com carinho e qualidade.</h1>
          <p>
            Na nossa loja você encontra os melhores produtos para o bem-estar do seu pet.<br />
            Compre com segurança e receba em casa!
          </p>
          <button className="btn-primary">Ver Produtos</button>
        </div>

        <div className="header-image">
          <img src={dogBanner} alt="Petshop Banner" />
        </div>
      </header>

      {/* SERVIÇOS / CATEGORIAS */}
      <section className="cards-section">
        <h2>Produtos e Cuidados</h2>
        <div className="cards-container">
          <div className="card">
            <div className="icon-circle">
              <FontAwesomeIcon icon={faHandPaper} />
            </div>
            <h3>Higiene</h3>
            <p>Shampoos, sabonetes e produtos para manter seu pet sempre limpo e cheiroso.</p>
            <a href="#!">Ver mais</a>
          </div>
          <div className="card">
            <div className="icon-circle">
              <FontAwesomeIcon icon={faDog} />
            </div>
            <h3>Brinquedos</h3>
            <p>Diversão garantida com brinquedos seguros e divertidos para cães e gatos.</p>
            <a href="#!">Ver mais</a>
          </div>
          <div className="card">
            <div className="icon-circle">
              <FontAwesomeIcon icon={faPaw} />
            </div>
            <h3>Rações</h3>
            <p>As melhores marcas de ração para todas as fases e portes do seu pet.</p>
            <a href="#!">Ver mais</a>
          </div>
          <div className="card">
            <div className="icon-circle">
              <FontAwesomeIcon icon={faLeaf} />
            </div>
            <h3>Produtos Naturais</h3>
            <p>Cuidados alternativos com ingredientes naturais para a saúde do seu pet.</p>
            <a href="#!">Ver mais</a>
          </div>
        </div>
      </section>

      {/* INFORMAÇÕES ADICIONAIS */}
      <section className="dogs-section">
        <div className="dogs-text">
          <h2>O melhor para o seu pet<br /><span>em um só lugar</span></h2>
          <p>
            Nossa missão é oferecer produtos de qualidade e atendimento diferenciado para garantir o bem-estar do seu companheiro de quatro patas.
          </p>
          <p>
            Contamos com uma variedade de itens: rações, brinquedos, acessórios, produtos de higiene e muito mais. Tudo pensado com carinho e dedicação.
          </p>
          <button className="btn-primary">Conheça a Loja</button>
        </div>
        <div className="dogs-images">
          <img src={dog1} alt="Cachorro feliz" />
        </div>
      </section>
    </div>
  );
}
