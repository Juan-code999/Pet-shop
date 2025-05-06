import React, { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  deleteUser
} from 'firebase/auth';
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
    IsAdmin: false,
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormDataUsuario((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitCompleto = async (e) => {
    e.preventDefault();
    const { Nome, Email, Senha } = formDataUsuario;

    if (!Email || !Senha || !Nome) {
      alert('Preencha o nome, email e a senha!');
      return;
    }

    let userCredential = null;

    try {
      // 1️⃣ Cadastra no Firebase Auth
      userCredential = await createUserWithEmailAndPassword(auth, Email, Senha);

      await updateProfile(userCredential.user, {
        displayName: Nome,
        photoURL: 'https://i.pravatar.cc/150?u=' + Email,
      });

      const userId = userCredential.user.uid;

      // 2️⃣ Cadastra na API
      const response = await fetch('https://localhost:7096/api/Usuario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formDataUsuario,
          id: userId,
        }),
      });

      if (!response.ok) {
        let errMsg = 'Erro desconhecido na API';
        try {
          const err = await response.json();
          errMsg = err.message || errMsg;
        } catch {}

        // ⚠️ Se falhou na API, desfaz o cadastro no Firebase
        await deleteUser(userCredential.user);
        alert('Erro ao salvar na API: ' + errMsg);
        return;
      }

      alert('Usuário registrado com sucesso!');
      navigate('/login');

    } catch (error) {
      // Se Firebase Auth falhar
      if (error.code === 'auth/email-already-in-use') {
        alert('Este e-mail já está em uso.');
      } else {
        alert('Erro ao registrar: ' + error.message);
      }

      // Se API falhar e não for possível deletar o user
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
            onChange={() =>
              setFormDataUsuario((prev) => ({ ...prev, IsAdmin: !prev.IsAdmin }))
            }
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
