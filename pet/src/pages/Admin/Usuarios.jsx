import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Table, Button, Pagination, Badge, InputGroup, Form, 
  Modal, Spinner, Alert, OverlayTrigger, Tooltip,
  Container, Row, Col
} from 'react-bootstrap';
import { 
  BiSearch, BiRefresh, BiUserCheck, BiUserX, 
  BiSort, BiFilterAlt
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
  const [successMessage, setSuccessMessage] = useState(null);
  const [showAdminConfirmModal, setShowAdminConfirmModal] = useState(false);
  const [adminConfirmData, setAdminConfirmData] = useState(null);
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
        nome: user.nome?.trim() || 'Sem nome',
        email: user.email?.trim()?.toLowerCase() || 'Sem email',
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
  const handleSearch = useMemo(() => debounce((term) => {
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
  const toggleAdminStatus = (userId, email, isCurrentlyAdmin) => {
    setAdminConfirmData({ userId, email, isCurrentlyAdmin });
    setShowAdminConfirmModal(true);
  };

  const confirmAdminChange = async () => {
    if (!adminConfirmData) return;
    
    const { userId, email, isCurrentlyAdmin } = adminConfirmData;
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
        const text = await response.text();
        let errorData;
        try {
          errorData = text ? JSON.parse(text) : {};
        } catch {
          errorData = { message: text || 'Erro ao alterar status' };
        }
        throw new Error(errorData.message || 'Erro ao alterar status');
      }
      
      await loadUsers();
      setSuccessMessage(`Status de admin alterado para ${email}`);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error('Erro:', err);
      setError(err.message || 'Erro ao alterar status de admin');
    } finally {
      setIsLoading(false);
      setShowAdminConfirmModal(false);
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

  // Render table rows
  const renderTableRows = () => {
    if (currentUsers.length === 0) {
      return (
        <tr>
          <td colSpan="6" className="text-center py-4">
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

      {/* Admin Confirm Modal */}
      <Modal show={showAdminConfirmModal} onHide={() => !isLoading && setShowAdminConfirmModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Alteração</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Tem certeza que deseja {adminConfirmData?.isCurrentlyAdmin ? 'remover' : 'conceder'} 
          privilégios de administrador para {adminConfirmData?.email}?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAdminConfirmModal(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={confirmAdminChange} disabled={isLoading}>
            {isLoading ? <Spinner size="sm" /> : 'Confirmar'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Usuarios;