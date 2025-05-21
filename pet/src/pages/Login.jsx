import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../Db/firebaseConfig'; // ajuste o caminho conforme sua estrutura
import '../styles/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;

      const response = await fetch(`http://localhost:5005/api/Usuario/${user.uid}`);
      const usuario = await response.json();
      const isAdmin = Boolean(usuario.IsAdmin);

      localStorage.setItem('tutorId', user.uid);
      localStorage.setItem('tutorNome', user.displayName || '');
      localStorage.setItem('isAdmin', isAdmin);

      alert("Login realizado com sucesso!");
      navigate('/dashboard');
    } catch (error) {
      alert("Erro no login: " + error.message);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-box">
        <div className="login-left">
          <div className="logo">
            <img src="src/img/logop.png" alt="Pet Care" />
            <h2>Lat Miau</h2>
          </div>
          <h3>Faça login para continuar</h3>
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
              <Link to="/registrar" className="forgot">Não tem uma conta? Cadastre-se</Link>
            </div>
            <button type="submit">Entrar</button>
          </form>
          <div className="terms">
            <Link to="/termos">Termos e Condições</Link> | <Link to="/privacidade">Política de Privacidade</Link>
          </div>
        </div>
        <div className="login-right">
          <img src="src/img/dogg.jpg" alt="Cachorro" />
        </div>
      </div>
    </div>
  );
};

export default Login;
