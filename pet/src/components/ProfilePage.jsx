import React from 'react';
import '../styles/ProfilePage.css';

const ProfilePage = () => {
  return (
    <div className="profile-page">
      <div className="cover">
        <button className="change-cover">📷 Mudar Capa</button>
      </div>
      <div className="content">
        <div className="sidebar">
          <img src="https://randomuser.me/api/portraits/men/75.jpg" alt="Perfil" />
          <h2>Nathaniel Poole</h2>
          <p>Microsoft Inc.</p>
          <button>Ver Perfil Público</button>
          <a href="https://app.ahiregro.com">https://app.ahiregro.com</a>
        </div>
        <div className="main">
          <h3>Configurações da Conta</h3>
          <div className="form">
            <div className="form-group">
              <label>Nome</label>
              <input type="text" defaultValue="Nathaniel" />
            </div>
            <div className="form-group">
              <label>Sobrenome</label>
              <input type="text" defaultValue="Poole" />
            </div>
            <div className="form-group">
              <label>Telefone</label>
              <input type="text" defaultValue="+1800-000" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" defaultValue="nathaniel.poole@microsoft.com" />
            </div>
            <div className="form-group">
              <label>Cidade</label>
              <input type="text" defaultValue="Bridgeport" />
            </div>
            <div className="form-group">
              <label>Estado/Região</label>
              <input type="text" defaultValue="WA" />
            </div>
            <div className="form-group">
              <label>CEP</label>
              <input type="text" defaultValue="31005" />
            </div>
            <div className="form-group">
              <label>País</label>
              <select defaultValue="United States">
                <option>Estados Unidos</option>
                <option>Brasil</option>
                <option>Canadá</option>
              </select>
            </div>
          </div>
          <button className="update">Atualizar</button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
