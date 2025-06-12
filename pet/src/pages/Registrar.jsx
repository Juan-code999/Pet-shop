import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile, deleteUser } from 'firebase/auth';
import { auth } from '../Db/firebaseConfig';
import {
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
  FiInfo
} from 'react-icons/fi';
import '../styles/Registrar.css';

// Função para gerar avatar SVG base64 com inicial e fundo colorido
function generateAvatar(name) {
  const initial = name.charAt(0).toUpperCase();

  // Gera cor aleatória
  const randomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const bgColor = randomColor();

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="150" height="150">
    <rect width="150" height="150" fill="${bgColor}" />
    <text x="50%" y="50%" dy=".35em" text-anchor="middle" font-family="Arial, sans-serif" font-size="72" fill="#fff">${initial}</text>
  </svg>`;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

const MessageBox = ({ text, type }) => {
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
    <div className="message-box" style={{ borderLeft: `5px solid ${color}`, color }}>
      <span style={{ marginRight: 8 }}>{icon}</span>
      {text}
    </div>
  );
};

const Registrar = () => {
  const [formDataUsuario, setFormDataUsuario] = useState({
    Nome: '',
    Email: '',
    Senha: '',
    ConfirmarSenha: '',
    Telefone: '',
    Endereco: {
      Rua: '',
      Numero: '',
      Bairro: '',
      Cidade: '',
      Estado: '',
      Cep: '',
      Complemento: '',
    },
    isAdmin: false,
  });

  const [message, setMessage] = useState({ text: '', type: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith('Endereco.')) {
      const enderecoField = name.split('.')[1];
      setFormDataUsuario((prev) => ({
        ...prev,
        Endereco: {
          ...prev.Endereco,
          [enderecoField]: value,
        },
      }));
    } else {
      setFormDataUsuario((prev) => ({ ...prev, [name]: value }));
    }
  };

  const showMessage = (text, type = 'info', duration = 4000) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), duration);
  };

  const handleSubmitCompleto = async (e) => {
    e.preventDefault();
    const { Nome, Email, Senha, ConfirmarSenha } = formDataUsuario;

    if (!Email || !Senha || !Nome) {
      showMessage('Preencha o nome, email e a senha!', 'warning');
      return;
    }

    if (Senha !== ConfirmarSenha) {
      showMessage('As senhas não coincidem!', 'error');
      return;
    }

    let userCredential = null;

    try {
      userCredential = await createUserWithEmailAndPassword(auth, Email, Senha);

      // Usando avatar gerado
      await updateProfile(userCredential.user, {
        displayName: Nome,
        photoURL: generateAvatar(Nome),
      });

      const userId = userCredential.user.uid;

      const response = await fetch('http://localhost:5005/api/Usuario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Id: userId,
          Nome: formDataUsuario.Nome,
          Email: formDataUsuario.Email,
          Senha: formDataUsuario.Senha,
          Telefone: formDataUsuario.Telefone,
          Endereco: formDataUsuario.Endereco,
          IsAdmin: formDataUsuario.IsAdmin,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erro na API:', errorData);

        if (errorData.errors) {
          const erros = Object.entries(errorData.errors)
            .map(([campo, mensagens]) => `${campo}: ${mensagens.join(', ')}`)
            .join(' | ');
          showMessage(`Erro na API: ${erros}`, 'error', 7000);
        } else {
          showMessage('Erro desconhecido ao enviar dados', 'error', 7000);
        }

        if (userCredential && userCredential.user) {
          try {
            await deleteUser(userCredential.user);
          } catch (err) {
            console.error('Erro ao desfazer usuário Firebase:', err.message);
          }
        }
        return;
      }

      showMessage('Usuário registrado com sucesso!', 'success');
      setTimeout(() => navigate('/login'), 1500);

    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        showMessage('Este e-mail já está em uso.', 'error');
      } else {
        showMessage('Erro ao registrar: ' + error.message, 'error');
      }

      if (userCredential && userCredential.user) {
        try {
          await deleteUser(userCredential.user);
        } catch (err) {
          console.error('Erro ao desfazer no Firebase:', err.message);
        }
      }
    }
  };

  return (
    <div className="registrar-container" style={{ position: 'relative' }}>
      {message.text && <MessageBox text={message.text} type={message.type} />}
      <div className="registrar-box">
        <div className="registrar-left">
          <img src="src/img/dogg.jpg" alt="Dog" />
        </div>
        <div className="registrar-right">
          <h2>Cadastro</h2>
          <form className="registrar-form" onSubmit={handleSubmitCompleto}>
            <input
              type="text"
              name="Nome"
              placeholder="Nome completo"
              value={formDataUsuario.Nome}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="Email"
              placeholder="Email"
              value={formDataUsuario.Email}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="Telefone"
              placeholder="Telefone"
              value={formDataUsuario.Telefone}
              onChange={handleChange}
            />
            <input
              type="text"
              name="Endereco.Rua"
              placeholder="Rua"
              value={formDataUsuario.Endereco.Rua}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="Endereco.Numero"
              placeholder="Número"
              value={formDataUsuario.Endereco.Numero}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="Endereco.Bairro"
              placeholder="Bairro"
              value={formDataUsuario.Endereco.Bairro}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="Endereco.Cidade"
              placeholder="Cidade"
              value={formDataUsuario.Endereco.Cidade}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="Endereco.Estado"
              placeholder="Estado"
              value={formDataUsuario.Endereco.Estado}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="Endereco.Cep"
              placeholder="CEP"
              value={formDataUsuario.Endereco.Cep}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="Endereco.Complemento"
              placeholder="Complemento"
              value={formDataUsuario.Endereco.Complemento}
              onChange={handleChange}
            />
            <input
              type="password"
              name="Senha"
              placeholder="Senha"
              value={formDataUsuario.Senha}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="ConfirmarSenha"
              placeholder="Confirmar Senha"
              value={formDataUsuario.ConfirmarSenha}
              onChange={handleChange}
              required
            />
            <button type="submit">Cadastrar</button>
          </form>
          <p>
            Já tem uma conta? <Link to="/login">Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Registrar;
