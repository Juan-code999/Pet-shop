import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../Db/firebaseConfig';
import logo from '../img/logo.png';
import banner from '../img/dogg.jpg';
import {
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
  FiInfo
} from 'react-icons/fi';
import '../styles/Login.css';

// Componente MessageBox para mensagens com ícones e cores
const MessageBox = ({ text, type }) => {
  if (!text) return null;

  let icon;
  let color;

  switch (type) {
    case 'success':
      icon = <FiCheckCircle />;
      color = '#28a745'; // verde
      break;
    case 'error':
      icon = <FiXCircle />;
      color = '#dc3545'; // vermelho
      break;
    case 'warning':
      icon = <FiAlertCircle />;
      color = '#ffc107'; // amarelo
      break;
    default:
      icon = <FiInfo />;
      color = '#17a2b8'; // azul-info
  }

  return (
    <div className="message-box" style={{ borderLeft: `5px solid ${color}`, color, marginBottom: 16 }}>
      <span style={{ marginRight: 8, verticalAlign: 'middle' }}>{icon}</span>
      {text}
    </div>
  );
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const navigate = useNavigate();

  const showMessage = (text, type = 'info', duration = 4000) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), duration);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !senha) {
      showMessage('Por favor, preencha email e senha.', 'warning');
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;

      const response = await fetch(`http://localhost:5005/api/Usuario/email/${encodeURIComponent(user.email)}`);
      if (!response.ok) {
        showMessage('Usuário não encontrado no banco de dados.', 'error');
        return;
      }

      const usuario = await response.json();

      localStorage.setItem('usuarioId', usuario.id || usuario.Id);
      localStorage.setItem('usuarioNome', usuario.nome || usuario.Nome || '');
      localStorage.setItem('isAdmin', usuario.isAdmin || usuario.IsAdmin ? 'true' : 'false');

      showMessage('Login realizado com sucesso!', 'success');
      setTimeout(() => navigate('/'), 1500);
    } catch (error) {
      console.error(error);
      showMessage('Erro no login: ' + error.message, 'error');
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-box">
        <div className="login-left">
          <div className="logo">
            <img src={logo} alt="Lat Miau" />
            <h2>Lat Miau</h2>
          </div>
          <h3>Faça login para continuar</h3>

          {message.text && <MessageBox text={message.text} type={message.type} />}

          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
            <div className="options">
              <Link to="/registrar" className="forgot">
                Não tem uma conta? Cadastre-se
              </Link>
            </div>
            <button type="submit">Entrar</button>
          </form>
          <div className="terms">
            <Link to="/termos">Termos e Condições</Link> |{' '}
            <Link to="/privacidade">Política de Privacidade</Link>
          </div>
        </div>
        <div className="login-right">
          <img src={banner} alt="Lat Miau" />
        </div>
      </div>
    </div>
  );
};

export default Login;
