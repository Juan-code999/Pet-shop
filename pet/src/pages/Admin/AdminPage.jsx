import React, { useState, useEffect } from 'react';
import '../../styles/AdminPage.css';
import ProductList from './ProductList';
import Usuarios from './Usuarios';

export default function AdminPage() {
  const [menuAtivo, setMenuAtivo] = useState('Dashboard');
  const [userLogado, setUserLogado] = useState({ 
    nome: 'Administrador', 
    email: 'admin@exemplo.com',
    perfil: 'Administrador'
  });
  const [totalUsuarios, setTotalUsuarios] = useState(42);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Simulação de dados enquanto a API não está disponível
  useEffect(() => {
    const simularCarregamento = async () => {
      setLoading(true);
      try {
        // Simula um delay de carregamento
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Dados mockados para desenvolvimento
        setUserLogado({ 
          id: 1,
          nome: 'Administrador Mock',
          email: 'admin@mock.com',
          perfil: 'Administrador',
          avatar: 'https://i.pravatar.cc/150?img=5'
        });
        
        setTotalUsuarios(42);
      } catch (err) {
        setError('Erro ao carregar dados simulados');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    // Comente esta linha quando a API estiver pronta
    simularCarregamento();
    
    // Descomente quando a API estiver pronta
    // fetchDataReal();
  }, []);

  // Função para quando a API estiver disponível
  const fetchDataReal = async () => {
    const API_URL = 'http://localhost:5005/api/Usuario';
    try {
      setLoading(true);
      setError(null);
      
      const userIdLogado = 1;
      const responseUser = await fetch(`${API_URL}/${userIdLogado}`);
      
      if (!responseUser.ok) {
        throw new Error(`Erro HTTP: ${responseUser.status}`);
      }
      
      const userData = await responseUser.json();
      setUserLogado(userData);

      const responseTotal = await fetch(API_URL);
      if (!responseTotal.ok) {
        throw new Error(`Erro HTTP: ${responseTotal.status}`);
      }
      
      const allUsers = await responseTotal.json();
      setTotalUsuarios(allUsers.length);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderConteudo = () => {
    if (loading) {
      return (
        <div className="dashboard-content">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Carregando dados...</p>
          </div>
        </div>
      );
    }

    switch (menuAtivo) {
      case 'Dashboard':
        return (
          <div className="dashboard-content">
            <h2>Bem-vindo, {userLogado.nome}!</h2>
            {error && (
              <div className="alert alert-warning">
                <p>Sistema operando em modo de desenvolvimento. {error}</p>
              </div>
            )}
            <div className="dashboard-stats">
              <div className="stat-card">
                <h3>Total de Produtos</h3>
                <p>124</p>
              </div>
              <div className="stat-card">
                <h3>Pedidos Hoje</h3>
                <p>18</p>
              </div>
              <div className="stat-card">
                <h3>Usuários Registrados</h3>
                <p>{totalUsuarios}</p>
              </div>
            </div>
            <div className="dashboard-charts">
              <div className="chart-container">
                <h3>Vendas Mensais</h3>
                <div className="chart-placeholder">
                  <p>Gráfico de vendas (simulado)</p>
                </div>
              </div>
              <div className="chart-container">
                <h3>Usuários Ativos</h3>
                <div className="chart-placeholder">
                  <p>Gráfico de usuários (simulado)</p>
                </div>
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
            <h2>Pedidos recentes</h2>
            <div className="coming-soon">
              <p>Funcionalidade em desenvolvimento</p>
              <small>Disponível em breve</small>
            </div>
          </div>
        );
      case 'Configurações':
        return (
          <div className="dashboard-content">
            <h2>Configurações do sistema</h2>
            <div className="settings-grid">
              <div className="settings-card">
                <h3>Perfil do Usuário</h3>
                <p>Nome: {userLogado.nome}</p>
                <p>Email: {userLogado.email}</p>
                <p>Tipo: {userLogado.perfil}</p>
              </div>
              <div className="settings-card">
                <h3>Preferências</h3>
                <p>Configurações gerais do sistema</p>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="dashboard-content">
            <h2>Selecione uma opção no menu</h2>
          </div>
        );
    }
  };

  return (
    <div className="admin-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1 className="logo">Admin</h1>
          <div className="user-info">
            {userLogado.avatar && (
              <img 
                src={userLogado.avatar} 
                alt="Avatar" 
                className="user-avatar"
              />
            )}
            <span>{userLogado.nome}</span>
            <small>{userLogado.perfil}</small>
          </div>
        </div>
        <nav className="menu">
          <ul>
            {['Dashboard', 'Produtos', 'Usuários', 'Pedidos', 'Configurações'].map((item) => (
              <li 
                key={item}
                className={menuAtivo === item ? 'ativo' : ''} 
                onClick={() => setMenuAtivo(item)}
              >
                {item}
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <main className="main-content">
        {renderConteudo()}
      </main>
    </div>
  );
}