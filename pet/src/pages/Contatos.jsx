import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSend, FiMail, FiPhone, FiUser, 
  FiMessageSquare, FiCheckCircle, 
  FiAlertCircle, FiLoader, FiX,
  FiClock, FiMapPin, FiInstagram,
  FiFacebook, FiLinkedin, FiTwitter
} from 'react-icons/fi';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import '../styles/Contatos.css';

const contactSchema = yup.object().shape({
  nome: yup.string()
    .required('Nome é obrigatório')
    .min(3, 'Mínimo 3 caracteres')
    .max(100, 'Máximo 100 caracteres'),
  email: yup.string()
    .required('Email é obrigatório')
    .email('Email inválido')
    .max(100, 'Máximo 100 caracteres'),
  telefone: yup.string()
    .required('Telefone é obrigatório')
    .matches(/^\(\d{2}\) \d{4,5}-\d{4}$/, 'Formato inválido (00) 00000-0000'),
  mensagem: yup.string()
    .required('Mensagem é obrigatória')
    .min(10, 'Mínimo 10 caracteres')
    .max(1000, 'Máximo 1000 caracteres')
});

const newsletterSchema = yup.object().shape({
  email: yup.string()
    .required('Email é obrigatório')
    .email('Email inválido')
    .max(100, 'Máximo 100 caracteres')
});

const Contatos = () => {
  const [loading, setLoading] = useState(false);
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('contato');
  const [feedback, setFeedback] = useState({
    show: false,
    message: '',
    type: '',
    id: 0
  });
  
  const API_BASE_URL = 'https://pet-shop-eiab.onrender.com/api/Contato';
  const CONTACT_INFO = {
    email: 'contato@seusite.com',
    phone: '(11) 99999-9999',
    hours: 'Seg-Sex: 9h às 18h',
    address: 'Av. Paulista, 1000 - São Paulo/SP'
  };

  const { 
    register: registerContact,
    handleSubmit: handleContactSubmit,
    control,
    reset: resetContact,
    formState: { errors: contactErrors }
  } = useForm({ 
    resolver: yupResolver(contactSchema),
    mode: 'onBlur'
  });

  const { 
    register: registerNewsletter,
    handleSubmit: handleNewsletterSubmit,
    reset: resetNewsletter,
    formState: { errors: newsletterErrors }
  } = useForm({ 
    resolver: yupResolver(newsletterSchema),
    mode: 'onBlur'
  });

  const showFeedback = useCallback((message, type) => {
    const id = Date.now();
    setFeedback({ show: true, message, type, id });
    
    setTimeout(() => {
      setFeedback(prev => prev.id === id ? { ...prev, show: false } : prev);
    }, 5000);
  }, []);

  useEffect(() => {
    return () => {
      setFeedback({ show: false, message: '', type: '', id: 0 });
    };
  }, []);

  const onSubmitContact = async (data) => {
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/mensagem`, {
        usuarioId: localStorage.getItem('usuarioId') || null,
        email: data.email,
        telefone: data.telefone,
        nome: data.nome,
        mensagem: data.mensagem
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 200) {
        showFeedback('Mensagem enviada com sucesso!', 'success');
        resetContact();
      }
    } catch (error) {
      console.error('Erro ao enviar:', error);
      const errorMessage = error.response?.data?.message || 
        error.response?.data?.error || 
        'Erro ao enviar mensagem. Tente novamente mais tarde.';
      showFeedback(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const onSubmitNewsletter = async ({ email }) => {
    setNewsletterLoading(true);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/newsletter`, { 
        email 
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 200) {
        showFeedback('Inscrição realizada com sucesso!', 'success');
        resetNewsletter();
      }
    } catch (error) {
      console.error('Erro na newsletter:', error);
      
      let errorMessage = 'Erro ao inscrever na newsletter. Tente novamente mais tarde.';
      
      if (error.response?.status === 409) {
        errorMessage = 'Este email já está cadastrado na nossa newsletter!';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      showFeedback(errorMessage, 'error');
    } finally {
      setNewsletterLoading(false);
    }
  };

  const tabVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  const feedbackVariants = {
    hidden: { x: 50, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { type: 'spring', damping: 25 }
    },
    exit: { x: 50, opacity: 0 }
  };

  return (
    <motion.div 
      className="contact-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <header className="contact-header">
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring' }}
        >
          Fale Conosco
        </motion.h1>
        <motion.p
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="contact-subtitle"
        >
          Estamos aqui para ajudar com qualquer dúvida ou solicitação
        </motion.p>
      </header>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'contato' ? 'active' : ''}`}
          onClick={() => setActiveTab('contato')}
          aria-selected={activeTab === 'contato'}
          aria-controls="contato-tabpanel"
        >
          Contato
        </button>
        <button
          className={`tab ${activeTab === 'newsletter' ? 'active' : ''}`}
          onClick={() => setActiveTab('newsletter')}
          aria-selected={activeTab === 'newsletter'}
          aria-controls="newsletter-tabpanel"
        >
          Newsletter
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          variants={tabVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="tab-content"
          id={`${activeTab}-tabpanel`}
          role="tabpanel"
          aria-labelledby={`${activeTab}-tab`}
        >
          {activeTab === 'contato' ? (
            <div className="contact-content">
              <motion.form
                onSubmit={handleContactSubmit(onSubmitContact)}
                className="contact-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                noValidate
              >
                <div className="form-group">
                  <label htmlFor="nome">
                    Nome Completo <span className="required">*</span>
                  </label>
                  <div className={`input-container ${contactErrors.nome ? 'error' : ''}`}>
                    <FiUser className="input-icon" />
                    <input
                      id="nome"
                      type="text"
                      {...registerContact('nome')}
                      placeholder="Seu nome completo"
                      aria-invalid={contactErrors.nome ? "true" : "false"}
                      aria-describedby="nome-error"
                    />
                  </div>
                  {contactErrors.nome && (
                    <span id="nome-error" className="error-message" role="alert">
                      {contactErrors.nome.message}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="email">
                    Email <span className="required">*</span>
                  </label>
                  <div className={`input-container ${contactErrors.email ? 'error' : ''}`}>
                    <FiMail className="input-icon" />
                    <input
                      id="email"
                      type="email"
                      {...registerContact('email')}
                      placeholder="seu@email.com"
                      aria-invalid={contactErrors.email ? "true" : "false"}
                      aria-describedby="email-error"
                    />
                  </div>
                  {contactErrors.email && (
                    <span id="email-error" className="error-message" role="alert">
                      {contactErrors.email.message}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="telefone">
                    Telefone <span className="required">*</span>
                  </label>
                  <div className={`input-container ${contactErrors.telefone ? 'error' : ''}`}>
                    <FiPhone className="input-icon" />
                    <Controller
                      name="telefone"
                      control={control}
                      render={({ field }) => (
                        <input
                          id="telefone"
                          type="tel"
                          {...field}
                          placeholder="(00) 00000-0000"
                          aria-invalid={contactErrors.telefone ? "true" : "false"}
                          aria-describedby="telefone-error"
                          onChange={(e) => {
                            const value = e.target.value
                              .replace(/\D/g, '')
                              .replace(/(\d{2})(\d)/, '($1) $2')
                              .replace(/(\d{5})(\d)/, '$1-$2')
                              .replace(/(-\d{4})\d+?$/, '$1');
                            field.onChange(value);
                          }}
                        />
                      )}
                    />
                  </div>
                  {contactErrors.telefone && (
                    <span id="telefone-error" className="error-message" role="alert">
                      {contactErrors.telefone.message}
                    </span>
                  )}
                </div>

                <div className="form-group full-width">
                  <label htmlFor="mensagem">
                    Mensagem <span className="required">*</span>
                  </label>
                  <div className={`input-container ${contactErrors.mensagem ? 'error' : ''}`}>
                    <FiMessageSquare className="input-icon" />
                    <textarea
                      id="mensagem"
                      {...registerContact('mensagem')}
                      placeholder="Como podemos ajudar?"
                      rows="5"
                      aria-invalid={contactErrors.mensagem ? "true" : "false"}
                      aria-describedby="mensagem-error"
                    />
                  </div>
                  {contactErrors.mensagem && (
                    <span id="mensagem-error" className="error-message" role="alert">
                      {contactErrors.mensagem.message}
                    </span>
                  )}
                </div>

                <input 
                  type="text" 
                  name="honeypot" 
                  style={{ display: 'none' }} 
                  tabIndex="-1"
                  autoComplete="off"
                />

                <motion.button
                  type="submit"
                  className="submit-button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                  aria-busy={loading}
                >
                  {loading ? (
                    <>
                      <FiLoader className="spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <FiSend />
                      Enviar Mensagem
                    </>
                  )}
                </motion.button>
              </motion.form>

              <div className="contact-info">
                <h3>Outras Formas de Contato</h3>
                
                <div className="info-item">
                  <FiMail className="info-icon" />
                  <div>
                    <h4>Email</h4>
                    <a href={`mailto:${CONTACT_INFO.email}`}>{CONTACT_INFO.email}</a>
                  </div>
                </div>
                
                <div className="info-item">
                  <FiPhone className="info-icon" />
                  <div>
                    <h4>Telefone</h4>
                    <a href={`tel:${CONTACT_INFO.phone.replace(/\D/g, '')}`}>
                      {CONTACT_INFO.phone}
                    </a>
                  </div>
                </div>
                
                <div className="info-item">
                  <FiClock className="info-icon" />
                  <div>
                    <h4>Horário</h4>
                    <p>{CONTACT_INFO.hours}</p>
                  </div>
                </div>
                
                <div className="info-item">
                  <FiMapPin className="info-icon" />
                  <div>
                    <h4>Endereço</h4>
                    <p>{CONTACT_INFO.address}</p>
                  </div>
                </div>
                
                <div className="social-links">
                  <a href="#" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                    <FiInstagram />
                  </a>
                  <a href="#" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                    <FiFacebook />
                  </a>
                  <a href="#" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
                    <FiLinkedin />
                  </a>
                  <a href="#" aria-label="Twitter" target="_blank" rel="noopener noreferrer">
                    <FiTwitter />
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <motion.div
              className="newsletter-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="newsletter-card">
                <div className="newsletter-header">
                  <div className="icon-wrapper">
                    <FiMail />
                  </div>
                  <h3>Assine Nossa Newsletter</h3>
                </div>
                
                <p className="newsletter-description">
                  Receba atualizações, novidades e ofertas exclusivas diretamente 
                  no seu e-mail. Prometemos não enviar spam.
                </p>
                
                <form onSubmit={handleNewsletterSubmit(onSubmitNewsletter)} noValidate>
                  <div className="form-group">
                    <label htmlFor="newsletter-email">
                      Email <span className="required">*</span>
                    </label>
                    <div className={`input-container ${newsletterErrors.email ? 'error' : ''}`}>
                      <FiMail className="input-icon" />
                      <input
                        id="newsletter-email"
                        type="email"
                        {...registerNewsletter('email')}
                        placeholder="seu@email.com"
                        aria-invalid={newsletterErrors.email ? "true" : "false"}
                        aria-describedby="newsletter-email-error"
                      />
                    </div>
                    {newsletterErrors.email && (
                      <span id="newsletter-email-error" className="error-message" role="alert">
                        {newsletterErrors.email.message}
                      </span>
                    )}
                  </div>
                  
                  <motion.button
                    type="submit"
                    className="submit-button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={newsletterLoading}
                    aria-busy={newsletterLoading}
                  >
                    {newsletterLoading ? (
                      <>
                        <FiLoader className="spin" />
                        Assinando...
                      </>
                    ) : (
                      <>
                        <FiSend />
                        Assinar Newsletter
                      </>
                    )}
                  </motion.button>
                </form>
                
                <div className="benefits">
                  <h4>Vantagens:</h4>
                  <ul className="benefits-list">
                    <li>Conteúdos exclusivos para assinantes</li>
                    <li>Ofertas especiais e descontos</li>
                    <li>Novidades em primeira mão</li>
                    <li>Dicas e tutoriais</li>
                    <li>Pode cancelar a qualquer momento</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {feedback.show && (
          <motion.div
            className={`feedback ${feedback.type}`}
            variants={feedbackVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
          >
            <div className="feedback-content">
              {feedback.type === 'success' ? (
                <FiCheckCircle className="feedback-icon" />
              ) : (
                <FiAlertCircle className="feedback-icon" />
              )}
              <span>{feedback.message}</span>
            </div>
            <button 
              onClick={() => setFeedback(prev => ({ ...prev, show: false }))}
              aria-label="Fechar notificação"
              className="feedback-close"
            >
              <FiX />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Contatos;