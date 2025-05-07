import React from 'react';
import '../styles/AdminPage.css'; // (opcional para estilização personalizada)

const AdminPage = () => {
  return (
    <div className="admin-container">
      <h1>Painel Administrativo</h1>
      <p>Bem-vindo à área administrativa do sistema.</p>

      <div className="admin-sections">
        <div className="admin-card">
          <h3>Gerenciar Usuários</h3>
          <p>Visualize, edite ou remova usuários cadastrados.</p>
        </div>

        <div className="admin-card">
          <h3>Agendamentos</h3>
          <p>Acompanhe e gerencie os agendamentos de serviços.</p>
        </div>

        <div className="admin-card">
          <h3>Produtos</h3>
          <p>Adicione ou edite os produtos disponíveis no sistema.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
