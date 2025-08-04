import React, { useState, useEffect, useCallback } from 'react';
import { 
  Table, Button, Pagination, Badge, InputGroup, Form, 
  Modal, Spinner, Alert, OverlayTrigger, Tooltip
} from 'react-bootstrap';
import { 
  BiSearch, BiRefresh, BiTrash, BiUserCheck, BiUserX, 
  BiEdit, BiSort, BiFilterAlt
} from 'react-icons/bi';
import { debounce } from 'lodash';
import '../../styles/Usuarios.css';

const Usuarios = () => {
  // Estados
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(12);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdminsOnly, setShowAdminsOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'nome', direction: 'asc' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Carregar usuários
  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5005/api/Usuario');
      if (!response.ok) throw new Error('Erro ao carregar usuários');
      
      const data = await response.json();
      setUsers(data);
      setFilteredUsers(data);
    } catch (err) {
      console.error('Erro:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Efeitos
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    let result = [...users];
    
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
    
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    setFilteredUsers(result);
    setCurrentPage(1);
  }, [searchTerm, showAdminsOnly, users, sortConfig]);

  // Debounce para pesquisa
  const debouncedSearch = debounce((term) => {
    setSearchTerm(term);
  }, 300);

  // Paginação
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Funções auxiliares
  const renderAddress = (endereco) => {
    if (!endereco) return 'N/A';
    return `${endereco.rua}, ${endereco.numero} - ${endereco.bairro}`;
  };

  const toggleAdminStatus = async (userId, email, isCurrentlyAdmin) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5005/api/Usuario/promover', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(email)
      });
      
      if (!response.ok) throw new Error('Erro ao alterar status');
      
      await loadUsers();
    } catch (err) {
      console.error('Erro:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5005/api/Usuario/${userToDelete.id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Erro ao excluir usuário');
      
      await loadUsers();
      setShowDeleteModal(false);
    } catch (err) {
      console.error('Erro:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return <BiSort className="text-muted" />;
    return sortConfig.direction === 'asc' 
      ? <BiSort className="text-primary" /> 
      : <BiSort className="text-primary" style={{ transform: 'rotate(180deg)' }} />;
  };

  return (
    <div className="usuarios-container">
      <div className="usuarios-content">
        {/* Header */}
        <div className="usuarios-header">
          <h2>
            <span className="badge bg-primary me-2">{filteredUsers.length}</span>
            Gerenciamento de Usuários
          </h2>
          <Button 
            variant="outline-primary" 
            onClick={loadUsers}
            disabled={isLoading}
          >
            <BiRefresh /> {isLoading ? 'Carregando...' : 'Atualizar'}
          </Button>
        </div>

        {/* Alertas */}
        {error && (
          <Alert variant="danger" onClose={() => setError(null)} dismissible>
            {error}
          </Alert>
        )}

        {/* Filtros */}
        <div className="filtros-container">
          <InputGroup className="search-input">
            <InputGroup.Text>
              <BiSearch />
            </InputGroup.Text>
            <Form.Control
              placeholder="Pesquisar por nome ou email..."
              onChange={(e) => debouncedSearch(e.target.value)}
              disabled={isLoading}
            />
          </InputGroup>

          <div className="d-flex align-items-center gap-3">
            <Form.Check
              type="switch"
              id="admin-switch"
              label={
                <span className="d-flex align-items-center gap-1">
                  <BiFilterAlt /> Administradores
                </span>
              }
              checked={showAdminsOnly}
              onChange={(e) => setShowAdminsOnly(e.target.checked)}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Tabela */}
        <div className="table-responsive">
          {isLoading && users.length === 0 ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Carregando usuários...</p>
            </div>
          ) : (
            <Table striped hover className="usuarios-table">
              <thead>
                <tr>
                  <th>Avatar</th>
                  <th onClick={() => requestSort('nome')} className="sortable-header">
                    <div className="d-flex align-items-center gap-1">
                      Nome {renderSortIcon('nome')}
                    </div>
                  </th>
                  <th onClick={() => requestSort('email')} className="sortable-header">
                    <div className="d-flex align-items-center gap-1">
                      Email {renderSortIcon('email')}
                    </div>
                  </th>
                  <th>Endereço</th>
                  <th onClick={() => requestSort('isAdmin')} className="sortable-header">
                    <div className="d-flex align-items-center gap-1">
                      Tipo {renderSortIcon('isAdmin')}
                    </div>
                  </th>
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
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip>{user.isAdmin ? 'Remover Admin' : 'Tornar Admin'}</Tooltip>}
                        >
                          <Button
                            variant={user.isAdmin ? "outline-warning" : "outline-success"}
                            size="sm"
                            onClick={() => toggleAdminStatus(user.id, user.email, user.isAdmin)}
                            disabled={isLoading}
                          >
                            {user.isAdmin ? <BiUserX /> : <BiUserCheck />}
                          </Button>
                        </OverlayTrigger>
                        
                        <OverlayTrigger placement="top" overlay={<Tooltip>Editar</Tooltip>}>
                          <Button variant="outline-primary" size="sm" disabled>
                            <BiEdit />
                          </Button>
                        </OverlayTrigger>
                        
                        <OverlayTrigger placement="top" overlay={<Tooltip>Excluir</Tooltip>}>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => confirmDelete(user)}
                            disabled={isLoading}
                          >
                            <BiTrash />
                          </Button>
                        </OverlayTrigger>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      {searchTerm || showAdminsOnly 
                        ? 'Nenhum usuário encontrado com os filtros atuais' 
                        : 'Nenhum usuário cadastrado'}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </div>

        {/* Paginação Estilizada */}
        {totalPages > 1 && (
          <div className="pagination-container">
            <span className="pagination-info">
              Mostrando {indexOfFirstUser + 1}-{Math.min(indexOfLastUser, filteredUsers.length)} de {filteredUsers.length} usuários
            </span>
            
            <Pagination className="simplified-pagination">
              <Pagination.Prev 
                onClick={() => !isLoading && setCurrentPage(p => Math.max(1, p - 1))} 
                disabled={currentPage === 1 || isLoading} 
              />
              
              <Pagination.Item active>{currentPage}</Pagination.Item>
              
              {currentPage < totalPages && (
                <Pagination.Item 
                  onClick={() => !isLoading && setCurrentPage(currentPage + 1)}
                  disabled={isLoading}
                >
                  {currentPage + 1}
                </Pagination.Item>
              )}
              
              {currentPage < totalPages - 1 && (
                <Pagination.Item 
                  onClick={() => !isLoading && setCurrentPage(currentPage + 2)}
                  disabled={isLoading}
                >
                  {currentPage + 2}
                </Pagination.Item>
              )}
              
              {currentPage < totalPages - 2 && (
                <Pagination.Ellipsis disabled />
              )}
              
              <Pagination.Next 
                onClick={() => !isLoading && setCurrentPage(p => Math.min(totalPages, p + 1))} 
                disabled={currentPage === totalPages || isLoading} 
              />
            </Pagination>
          </div>
        )}
      </div>

      {/* Modal de Confirmação */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Exclusão</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Tem certeza que deseja excluir o usuário <strong>{userToDelete?.nome}</strong>? Esta ação não pode ser desfeita.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={isLoading}>
            {isLoading ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                Excluindo...
              </>
            ) : (
              'Confirmar Exclusão'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Usuarios;