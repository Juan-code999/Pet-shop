import React, { useState, useEffect, useCallback } from 'react';
import { 
  Table, Button, Pagination, Badge, InputGroup, Form, 
  Modal, Spinner, Alert, OverlayTrigger, Tooltip
} from 'react-bootstrap';
import { 
  BiSearch, BiRefresh, BiTrash, BiEdit, BiStar, 
  BiFilterAlt, BiSort
} from 'react-icons/bi';
import { debounce } from 'lodash';
import '../../styles/ProductList.css';

const ProductList = () => {
  // States
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [speciesFilter, setSpeciesFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'nome', direction: 'asc' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const API_URL = 'http://localhost:5005/api/Produtos';

  // Load products
  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Error loading products');
      
      const data = await response.json();
      console.log('API Response:', data); // Debug log

      // Normalize product data structure
      const normalizedProducts = data.map(product => ({
        id: product.id || product.Id,
        nome: product.nome || product.Nome || 'Unnamed Product',
        descricao: product.descricao || product.Descricao,
        categoria: product.categoria || product.Categoria || 'Uncategorized',
        especieAnimal: product.especieAnimal || product.EspecieAnimal || 'Unknown',
        marca: product.marca || product.Marca,
        imagensUrl: product.imagensUrl || product.ImagensUrl || [],
        tamanhos: product.tamanhos || product.Tamanhos || [],
        destaque: product.destaque || product.Destaque || false,
        desconto: product.desconto || product.Desconto || 0,
        disponivel: product.disponivel || product.Disponivel || false
      }));

      setProducts(normalizedProducts);
      setFilteredProducts(normalizedProducts);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Effects
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    let result = [...products];
    
    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(product => 
        (product.nome?.toLowerCase().includes(term)) || 
        (product.descricao?.toLowerCase().includes(term)) ||
        (product.marca?.toLowerCase().includes(term))
      );
    }
    
    // Featured filter
    if (showFeaturedOnly) {
      result = result.filter(product => product.destaque);
    }
    
    // Category filter
    if (categoryFilter !== 'All') {
      result = result.filter(product => product.categoria === categoryFilter);
    }
    
    // Species filter
    if (speciesFilter !== 'All') {
      result = result.filter(product => product.especieAnimal === speciesFilter);
    }
    
    // Sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key]?.toString().toLowerCase();
        const bValue = b[sortConfig.key]?.toString().toLowerCase();
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    setFilteredProducts(result);
    setCurrentPage(1);
  }, [searchTerm, showFeaturedOnly, categoryFilter, speciesFilter, products, sortConfig]);

  // Debounce search
  const debouncedSearch = debounce((term) => {
    setSearchTerm(term);
  }, 300);

  // Pagination
  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Helper functions
  const renderPrices = (sizes) => {
    if (!sizes || sizes.length === 0) return 'N/A';
    return sizes.map((s, i) => (
      <span key={`size-${i}`}>
        {s.Tamanho || s.tamanho}: ${(s.PrecoTotal || s.precoTotal)?.toFixed(2) || '0.00'}
        {i < sizes.length - 1 ? ', ' : ''}
      </span>
    ));
  };

  const confirmDelete = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/${productToDelete.id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Error deleting product');
      
      await loadProducts();
      setShowDeleteModal(false);
    } catch (err) {
      console.error('Error:', err);
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

  // Get unique categories and species for filters
  const categories = ['All', ...new Set(products.map(p => p.categoria).filter(Boolean))];
  const species = ['All', ...new Set(products.map(p => p.especieAnimal).filter(Boolean))];

  return (
    <div className="admin-product-list-container">
      <div className="admin-product-content">
        {/* Header */}
        <div className="admin-product-header">
          <h2>
            <span className="badge bg-primary me-2">{filteredProducts.length}</span>
            Product Management
          </h2>
          <Button 
            variant="outline-primary" 
            onClick={loadProducts}
            disabled={isLoading}
          >
            <BiRefresh /> {isLoading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>

        {/* Alerts */}
        {error && (
          <Alert variant="danger" onClose={() => setError(null)} dismissible>
            {error}
          </Alert>
        )}

        {/* Filters */}
        <div className="admin-product-filters">
          <InputGroup className="admin-search-input">
            <InputGroup.Text>
              <BiSearch />
            </InputGroup.Text>
            <Form.Control
              placeholder="Search by name, description or brand..."
              onChange={(e) => debouncedSearch(e.target.value)}
              disabled={isLoading}
            />
          </InputGroup>

          <div className="admin-filter-controls">
            <Form.Check
              type="switch"
              id="featured-switch"
              label={
                <span className="d-flex align-items-center gap-1">
                  <BiStar /> Featured
                </span>
              }
              checked={showFeaturedOnly}
              onChange={(e) => setShowFeaturedOnly(e.target.checked)}
              disabled={isLoading}
            />

            <Form.Select
              size="sm"
              className="admin-filter-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              disabled={isLoading}
            >
              {categories.map((category, index) => (
                <option key={`category-${index}`} value={category}>
                  {category}
                </option>
              ))}
            </Form.Select>

            <Form.Select
              size="sm"
              className="admin-filter-select"
              value={speciesFilter}
              onChange={(e) => setSpeciesFilter(e.target.value)}
              disabled={isLoading}
            >
              {species.map((specie, index) => (
                <option key={`specie-${index}`} value={specie}>
                  {specie}
                </option>
              ))}
            </Form.Select>
          </div>
        </div>

        {/* Table */}
        <div className="admin-table-responsive">
          {isLoading && products.length === 0 ? (
            <div className="admin-loading-container">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Loading products...</p>
            </div>
          ) : (
            <Table striped hover className="admin-product-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th onClick={() => requestSort('nome')} className="admin-sortable-header">
                    <div className="d-flex align-items-center gap-1">
                      Name {renderSortIcon('nome')}
                    </div>
                  </th>
                  <th>Category</th>
                  <th>Species</th>
                  <th>Prices</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentProducts.length > 0 ? (
                  currentProducts.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <img 
                          src={
                            product.imagensUrl?.[0] || 
                            '/placeholder-product.png'
                          } 
                          alt={product.nome}
                          className="admin-product-image"
                          onError={(e) => {
                            e.target.onerror = null; 
                            e.target.src = '/placeholder-product.png';
                          }}
                        />
                      </td>
                      <td>
                        <div className="admin-product-name">
                          <strong>{product.nome}</strong>
                          {product.marca && (
                            <small className="text-muted">{product.marca}</small>
                          )}
                        </div>
                      </td>
                      <td>{product.categoria}</td>
                      <td>{product.especieAnimal}</td>
                      <td>{renderPrices(product.tamanhos)}</td>
                      <td>
                        <Badge pill bg={product.disponivel ? "success" : "secondary"}>
                          {product.disponivel ? 'Available' : 'Unavailable'}
                        </Badge>
                        {product.destaque && (
                          <Badge pill bg="warning" className="ms-1">
                            <BiStar /> Featured
                          </Badge>
                        )}
                        {product.desconto > 0 && (
                          <Badge pill bg="danger" className="ms-1">
                            {product.desconto}% OFF
                          </Badge>
                        )}
                      </td>
                      <td className="admin-actions-cell">
                        <OverlayTrigger placement="top" overlay={<Tooltip>Edit</Tooltip>}>
                          <Button variant="outline-primary" size="sm" disabled={isLoading}>
                            <BiEdit />
                          </Button>
                        </OverlayTrigger>
                        
                        <OverlayTrigger placement="top" overlay={<Tooltip>Delete</Tooltip>}>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => confirmDelete(product)}
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
                    <td colSpan="7" className="admin-no-results">
                      {searchTerm || showFeaturedOnly || categoryFilter !== 'All' || speciesFilter !== 'All'
                        ? 'No products found with current filters' 
                        : 'No products registered'}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="admin-pagination-container">
            <div className="admin-pagination-info">
              Showing {indexOfFirstProduct + 1}-{Math.min(indexOfLastProduct, filteredProducts.length)} of {filteredProducts.length} products
            </div>
            
            <Pagination className="admin-pagination-controls">
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

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the product <strong>{productToDelete?.nome}</strong>? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={isLoading}>
            {isLoading ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                Deleting...
              </>
            ) : (
              'Confirm Deletion'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ProductList;