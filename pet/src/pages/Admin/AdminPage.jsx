import React, { useState } from 'react';
import '../../styles/AdminPage.css';
import ProductList from './ProductList';

export default function AdminPage() {
  const [menuAtivo, setMenuAtivo] = useState('Dashboard');

  const renderConteudo = () => {
    switch (menuAtivo) {
      case 'Dashboard':
        return <h2>Bem-vindo ao Painel Admin</h2>;
      case 'Produtos':
        return <ProductList />;
      case 'Usuários':
        return <h2>Gerenciar Usuários (em breve)</h2>;
      case 'Pedidos':
        return <h2>Pedidos recentes (em breve)</h2>;
      case 'Configurações':
        return <h2>Configurações do sistema</h2>;
      default:
        return <h2>Selecionar uma opção</h2>;
    }
  };

  return (
    <div className="admin-container">
      <aside className="sidebar">
        <h1 className="logo">Admin</h1>
        <nav className="menu">
          <ul>
            <li className={menuAtivo === 'Dashboard' ? 'ativo' : ''} onClick={() => setMenuAtivo('Dashboard')}>Dashboard</li>
            <li className={menuAtivo === 'Produtos' ? 'ativo' : ''} onClick={() => setMenuAtivo('Produtos')}>Produtos</li>
            <li className={menuAtivo === 'Usuários' ? 'ativo' : ''} onClick={() => setMenuAtivo('Usuários')}>Usuários</li>
            <li className={menuAtivo === 'Pedidos' ? 'ativo' : ''} onClick={() => setMenuAtivo('Pedidos')}>Pedidos</li>
            <li className={menuAtivo === 'Configurações' ? 'ativo' : ''} onClick={() => setMenuAtivo('Configurações')}>Configurações</li>
          </ul>
        </nav>
      </aside>

      <main className="conteudo">
        {renderConteudo()}
      </main>
    </div>
  );
}
