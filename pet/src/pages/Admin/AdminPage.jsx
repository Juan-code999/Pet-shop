import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/AdminPage.css';
import ProductList from './ProductList';
import Usuarios from './Usuarios';

export default function AdminPage() {
  const [menuAtivo, setMenuAtivo] = useState('Dashboard');
  const [userLogado, setUserLogado] = useState(null);
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [totalProdutos, setTotalProdutos] = useState(0);
  const [pedidosHoje, setPedidosHoje] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const API_URL = 'http://localhost:5005/api';
  const USUARIO_URL = `${API_URL}/Usuario`;
  const PRODUTO_URL = `${API_URL}/Produto`;
  const PEDIDO_URL = `${API_URL}/Pedido`;

  // Buscar dados iniciais
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 1. Buscar ID do usuário logado do localStorage (exemplo)
        const userIdLogado = localStorage.getItem('userId');
        
        if (!userIdLogado) {
          navigate('/login'); // Redireciona se não estiver logado
          return;
        }

        // 2. Buscar dados do usuário logado
        const [userResponse, usersResponse, produtosResponse, pedidosResponse] = await Promise.all([
          fetch(`${USUARIO_URL}/${userIdLogado}`),
          fetch(USUARIO_URL),
          fetch(PRODUTO_URL),
          fetch(`${PEDIDO_URL}/hoje`) // Endpoint fictício para pedidos de hoje
        ]);

        // Verificar respostas
        if (!userResponse.ok) throw new Error('Erro ao carregar usuário');
        if (!usersResponse.ok) throw new Error('Erro ao carregar lista de usuários');
        if (!produtosResponse.ok) throw new Error('Erro ao carregar lista de produtos');
        
        // Processar dados
        const userData = await userResponse.json();
        const allUsers = await usersResponse.json();
        const allProdutos = await produtosResponse.json();
        
        setUserLogado(userData);
        setTotalUsuarios(allUsers.length);
        setTotalProdutos(allProdutos.length);

        // Tentar processar pedidos (pode falhar silenciosamente)
        try {
          if (pedidosResponse.ok) {
            const pedidosHojeData = await pedidosResponse.json();
            setPedidosHoje(pedidosHojeData.length);
          }
        } catch (e) {
          console.warn('Não foi possível carregar pedidos:', e);
        }

      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const renderConteudo = () => {
    switch (menuAtivo) {
      case 'Dashboard':
        return (
          <div className="dashboard-content">
            {loading ? (
              <div className="loading-spinner">Carregando...</div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : (
              <>
                <h2>Bem-vindo, {userLogado?.nome || 'Administrador'}!</h2>
                <p className="user-email">{userLogado?.email}</p>
                
                <div className="dashboard-stats">
                  <div className="stat-card">
                    <h3>Total de Usuários</h3>
                    <div className="stat-value">{totalUsuarios}</div>
                    <div className="stat-trend">+5% em relação ao mês passado</div>
                  </div>
                  
                  <div className="stat-card">
                    <h3>Total de Produtos</h3>
                    <div className="stat-value">{totalProdutos}</div>
                    <div className="stat-trend">+12% em relação ao mês passado</div>
                  </div>
                  
                  <div className="stat-card">
                    <h3>Pedidos Hoje</h3>
                    <div className="stat-value">{pedidosHoje}</div>
                    <div className="stat-trend">+3% em relação a ontem</div>
                  </div>
                </div>

                <div className="recent-activity">
                  <h3>Atividade Recente</h3>
                  <ul>
                    <li>Novo usuário cadastrado: João Silva</li>
                    <li>Pedido #1234 realizado com sucesso</li>
                    <li>Produto "Ração Premium" atualizado</li>
                  </ul>
                </div>
              </>
            )}
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
            <div className="coming-soon">Módulo em desenvolvimento</div>
          </div>
        );
      case 'Configurações':
        return (
          <div className="dashboard-content">
            <h2>Configurações do sistema</h2>
            <div className="settings-section">
              <h3>Preferências</h3>
              <div className="setting-item">
                <label>Notificações por email</label>
                <input type="checkbox" defaultChecked />
              </div>
              <div className="setting-item">
                <label>Tema escuro</label>
                <input type="checkbox" />
              </div>
            </div>
            <div className="settings-section">
              <h3>Sessão</h3>
              <button onClick={handleLogout} className="logout-btn">
                Sair do Sistema
              </button>
            </div>
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
        <div className="sidebar-header">
          <h1 className="logo">PetShop Admin</h1>
          {userLogado && (
            <div className="user-info">
              <img 
                src={userLogado.foto || 'https://i.imgur.com/8Km9tLL.jpg'} 
                alt={userLogado.nome}
                className="user-avatar"
              />
              <span className="user-name">{userLogado.nome}</span>
              <span className="user-role">{userLogado.isAdmin ? 'Administrador' : 'Usuário'}</span>
            </div>
          )}
        </div>
        
        <nav className="menu">
          <ul>
            <li className={menuAtivo === 'Dashboard' ? 'ativo' : ''} onClick={() => setMenuAtivo('Dashboard')}>
              <i className="icon dashboard-icon"></i>
              Dashboard
            </li>
            <li className={menuAtivo === 'Produtos' ? 'ativo' : ''} onClick={() => setMenuAtivo('Produtos')}>
              <i className="icon products-icon"></i>
              Produtos
            </li>
            <li className={menuAtivo === 'Usuários' ? 'ativo' : ''} onClick={() => setMenuAtivo('Usuários')}>
              <i className="icon users-icon"></i>
              Usuários
            </li>
            <li className={menuAtivo === 'Pedidos' ? 'ativo' : ''} onClick={() => setMenuAtivo('Pedidos')}>
              <i className="icon orders-icon"></i>
              Pedidos
            </li>
            <li className={menuAtivo === 'Configurações' ? 'ativo' : ''} onClick={() => setMenuAtivo('Configurações')}>
              <i className="icon settings-icon"></i>
              Configurações
            </li>
          </ul>
        </nav>
        
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <i className="icon logout-icon"></i>
            Sair
          </button>
        </div>
      </aside>

      <main className="main-content">
        {renderConteudo()}
      </main>
    </div>
  );
}