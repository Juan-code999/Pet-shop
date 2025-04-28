import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../Db/firebaseConfig';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/registrar.css';

const Registrar = () => {
  const [formDataUsuario, setFormDataUsuario] = useState({
    Nome: '',
    Email: '',
    Senha: '',
    Telefone: '',
    Endereco: '',
    IsAdmin: false, // Adiciona o campo IsAdmin
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormDataUsuario((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitCompleto = async (e) => {
    e.preventDefault();

    const { Nome, Email, Senha, IsAdmin } = formDataUsuario;

    if (!Email || !Senha || !Nome) {
      alert('Preencha o nome, email e a senha!');
      return;
    }

    try {
      console.log('Tentando registrar com:', formDataUsuario);

      // 1️⃣ Cadastrar no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, Email, Senha);

      // 2️⃣ Atualizar o perfil do usuário com nome e foto (opcional)
      await updateProfile(userCredential.user, {
        displayName: Nome,
        photoURL: 'https://i.pravatar.cc/150?u=' + Email, // foto padrão gerada pelo email
      });

      const userId = userCredential.user.uid;

      // 3️⃣ Enviar para a API com o campo IsAdmin
      const response = await fetch('http://localhost:5005/Usuario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formDataUsuario,
          id: userId,
        }),
      });

      if (response.ok) {
        alert('Usuário registrado com sucesso!');
        navigate('/login');
      } else {
        const err = await response.json();
        alert('Erro ao salvar na API: ' + err.message);
      }
    } catch (error) {
      alert('Erro ao registrar: ' + error.message);
    }
  };

  return (
    <div className="registrar-container">
      <h2>Cadastro</h2>
      <form className="registrar-form" onSubmit={handleSubmitCompleto}>
        <input
          type="text"
          name="Nome"
          placeholder="Nome completo"
          value={formDataUsuario.Nome}
          onChange={handleChange}
        />
        <input
          type="email"
          name="Email"
          placeholder="Email"
          value={formDataUsuario.Email}
          onChange={handleChange}
        />
        <input
          type="password"
          name="Senha"
          placeholder="Senha"
          value={formDataUsuario.Senha}
          onChange={handleChange}
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
          name="Endereco"
          placeholder="Endereço"
          value={formDataUsuario.Endereco}
          onChange={handleChange}
        />
        <label>
          <input
            type="checkbox"
            name="IsAdmin"
            checked={formDataUsuario.IsAdmin}
            onChange={() => setFormDataUsuario((prev) => ({ ...prev, IsAdmin: !prev.IsAdmin }))}
          />
          Tornar este usuário admin
        </label>
        <button type="submit">Cadastrar</button>
      </form>
      <p>
        Já tem uma conta? <Link to="/login">Entrar</Link>
      </p>
    </div>
  );
};

export default Registrar;