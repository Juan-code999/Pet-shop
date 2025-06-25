import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiMail, FiPhone, FiUser, FiMessageSquare, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import "../styles/Contatos.css";

const Contatos = () => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    mensagem: '',
  });

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNewsletterSubmitting, setIsNewsletterSubmitting] = useState(false);
  
  const [feedback, setFeedback] = useState({
    show: false,
    message: '',
    type: ''
  });

  const showFeedback = (message, type) => {
    setFeedback({
      show: true,
      message,
      type
    });
    setTimeout(() => setFeedback({ ...feedback, show: false }), 5000);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmitContato = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const usuarioId = localStorage.getItem('usuarioId');
    if (!usuarioId) {
      showFeedback('Você precisa estar logado para enviar uma mensagem.', 'error');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5005/api/Contato/mensagem', {
        ...formData,
        usuarioId,
      });
      
      if (response.status === 200) {
        showFeedback('Mensagem enviada com sucesso!', 'success');
        setFormData({ nome: '', email: '', telefone: '', mensagem: '' });
      } else {
        showFeedback('Ocorreu um erro ao enviar a mensagem.', 'error');
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      let errorMessage = 'Erro ao enviar mensagem.';
      
      if (error.response) {
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else {
          errorMessage = `Erro ${error.response.status}: ${error.response.statusText}`;
        }
      } else if (error.request) {
        errorMessage = 'Sem resposta do servidor. Verifique sua conexão.';
      }
      
      showFeedback(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitNewsletter = async () => {
    if (!newsletterEmail) {
      showFeedback('Por favor, insira um e-mail válido.', 'error');
      return;
    }
    
    setIsNewsletterSubmitting(true);
    try {
      const response = await axios.post('http://localhost:5005/api/Contato/newsletter', {
        email: newsletterEmail,
      });
      
      if (response.status === 200) {
        showFeedback('Inscrição na newsletter realizada com sucesso!', 'success');
        setNewsletterEmail('');
      } else {
        showFeedback('Ocorreu um erro ao se inscrever.', 'error');
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      let errorMessage = 'Erro ao se inscrever na newsletter.';
      
      if (error.response) {
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else {
          errorMessage = `Erro ${error.response.status}: ${error.response.statusText}`;
        }
      } else if (error.request) {
        errorMessage = 'Sem resposta do servidor. Verifique sua conexão.';
      }
      
      showFeedback(errorMessage, 'error');
    } finally {
      setIsNewsletterSubmitting(false);
    }
  };

  const feedbackVariants = {
    hidden: { x: -50, opacity: 0 },
    visible: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 }
  };

  return (
    <motion.div 
      className="contact-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.h2 
        className="contact-title"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Entre em Contato
      </motion.h2>

      <AnimatePresence>
        {feedback.show && (
          <motion.div
            className={`feedback-message ${feedback.type}`}
            variants={feedbackVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            {feedback.type === 'success' ? (
              <FiCheckCircle className="feedback-icon" />
            ) : (
              <FiAlertCircle className="feedback-icon" />
            )}
            {feedback.message}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.section 
        className="contact-form-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
      >
        <motion.form 
          className="contact-form" 
          onSubmit={handleSubmitContato}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          whileHover={{ scale: 1.01 }}
        >
          <div className="form-group">
            <div className="input-container">
              <FiUser className="input-icon" />
              <motion.input
                type="text"
                name="nome"
                placeholder="Seu Nome"
                value={formData.nome}
                onChange={handleInputChange}
                required
                whileFocus={{ boxShadow: "0 0 0 2px #3B82F6" }}
              />
            </div>
          </div>

          <div className="input-row">
            <div className="form-group">
              <div className="input-container">
                <FiMail className="input-icon" />
                <motion.input
                  type="email"
                  name="email"
                  placeholder="Seu Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  whileFocus={{ boxShadow: "0 0 0 2px #3B82F6" }}
                />
              </div>
            </div>
            <div className="form-group">
              <div className="input-container">
                <FiPhone className="input-icon" />
                <motion.input
                  type="tel"
                  name="telefone"
                  placeholder="Seu Telefone"
                  value={formData.telefone}
                  onChange={handleInputChange}
                  required
                  whileFocus={{ boxShadow: "0 0 0 2px #3B82F6" }}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <div className="input-container">
              <FiMessageSquare className="textarea-icon" />
              <motion.textarea
                name="mensagem"
                placeholder="Sua Mensagem..."
                value={formData.mensagem}
                onChange={handleInputChange}
                required
                whileFocus={{ boxShadow: "0 0 0 2px #3B82F6" }}
              />
            </div>
          </div>

          <motion.button 
            type="submit"
            className="submit-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isSubmitting}
          >
            <FiSend className="button-icon" />
            {isSubmitting ? 'Enviando...' : 'Enviar Mensagem'}
          </motion.button>
        </motion.form>

        <motion.div 
          className="newsletter-box"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          whileHover={{ y: -5 }}
        >
          <div className="newsletter-header">
            <FiMail className="newsletter-icon" />
            <h3>Assine nossa Newsletter</h3>
          </div>
          <p>Receba novidades, promoções e muito mais diretamente no seu e-mail.</p>
          
          <div className="newsletter-input-container">
            <FiMail className="input-icon" />
            <motion.input
              type="email"
              placeholder="Seu Email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              whileFocus={{ boxShadow: "0 0 0 2px #3B82F6" }}
            />
          </div>
          <motion.button 
            className="newsletter-button"
            onClick={handleSubmitNewsletter}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isNewsletterSubmitting}
          >
            <FiSend className="button-icon" />
            {isNewsletterSubmitting ? 'Assinando...' : 'Assinar Newsletter'}
          </motion.button>
        </motion.div>
      </motion.section>
    </motion.div>
  );
};

export default Contatos;