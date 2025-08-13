import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  FiTrash2, FiEdit2, FiStar, FiPlus, FiX, FiCheck,
  FiSearch, FiRefreshCw, FiFilter, FiAlertCircle,
  FiCheckCircle, FiChevronLeft, FiChevronRight,
  FiChevronsLeft, FiChevronsRight
} from 'react-icons/fi';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  
  const API_URL = 'https://pet-shop-eiab.onrender.com/api/Produtos';
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
    if (sortConfig.key !== key) return <FiFilter className="text-muted" />;
    return sortConfig.direction === 'asc' 
      ? <FiFilter className="text-primary" /> 
      : <FiFilter className="text-primary" style={{ transform: 'rotate(180deg)' }} />;
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
    navigate('/Formprodutos');
  };

  const handleEditProduct = (productId) => {
    navigate(`/admin/products/edit/${productId}`);
  };

  const Notificacao = ({ mensagem, tipo, onFechar }) => (
    <motion.div
      className={`notificacao ${tipo}`}
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <div className="notificacao-conteudo">
        {tipo === 'sucesso' ? (
          <FiCheckCircle className="notificacao-icone" />
        ) : (
          <FiAlertCircle className="notificacao-icone" />
        )}
        <span>{mensagem}</span>
      </div>
      <button className="notificacao-fechar" onClick={onFechar}>
        <FiX />
      </button>
    </motion.div>
  );

  const ModalConfirmacao = ({ onConfirm, onCancel, product }) => (
    <motion.div 
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="modal-content"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
      >
        <div className="modal-header">
          <h3>
            <FiAlertCircle className="modal-icon" />
            Confirmar Exclusão
          </h3>
          <button onClick={onCancel} className="modal-close-btn">
            <FiX />
          </button>
        </div>
        <div className="modal-body">
          <div className="product-preview">
            <img 
              src={product?.imagensUrl?.[0] || '/placeholder-product.png'} 
              alt={product?.nome}
              className="product-image"
            />
            <div className="product-info">
              <h4>{product?.nome}</h4>
              <p>ID: {product?.id}</p>
              {product?.destaque && (
                <span className="featured-badge">
                  <FiStar /> Produto em destaque
                </span>
              )}
            </div>
          </div>
          <p>Tem certeza que deseja excluir este produto permanentemente?</p>
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onCancel}>
            <FiX /> Cancelar
          </button>
          <button className="btn-danger" onClick={onConfirm}>
            <FiTrash2 /> Excluir
          </button>
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="product-list-container">
      <AnimatePresence>
        {showDeleteModal && (
          <ModalConfirmacao
            product={productToDelete}
            onConfirm={handleDelete}
            onCancel={() => setShowDeleteModal(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <Notificacao
            mensagem={error}
            tipo="erro"
            onFechar={() => setError(null)}
          />
        )}
        {successMessage && (
          <Notificacao
            mensagem={successMessage}
            tipo="sucesso"
            onFechar={() => setSuccessMessage(null)}
          />
        )}
      </AnimatePresence>

      <div className="product-list-header">
        <h2>
          <span className="badge">{filteredProducts.length}</span>
          Gerenciamento de Produtos
        </h2>
        
        <div className="actions">
          <button 
            className="btn-primary"
            onClick={handleAddProduct}
          >
            <FiPlus /> Adicionar Produto
          </button>
          
          <button 
            className="btn-refresh"
            onClick={loadProducts}
            disabled={isLoading}
          >
            <FiRefreshCw /> {isLoading ? 'Carregando...' : 'Atualizar'}
          </button>
        </div>
      </div>

      <div className="filters-container">
        <div className="search-container">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Buscar por nome, descrição ou marca..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={isLoading}
          />
          {(searchTerm || showFeaturedOnly || categoryFilter !== 'All' || speciesFilter !== 'All') && (
            <button 
              className="clear-filters"
              onClick={resetFilters}
              title="Limpar filtros"
            >
              <FiX />
            </button>
          )}
        </div>

        <div className="filter-controls">
          <label className="featured-switch">
            <input
              type="checkbox"
              checked={showFeaturedOnly}
              onChange={(e) => setShowFeaturedOnly(e.target.checked)}
              disabled={isLoading}
            />
            <span className="slider round"></span>
            <FiStar className="star-icon" /> Destaque
          </label>

          <select
            className="filter-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            disabled={isLoading}
          >
            {categories.map((category, index) => (
              <option key={`category-${index}`} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            className="filter-select"
            value={speciesFilter}
            onChange={(e) => setSpeciesFilter(e.target.value)}
            disabled={isLoading}
          >
            {species.map((specie, index) => (
              <option key={`specie-${index}`} value={specie}>
                {specie}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading && products.length === 0 ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Carregando produtos...</p>
        </div>
      ) : (
        <>
          <div className="products-grid">
            {currentProducts.length > 0 ? (
              currentProducts.map((product) => (
                <div key={product.id} className="product-card">
                  <div className="product-image-container">
                    <img 
                      src={product.imagensUrl[0]} 
                      alt={product.nome}
                      onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src = '/placeholder-product.png';
                      }}
                    />
                    <div className="product-actions">
                      <button 
                        className="edit-btn"
                        onClick={() => handleEditProduct(product.id)}
                        disabled={isLoading}
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => confirmDelete(product)}
                        disabled={isLoading}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                  
                  <div className="product-info">
                    <h3>{product.nome}</h3>
                    {product.marca && <p className="brand">{product.marca}</p>}
                    
                    <div className="product-meta">
                      <span className="category">{product.categoria}</span>
                      <span className="species">{product.especieAnimal}</span>
                    </div>
                    
                    <div className="product-prices">
                      {renderPrices(product.tamanhos)}
                    </div>
                    
                    <div className="product-status">
                      <span className={`status-badge ${product.disponivel ? 'available' : 'unavailable'}`}>
                        {product.disponivel ? 'Disponível' : 'Indisponível'}
                      </span>
                      {product.destaque && (
                        <span className="featured-badge">
                          <FiStar /> Destaque
                        </span>
                      )}
                      {product.desconto > 0 && (
                        <span className="discount-badge">
                          {product.desconto}% OFF
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <FiFilter size={48} className="empty-icon" />
                <p>
                  {searchTerm || showFeaturedOnly || categoryFilter !== 'All' || speciesFilter !== 'All'
                    ? 'Nenhum produto corresponde aos filtros' 
                    : 'Nenhum produto encontrado'}
                </p>
                {(searchTerm || showFeaturedOnly || categoryFilter !== 'All' || speciesFilter !== 'All') && (
                  <button 
                    className="clear-filters-btn"
                    onClick={resetFilters}
                  >
                    Limpar todos os filtros
                  </button>
                )}
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="pagination-container">
              <div className="pagination-info">
                Mostrando {Math.min(indexOfFirstProduct + 1, filteredProducts.length)}-
                {Math.min(indexOfLastProduct, filteredProducts.length)} de {filteredProducts.length} produtos
              </div>
              
              <div className="pagination-controls">
                <button 
                  onClick={() => !isLoading && setCurrentPage(1)} 
                  disabled={currentPage === 1 || isLoading}
                >
                  <FiChevronsLeft />
                </button>
                <button 
                  onClick={() => !isLoading && setCurrentPage(p => Math.max(1, p - 1))} 
                  disabled={currentPage === 1 || isLoading}
                >
                  <FiChevronLeft />
                </button>
                
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
                    <button
                      key={pageNum}
                      className={pageNum === currentPage ? 'active' : ''}
                      onClick={() => !isLoading && setCurrentPage(pageNum)}
                      disabled={isLoading}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button 
                  onClick={() => !isLoading && setCurrentPage(p => Math.min(totalPages, p + 1))} 
                  disabled={currentPage === totalPages || isLoading}
                >
                  <FiChevronRight />
                </button>
                <button 
                  onClick={() => !isLoading && setCurrentPage(totalPages)} 
                  disabled={currentPage === totalPages || isLoading}
                >
                  <FiChevronsRight />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductList;