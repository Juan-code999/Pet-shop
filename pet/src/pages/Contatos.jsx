import React, { useState } from 'react';
import axios from 'axios';
import "../styles/Contatos.css";

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

    // Pega o usuarioId do localStorage
    const usuarioId = localStorage.getItem('usuarioId');
    if (!usuarioId) {
      alert('Você precisa estar logado para enviar uma mensagem.');
      return;
    }

    try {
      await axios.post('http://localhost:5005/api/Contato/mensagem', {
        ...formData,
        usuarioId,  // envia o usuarioId junto
      });
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
              required
            />
            <input
              type="tel"
              name="telefone"
              placeholder="Seu Telefone"
              value={formData.telefone}
              onChange={handleInputChange}
              required
            />
          </div>
          <input
            type="text"
            name="nome"
            placeholder="Seu Nome"
            value={formData.nome}
            onChange={handleInputChange}
            required
          />
          <textarea
            name="mensagem"
            placeholder="Sua Mensagem..."
            value={formData.mensagem}
            onChange={handleInputChange}
            required
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
    </div>
  );
};

export default Contatos;
