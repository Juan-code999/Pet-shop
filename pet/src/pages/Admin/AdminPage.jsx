import React, { useState, useEffect, useCallback } from 'react';
import '../../styles/AdminPage.css';
import ProductList from './ProductList';
import Usuarios from './Usuarios';
import MensagensContato from './MensagensContato';
import Newsletters from './Newsletters';

import { getAuth, onAuthStateChanged } from "firebase/auth";

// Função auxiliar para gerar hash do nome (igual à NavBar)
const hashCode = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
};

export default function AdminPage() {
  const [menuAtivo, setMenuAtivo] = useState('Dashboard');
  const [userLogado, setUserLogado] = useState(null);
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Função para gerar avatar padrão (igual à NavBar)
  const generateDefaultAvatar = useCallback((name) => {
    if (!name) return '';
    const initial = name.charAt(0).toUpperCase();
    const hue = hashCode(name) % 360;
    return `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='hsl(${hue}, 70%, 60%)'/><text x='50' y='60' text-anchor='middle' font-size='50' fill='white'>${initial}</text></svg>`;
  }, []);

  // Busca os dados do usuário da API
  const fetchUserData = useCallback(async (currentUser) => {
    try {
      const response = await fetch(`https://pet-shop-eiab.onrender.com/api/Usuario/email/${currentUser.email}`);
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      
      const userData = await response.json();
      
      return {
        id: userData.id,
        nome: userData.nome || currentUser.displayName || "Administrador",
        email: currentUser.email,
        perfil: userData.isAdmin ? "Administrador" : "Usuário",
        avatar: userData.foto || currentUser.photoURL || generateDefaultAvatar(userData.nome)
      };
    } catch (error) {
      console.error("Erro ao buscar dados do usuário:", error);
      return null;
    }
  }, [generateDefaultAvatar]);

  // Busca o total de usuários
  const fetchTotalUsers = useCallback(async () => {
    try {
      const response = await fetch('https://pet-shop-eiab.onrender.com/api/Usuario');
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      
      const allUsers = await response.json();
      return allUsers.length;
    } catch (error) {
      console.error("Erro ao buscar total de usuários:", error);
      return 0;
    }
  }, []);

  // Monitora estado de autenticação e carrega dados
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          setLoading(true);
          
          // Busca dados do usuário e total de usuários em paralelo
          const [userData, totalUsers] = await Promise.all([
            fetchUserData(currentUser),
            fetchTotalUsers()
          ]);
          
          if (userData) {
            setUserLogado(userData);
          } else {
            // Fallback para dados mockados se a API falhar
            setUserLogado({
              id: 1,
              nome: 'Administrador Mock',
              email: 'admin@mock.com',
              perfil: 'Administrador',
              avatar: 'https://i.pravatar.cc/150?img=5'
            });
            setError('Falha ao conectar com a API. Dados mockados em uso.');
          }
          
          setTotalUsuarios(totalUsers);
        } catch (error) {
          console.error("Erro ao carregar dados:", error);
          setError(error.message);
        } finally {
          setLoading(false);
        }
      } else {
        // Redirecionar para login se não estiver autenticado
        // Você pode adicionar um redirecionamento aqui se necessário
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [fetchUserData, fetchTotalUsers]);

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

    if (!userLogado) {
      return (
        <div className="dashboard-content">
          <h2>Usuário não autenticado</h2>
          <p>Por favor, faça login para acessar o painel administrativo.</p>
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
                <p>{error}</p>
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
        case 'Mensagens':
  return <MensagensContato />;

      case 'Newsletters':
  return < Newsletters />;

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
          {userLogado && (
            <div className="user-info">
              <img 
                src={userLogado.avatar} 
                alt="Avatar" 
                className="user-avatar"
                onError={(e) => {
                  e.target.src = generateDefaultAvatar(userLogado.nome);
                }}
              />
              <span>{userLogado.nome}</span>
              <small>{userLogado.perfil}</small>
            </div>
          )}
        </div>
        <nav className="menu">
          <ul>
            {['Dashboard', 'Produtos', 'Usuários', 'Pedidos','Mensagens','Newsletters','Configurações'].map((item) => (
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