import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile, deleteUser } from 'firebase/auth';
import { auth } from '../Db/firebaseConfig'; // Ajuste o caminho se estiver diferente
import '../styles/Registrar.css';

const Registrar = () => {
  const [formDataUsuario, setFormDataUsuario] = useState({
    Nome: '',
    Email: '',
    Senha: '',
    ConfirmarSenha: '',
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
    const { Nome, Email, Senha, ConfirmarSenha } = formDataUsuario;

    if (!Email || !Senha || !Nome) {
      alert('Preencha o nome, email e a senha!');
      return;
    }

    if (Senha !== ConfirmarSenha) {
      alert('As senhas não coincidem!');
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
        const err = await response.json();
        await deleteUser(userCredential.user);
        alert('Erro ao salvar na API: ' + (err.message || 'Erro desconhecido'));
        return;
      }

      alert('Usuário registrado com sucesso!');
      navigate('/login');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        alert('Este e-mail já está em uso.');
      } else {
        alert('Erro ao registrar: ' + error.message);
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
          />
          <input
            type="email"
            name="Email"
            placeholder="Email"
            value={formDataUsuario.Email}
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
          <input
            type="password"
            name="Senha"
            placeholder="Senha"
            value={formDataUsuario.Senha}
            onChange={handleChange}
          />
          <input
            type="password"
            name="ConfirmarSenha"
            placeholder="Confirmar Senha"
            value={formDataUsuario.ConfirmarSenha}
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
    </div>
  </div>
);

};

export default Registrar;
