import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth';
import { auth } from '../Db/firebaseConfig';
import { FiAlertCircle, FiCheckCircle, FiXCircle, FiInfo, FiEye, FiEyeOff } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import banner from '../img/dogg.jpg';
import '../styles/Registrar.css';

const MessageBox = ({ text, type }) => {
  const icons = {
    success: <FiCheckCircle />,
    error: <FiXCircle />,
    warning: <FiAlertCircle />,
    info: <FiInfo />
  };

  const colors = {
    success: '#28a745',
    error: '#dc3545',
    warning: '#ffc107',
    info: '#17a2b8'
  };

  return (
    <motion.div
      className="message-box"
      style={{ borderLeft: `5px solid ${colors[type]}` }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <span className="message-icon">{icons[type]}</span>
      {text}
    </motion.div>
  );
};

const Registrar = () => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    telefone: '',
    endereco: {
      rua: '',
      numero: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: '',
      complemento: ''
    }
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith('endereco.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        endereco: { ...prev.endereco, [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    } else if (formData.nome.trim().length < 3) {
      newErrors.nome = 'Nome muito curto';
    }

    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.senha) {
      newErrors.senha = 'Senha é obrigatória';
    } else if (formData.senha.length < 6) {
      newErrors.senha = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (formData.senha !== formData.confirmarSenha) {
      newErrors.confirmarSenha = 'Senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateAvatar = (name) => {
    if (!name) return '';
    const initial = name.charAt(0).toUpperCase();
    const hue = Math.floor(Math.random() * 360);
    const bgColor = `hsl(${hue}, 70%, 60%)`;

    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150">
      <rect width="150" height="150" fill="${bgColor}" rx="75"/>
      <text x="50%" y="50%" dy=".35em" text-anchor="middle" font-family="Arial, sans-serif" font-size="72" fill="#fff">${initial}</text>
    </svg>`;

    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);
  setMessage({ text: '', type: '' }); // Limpa mensagens anteriores

  if (!validateForm()) {
    setIsSubmitting(false);
    setMessage({ text: 'Por favor, corrija os erros no formulário', type: 'error' });
    return;
  }

  try {
    // 1. Criar usuário no Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.senha);
    const userId = userCredential.user.uid;
    const avatarUrl = generateAvatar(formData.nome);

    // 2. Atualizar perfil no Firebase
    await updateProfile(userCredential.user, {
      displayName: formData.nome,
      photoURL: avatarUrl
    });

    // 3. Enviar dados para sua API
    const response = await fetch('https://pet-shop-eiab.onrender.com/api/Usuario', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Id: userId,
        Nome: formData.nome,
        Email: formData.email,
        Senha: formData.senha,
        Telefone: formData.telefone,
        Endereco: {
          Rua: formData.endereco.rua,
          Numero: formData.endereco.numero,
          Bairro: formData.endereco.bairro,
          Cidade: formData.endereco.cidade,
          Estado: formData.endereco.estado,
          Cep: formData.endereco.cep,
          Complemento: formData.endereco.complemento,
        },
        IsAdmin: false,
        Foto: avatarUrl, // Agora enviando o avatar gerado
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erro na API:', errorData);
      setMessage({ text: 'Erro ao salvar dados na API.', type: 'error' });

      // Remove usuário do Firebase se a API falhar
      if (userCredential?.user) {
        await userCredential.user.delete();
      }

      setIsSubmitting(false);
      return;
    }

    setMessage({ 
      text: 'Cadastro realizado com sucesso! Redirecionando...', 
      type: 'success' 
    });

    // Desloga usuário para evitar login automático
    await signOut(auth);
    setTimeout(() => navigate('/login'), 1500);

  } catch (error) {
    console.error('Erro no registro:', error);
    
    let errorMessage = 'Erro ao realizar cadastro';
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'Este e-mail já está cadastrado. Por favor, use outro e-mail ou faça login.';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'A senha deve ter pelo menos 6 caracteres';
    }

    setMessage({ text: errorMessage, type: 'error' });
    setIsSubmitting(false);
  }
};

  return (
    <div className="registrar-container">
      <AnimatePresence>
        {message.text && <MessageBox text={message.text} type={message.type} />}
      </AnimatePresence>

      <div className="registrar-box">
        <div className="registrar-left">
          <img src={banner} alt="Cachorro fofo" />
        </div>

        <div className="registrar-right">
          <h2>Crie sua conta</h2>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Nome Completo*</label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                className={errors.nome ? 'input-error' : ''}
                placeholder="Digite seu nome completo"
              />
              {errors.nome && <span className="error-message">{errors.nome}</span>}
            </div>

            <div className="input-group">
              <label>Email*</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'input-error' : ''}
                placeholder="seu@email.com"
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="input-group">
              <label>Telefone</label>
              <input
                type="tel"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                className={errors.telefone ? 'input-error' : ''}
                placeholder="(00) 00000-0000"
              />
              {errors.telefone && <span className="error-message">{errors.telefone}</span>}
            </div>

            <div className="address-section">
              <h3>Endereço</h3>
              <div className="address-grid">
                <div className="input-group">
                  <label>Rua*</label>
                  <input
                    type="text"
                    name="endereco.rua"
                    value={formData.endereco.rua}
                    onChange={handleChange}
                    className={errors.rua ? 'input-error' : ''}
                    placeholder="Nome da rua"
                  />
                  {errors.rua && <span className="error-message">{errors.rua}</span>}
                </div>

                <div className="input-group">
                  <label>Número*</label>
                  <input
                    type="text"
                    name="endereco.numero"
                    value={formData.endereco.numero}
                    onChange={handleChange}
                    className={errors.numero ? 'input-error' : ''}
                    placeholder="Número"
                  />
                  {errors.numero && <span className="error-message">{errors.numero}</span>}
                </div>

                <div className="input-group">
                  <label>Bairro*</label>
                  <input
                    type="text"
                    name="endereco.bairro"
                    value={formData.endereco.bairro}
                    onChange={handleChange}
                    className={errors.bairro ? 'input-error' : ''}
                    placeholder="Nome do bairro"
                  />
                  {errors.bairro && <span className="error-message">{errors.bairro}</span>}
                </div>

                <div className="input-group">
                  <label>Cidade*</label>
                  <input
                    type="text"
                    name="endereco.cidade"
                    value={formData.endereco.cidade}
                    onChange={handleChange}
                    className={errors.cidade ? 'input-error' : ''}
                    placeholder="Nome da cidade"
                  />
                  {errors.cidade && <span className="error-message">{errors.cidade}</span>}
                </div>

                <div className="input-group">
                  <label>Estado*</label>
                  <input
                    type="text"
                    name="endereco.estado"
                    value={formData.endereco.estado}
                    onChange={handleChange}
                    className={errors.estado ? 'input-error' : ''}
                    placeholder="UF"
                    maxLength="2"
                  />
                  {errors.estado && <span className="error-message">{errors.estado}</span>}
                </div>

                <div className="input-group">
                  <label>CEP*</label>
                  <input
                    type="text"
                    name="endereco.cep"
                    value={formData.endereco.cep}
                    onChange={handleChange}
                    className={errors.cep ? 'input-error' : ''}
                    placeholder="00000-000"
                  />
                  {errors.cep && <span className="error-message">{errors.cep}</span>}
                </div>

                <div className="input-group">
                  <label>Complemento</label>
                  <input
                    type="text"
                    name="endereco.complemento"
                    value={formData.endereco.complemento}
                    onChange={handleChange}
                    placeholder="Apto, bloco, etc."
                  />
                </div>
              </div>
            </div>

            <div className="input-group">
              <label>Senha*</label>
              <div className="password-input">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="senha"
                  value={formData.senha}
                  onChange={handleChange}
                  className={errors.senha ? 'input-error' : ''}
                  placeholder="Mínimo 6 caracteres"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
              {errors.senha && <span className="error-message">{errors.senha}</span>}
            </div>

            <div className="input-group">
              <label>Confirmar Senha*</label>
              <div className="password-input">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmarSenha"
                  value={formData.confirmarSenha}
                  onChange={handleChange}
                  className={errors.confirmarSenha ? 'input-error' : ''}
                  placeholder="Confirme sua senha"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={toggleConfirmPasswordVisibility}
                  aria-label={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
              {errors.confirmarSenha && <span className="error-message">{errors.confirmarSenha}</span>}
            </div>

            <button type="submit" disabled={isSubmitting} className="submit-button">
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  Cadastrando...
                </>
              ) : 'Cadastrar'}
            </button>
          </form>

          <p className="login-link">
            Já tem uma conta? <Link to="/login">Faça login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Registrar;
