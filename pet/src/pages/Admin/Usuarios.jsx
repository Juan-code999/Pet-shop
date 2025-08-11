import React, { useState, useEffect, useCallback } from 'react';
import { 
  Table, Button, Pagination, Badge, InputGroup, Form, 
  Modal, Spinner, Alert, OverlayTrigger, Tooltip,
  Container, Row, Col
} from 'react-bootstrap';
import { 
  BiSearch, BiRefresh, BiTrash, BiUserCheck, BiUserX, 
  BiEdit, BiSort, BiFilterAlt, BiPlus
} from 'react-icons/bi';
import { debounce } from 'lodash';
import { useNavigate } from 'react-router-dom';
import '../../styles/Usuarios.css';

const Usuarios = () => {
  // States
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdminsOnly, setShowAdminsOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'nome', direction: 'asc' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const navigate = useNavigate();

  // Generate unique ID for temporary users
  const generateUniqueId = () => `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Generate default avatar
  const generateDefaultAvatar = (name) => {
    const initial = name?.charAt(0)?.toUpperCase() || 'U';
    const hue = Math.floor(Math.random() * 360);
    return `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'><rect width='150' height='150' fill='hsl(${hue}, 70%, 60%)' rx='75'/><text x='50%' y='50%' dy='.35em' text-anchor='middle' font-family='Arial, sans-serif' font-size='72' fill='#fff'>${initial}</text></svg>`;
  };

  // Load users from API
  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5005/api/Usuario', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      const normalizedUsers = data.map(user => ({
        ...user,
        id: user._id || user.id || generateUniqueId(),
        nome: user.nome || 'Sem nome',
        email: user.email || 'Sem email',
        endereco: user.endereco || {
          rua: '',
          numero: '',
          complemento: '',
          bairro: '',
          cidade: '',
          estado: '',
          cep: ''
        },
        foto: user.foto || generateDefaultAvatar(user.nome),
        telefone: user.telefone || 'Não informado',
        isAdmin: user.isAdmin || false
      }));

      setUsers(normalizedUsers);
      setFilteredUsers(normalizedUsers);
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
      setError(err.message || 'Erro ao carregar usuários');
      if (err.message.includes('autenticação')) {
        navigate('/login');
      }
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Filter, sort and search users
  useEffect(() => {
    let result = [...users];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(user => 
        (user.nome && user.nome.toLowerCase().includes(term)) || 
        (user.email && user.email.toLowerCase().includes(term)) ||
        (user.telefone && user.telefone.toLowerCase().includes(term))
      );
    }
    
    if (showAdminsOnly) {
      result = result.filter(user => user.isAdmin);
    }
    
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key] || '';
        const bValue = b[sortConfig.key] || '';
        
        if (typeof aValue === 'boolean' || typeof bValue === 'boolean') {
          return sortConfig.direction === 'asc' 
            ? (aValue === bValue ? 0 : aValue ? -1 : 1)
            : (aValue === bValue ? 0 : aValue ? 1 : -1);
        }
        
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

  // Debounced search
  const handleSearch = useCallback(debounce((term) => {
    setSearchTerm(term);
  }, 300), []);

  // Pagination calculations
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Format address display
  const renderAddress = (endereco) => {
    if (!endereco) return 'Não informado';
    
    const parts = [
      endereco.rua,
      endereco.numero && `, ${endereco.numero}`,
      endereco.complemento && ` (${endereco.complemento})`,
      endereco.bairro && ` - ${endereco.bairro}`,
      endereco.cidade && `, ${endereco.cidade}`,
      endereco.estado && `/${endereco.estado}`
    ].filter(Boolean);
    
    return parts.length > 0 ? parts.join('') : 'Não informado';
  };

  // Toggle admin status
  const toggleAdminStatus = async (userId, email, isCurrentlyAdmin) => {
    if (!window.confirm(`Tem certeza que deseja ${isCurrentlyAdmin ? 'remover' : 'conceder'} privilégios de administrador para ${email}?`)) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5005/api/Usuario/admin-status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          userId,
          email, 
          isAdmin: !isCurrentlyAdmin 
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao alterar status');
      }
      
      await loadUsers();
      setSuccessMessage(`Status de admin alterado para ${email}`);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error('Erro:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle edit user
  const handleEdit = (user) => {
    if (!user?.id) {
      setError('Usuário inválido para edição');
      return;
    }
    setUserToEdit({
      ...user,
      endereco: user.endereco || {
        rua: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: ''
      }
    });
    setShowEditModal(true);
  };

  // Handle delete confirmation
  const confirmDelete = (user) => {
    if (!user?.id) {
      setError('Usuário inválido para exclusão');
      return;
    }
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  // Handle user deletion
  const handleDelete = async () => {
    if (!userToDelete?.id) {
      setError('Nenhum usuário selecionado para exclusão');
      setShowDeleteModal(false);
      return;
    }

    setIsLoading(true);
    
    try {
      if (userToDelete.id.startsWith('temp-')) {
        setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
        setFilteredUsers(prev => prev.filter(u => u.id !== userToDelete.id));
        setSuccessMessage('Usuário removido localmente');
      } else {
        const response = await fetch(`http://localhost:5005/api/Usuario/${userToDelete.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Erro ao excluir usuário');
        }

        await loadUsers();
        setSuccessMessage(`Usuário "${userToDelete.nome}" removido com sucesso`);
      }
      
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error('Erro ao excluir usuário:', err);
      setError(`Falha ao excluir usuário: ${err.message}`);
    } finally {
      setIsLoading(false);
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  // Handle sort request
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Render sort icon
  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return <BiSort className="text-muted" />;
    return sortConfig.direction === 'asc' 
      ? <BiSort className="text-primary" /> 
      : <BiSort className="text-primary" style={{ transform: 'rotate(180deg)' }} />;
  };

  // Save edited user
  const handleSaveEdit = async () => {
    if (!userToEdit?.id) {
      setError('Usuário inválido para edição');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5005/api/Usuario/${userToEdit.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          nome: userToEdit.nome,
          email: userToEdit.email,
          telefone: userToEdit.telefone,
          foto: userToEdit.foto,
          endereco: userToEdit.endereco
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao atualizar usuário');
      }
      
      await loadUsers();
      setShowEditModal(false);
      setSuccessMessage(`Usuário ${userToEdit.nome} atualizado com sucesso`);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error('Erro:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Render table rows
  const renderTableRows = () => {
    if (currentUsers.length === 0) {
      return (
        <tr>
          <td colSpan="7" className="text-center py-4">
            {isLoading ? (
              <Spinner animation="border" variant="primary" />
            ) : (
              searchTerm || showAdminsOnly 
                ? 'Nenhum usuário encontrado com os filtros atuais' 
                : 'Nenhum usuário cadastrado'
            )}
          </td>
        </tr>
      );
    }

    return currentUsers.map((user) => (
      <tr key={user.id}>
        <td className="align-middle">
          <img 
            src={user.foto} 
            alt={`Avatar de ${user.nome}`}
            className="user-avatar rounded-circle"
            onError={(e) => {
              e.target.src = generateDefaultAvatar(user.nome);
            }}
          />
        </td>
        <td className="align-middle">{user.nome}</td>
        <td className="align-middle">{user.email}</td>
        <td className="align-middle">{user.telefone}</td>
        <td className="align-middle">{renderAddress(user.endereco)}</td>
        <td className="align-middle">
          <Badge pill bg={user.isAdmin ? "primary" : "secondary"}>
            {user.isAdmin ? 'Admin' : 'Usuário'}
          </Badge>
        </td>
        <td className="align-middle">
          <div className="d-flex gap-2">
            <OverlayTrigger overlay={<Tooltip>{user.isAdmin ? 'Remover admin' : 'Tornar admin'}</Tooltip>}>
              <Button
                variant={user.isAdmin ? "outline-warning" : "outline-success"}
                size="sm"
                onClick={() => toggleAdminStatus(user.id, user.email, user.isAdmin)}
                disabled={isLoading}
              >
                {user.isAdmin ? <BiUserX /> : <BiUserCheck />}
              </Button>
            </OverlayTrigger>
            
            <OverlayTrigger overlay={<Tooltip>Editar</Tooltip>}>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => handleEdit(user)}
                disabled={isLoading}
              >
                <BiEdit />
              </Button>
            </OverlayTrigger>
            
            <OverlayTrigger overlay={<Tooltip>Excluir</Tooltip>}>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => confirmDelete(user)}
                disabled={isLoading}
              >
                <BiTrash />
              </Button>
            </OverlayTrigger>
          </div>
        </td>
      </tr>
    ));
  };

  // Render pagination items
  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    
    // Previous button
    items.push(
      <Pagination.Prev 
        key="prev"
        onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
        disabled={currentPage === 1 || isLoading} 
      />
    );

    // Always show first page
    if (currentPage > maxVisiblePages / 2 + 1) {
      items.push(
        <Pagination.Item 
          key={1}
          active={1 === currentPage}
          onClick={() => setCurrentPage(1)}
        >
          1
        </Pagination.Item>
      );
      if (currentPage > maxVisiblePages / 2 + 2) {
        items.push(<Pagination.Ellipsis key="ellipsis-start" />);
      }
    }

    // Middle pages
    const startPage = Math.max(1, Math.min(
      currentPage - Math.floor(maxVisiblePages / 2),
      totalPages - maxVisiblePages + 1
    ));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <Pagination.Item 
          key={i}
          active={i === currentPage}
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </Pagination.Item>
      );
    }

    // Always show last page
    if (currentPage < totalPages - Math.floor(maxVisiblePages / 2)) {
      if (currentPage < totalPages - Math.floor(maxVisiblePages / 2) - 1) {
        items.push(<Pagination.Ellipsis key="ellipsis-end" />);
      }
      items.push(
        <Pagination.Item 
          key={totalPages}
          active={totalPages === currentPage}
          onClick={() => setCurrentPage(totalPages)}
        >
          {totalPages}
        </Pagination.Item>
      );
    }

    // Next button
    items.push(
      <Pagination.Next 
        key="next"
        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
        disabled={currentPage === totalPages || isLoading} 
      />
    );

    return items;
  };

  return (
    <Container fluid className="usuarios-container py-4">
      <Row>
        <Col>
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0">
              <Badge bg="primary" className="me-2">{filteredUsers.length}</Badge>
              Gerenciamento de Usuários
            </h2>
            <div>
              <Button 
                variant="primary"
                className="me-2"
                onClick={() => navigate('/usuarios/novo')}
              >
                <BiPlus className="me-1" /> Novo Usuário
              </Button>
              <Button 
                variant="outline-secondary" 
                onClick={loadUsers}
                disabled={isLoading}
              >
                <BiRefresh className={isLoading ? 'spin' : ''} /> 
                {isLoading ? ' Carregando...' : ' Atualizar'}
              </Button>
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-3">
              {error}
            </Alert>
          )}

          {successMessage && (
            <Alert variant="success" dismissible onClose={() => setSuccessMessage(null)} className="mb-3">
              {successMessage}
            </Alert>
          )}

          {/* Filters */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <InputGroup style={{ maxWidth: '400px' }}>
              <InputGroup.Text>
                <BiSearch />
              </InputGroup.Text>
              <Form.Control
                placeholder="Pesquisar por nome, email ou telefone..."
                onChange={(e) => handleSearch(e.target.value)}
                disabled={isLoading}
              />
            </InputGroup>

            <Form.Check
              type="switch"
              id="admin-switch"
              label={
                <span className="d-flex align-items-center">
                  <BiFilterAlt className="me-1" /> Mostrar apenas admins
                </span>
              }
              checked={showAdminsOnly}
              onChange={(e) => setShowAdminsOnly(e.target.checked)}
              disabled={isLoading}
            />
          </div>

          {/* Table */}
          <div className="table-responsive mb-3">
            <Table striped hover className="mb-0">
              <thead className="table-dark">
                <tr>
                  <th>Avatar</th>
                  <th 
                    onClick={() => requestSort('nome')} 
                    className="sortable-header"
                  >
                    <div className="d-flex align-items-center">
                      Nome {renderSortIcon('nome')}
                    </div>
                  </th>
                  <th 
                    onClick={() => requestSort('email')} 
                    className="sortable-header"
                  >
                    <div className="d-flex align-items-center">
                      Email {renderSortIcon('email')}
                    </div>
                  </th>
                  <th>Telefone</th>
                  <th>Endereço</th>
                  <th 
                    onClick={() => requestSort('isAdmin')} 
                    className="sortable-header"
                  >
                    <div className="d-flex align-items-center">
                      Tipo {renderSortIcon('isAdmin')}
                    </div>
                  </th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {renderTableRows()}
              </tbody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center">
              <div className="text-muted">
                Mostrando {indexOfFirstUser + 1} a {Math.min(indexOfLastUser, filteredUsers.length)} de {filteredUsers.length} usuários
              </div>
              <Pagination className="mb-0">
                {renderPaginationItems()}
              </Pagination>
            </div>
          )}
        </Col>
      </Row>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => !isLoading && setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Exclusão</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Tem certeza que deseja excluir permanentemente o usuário <strong>{userToDelete?.nome || 'selecionado'}</strong>? Esta ação não pode ser desfeita.
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowDeleteModal(false)} 
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDelete} 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Excluindo...
              </>
            ) : 'Confirmar Exclusão'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit User Modal */}
      <Modal show={showEditModal} onHide={() => !isLoading && setShowEditModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Editar Usuário</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {userToEdit ? (
            <Form>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nome</Form.Label>
                    <Form.Control
                      value={userToEdit.nome}
                      onChange={(e) => setUserToEdit({...userToEdit, nome: e.target.value})}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={userToEdit.email}
                      onChange={(e) => setUserToEdit({...userToEdit, email: e.target.value})}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Telefone</Form.Label>
                    <Form.Control
                      value={userToEdit.telefone}
                      onChange={(e) => setUserToEdit({...userToEdit, telefone: e.target.value})}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Foto (URL)</Form.Label>
                    <Form.Control
                      value={userToEdit.foto}
                      onChange={(e) => setUserToEdit({...userToEdit, foto: e.target.value})}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <h5 className="mt-4">Endereço</h5>
              <Row>
                <Col md={8}>
                  <Form.Group className="mb-3">
                    <Form.Label>Rua</Form.Label>
                    <Form.Control
                      value={userToEdit.endereco.rua}
                      onChange={(e) => setUserToEdit({
                        ...userToEdit,
                        endereco: {...userToEdit.endereco, rua: e.target.value}
                      })}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Número</Form.Label>
                    <Form.Control
                      value={userToEdit.endereco.numero}
                      onChange={(e) => setUserToEdit({
                        ...userToEdit,
                        endereco: {...userToEdit.endereco, numero: e.target.value}
                      })}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Complemento</Form.Label>
                    <Form.Control
                      value={userToEdit.endereco.complemento}
                      onChange={(e) => setUserToEdit({
                        ...userToEdit,
                        endereco: {...userToEdit.endereco, complemento: e.target.value}
                      })}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Bairro</Form.Label>
                    <Form.Control
                      value={userToEdit.endereco.bairro}
                      onChange={(e) => setUserToEdit({
                        ...userToEdit,
                        endereco: {...userToEdit.endereco, bairro: e.target.value}
                      })}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Cidade</Form.Label>
                    <Form.Control
                      value={userToEdit.endereco.cidade}
                      onChange={(e) => setUserToEdit({
                        ...userToEdit,
                        endereco: {...userToEdit.endereco, cidade: e.target.value}
                      })}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Estado</Form.Label>
                    <Form.Control
                      value={userToEdit.endereco.estado}
                      onChange={(e) => setUserToEdit({
                        ...userToEdit,
                        endereco: {...userToEdit.endereco, estado: e.target.value}
                      })}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>CEP</Form.Label>
                    <Form.Control
                      value={userToEdit.endereco.cep}
                      onChange={(e) => setUserToEdit({
                        ...userToEdit,
                        endereco: {...userToEdit.endereco, cep: e.target.value}
                      })}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          ) : (
            <Alert variant="danger">Usuário não encontrado</Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowEditModal(false)} 
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSaveEdit} 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Salvando...
              </>
            ) : 'Salvar Alterações'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Usuarios;