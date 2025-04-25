import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../Db/firebaseConfig';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      
      const user = userCredential.user;
      
      // Salvar UID e nome no localStorage
      localStorage.setItem('tutorId', user.uid);
      localStorage.setItem('tutorNome', user.displayName || ''); // displayName salvo no registro

      alert("Login realizado com sucesso!");
      navigate('/dashboard');
    } catch (error) {
      alert("Erro no login: " + error.message);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form className="login-form" onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Senha"
          required
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
        <button type="submit">Entrar</button>
      </form>
      <p>
        Ainda não tem conta? <Link to="/registrar">Cadastre-se</Link>
      </p>
    </div>
  );
};

export default Login;
