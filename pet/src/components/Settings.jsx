import React, { useState, useEffect } from "react";
import { getAuth, updateProfile, updateEmail, updatePassword } from "firebase/auth";
import "../styles/Settings.css";
import { FaLock } from "react-icons/fa";

const Settings = () => {
  const auth = getAuth();
  const user = auth.currentUser;

  const [usuarioId, setUsuarioId] = useState("");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [photoURL, setPhotoURL] = useState("");

  // Buscar o UsuarioId pelo email (ajustado para pegar `id` do retorno)
  const buscarUsuarioId = async (email) => {
    try {
      const res = await fetch(`http://localhost:5005/api/Usuario/email/${encodeURIComponent(email)}`);
      if (!res.ok) throw new Error("Erro ao buscar ID do usuário");
      const data = await res.json();
      // data vem assim: { id: "...", usuario: {...} }
      return data.id; // pega o id diretamente
    } catch (err) {
      console.error("Erro ao buscar ID:", err);
      return null;
    }
  };

  // Buscar os dados do usuário pelo UsuarioId
  const buscarDadosUsuario = async (id) => {
    try {
      const res = await fetch(`http://localhost:5005/api/Usuario/${id}`);
      if (!res.ok) throw new Error("Erro ao buscar dados do usuário");
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Erro ao buscar dados:", err);
      return null;
    }
  };

  useEffect(() => {
    const carregarUsuario = async () => {
      if (user && user.email) {
        setEmail(user.email);
        setPhotoURL(user.photoURL || "");

        const id = await buscarUsuarioId(user.email);
        if (!id) return;

        setUsuarioId(id);

        const dados = await buscarDadosUsuario(id);
        if (dados) {
          setNome(dados.nome || "");
          setTelefone(dados.telefone || "");
        }
      }
    };

    carregarUsuario();
  }, [user]);

  // Atualizar backend e Firebase Auth
  const handleSaveAll = async () => {
    try {
      // Atualiza Firebase Auth nome e email (só se mudaram)
      if (user.displayName !== nome) {
        await updateProfile(user, { displayName: nome });
      }
      if (user.email !== email) {
        await updateEmail(user, email);
      }

      // Atualiza backend via PUT
      const body = {
        nome,
        email,
        telefone,
        senha: "", // vazio pois não alteramos a senha aqui
        endereco: "", // se precisar, pode adicionar o campo Endereco e buscar no estado
        isAdmin: false, // não altera admin aqui
      };

      const res = await fetch(`http://localhost:5005/api/Usuario/${usuarioId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error("Erro ao atualizar usuário no backend");
      }

      alert("Dados atualizados com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar dados: " + error.message);
    }
  };

  const handleChangePassword = async () => {
    const newPassword = prompt("Digite a nova senha:");
    if (newPassword) {
      try {
        await updatePassword(user, newPassword);
        alert("Senha atualizada!");
      } catch (error) {
        console.error(error);
        alert("Erro ao atualizar senha: " + error.message);
      }
    }
  };

  return (
    <div className="settings__container">
      <div className="settings__header">
        <img src={photoURL || "https://via.placeholder.com/100"} alt="Avatar" className="settings__avatar" />
        <div className="settings__info">
          <h2>{nome || "Usuário"}</h2>
          <button className="settings__editButton" onClick={() => alert("Funcionalidade futura para mudar foto.")}>
            Editar perfil de usuário
          </button>
        </div>
      </div>

      <div className="settings__section">
        <h3>Informações da Conta</h3>

        <div className="settings__item">
          <span>Nome Exibido:</span>
          <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} />
        </div>

        <div className="settings__item">
          <span>Email:</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="settings__item">
          <span>Telefone:</span>
          <input
            type="text"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            placeholder="(00) 00000-0000"
          />
        </div>

        <button onClick={handleSaveAll}>Salvar todas alterações</button>
      </div>

      <div className="settings__section">
        <h3>Senha e Autenticação</h3>
        <div className="settings__password">
          <FaLock size={20} />
          <span>Senha segura configurada</span>
          <button onClick={handleChangePassword}>Mudar senha</button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
