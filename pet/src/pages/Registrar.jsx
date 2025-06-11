import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile, deleteUser } from 'firebase/auth';
import { auth } from '../Db/firebaseConfig'; // Ajuste o caminho se estiver diferente
import { FiAlertCircle } from 'react-icons/fi';
import '../styles/Registrar.css';

const MessageBox = ({ text }) => (
  <div className="message-box">
    <FiAlertCircle size={24} style={{ marginRight: 8 }} />
    {text}
  </div>
);

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
    },
    isAdmin: false,
  });

  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  // handleChange para campos simples e Endereco (objeto)
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

  // Função para exibir mensagem temporária no topo
  const showMessage = (text, duration = 4000) => {
    setMessage(text);
    setTimeout(() => setMessage(null), duration);
  };

  const handleSubmitCompleto = async (e) => {
    e.preventDefault();
    const { Nome, Email, Senha, ConfirmarSenha } = formDataUsuario;

    if (!Email || !Senha || !Nome) {
      showMessage('Preencha o nome, email e a senha!');
      return;
    }

    if (Senha !== ConfirmarSenha) {
      showMessage('As senhas não coincidem!');
      return;
    }

    let userCredential = null;

    try {
      userCredential = await createUserWithEmailAndPassword(auth, Email, Senha);

      await updateProfile(userCredential.user, {
        displayName: Nome,
        photoURL: 'https://i.pravatar.cc/150?u=' + Email,
      });

      const userId = userCredential.user.uid;

      const response = await fetch('http://localhost:5005/api/Usuario', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
  Nome: formDataUsuario.Nome,
  Email: formDataUsuario.Email,
  Senha: formDataUsuario.Senha,
  Telefone: formDataUsuario.Telefone,
  Endereco: formDataUsuario.Endereco,
  IsAdmin: formDataUsuario.isAdmin
  }),
});


      if (!response.ok) {
        const err = await response.json();
        await deleteUser(userCredential.user);
        showMessage('Erro ao salvar na API: ' + (err.message || 'Erro desconhecido'));
        return;
      }

      showMessage('Usuário registrado com sucesso!');
      setTimeout(() => navigate('/login'), 1500);
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        showMessage('Este e-mail já está em uso.');
      } else {
        showMessage('Erro ao registrar: ' + error.message);
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
    <div className="registrar-container">
      {message && <MessageBox text={message} />}
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
            {/* Campos do endereço */}
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
