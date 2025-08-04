import React, { useState, useEffect } from 'react';
import { 
  Container, Form, Button, Row, Col, 
  Modal, Spinner, Alert, Badge
} from 'react-bootstrap';
import { BiTrash, BiPlus, BiCheck, BiArrowBack } from 'react-icons/bi';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import '../../styles/ProductEdit.css';

const ProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    categoria: '',
    especieAnimal: '',
    marca: '',
    destaque: false,
    desconto: 0,
    disponivel: true,
    tamanhos: [],
    imagensUrl: []
  });

  const [categories, setCategories] = useState([]);
  const [species, setSpecies] = useState([]);
  const API_URL = 'http://localhost:5005/api/Produtos';

  // Load product data
  useEffect(() => {
    const fetchProductData = async () => {
      setIsLoading(true);
      try {
        // Fetch product
        const productResponse = await axios.get(`${API_URL}/${id}`);
        const product = productResponse.data;
        
        // Normalize product data
        const normalizedProduct = {
          nome: product.nome || product.Nome || '',
          descricao: product.descricao || product.Descricao || '',
          categoria: product.categoria || product.Categoria || '',
          especieAnimal: product.especieAnimal || product.EspecieAnimal || '',
          marca: product.marca || product.Marca || '',
          destaque: Boolean(product.destaque || product.Destaque || false),
          desconto: Number(product.desconto || product.Desconto || 0),
          disponivel: Boolean(product.disponivel || product.Disponivel || true),
          tamanhos: product.tamanhos || product.Tamanhos || [],
          imagensUrl: Array.isArray(product.imagensUrl) ? product.imagensUrl : 
                     Array.isArray(product.ImagensUrl) ? product.ImagensUrl : 
                     product.imagensUrl ? [product.imagensUrl] : 
                     product.ImagensUrl ? [product.ImagensUrl] : 
                     ['/placeholder-product.png']
        };

        setFormData(normalizedProduct);

        // Fetch categories and species
        const productsResponse = await axios.get(API_URL);
        const allProducts = productsResponse.data;
        
        const uniqueCategories = [...new Set(allProducts.map(p => p.categoria || p.Categoria).filter(Boolean))];
        const uniqueSpecies = [...new Set(allProducts.map(p => p.especieAnimal || p.EspecieAnimal).filter(Boolean))];
        
        setCategories(uniqueCategories);
        setSpecies(uniqueSpecies);
        
      } catch (err) {
        console.error('Error loading product:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load product');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductData();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSizeChange = (index, field, value) => {
    const updatedSizes = [...formData.tamanhos];
    updatedSizes[index] = {
      ...updatedSizes[index],
      [field]: field === 'PrecoTotal' ? parseFloat(value) : value
    };
    setFormData(prev => ({
      ...prev,
      tamanhos: updatedSizes
    }));
  };

  const handleAddSize = () => {
    setFormData(prev => ({
      ...prev,
      tamanhos: [...prev.tamanhos, { Tamanho: '', PrecoTotal: 0 }]
    }));
  };

  const handleRemoveSize = (index) => {
    setFormData(prev => ({
      ...prev,
      tamanhos: prev.tamanhos.filter((_, i) => i !== index)
    }));
  };

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsLoading(true);
    try {
      // In a real app, you would upload to a server or cloud storage
      // This is just a mock implementation
      const newImages = Array.from(files).map(file => 
        URL.createObjectURL(file)
      );
      
      setFormData(prev => ({
        ...prev,
        imagensUrl: [...prev.imagensUrl, ...newImages]
      }));
      
    } catch (err) {
      console.error('Error uploading images:', err);
      setError('Failed to upload images');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      imagensUrl: prev.imagensUrl.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await axios.put(`${API_URL}/${id}`, formData);
      setSuccessMessage('Product updated successfully!');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error('Error updating product:', err);
      setError(err.response?.data?.message || err.message || 'Failed to update product');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await axios.delete(`${API_URL}/${id}`);
      setSuccessMessage('Product deleted successfully!');
      setTimeout(() => {
        navigate('/admin/products');
      }, 1500);
    } catch (err) {
      console.error('Error deleting product:', err);
      setError(err.response?.data?.message || err.message || 'Failed to delete product');
    } finally {
      setIsLoading(false);
      setShowDeleteModal(false);
    }
  };

  const goBack = () => {
    navigate('/admin/products');
  };

  return (
    <Container fluid className="product-edit-container py-4">
      <div className="product-edit-content bg-white rounded-3 shadow-sm p-4">
        {/* Header */}
        <div className="product-edit-header mb-4">
          <Button 
            variant="outline-secondary" 
            onClick={goBack}
            className="d-flex align-items-center"
          >
            <BiArrowBack className="me-1" /> Back to Products
          </Button>
          
          <h2 className="m-0">
            Edit Product
            {formData.destaque && (
              <Badge bg="warning" className="ms-2 d-inline-flex align-items-center">
                <BiStar className="me-1" /> Featured
              </Badge>
            )}
          </h2>
          
          <Button 
            variant="outline-danger" 
            onClick={() => setShowDeleteModal(true)}
            disabled={isLoading}
          >
            <BiTrash /> Delete
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

        {isLoading && !formData.nome ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">Loading product data...</p>
          </div>
        ) : (
          <Form onSubmit={handleSubmit}>
            <Row className="g-3">
              {/* Left Column - Images and Basic Info */}
              <Col md={6}>
                {/* Image Upload and Display */}
                <div className="mb-4">
                  <Form.Label className="d-block fw-bold mb-3">Product Images</Form.Label>
                  
                  <div className="product-images-grid mb-3">
                    {formData.imagensUrl.map((img, index) => (
                      <div key={index} className="product-image-thumbnail">
                        <img 
                          src={img} 
                          alt={`Product ${index + 1}`} 
                          className="img-thumbnail"
                        />
                        <Button 
                          variant="danger" 
                          size="sm" 
                          className="remove-image-btn"
                          onClick={() => handleRemoveImage(index)}
                        >
                          <BiTrash />
                        </Button>
                      </div>
                    ))}
                    
                    {formData.imagensUrl.length < 5 && (
                      <div className="image-upload-placeholder">
                        <Form.Control
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={isLoading}
                        />
                        <small className="text-muted d-block mt-1">Max 5 images</small>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Basic Information */}
                <div className="mb-4">
                  <Form.Label className="fw-bold mb-3">Basic Information</Form.Label>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Product Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="nome"
                      value={formData.nome}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="descricao"
                      value={formData.descricao}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Brand</Form.Label>
                    <Form.Control
                      type="text"
                      name="marca"
                      value={formData.marca}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </div>
              </Col>
              
              {/* Right Column - Details */}
              <Col md={6}>
                {/* Categories */}
                <div className="mb-4">
                  <Form.Label className="fw-bold mb-3">Categories</Form.Label>
                  
                  <Row className="g-2">
                    <Form.Group as={Col} md={6}>
                      <Form.Label>Product Category</Form.Label>
                      <Form.Select
                        name="categoria"
                        value={formData.categoria}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select a category</option>
                        {categories.map((category, index) => (
                          <option key={index} value={category}>{category}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                    
                    <Form.Group as={Col} md={6}>
                      <Form.Label>Animal Species</Form.Label>
                      <Form.Select
                        name="especieAnimal"
                        value={formData.especieAnimal}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select a species</option>
                        {species.map((specie, index) => (
                          <option key={index} value={specie}>{specie}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Row>
                </div>
                
                {/* Status */}
                <div className="mb-4">
                  <Form.Label className="fw-bold mb-3">Status</Form.Label>
                  
                  <Row className="g-2">
                    <Form.Group as={Col} md={6}>
                      <Form.Check
                        type="switch"
                        id="featured-switch"
                        label="Featured Product"
                        name="destaque"
                        checked={formData.destaque}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                    
                    <Form.Group as={Col} md={6}>
                      <Form.Check
                        type="switch"
                        id="available-switch"
                        label="Available"
                        name="disponivel"
                        checked={formData.disponivel}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Row>
                  
                  <Form.Group className="mt-3">
                    <Form.Label>Discount (%)</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      max="100"
                      name="desconto"
                      value={formData.desconto}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </div>
                
                {/* Sizes and Prices */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <Form.Label className="fw-bold">Sizes & Prices</Form.Label>
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={handleAddSize}
                      type="button"
                    >
                      <BiPlus /> Add Size
                    </Button>
                  </div>
                  
                  {formData.tamanhos.length === 0 ? (
                    <div className="text-muted small py-2">No sizes added</div>
                  ) : (
                    <div className="sizes-container">
                      {formData.tamanhos.map((size, index) => (
                        <Row key={index} className="g-2 mb-2 align-items-center">
                          <Col md={5}>
                            <Form.Control
                              type="text"
                              placeholder="Size (e.g., S, M, L)"
                              value={size.Tamanho || size.tamanho || ''}
                              onChange={(e) => handleSizeChange(index, 'Tamanho', e.target.value)}
                              required
                            />
                          </Col>
                          <Col md={5}>
                            <Form.Control
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="Price"
                              value={size.PrecoTotal || size.precoTotal || 0}
                              onChange={(e) => handleSizeChange(index, 'PrecoTotal', e.target.value)}
                              required
                            />
                          </Col>
                          <Col md={2}>
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => handleRemoveSize(index)}
                              type="button"
                            >
                              <BiTrash />
                            </Button>
                          </Col>
                        </Row>
                      ))}
                    </div>
                  )}
                </div>
              </Col>
            </Row>
            
            {/* Form Actions */}
            <div className="border-top pt-4 mt-3 d-flex justify-content-end gap-2">
              <Button 
                variant="outline-secondary" 
                onClick={goBack}
                disabled={isLoading}
              >
                Cancel
              </Button>
              
              <Button 
                variant="primary" 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" className="me-2" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </Form>
        )}
      </div>
      
      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4">
          <div className="d-flex align-items-center mb-3">
            <div className="product-image-thumbnail me-3">
              <img 
                src={formData.imagensUrl[0] || '/placeholder-product.png'} 
                alt={formData.nome}
                className="img-thumbnail"
              />
            </div>
            <div>
              <h5 className="mb-1">{formData.nome}</h5>
              <small className="text-muted">ID: {id}</small>
            </div>
          </div>
          <p className="mb-0">
            Are you sure you want to delete this product? This action cannot be undone.
            {formData.destaque && (
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

export default ProductEdit;