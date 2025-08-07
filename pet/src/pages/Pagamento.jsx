import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaRegCreditCard, 
  FaBarcode,
  FaSpinner
} from 'react-icons/fa';
import { 
  FaPix, 
  FaCcVisa, 
  FaCcMastercard, 
  FaCcAmex 
} from 'react-icons/fa6';
import { motion, AnimatePresence } from 'framer-motion';
import { MdCheckCircle, MdError } from 'react-icons/md';
import { BiSolidDiscount } from 'react-icons/bi';
import '../styles/Pagamento.css';

const Pagamento = () => {
  const navigate = useNavigate();
  const [produtos, setProdutos] = useState([]);
  const [total, setTotal] = useState(0);
  const [desconto, setDesconto] = useState(0);
  const [metodoPagamento, setMetodoPagamento] = useState('credito');
  const [numeroCartao, setNumeroCartao] = useState('');
  const [nomeTitular, setNomeTitular] = useState('');
  const [dataValidade, setDataValidade] = useState('');
  const [codigoSeguranca, setCodigoSeguranca] = useState('');
  const [cpf, setCpf] = useState('');
  const [parcelas, setParcelas] = useState(1);
  const [cupom, setCupom] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5005/api',
    timeout: 10000,
  });

  useEffect(() => {
    const carregarDadosCheckout = async () => {
      try {
        const dadosCheckout = JSON.parse(localStorage.getItem('checkoutItems')) || {
          items: [],
          total: 0,
          desconto: 0,
        };

        if (!dadosCheckout.items.length) {
          navigate('/carrinho');
          return;
        }

        // Fetch complete product details
        const produtosCompletos = await Promise.all(
          dadosCheckout.items.map(async (item) => {
            try {
              const response = await api.get(`/produtos/${item.produtoId}`);
              return {
                ...item,
                nome: response.data.nome || 'Produto sem nome',
                imagemUrl: response.data.imagensUrl || ['/placeholder.jpg'],
                preco: response.data.preco || item.preco
              };
            } catch (error) {
              console.error(`Erro ao buscar produto ${item.produtoId}:`, error);
              return {
                ...item,
                nome: 'Produto não encontrado',
                imagemUrl: ['/placeholder.jpg'],
                preco: item.preco
              };
            }
          })
        );

        setProdutos(produtosCompletos);
        setTotal(dadosCheckout.total);
        setDesconto(dadosCheckout.desconto || 0);
      } catch (error) {
        console.error('Erro ao carregar checkout:', error);
        setErro('Erro ao carregar dados do pedido');
      }
    };

    carregarDadosCheckout();
  }, [navigate]);

  const aplicarCupom = async () => {
    if (!cupom.trim()) {
      setErro('Digite um código de cupom');
      return;
    }

    setIsApplyingCoupon(true);
    setErro(null);
    
    try {
      const response = await api.get(`/cupons/${cupom}`);
      if (response.data.valido) {
        const { desconto, tipo } = response.data.cupom;
        const valorDesconto = tipo === 'percentual' 
          ? total * (desconto / 100)
          : Math.min(desconto, total);
        
        setDesconto(valorDesconto);
      } else {
        setErro('Cupom inválido ou expirado');
        setDesconto(0);
      }
    } catch (error) {
      console.error('Erro ao validar cupom:', error);
      setErro('Erro ao validar cupom. Tente novamente.');
      setDesconto(0);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handlePagamento = async () => {
    const erroValidacao = validarFormulario();
    if (erroValidacao) {
      setErro(erroValidacao);
      return;
    }

    setCarregando(true);
    setErro(null);
    
    try {
      if (metodoPagamento === 'pix') {
        const response = await api.post('/pagamentos/pix', {
          valor: total - desconto,
          produtos: produtos.map(p => ({
            id: p.produtoId,
            quantidade: p.quantidade,
            preco: p.preco
          }))
        });
        
        navigate('/confirmacao', {
          state: { 
            produtos, 
            total: total - desconto, 
            metodoPagamento,
            dadosPagamento: response.data
          }
        });
        
      } else if (metodoPagamento === 'boleto') {
        const response = await api.post('/pagamentos/boleto', {
          valor: total - desconto,
          produtos: produtos.map(p => ({
            id: p.produtoId,
            quantidade: p.quantidade,
            preco: p.preco
          }))
        });
        
        navigate('/confirmacao', {
          state: { 
            produtos, 
            total: total - desconto, 
            metodoPagamento,
            dadosPagamento: response.data
          }
        });
        
      } else {
        // Cartão de crédito
        const response = await api.post('/pagamentos/cartao', {
          valor: total - desconto,
          produtos: produtos.map(p => ({
            id: p.produtoId,
            quantidade: p.quantidade,
            preco: p.preco,
            tamanho: p.tamanho
          })),
          parcelas,
          dadosCartao: {
            numero: numeroCartao.replace(/\s/g, ''),
            nome: nomeTitular,
            validade: dataValidade,
            cvv: codigoSeguranca,
            cpf: cpf.replace(/\D/g, '')
          }
        });
        
        setSucesso(true);
        setTimeout(() => {
          navigate('/confirmacao', {
            state: { 
              produtos, 
              total: total - desconto, 
              metodoPagamento,
              pedidoId: response.data.pedidoId
            }
          });
        }, 2000);
      }
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      setErro(error.response?.data?.message || 'Erro ao processar pagamento. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  const handleInputChange = (setter) => (e) => {
    let value = e.target.value;
    
    if (setter === setNumeroCartao) {
      value = value.replace(/\D/g, '').slice(0, 16);
      value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    } 
    else if (setter === setDataValidade) {
      value = value.replace(/\D/g, '').slice(0, 4);
      if (value.length > 2) value = value.replace(/(\d{2})(\d+)/, '$1/$2');
    } 
    else if (setter === setCpf) {
      value = value.replace(/\D/g, '').slice(0, 11);
      value = value.replace(/(\d{3})(\d)/, '$1.$2')
                   .replace(/(\d{3})(\d)/, '$1.$2')
                   .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    
    setter(value);
  };

  const validarFormulario = () => {
    if (metodoPagamento === 'credito') {
      if (!numeroCartao || numeroCartao.replace(/\s/g, '').length !== 16) {
        return 'Número do cartão inválido';
      }
      if (!nomeTitular || nomeTitular.trim().length < 3) {
        return 'Nome do titular inválido';
      }
      if (!dataValidade || !/^\d{2}\/\d{2}$/.test(dataValidade)) {
        return 'Data de validade inválida (MM/AA)';
      }
      if (!codigoSeguranca || !/^\d{3}$/.test(codigoSeguranca)) {
        return 'Código de segurança inválido';
      }
      if (!cpf || !/^\d{3}\.\d{3}\.\d{3}\-\d{2}$/.test(cpf)) {
        return 'CPF inválido';
      }
    }
    return null;
  };

  const formatarValor = (valor) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const ImageWithFallback = ({ src, alt, className }) => {
    const [imgSrc, setImgSrc] = useState(src);
    
    return (
      <img
        src={imgSrc}
        alt={alt}
        className={className}
        loading="lazy"
        onError={() => setImgSrc('/placeholder.jpg')}
      />
    );
  };

  return (
    <motion.div 
      className="pagamento-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="pagamento-header">
        <motion.h1 
          className="pagamento-title"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          Finalizar Compra
        </motion.h1>
        <motion.div 
          className="pagamento-steps"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span className="step">Carrinho</span>
          <span className="divider">›</span>
          <span className="step active">Pagamento</span>
          <span className="divider">›</span>
          <span className="step">Confirmação</span>
        </motion.div>
      </div>

      <div className="pagamento-content">
        <div className="pagamento-form-container">
          <h2 className="section-title">Resumo do Pedido</h2>

          <div className="selected-items-section">
            <ul className="items-list">
              <AnimatePresence>
                {produtos.map((produto, index) => {
                  const preco = Number(produto.preco) || 0;
                  const quantidade = Number(produto.quantidade) || 1;
                  const precoTotal = preco * quantidade;

                  return (
                    <motion.li 
                      key={`${produto.produtoId}-${produto.tamanho}-${index}`}
                      className="cart-item"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                    >
                      <div className="item-image-container">
                        <ImageWithFallback
                          src={produto.imagemUrl[0]}
                          alt={produto.nome}
                          className="item-image"
                        />
                      </div>
                      <div className="item-details">
                        <h4>{produto.nome}</h4>
                        <div className="item-attributes">
                          <p>Quantidade: {quantidade}</p>
                          <p>Tamanho: {produto.tamanho || 'Único'}</p>
                        </div>
                      </div>
                      <div className="item-price">{formatarValor(precoTotal)}</div>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>
          </div>

          <div className="coupon-section">
            <h3 className="section-subtitle">Cupom de Desconto</h3>
            <div className="coupon-input">
              <BiSolidDiscount className="coupon-icon" />
              <input
                type="text"
                placeholder="Digite o cupom"
                value={cupom}
                onChange={(e) => {
                  setCupom(e.target.value);
                  setErro(null);
                }}
                disabled={isApplyingCoupon}
              />
              <motion.button 
                onClick={aplicarCupom}
                className="apply-coupon-btn"
                disabled={isApplyingCoupon}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isApplyingCoupon ? (
                  <motion.span
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    Aplicando...
                  </motion.span>
                ) : (
                  'Aplicar'
                )}
              </motion.button>
            </div>
          </div>

          <h2 className="section-title">Método de Pagamento</h2>
          <div className="payment-methods-selector">
            <motion.div
              className={`payment-method ${metodoPagamento === 'credito' ? 'active' : ''}`}
              onClick={() => setMetodoPagamento('credito')}
              whileHover={{ scale: 1.01 }}
              layout
            >
              <div className="method-header">
                <div className="method-radio">
                  <input 
                    type="radio" 
                    checked={metodoPagamento === 'credito'} 
                    onChange={() => setMetodoPagamento('credito')}
                  />
                </div>
                <span>Cartão de Crédito</span>
                <div className="card-icons">
                  <FaCcVisa title="Visa" />
                  <FaCcMastercard title="Mastercard" />
                  <FaCcAmex title="American Express" />
                </div>
              </div>

              <AnimatePresence>
                {metodoPagamento === 'credito' && (
                  <motion.div 
                    className="card-form"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    layout
                  >
                    <div className="form-group">
                      <label>Número do cartão</label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        value={numeroCartao}
                        onChange={handleInputChange(setNumeroCartao)}
                        maxLength={19}
                      />
                    </div>

                    <div className="form-group">
                      <label>Nome do titular</label>
                      <input
                        type="text"
                        placeholder="Como no cartão"
                        value={nomeTitular}
                        onChange={(e) => setNomeTitular(e.target.value)}
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Validade (MM/AA)</label>
                        <input
                          type="text"
                          placeholder="MM/AA"
                          value={dataValidade}
                          onChange={handleInputChange(setDataValidade)}
                          maxLength={5}
                        />
                      </div>

                      <div className="form-group">
                        <label>CVV</label>
                        <input
                          type="password"
                          placeholder="123"
                          value={codigoSeguranca}
                          onChange={(e) => setCodigoSeguranca(e.target.value.replace(/\D/g, '').slice(0, 3))}
                          maxLength={3}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>CPF do titular</label>
                      <input
                        type="text"
                        placeholder="000.000.000-00"
                        value={cpf}
                        onChange={handleInputChange(setCpf)}
                        maxLength={14}
                      />
                    </div>

                    <div className="form-group">
                      <label>Parcelas</label>
                      <select 
                        value={parcelas} 
                        onChange={(e) => setParcelas(Number(e.target.value))}
                      >
                        {[...Array(12)].map((_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {i + 1}x de {formatarValor((total - desconto) / (i + 1))}
                            {i > 0 ? ' (sem juros)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div
              className={`payment-method ${metodoPagamento === 'pix' ? 'active' : ''}`}
              onClick={() => setMetodoPagamento('pix')}
              whileHover={{ scale: 1.01 }}
              layout
            >
              <div className="method-header">
                <div className="method-radio">
                  <input 
                    type="radio" 
                    checked={metodoPagamento === 'pix'} 
                    onChange={() => setMetodoPagamento('pix')}
                  />
                </div>
                <span>PIX</span>
                <div className="pix-icon">
                  <FaPix />
                </div>
              </div>

              <AnimatePresence>
                {metodoPagamento === 'pix' && (
                  <motion.div 
                    className="pix-info"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    layout
                  >
                    <p>
                      Você será redirecionado para realizar o pagamento via PIX após confirmar o pedido.
                    </p>
                    <p>O processamento é instantâneo e seu pedido será liberado imediatamente.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div
              className={`payment-method ${metodoPagamento === 'boleto' ? 'active' : ''}`}
              onClick={() => setMetodoPagamento('boleto')}
              whileHover={{ scale: 1.01 }}
              layout
            >
              <div className="method-header">
                <div className="method-radio">
                  <input 
                    type="radio" 
                    checked={metodoPagamento === 'boleto'} 
                    onChange={() => setMetodoPagamento('boleto')}
                  />
                </div>
                <span>Boleto Bancário</span>
                <div className="barcode-icon">
                  <FaBarcode />
                </div>
              </div>

              <AnimatePresence>
                {metodoPagamento === 'boleto' && (
                  <motion.div 
                    className="boleto-info"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    layout
                  >
                    <p>O boleto será gerado após a confirmação do pedido.</p>
                    <p>O prazo para pagamento é de 3 dias úteis.</p>
                    <p>Seu pedido será enviado após a confirmação do pagamento.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          <AnimatePresence>
            {erro && (
              <motion.div 
                className="error-message"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <MdError /> {erro}
              </motion.div>
            )}

            {sucesso && (
              <motion.div 
                className="success-message"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <MdCheckCircle /> Pagamento realizado com sucesso!
              </motion.div>
            )}
          </AnimatePresence>

          <div className="form-actions">
            <motion.button 
              onClick={() => navigate('/carrinho')} 
              className="back-btn"
              whileHover={{ x: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              Voltar para o Carrinho
            </motion.button>
            <motion.button
              onClick={handlePagamento}
              className={`confirm-payment-btn ${carregando ? 'loading' : ''}`}
              disabled={carregando}
              whileHover={carregando ? {} : { scale: 1.03 }}
              whileTap={carregando ? {} : { scale: 0.97 }}
            >
              {carregando ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    style={{ marginRight: '8px' }}
                  >
                    <FaSpinner />
                  </motion.div>
                  Processando Pagamento...
                </>
              ) : (
                `Confirmar Pagamento - ${formatarValor(total - desconto)}`
              )}
            </motion.button>
          </div>
        </div>

        <motion.div 
          className="cart-summary"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          layout
        >
          <h2 className="summary-title">Resumo do Pedido</h2>
          <div className="summary-content">
            <motion.div 
              className="summary-row"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <span>Subtotal:</span>
              <span>{formatarValor(total)}</span>
            </motion.div>

            {desconto > 0 && (
              <motion.div 
                className="summary-row discount"
                initial={{ scale: 1.05 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <span>Desconto:</span>
                <span className="discount-value">- {formatarValor(desconto)}</span>
              </motion.div>
            )}

            <motion.div 
              className="summary-divider"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.6 }}
            />

            <motion.div 
              className="summary-row total"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <span>Total:</span>
              <motion.span 
                className="total-price"
                key={`total-${total - desconto}`}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
              >
                {formatarValor(total - desconto)}
              </motion.span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Pagamento;