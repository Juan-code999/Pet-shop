import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Table, Button, Pagination, Badge, InputGroup, Form, 
  Modal, Spinner, Alert, OverlayTrigger, Tooltip, Container
} from 'react-bootstrap';
import { 
  BiSearch, BiRefresh, BiTrash, BiEdit, BiStar, 
  BiFilterAlt, BiSort, BiPlus, BiX, BiCheck
} from 'react-icons/bi';
import { debounce } from 'lodash';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../styles/ProductList.css';

const ProductList = () => {
  // States
  const [products, setProducts] = useState([]);
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
  const [successMessage, setSuccessMessage] = useState(null);
  
  const API_URL = 'http://localhost:5005/api/Produtos';
  const navigate = useNavigate();

  // Load products with axios and better error handling
  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(API_URL);
      
      // Normalize product data structure more robustly
      const normalizedProducts = response.data.map(product => ({
        id: product.id || product.Id || Math.random().toString(36).substr(2, 9),
        nome: product.nome || product.Nome || 'Unnamed Product',
        descricao: product.descricao || product.Descricao || '',
        categoria: product.categoria || product.Categoria || 'Uncategorized',
        especieAnimal: product.especieAnimal || product.EspecieAnimal || 'Unknown',
        marca: product.marca || product.Marca || '',
        imagensUrl: Array.isArray(product.imagensUrl) ? product.imagensUrl : 
                   Array.isArray(product.ImagensUrl) ? product.ImagensUrl : 
                   product.imagensUrl ? [product.imagensUrl] : 
                   product.ImagensUrl ? [product.ImagensUrl] : 
                   ['/placeholder-product.png'],
        tamanhos: product.tamanhos || product.Tamanhos || [],
        destaque: Boolean(product.destaque || product.Destaque || false),
        desconto: Number(product.desconto || product.Desconto || 0),
        disponivel: Boolean(product.disponivel || product.Disponivel || false),
        dataCriacao: product.dataCriacao || product.DataCriacao || new Date().toISOString()
      }));

      setProducts(normalizedProducts);
    } catch (err) {
      console.error('Error loading products:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Effects
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Memoized filtered and sorted products
  const filteredProducts = useMemo(() => {
    let result = [...products];
    
    // Apply filters
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(product => 
        (product.nome?.toLowerCase().includes(term)) || 
        (product.descricao?.toLowerCase().includes(term)) ||
        (product.marca?.toLowerCase().includes(term))
      );
    }
    
    if (showFeaturedOnly) result = result.filter(product => product.destaque);
    if (categoryFilter !== 'All') result = result.filter(product => product.categoria === categoryFilter);
    if (speciesFilter !== 'All') result = result.filter(product => product.especieAnimal === speciesFilter);
    
    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        // Handle nested properties and null values
        const aValue = a[sortConfig.key]?.toString().toLowerCase() || '';
        const bValue = b[sortConfig.key]?.toString().toLowerCase() || '';
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    return result;
  }, [products, searchTerm, showFeaturedOnly, categoryFilter, speciesFilter, sortConfig]);

  // Pagination calculations with all needed variables
  const { currentProducts, totalPages, indexOfFirstProduct, indexOfLastProduct } = useMemo(() => {
    const indexOfLastProduct = currentPage * itemsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    
    return { currentProducts, totalPages, indexOfFirstProduct, indexOfLastProduct };
  }, [filteredProducts, currentPage, itemsPerPage]);

  // Debounce search with cleanup
  const debouncedSearch = useMemo(
    () => debounce((term) => setSearchTerm(term), 300),
    []
  );

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

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
      await axios.delete(`${API_URL}/${productToDelete.id}`);
      setSuccessMessage(`Product "${productToDelete.nome}" deleted successfully`);
      await loadProducts();
      setShowDeleteModal(false);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error('Error deleting product:', err);
      setError(err.response?.data?.message || err.message || 'Failed to delete product');
    } finally {
      setIsLoading(false);
    }
  };

  const requestSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return <BiSort className="text-muted" />;
    return sortConfig.direction === 'asc' 
      ? <BiSort className="text-primary" /> 
      : <BiSort className="text-primary" style={{ transform: 'rotate(180deg)' }} />;
  };

  // Get unique categories and species for filters
  const { categories, species } = useMemo(() => {
    const uniqueCategories = new Set(products.map(p => p.categoria).filter(Boolean));
    const uniqueSpecies = new Set(products.map(p => p.especieAnimal).filter(Boolean));
    
    return {
      categories: ['All', ...uniqueCategories],
      species: ['All', ...uniqueSpecies]
    };
  }, [products]);

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setShowFeaturedOnly(false);
    setCategoryFilter('All');
    setSpeciesFilter('All');
    setSortConfig({ key: 'nome', direction: 'asc' });
    setCurrentPage(1);
  };

  const handleAddProduct = () => {
    navigate('/admin/products/new');
  };

  const handleEditProduct = (productId) => {
    navigate(`/admin/products/edit/${productId}`);
  };

  return (
    <Container fluid className="admin-product-list-container py-4">
      <div className="admin-product-content bg-white rounded-3 shadow-sm p-4">
        {/* Header */}
        <div className="admin-product-header mb-4">
          <h2 className="m-0 d-flex align-items-center">
            <Badge bg="primary" className="me-2">{filteredProducts.length}</Badge>
            Product Management
            <Button 
              variant="outline-success" 
              size="sm" 
              className="ms-3"
              onClick={handleAddProduct}
            >
              <BiPlus /> Add Product
            </Button>
          </h2>
          
          <Button 
            variant="outline-primary" 
            onClick={loadProducts}
            disabled={isLoading}
            className="d-flex align-items-center"
          >
            <BiRefresh className="me-1" /> 
            {isLoading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>

        {/* Alerts */}
        {error && (
          <Alert variant="danger" onClose={() => setError(null)} dismissible className="mb-4">
            <strong>Error:</strong> {error}
          </Alert>
        )}
        
        {successMessage && (
          <Alert variant="success" onClose={() => setSuccessMessage(null)} dismissible className="mb-4">
            <BiCheck className="me-2" size={20} />
            {successMessage}
          </Alert>
        )}

        {/* Filters */}
        <div className="admin-product-filters mb-4 p-3 bg-light rounded-3">
          <InputGroup className="admin-search-input mb-3 mb-md-0">
            <InputGroup.Text className="bg-white">
              <BiSearch />
            </InputGroup.Text>
            <Form.Control
              placeholder="Search by name, description or brand..."
              onChange={(e) => debouncedSearch(e.target.value)}
              disabled={isLoading}
              value={searchTerm}
            />
            {(searchTerm || showFeaturedOnly || categoryFilter !== 'All' || speciesFilter !== 'All') && (
              <Button 
                variant="outline-secondary" 
                onClick={resetFilters}
                title="Reset filters"
              >
                <BiX />
              </Button>
            )}
          </InputGroup>

          <div className="admin-filter-controls d-flex flex-wrap align-items-center gap-2">
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
              className="me-2"
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
        <div className="admin-table-responsive mb-4">
          {isLoading && products.length === 0 ? (
            <div className="admin-loading-container d-flex flex-column align-items-center justify-content-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Loading products...</p>
            </div>
          ) : (
            <Table striped hover className="admin-product-table mb-0">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>Image</th>
                  <th 
                    onClick={() => requestSort('nome')} 
                    className="admin-sortable-header"
                    style={{ minWidth: '200px' }}
                  >
                    <div className="d-flex align-items-center gap-1">
                      Name {renderSortIcon('nome')}
                    </div>
                  </th>
                  <th onClick={() => requestSort('categoria')} className="admin-sortable-header">
                    <div className="d-flex align-items-center gap-1">
                      Category {renderSortIcon('categoria')}
                    </div>
                  </th>
                  <th onClick={() => requestSort('especieAnimal')} className="admin-sortable-header">
                    <div className="d-flex align-items-center gap-1">
                      Species {renderSortIcon('especieAnimal')}
                    </div>
                  </th>
                  <th style={{ minWidth: '150px' }}>Prices</th>
                  <th>Status</th>
                  <th style={{ width: '120px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentProducts.length > 0 ? (
                  currentProducts.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <div className="admin-product-image-container">
                          <img 
                            src={product.imagensUrl[0]} 
                            alt={product.nome}
                            className="admin-product-image"
                            onError={(e) => {
                              e.target.onerror = null; 
                              e.target.src = '/placeholder-product.png';
                            }}
                          />
                        </div>
                      </td>
                      <td>
                        <div className="admin-product-name">
                          <strong>{product.nome}</strong>
                          {product.marca && (
                            <small className="text-muted d-block">{product.marca}</small>
                          )}
                        </div>
                      </td>
                      <td>{product.categoria}</td>
                      <td>{product.especieAnimal}</td>
                      <td className="small">{renderPrices(product.tamanhos)}</td>
                      <td>
                        <div className="d-flex flex-wrap gap-1">
                          <Badge pill bg={product.disponivel ? "success" : "secondary"}>
                            {product.disponivel ? 'Available' : 'Unavailable'}
                          </Badge>
                          {product.destaque && (
                            <Badge pill bg="warning" className="d-flex align-items-center">
                              <BiStar size={12} className="me-1" /> Featured
                            </Badge>
                          )}
                          {product.desconto > 0 && (
                            <Badge pill bg="danger">
                              {product.desconto}% OFF
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="admin-actions-cell">
                        <OverlayTrigger placement="top" overlay={<Tooltip>Edit</Tooltip>}>
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            disabled={isLoading}
                            onClick={() => handleEditProduct(product.id)}
                          >
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
                    <td colSpan="7" className="admin-no-results text-center py-5">
                      <BiFilterAlt size={24} className="mb-2" />
                      <p className="mb-1">
                        {searchTerm || showFeaturedOnly || categoryFilter !== 'All' || speciesFilter !== 'All'
                          ? 'No products match your filters' 
                          : 'No products found'}
                      </p>
                      {(searchTerm || showFeaturedOnly || categoryFilter !== 'All' || speciesFilter !== 'All') && (
                        <Button 
                          variant="link" 
                          size="sm" 
                          onClick={resetFilters}
                          className="text-primary"
                        >
                          Clear all filters
                        </Button>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="admin-pagination-container d-flex flex-column flex-md-row justify-content-between align-items-center py-3 border-top">
            <div className="admin-pagination-info small text-muted mb-2 mb-md-0">
              Showing {Math.min(indexOfFirstProduct + 1, filteredProducts.length)}-
              {Math.min(indexOfLastProduct, filteredProducts.length)} of {filteredProducts.length} products
            </div>
            
            <Pagination className="admin-pagination-controls mb-0">
              <Pagination.First 
                onClick={() => !isLoading && setCurrentPage(1)} 
                disabled={currentPage === 1 || isLoading} 
              />
              <Pagination.Prev 
                onClick={() => !isLoading && setCurrentPage(p => Math.max(1, p - 1))} 
                disabled={currentPage === 1 || isLoading} 
              />
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <Pagination.Item
                    key={pageNum}
                    active={pageNum === currentPage}
                    onClick={() => !isLoading && setCurrentPage(pageNum)}
                    disabled={isLoading}
                  >
                    {pageNum}
                  </Pagination.Item>
                );
              })}
              
              <Pagination.Next 
                onClick={() => !isLoading && setCurrentPage(p => Math.min(totalPages, p + 1))} 
                disabled={currentPage === totalPages || isLoading} 
              />
              <Pagination.Last 
                onClick={() => !isLoading && setCurrentPage(totalPages)} 
                disabled={currentPage === totalPages || isLoading} 
              />
            </Pagination>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4">
          <div className="d-flex align-items-center mb-3">
            <div className="admin-product-image-container me-3">
              <img 
                src={productToDelete?.imagensUrl?.[0] || '/placeholder-product.png'} 
                alt={productToDelete?.nome}
                className="admin-product-image"
              />
            </div>
            <div>
              <h5 className="mb-1">{productToDelete?.nome}</h5>
              <small className="text-muted">ID: {productToDelete?.id}</small>
            </div>
          </div>
          <p className="mb-0">
            Are you sure you want to delete this product? This action cannot be undone.
            {productToDelete?.destaque && (
              <span className="d-block mt-2 text-warning">
                <BiStar className="me-1" /> This is a featured product
              </span>
            )}
          </p>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="outline-secondary" onClick={() => setShowDeleteModal(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={isLoading}>
            {isLoading ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" className="me-2" />
                Deleting...
              </>
            ) : (
              'Delete Product'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ProductList;