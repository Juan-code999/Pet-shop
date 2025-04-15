import React from "react";
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";
import "../styles/Footer.css";

const Footer = () => {
  return (
    <footer className="Footer__Container">
      <div className="Footer__Content">
        {/* Logo e descrição */}
        <div className="Footer__Section Footer__Brand">
          <img src="src/img/logo.png" alt="Logo" className="Footer__Logo" />
          <p>Assistência Técnica especializada em manutenção e suporte para computadores e notebooks.</p>
        </div>

        {/* Links Rápidos */}
        <div className="Footer__Section">
          <h3>Links Rápidos</h3>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/projetos">Projetos</a></li>
            <li><a href="/conta">Contatos</a></li>
            <li><a href="/empresa">Empresa</a></li>
          </ul>
        </div>

        {/* Contato */}
        <div className="Footer__Section">
          <h3>Contato</h3>
          <p><FaPhone /> (11) 99999-9999</p>
          <p><FaEnvelope /> suporte@assistenciatech.com</p>
          <p><FaMapMarkerAlt /> Rua Exemplo, 123 - São Paulo, SP</p>
        </div>

        {/* Redes Sociais */}
        <div className="Footer__Section">
          <h3>Redes Sociais</h3>
          <div className="Footer__Socials">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FaFacebook /></a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="Footer__Bottom">
        <p>© 2024 AssistênciaTech - Todos os direitos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
