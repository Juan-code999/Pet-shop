import React, { useState, useEffect } from "react";
import { getAuth, updateProfile, updateEmail, updatePassword } from "firebase/auth";
import { getDatabase, ref, set, get } from "firebase/database"; // Realtime Database
import "../styles/Settings.css";
import { FaLock } from "react-icons/fa";

const Settings = () => {
  const auth = getAuth();
  const db = getDatabase(); // conecta no Firebase Realtime Database
  const user = auth.currentUser;

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [photoURL, setPhotoURL] = useState("");

  useEffect(() => {
    if (user) {
      setNome(user.displayName || "");
      setEmail(user.email || "");
      setPhotoURL(user.photoURL || "");

      // Buscar telefone do banco
      const telefoneRef = ref(db, `usuarios/${user.uid}/telefone`);
      get(telefoneRef).then((snapshot) => {
        if (snapshot.exists()) {
          setTelefone(snapshot.val());
        }
      }).catch((error) => {
        console.error(error);
      });
    }
  }, [user, db]);

  const handleSaveName = async () => {
    try {
      await updateProfile(user, { displayName: nome });
      alert("Nome atualizado!");
      window.location.reload();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSaveEmail = async () => {
    try {
      await updateEmail(user, email);
      alert("Email atualizado!");
      window.location.reload();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSaveTelefone = async () => {
    try {
      await set(ref(db, `usuarios/${user.uid}/telefone`), telefone);
      alert("Telefone atualizado!");
    } catch (error) {
      console.error(error);
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
          <button onClick={handleSaveName}>Salvar</button>
        </div>

        <div className="settings__item">
          <span>Email:</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button onClick={handleSaveEmail}>Salvar</button>
        </div>

        <div className="settings__item">
          <span>Telefone:</span>
          <input
            type="text"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            placeholder="(00) 00000-0000"
          />
          <button onClick={handleSaveTelefone}>Salvar</button>
        </div>
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
