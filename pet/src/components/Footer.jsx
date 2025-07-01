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
    <footer className="footer-premium">
      <div className="footer-wave"></div>
      
      <div className="footer-container">
        {/* Brand Column */}
        <div className="footer-brand-col">
          <div className="footer-brand">
            <Link to="/" className="logo-wrapper">
              <img src={logo} alt="Lat Miau" className="footer-logo" />
              <span className="logo-text">Lat Miau</span>
            </Link>
            <p className="brand-slogan">
              Transformando ideias em soluções digitais de alto impacto.
            </p>
            
            <div className="footer-newsletter">
              <h4>Assine nossa newsletter</h4>
              <div className="newsletter-form">
                <input type="email" placeholder="Seu melhor e-mail" />
                <button type="submit">
                  <FaEnvelope />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Links Columns */}
        <div className="footer-links-grid">
          {/* Services */}
          <div className="footer-links-col">
            <h3 className="links-title">Serviços</h3>
            <ul className="footer-links">
              <li><Link to="/desenvolvimento">Desenvolvimento Web</Link></li>
              <li><Link to="/mobile">Aplicativos Mobile</Link></li>
              <li><Link to="/marketing">Marketing Digital</Link></li>
              <li><Link to="/consultoria">Consultoria TI</Link></li>
              <li><Link to="/suporte">Suporte 24/7</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div className="footer-links-col">
            <h3 className="links-title">Empresa</h3>
            <ul className="footer-links">
              <li><Link to="/sobre">Sobre Nós</Link></li>
              <li><Link to="/equipe">Nossa Equipe</Link></li>
              <li><Link to="/portfolio">Portfólio</Link></li>
              <li><Link to="/blog">Blog</Link></li>
              <li><Link to="/trabalhe-conosco">Carreiras</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="footer-links-col">
            <h3 className="links-title">Suporte</h3>
            <ul className="footer-links">
              <li><Link to="/contato">Contato</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/politica">Política de Privacidade</Link></li>
              <li><Link to="/termos">Termos de Serviço</Link></li>
              <li><Link to="/sitemap">Mapa do Site</Link></li>
            </ul>
          </div>
        </div>

        {/* Contact Column */}
        <div className="footer-contact-col">
          <h3 className="contact-title">Fale Conosco</h3>
          
          <div className="contact-info">
            <div className="contact-item">
              <div className="contact-icon">
                <FaPhone />
              </div>
              <div>
                <h4>Telefone</h4>
                <p>(11) 98765-4321</p>
              </div>
            </div>
            
            <div className="contact-item">
              <div className="contact-icon">
                <FaEnvelope />
              </div>
              <div>
                <h4>E-mail</h4>
                <p>contato@latmiau.com.br</p>
              </div>
            </div>
            
            <div className="contact-item">
              <div className="contact-icon">
                <FaMapMarkerAlt />
              </div>
              <div>
                <h4>Endereço</h4>
                <p>Av. Paulista, 1000 - São Paulo/SP</p>
              </div>
            </div>
            
            <div className="contact-item">
              <div className="contact-icon">
                <FiClock />
              </div>
              <div>
                <h4>Horário</h4>
                <p>Seg-Sex: 9h às 18h</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <div className="copyright">
            © {new Date().getFullYear()} Lat Miau. Todos os direitos reservados.
          </div>
          
          <div className="social-links">
            <a href="#" aria-label="Facebook"><FaFacebookF /></a>
            <a href="#" aria-label="Instagram"><FaInstagram /></a>
            <a href="#" aria-label="LinkedIn"><FaLinkedinIn /></a>
            <a href="#" aria-label="Twitter"><FaTwitter /></a>
            <a href="#" aria-label="YouTube"><FaYoutube /></a>
          </div>
          
          <div className="payment-methods">
            <span className="payment-label">Métodos de pagamento:</span>
            <div className="payment-icons">
              <span className="payment-icon" title="Visa"><FaCcVisa /></span>
              <span className="payment-icon" title="Mastercard"><FaCcMastercard /></span>
              <span className="payment-icon" title="Boleto"><FaBarcode /></span>
              <span className="payment-icon" title="Pix"><SiPix /></span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;