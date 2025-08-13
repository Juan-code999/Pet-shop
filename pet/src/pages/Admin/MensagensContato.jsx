import React, { useState, useEffect } from 'react';
import { 
  FiMail, FiPhone, FiUser, 
  FiMessageSquare, FiClock,
  FiTrash2, FiSearch, FiAlertCircle,
  FiCheck, FiX, FiCheckCircle
} from 'react-icons/fi';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import '../../styles/MensagensContato.css';

const MensagensContato = () => {
  const [mensagens, setMensagens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchMensagens = async () => {
      try {
        const response = await axios.get('http://localhost:5005/api/Contato/todos');
        
        const mensagensComFoto = await Promise.all(
          response.data.map(async msg => {
            if (msg.usuarioId) {
              try {
                const userResponse = await axios.get(`http://localhost:5005/api/Usuario/${msg.usuarioId}`);
                return { ...msg, fotoUsuario: userResponse.data.foto };
              } catch {
                return msg;
              }
            }
            return msg;
          })
        );
        
        setMensagens(mensagensComFoto);
        setSuccess('Mensagens carregadas com sucesso!');
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        console.error('Erro ao buscar mensagens:', err);
        setError('Erro ao carregar mensagens. Tente novamente mais tarde.');
        setTimeout(() => setError(null), 5000);
      } finally {
        setLoading(false);
      }
    };

    fetchMensagens();
  }, []);

  const ModalConfirmacao = ({ onConfirm, onCancel, message }) => (
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
          <p>Tem certeza que deseja excluir a mensagem de <strong>{message.nome || 'Anônimo'}</strong>?</p>
          <p className="modal-message-preview">{message.mensagem.substring(0, 50)}...</p>
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

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5005/api/Contato/mensagem/${id}`);
      setMensagens(mensagens.filter(msg => msg.id !== id));
      setSuccess('Mensagem excluída com sucesso!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Erro ao excluir mensagem:', err);
      setError('Erro ao excluir mensagem.');
      setTimeout(() => setError(null), 5000);
    }
  };

  const filteredMensagens = mensagens.filter(msg =>
    msg.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (msg.mensagem && msg.mensagem.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Carregando mensagens...</p>
      </div>
    );
  }

  return (
    <div className="messages-container">
      <AnimatePresence>
        {showDeleteModal && (
          <ModalConfirmacao
            message={mensagens.find(msg => msg.id === confirmingDelete)}
            onConfirm={() => {
              handleDelete(confirmingDelete);
              setShowDeleteModal(false);
            }}
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
        {success && (
          <Notificacao
            mensagem={success}
            tipo="sucesso"
            onFechar={() => setSuccess(null)}
          />
        )}
      </AnimatePresence>

      <div className="messages-header">
        <h2>Mensagens de Contato</h2>
        
        <div className="search-bar">
          <div className="search-container">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Buscar por nome, email ou mensagem..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {filteredMensagens.length === 0 ? (
        <div className="empty-state">
          <img src="/empty-state.svg" alt="Nenhuma mensagem" />
          <p>Nenhuma mensagem encontrada</p>
          {searchTerm && (
            <button 
              className="clear-search"
              onClick={() => setSearchTerm('')}
            >
              Limpar busca
            </button>
          )}
        </div>
      ) : (
        <div className="messages-grid">
          {filteredMensagens.map((msg) => (
            <div key={msg.id} className="message-card">
              <div className="message-header">
                <div className="user-avatar">
                  {msg.fotoUsuario ? (
                    <img 
                      src={msg.fotoUsuario} 
                      alt={msg.nome} 
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${msg.nome || '?'}&background=random`;
                      }}
                    />
                  ) : (
                    <div className="avatar-fallback">
                      {msg.nome ? msg.nome.charAt(0).toUpperCase() : '?'}
                    </div>
                  )}
                </div>
                <div className="user-info">
                  <h3>{msg.nome || 'Sem nome'}</h3>
                  <small>
                    <FiClock />
                    {new Date(msg.dataEnvio).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </small>
                </div>
                <button 
                  className="delete-btn"
                  onClick={() => {
                    setConfirmingDelete(msg.id);
                    setShowDeleteModal(true);
                  }}
                  title="Excluir mensagem"
                >
                  <FiTrash2 />
                </button>
              </div>
              
              <div className="message-content">
                <div className="message-row">
                  <FiMail className="icon" />
                  <a href={`mailto:${msg.email}`} className="contact-link">
                    {msg.email}
                  </a>
                </div>
                
                {msg.telefone && (
                  <div className="message-row">
                    <FiPhone className="icon" />
                    <a href={`tel:${msg.telefone.replace(/\D/g, '')}`} className="contact-link">
                      {msg.telefone}
                    </a>
                  </div>
                )}
                
                <div className="message-body">
                  <div className="message-row">
                    <FiMessageSquare className="icon" />
                    <p className="message-text">{msg.mensagem}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MensagensContato;