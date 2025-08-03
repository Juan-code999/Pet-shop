import React, { useState, useEffect } from 'react';
import { Table, Button, Pagination, Badge, InputGroup, Form } from 'react-bootstrap';
import { BiSearch, BiRefresh, BiTrash, BiUserCheck, BiUserX } from 'react-icons/bi';
import '../../styles/Usuarios.css';

const Usuarios = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdminsOnly, setShowAdminsOnly] = useState(false);

  const usersPerPage = 8;
  const API_URL = 'http://localhost:5005/api/Usuario';

  const loadUsers = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Erro ao carregar usuários');
      
      const data = await response.json();
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao carregar usuários: ' + error.message);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    let result = users;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(user => 
        user.nome.toLowerCase().includes(term) || 
        user.email.toLowerCase().includes(term)
      );
    }
    
    if (showAdminsOnly) {
      result = result.filter(user => user.isAdmin);
    }
    
    setFilteredUsers(result);
    setCurrentPage(1);
  }, [searchTerm, showAdminsOnly, users]);

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const renderAddress = (endereco) => {
    if (!endereco) return 'N/A';
    return `${endereco.rua}, ${endereco.numero} - ${endereco.bairro}`;
  };

  const toggleAdminStatus = async (userId, email, isCurrentlyAdmin) => {
    try {
      const response = await fetch(`${API_URL}/promover`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(email)
      });
      
      if (!response.ok) throw new Error('Erro ao alterar status');
      
      loadUsers();
      alert(`Usuário ${isCurrentlyAdmin ? 'rebaixado' : 'promovido'} com sucesso!`);
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao alterar status: ' + error.message);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Tem certeza que deseja excluir este usuário?')) return;
    
    try {
      const response = await fetch(`${API_URL}/${userId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Erro ao excluir usuário');
      
      loadUsers();
      alert('Usuário excluído com sucesso!');
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao excluir usuário: ' + error.message);
    }
  };

  return (
    <div className="usuarios-container">
      <div className="usuarios-content">
        <div className="usuarios-header">
          <h2>Gerenciamento de Usuários</h2>
          <div className="usuarios-actions">
            <Button variant="outline-primary" onClick={loadUsers}>
              <BiRefresh className="icon" /> Atualizar
            </Button>
          </div>
        </div>

        <div className="filtros-container">
          <InputGroup className="search-input">
            <Form.Control
              placeholder="Pesquisar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button variant="outline-secondary">
              <BiSearch />
            </Button>
          </InputGroup>

          <Form.Check
            type="switch"
            id="admin-switch"
            label="Mostrar apenas administradores"
            checked={showAdminsOnly}
            onChange={(e) => setShowAdminsOnly(e.target.checked)}
          />
        </div>

        <div className="table-responsive">
          <Table striped hover className="usuarios-table">
            <thead>
              <tr>
                <th>Foto</th>
                <th>Nome</th>
                <th>Email</th>
                <th>Endereço</th>
                <th>Tipo</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.length > 0 ? (
                currentUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <img 
                        src={user.foto || 'https://i.imgur.com/8Km9tLL.jpg'} 
                        alt={user.nome}
                        className="user-avatar"
                      />
                    </td>
                    <td>{user.nome}</td>
                    <td>{user.email}</td>
                    <td>{renderAddress(user.endereco)}</td>
                    <td>
                      <Badge pill bg={user.isAdmin ? "primary" : "secondary"}>
                        {user.isAdmin ? 'Admin' : 'Usuário'}
                      </Badge>
                    </td>
                    <td className="actions-cell">
                      <Button
                        variant={user.isAdmin ? "outline-warning" : "outline-success"}
                        size="sm"
                        onClick={() => toggleAdminStatus(user.id, user.email, user.isAdmin)}
                      >
                        {user.isAdmin ? <BiUserX /> : <BiUserCheck />}
                        {user.isAdmin ? ' Remover Admin' : ' Tornar Admin'}
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => deleteUser(user.id)}
                      >
                        <BiTrash /> Excluir
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center">Nenhum usuário encontrado</td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="pagination-container">
          <Pagination>
            <Pagination.First 
              onClick={() => setCurrentPage(1)} 
              disabled={currentPage === 1} 
            />
            <Pagination.Prev 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
              disabled={currentPage === 1} 
            />
            
            {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = idx + 1;
              } else if (currentPage <= 3) {
                pageNum = idx + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + idx;
              } else {
                pageNum = currentPage - 2 + idx;
              }
              
              return (
                <Pagination.Item
                  key={pageNum}
                  active={pageNum === currentPage}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </Pagination.Item>
              );
            })}

            <Pagination.Next 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
              disabled={currentPage === totalPages} 
            />
            <Pagination.Last 
              onClick={() => setCurrentPage(totalPages)} 
              disabled={currentPage === totalPages} 
            />
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default Usuarios;