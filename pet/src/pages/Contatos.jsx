import React, { useState } from 'react';
import axios from 'axios';
import "../styles/Contatos.css";
import { Phone, Mail, MapPin } from 'lucide-react';

const Contatos = () => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    mensagem: '',
  });

  const [newsletterEmail, setNewsletterEmail] = useState('');

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmitContato = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5005/api/Contato/mensagem', formData);
      alert('Mensagem enviada com sucesso!');
      setFormData({ nome: '', email: '', telefone: '', mensagem: '' });
    } catch (error) {
      console.error(error);
      alert('Erro ao enviar mensagem.');
    }
  };

  const handleSubmitNewsletter = async () => {
    try {
      await axios.post('http://localhost:5005/api/Contato/newsletter', {
        email: newsletterEmail,
      });
      alert('Inscrição na newsletter realizada com sucesso!');
      setNewsletterEmail('');
    } catch (error) {
      console.error(error);
      alert('Erro ao se inscrever na newsletter.');
    }
  };

  return (
    <div className="contact-page">
      <h2 style={{ textAlign: 'center', marginBottom: '40px', color: '#1E1E1E' }}>Entre em Contato</h2>

      <section className="contact-form-section">
        <form className="contact-form" onSubmit={handleSubmitContato}>
          <div className="input-row">
            <input
              type="email"
              name="email"
              placeholder="Seu Email"
              value={formData.email}
              onChange={handleInputChange}
            />
            <input
              type="tel"
              name="telefone"
              placeholder="Seu Telefone"
              value={formData.telefone}
              onChange={handleInputChange}
            />
          </div>
          <input
            type="text"
            name="nome"
            placeholder="Seu Nome"
            value={formData.nome}
            onChange={handleInputChange}
          />
          <textarea
            name="mensagem"
            placeholder="Sua Mensagem..."
            value={formData.mensagem}
            onChange={handleInputChange}
          />
          <button type="submit">Enviar</button>
        </form>

        <div className="newsletter-box">
          <h3>Assine nossa Newsletter</h3>
          <p>Receba novidades, promoções e muito mais diretamente no seu e-mail.</p>
          <input
            type="email"
            placeholder="Seu Email"
            value={newsletterEmail}
            onChange={(e) => setNewsletterEmail(e.target.value)}
          />
          <button onClick={handleSubmitNewsletter}>Assinar</button>
        </div>
      </section>

      <section className="contact-info">
        <div className="info-card">
          <Phone size={24} />
          <p>(+55) 11 98765-4321</p>
          <span>Atendimento de segunda a sexta, das 9h às 18h</span>
        </div>
        <div className="info-card">
          <Mail size={24} />
          <p>contato@seudominio.com</p>
          <span>Envie-nos suas dúvidas ou sugestões</span>
        </div>
        <div className="info-card">
          <MapPin size={24} />
          <p>Rua Exemplo, 123 - São Paulo/SP</p>
          <span>Estamos localizados no centro da cidade</span>
        </div>
      </section>

      <section className="map">
        <iframe
          title="Mapa"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3656.2782357439785!2d-46.63620448485314!3d-23.59209626873106!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce59c44c1a0e9d%3A0x48c35cd8b13c92fc!2sAv.%20Paulista%2C%20São%20Paulo%20-%20SP!5e0!3m2!1spt-BR!2sbr!4v1616596801177!5m2!1spt-BR!2sbr"
          width="100%"
          height="300"
          style={{ border: "0", borderRadius: "16px" }}
          loading="lazy"
        ></iframe>
      </section>
    </div>
  );
};

export default Contatos;
