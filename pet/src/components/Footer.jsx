import React from "react";
import { 
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaFacebookF, 
  FaInstagram, 
  FaLinkedinIn,
  FaTwitter,
  FaYoutube,
  FaCcVisa,
  FaCcMastercard,
  FaBarcode,
  FaQrcode
} from "react-icons/fa";
import { FiClock } from "react-icons/fi";
import { SiPix } from "react-icons/si";
import { Link } from "react-router-dom";
import logo from '../img/logo.png';
import "../styles/Footer.css";

const Footer = () => {
  return (
    <footer className="pet-footer-premium">
      <div className="pet-footer-wave"></div>
      
      <div className="pet-footer-container">
        {/* Brand Column */}
        <div className="pet-footer-brand-col">
          <div className="pet-footer-brand">
            <Link to="/" className="pet-logo-wrapper">
              <img src={logo} alt="Lat Miau" className="pet-footer-logo" />
              <span className="pet-logo-text">Lat Miau</span>
            </Link>
            <p className="pet-brand-slogan">
              Os melhores produtos para seu pet com qualidade premium.
            </p>
            
            <div className="pet-footer-newsletter">
              <h4>Assine nossa newsletter</h4>
              <div className="pet-newsletter-form">
                <input type="email" placeholder="Seu melhor e-mail" />
                <button type="submit">
                  <FaEnvelope />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Links Columns */}
        <div className="pet-footer-links-grid">
          {/* Products */}
          <div className="pet-footer-links-col">
            <h3 className="pet-links-title">Produtos</h3>
            <ul className="pet-footer-links">
              <li><Link to="/racao">Ração Premium</Link></li>
              <li><Link to="/brinquedos">Brinquedos</Link></li>
              <li><Link to="/higiene">Higiene & Cuidados</Link></li>
              <li><Link to="/acessorios">Acessórios</Link></li>
              <li><Link to="/casinhas">Casinhas & Caminhas</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div className="pet-footer-links-col">
            <h3 className="pet-links-title">Empresa</h3>
            <ul className="pet-footer-links">
              <li><Link to="/sobre">Sobre Nós</Link></li>
              <li><Link to="/equipe">Nossa Equipe</Link></li>
              <li><Link to="/lojas">Nossas Lojas</Link></li>
              <li><Link to="/blog">Blog</Link></li>
              <li><Link to="/trabalhe-conosco">Carreiras</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="pet-footer-links-col">
            <h3 className="pet-links-title">Suporte</h3>
            <ul className="pet-footer-links">
              <li><Link to="/contato">Contato</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/politica">Política de Privacidade</Link></li>
              <li><Link to="/termos">Termos de Serviço</Link></li>
              <li><Link to="/sitemap">Mapa do Site</Link></li>
            </ul>
          </div>
        </div>

        {/* Contact Column */}
        <div className="pet-footer-contact-col">
          <h3 className="pet-contact-title">Fale Conosco</h3>
          
          <div className="pet-contact-info">
            <div className="pet-contact-item">
              <div className="pet-contact-icon">
                <FaPhone />
              </div>
              <div>
                <h4>Telefone</h4>
                <p>(11) 98765-4321</p>
              </div>
            </div>
            
            <div className="pet-contact-item">
              <div className="pet-contact-icon">
                <FaEnvelope />
              </div>
              <div>
                <h4>E-mail</h4>
                <p>contato@latmiau.com.br</p>
              </div>
            </div>
            
            <div className="pet-contact-item">
              <div className="pet-contact-icon">
                <FaMapMarkerAlt />
              </div>
              <div>
                <h4>Endereço</h4>
                <p>Av. Paulista, 1000 - São Paulo/SP</p>
              </div>
            </div>
            
            <div className="pet-contact-item">
              <div className="pet-contact-icon">
                <FiClock />
              </div>
              <div>
                <h4>Horário</h4>
                <p>Seg-Sab: 9h às 18h</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="pet-footer-bottom">
        <div className="pet-footer-bottom-container">
          <div className="pet-copyright">
            © {new Date().getFullYear()} Lat Miau. Todos os direitos reservados.
          </div>
          
          <div className="pet-social-links">
            <a href="#" aria-label="Facebook"><FaFacebookF /></a>
            <a href="#" aria-label="Instagram"><FaInstagram /></a>
            <a href="#" aria-label="LinkedIn"><FaLinkedinIn /></a>
            <a href="#" aria-label="Twitter"><FaTwitter /></a>
            <a href="#" aria-label="YouTube"><FaYoutube /></a>
          </div>
          
          <div className="pet-payment-methods">
            <span className="pet-payment-label">Métodos de pagamento:</span>
            <div className="pet-payment-icons">
              <span className="pet-payment-icon" title="Visa"><FaCcVisa /></span>
              <span className="pet-payment-icon" title="Mastercard"><FaCcMastercard /></span>
              <span className="pet-payment-icon" title="Boleto"><FaBarcode /></span>
              <span className="pet-payment-icon" title="Pix"><SiPix /></span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;