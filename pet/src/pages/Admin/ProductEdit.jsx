import React, { useState, useEffect } from 'react';
import { 
  Container, Form, Button, Row, Col, 
Spinner, Alert, Badge, Card
} from 'react-bootstrap';
import { BiTrash, BiPlus, BiCheck, BiArrowBack, BiStar } from 'react-icons/bi';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import '../../styles/ProductEdit.css';

const ProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
 
  
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
          tamanhos: (product.tamanhos || product.Tamanhos || []).map(t => ({
            Tamanho: t.Tamanho || t.tamanho || '',
            PrecoTotal: t.PrecoTotal || t.precoTotal || 0,
            PrecoPorKg: t.PrecoPorKg || t.precoPorKg || 0
          })),
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
      [field]: field.includes('Preco') ? parseFloat(value) || 0 : value
    };
    setFormData(prev => ({
      ...prev,
      tamanhos: updatedSizes
    }));
  };

  const handleAddSize = () => {
    setFormData(prev => ({
      ...prev,
      tamanhos: [...prev.tamanhos, { Tamanho: '', PrecoTotal: 0, PrecoPorKg: 0 }]
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
    // 1. Preparação dos dados no formato EXATO que a API espera
    const produtoData = {
      nome: String(formData.nome || ''),
      descricao: String(formData.descricao || ''),
      categoria: String(formData.categoria || ''),
      especieAnimal: String(formData.especieAnimal || ''),
      marca: String(formData.marca || ''),
      imagensUrl: Array.isArray(formData.imagensUrl) ? formData.imagensUrl : [],
      tamanhos: (formData.tamanhos || []).map(t => ({
        tamanho: String(t.Tamanho || t.tamanho || ''),
        precoPorKg: Number(t.PrecoPorKg || t.precoPorKg || 0),
        precoTotal: Number(t.PrecoTotal || t.precoTotal || 0)
      })),
      idadeRecomendada: String(formData.idadeRecomendada || ''),
      porteAnimal: String(formData.porteAnimal || ''),
      destaque: Boolean(formData.destaque),
      desconto: Math.min(Math.max(Number(formData.desconto) || 0, 0), 100),
      disponivel: Boolean(formData.disponivel)
    };

    // 2. Validações mínimas
    if (!produtoData.nome.trim()) {
      throw new Error('Nome do produto é obrigatório');
    }

    // 3. Envio para API
    const response = await axios.put(`${API_URL}/${id}`, produtoData, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    setSuccessMessage(response.data?.mensagem || 'Produto atualizado com sucesso!');
    setTimeout(() => navigate('/admin'), 1500);

  } catch (error) {
    console.error('Erro na atualização:', {
      message: error.message,
      response: error.response?.data
    });
    
    setError(error.response?.data?.message || error.message || 'Erro ao atualizar produto');
  } finally {
    setIsLoading(false);
  }
};

  

  const goBack = () => {
    navigate('/admin');
  };

  return (
    <Container fluid className="product-edit-container py-4">
      <div className="product-edit-content bg-white rounded-4 shadow-sm p-4">
        {/* Header */}
        <div className="product-edit-header mb-4 d-flex justify-content-between align-items-center">
          <Button 
            variant="outline-secondary" 
            onClick={goBack}
            className="d-flex align-items-center back-button"
          >
            <BiArrowBack className="me-1" /> Back to Products
          </Button>
          
          <h2 className="m-0 text-center flex-grow-1">
            Edit Product
            {formData.destaque && (
              <Badge bg="warning" className="ms-2 d-inline-flex align-items-center featured-badge">
                <BiStar className="me-1" /> Featured
              </Badge>
            )}
          </h2>
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
            <Row className="g-4">
              {/* Left Column - Images and Basic Info */}
              <Col lg={6}>
                {/* Image Upload and Display */}
                <Card className="mb-4 border-0 shadow-sm">
                  <Card.Body>
                    <Card.Title className="fw-bold mb-3">Product Images</Card.Title>
                    
                    <div className="product-images-grid mb-3">
                      {formData.imagensUrl.map((img, index) => (
                        <div key={index} className="product-image-thumbnail position-relative">
                          <img 
                            src={img} 
                            alt={`Product ${index + 1}`} 
                            className="img-thumbnail h-100 w-100 object-fit-cover"
                          />
                          <Button 
                            variant="danger" 
                            size="sm" 
                            className="remove-image-btn position-absolute top-0 end-0 m-1"
                            onClick={() => handleRemoveImage(index)}
                          >
                            <BiTrash />
                          </Button>
                        </div>
                      ))}
                      
                      {formData.imagensUrl.length < 5 && (
                        <div className="image-upload-placeholder d-flex flex-column justify-content-center align-items-center">
                          <Form.Control
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={isLoading}
                            className="d-none"
                            id="image-upload"
                          />
                          <label htmlFor="image-upload" className="btn btn-outline-primary w-100 h-100 d-flex flex-column justify-content-center align-items-center">
                            <BiPlus size={24} />
                            <span className="mt-2">Add Images</span>
                          </label>
                          <small className="text-muted d-block mt-2 text-center">Max 5 images</small>
                        </div>
                      )}
                    </div>
                  </Card.Body>
                </Card>
                
                {/* Basic Information */}
                <Card className="mb-4 border-0 shadow-sm">
                  <Card.Body>
                    <Card.Title className="fw-bold mb-3">Basic Information</Card.Title>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Product Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="nome"
                        value={formData.nome}
                        onChange={handleInputChange}
                        required
                        className="form-control-lg"
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        name="descricao"
                        value={formData.descricao}
                        onChange={handleInputChange}
                        className="form-control-lg"
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Brand</Form.Label>
                      <Form.Control
                        type="text"
                        name="marca"
                        value={formData.marca}
                        onChange={handleInputChange}
                        className="form-control-lg"
                      />
                    </Form.Group>
                  </Card.Body>
                </Card>
              </Col>
              
              {/* Right Column - Details */}
              <Col lg={6}>
                {/* Categories */}
                <Card className="mb-4 border-0 shadow-sm">
                  <Card.Body>
                    <Card.Title className="fw-bold mb-3">Categories</Card.Title>
                    
                    <Row className="g-3">
                      <Form.Group as={Col} md={6}>
                        <Form.Label>Product Category</Form.Label>
                        <Form.Select
                          name="categoria"
                          value={formData.categoria}
                          onChange={handleInputChange}
                          required
                          size="lg"
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
                          size="lg"
                        >
                          <option value="">Select a species</option>
                          {species.map((specie, index) => (
                            <option key={index} value={specie}>{specie}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Row>
                  </Card.Body>
                </Card>
                
                {/* Status */}
                <Card className="mb-4 border-0 shadow-sm">
                  <Card.Body>
                    <Card.Title className="fw-bold mb-3">Status</Card.Title>
                    
                    <Row className="g-3 mb-3">
                      <Col md={6}>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="featured-switch"
                            name="destaque"
                            checked={formData.destaque}
                            onChange={handleInputChange}
                            style={{ width: '2.5em', height: '1.5em' }}
                          />
                          <label className="form-check-label" htmlFor="featured-switch">
                            Featured Product
                          </label>
                        </div>
                      </Col>
                      
                      <Col md={6}>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="available-switch"
                            name="disponivel"
                            checked={formData.disponivel}
                            onChange={handleInputChange}
                            style={{ width: '2.5em', height: '1.5em' }}
                          />
                          <label className="form-check-label" htmlFor="available-switch">
                            Available
                          </label>
                        </div>
                      </Col>
                    </Row>
                    
                    <Form.Group>
                      <Form.Label>Discount (%)</Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        max="100"
                        name="desconto"
                        value={formData.desconto}
                        onChange={handleInputChange}
                        className="form-control-lg"
                      />
                    </Form.Group>
                  </Card.Body>
                </Card>
                
                {/* Sizes and Prices */}
                <Card className="mb-4 border-0 shadow-sm">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <Card.Title className="fw-bold m-0">Sizes & Prices</Card.Title>
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={handleAddSize}
                        type="button"
                        className="add-size-button"
                      >
                        <BiPlus /> Add Size
                      </Button>
                    </div>
                    
                    {formData.tamanhos.length === 0 ? (
                      <div className="text-muted small py-2 text-center">No sizes added</div>
                    ) : (
                      <div className="sizes-container">
                        {formData.tamanhos.map((size, index) => (
                          <Row key={index} className="g-2 mb-3 align-items-center">
                            <Col md={4}>
                              <Form.Control
                                type="text"
                                placeholder="Size (e.g., S, M, L)"
                                value={size.Tamanho}
                                onChange={(e) => handleSizeChange(index, 'Tamanho', e.target.value)}
                                required
                                size="lg"
                              />
                            </Col>
                            <Col md={4}>
                              <Form.Control
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="Price per kg"
                                value={size.PrecoPorKg}
                                onChange={(e) => handleSizeChange(index, 'PrecoPorKg', e.target.value)}
                                size="lg"
                              />
                            </Col>
                            <Col md={3}>
                              <Form.Control
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="Total price"
                                value={size.PrecoTotal}
                                onChange={(e) => handleSizeChange(index, 'PrecoTotal', e.target.value)}
                                required
                                size="lg"
                              />
                            </Col>
                            <Col md={1}>
                              <Button 
                                variant="outline-danger" 
                                size="sm"
                                onClick={() => handleRemoveSize(index)}
                                type="button"
                                className="w-100"
                              >
                                <BiTrash />
                              </Button>
                            </Col>
                          </Row>
                        ))}
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
            
            {/* Form Actions */}
            <div className="border-top pt-4 mt-3 d-flex justify-content-end gap-3">
              <Button 
                variant="outline-secondary" 
                onClick={goBack}
                disabled={isLoading}
                size="lg"
                className="px-4"
              >
                Cancel
              </Button>
              
              <Button 
                variant="primary" 
                type="submit"
                disabled={isLoading}
                size="lg"
                className="px-4"
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
    </Container>
  );
};

export default ProductEdit;