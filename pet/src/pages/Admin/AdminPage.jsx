import React, { useState, useEffect } from 'react';
import '../../styles/AdminPage.css';
import ProductList from './ProductList';
import Usuarios from './Usuarios';

export default function AdminPage() {
  const [menuAtivo, setMenuAtivo] = useState('Dashboard');
  const [userLogado, setUserLogado] = useState(null);
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const API_URL = 'http://localhost:5005/api/Usuario';

  // Buscar usuário logado e contagem total de usuários
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulando que temos o ID do usuário logado (na prática, você pegaria do seu sistema de autenticação)
        const userIdLogado = 1; // Substitua pelo ID real do usuário logado
        
        // Buscar dados do usuário logado
        const responseUser = await fetch(`${API_URL}/${userIdLogado}`);
        if (responseUser.ok) {
          const userData = await responseUser.json();
          setUserLogado(userData);
        }

        // Buscar contagem total de usuários
        const responseTotal = await fetch(API_URL);
        if (responseTotal.ok) {
          const allUsers = await responseTotal.json();
          setTotalUsuarios(allUsers.length);
        }
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      }
    };

    fetchData();
  }, []);

  const renderConteudo = () => {
    switch (menuAtivo) {
      case 'Dashboard':
        return (
          <div className="dashboard-content">
            <h2>Bem-vindo, {userLogado ? userLogado.nome : 'Administrador'}!</h2>
            <div className="dashboard-charts">
              <div className="chart-box">
                <h3>Vendas Mensais</h3>
                <div className="chart-placeholder"></div>
              </div>
              <div className="chart-box">
                <h3>Usuários Ativos</h3>
                <div className="chart-placeholder"></div>
              </div>
            </div>
            <div className="dashboard-cards">
              <div className="card">
                <h3>Total de Produtos</h3>
                <p>124</p>
              </div>
              <div className="card">
                <h3>Pedidos Hoje</h3>
                <p>18</p>
              </div>
              <div className="card">
                <h3>Usuários Registrados</h3>
                <p>{totalUsuarios}</p>
              </div>
            </div>
          </div>
        );
      case 'Produtos':
        return <ProductList />;
      case 'Usuários':
        return <Usuarios />;
      case 'Pedidos':
        return (
          <div className="dashboard-content">
            <h2>Pedidos recentes (em breve)</h2>
          </div>
        );
      case 'Configurações':
        return (
          <div className="dashboard-content">
            <h2>Configurações do sistema</h2>
          </div>
        );
      default:
        return (
          <div className="dashboard-content">
            <h2>Selecionar uma opção</h2>
          </div>
        );
    }
  };

  return (
    <div className="admin-container">
      <aside className="sidebar">
        <h1 className="logo">Admin</h1>
        <nav className="menu">
          <ul>
            <li className={menuAtivo === 'Dashboard' ? 'ativo' : ''} onClick={() => setMenuAtivo('Dashboard')}>
              Dashboard
            </li>
            <li className={menuAtivo === 'Produtos' ? 'ativo' : ''} onClick={() => setMenuAtivo('Produtos')}>
              Produtos
            </li>
            <li className={menuAtivo === 'Usuários' ? 'ativo' : ''} onClick={() => setMenuAtivo('Usuários')}>
              Usuários
            </li>
            <li className={menuAtivo === 'Pedidos' ? 'ativo' : ''} onClick={() => setMenuAtivo('Pedidos')}>
              Pedidos
            </li>
            <li className={menuAtivo === 'Configurações' ? 'ativo' : ''} onClick={() => setMenuAtivo('Configurações')}>
              Configurações
            </li>
          </ul>
        </nav>
      </aside>

      <main className="main-content">
        {renderConteudo()}
      </main>
    </div>
  );
}