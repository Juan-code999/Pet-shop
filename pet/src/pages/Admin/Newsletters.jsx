import React, { useState, useEffect } from 'react';
import { 
  FiMail, FiClock, 
  FiTrash2, FiSearch, FiAlertCircle,
  FiCheckCircle, FiX, FiPlus
} from 'react-icons/fi';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import '../../styles/Newsletters.css';

const Newsletters = () => {
  const [inscritos, setInscritos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [termoBusca, setTermoBusca] = useState('');
  const [novoInscrito, setNovoInscrito] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [notificacao, setNotificacao] = useState(null);
  const [mostrarModalExcluir, setMostrarModalExcluir] = useState(false);
  const [inscritoAExcluir, setInscritoAExcluir] = useState(null);

  const buscarInscritos = async () => {
    try {
      const resposta = await axios.get('http://localhost:5005/api/Contato/newsletters');
      const inscritosOrdenados = resposta.data.sort((a, b) => 
        new Date(b.dataInscricao) - new Date(a.dataInscricao)
      );
      setInscritos(inscritosOrdenados);
    } catch (err) {
      console.error('Erro ao buscar inscritos:', err);
      mostrarNotificacao('Erro ao carregar inscrições. Tente novamente.', 'erro');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    buscarInscritos();
  }, []);

  const ModalConfirmacao = ({ onConfirmar, onCancelar, email }) => (
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
          <h3>Confirmar Exclusão</h3>
          <button onClick={onCancelar} className="modal-close-btn">
            <FiX />
          </button>
        </div>
        <div className="modal-body">
          <p>Tem certeza que deseja remover <strong>{email}</strong> da newsletter?</p>
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onCancelar}>
            Cancelar
          </button>
          <button className="btn-danger" onClick={onConfirmar}>
            Remover
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

  const mostrarNotificacao = (mensagem, tipo) => {
    const id = Date.now();
    setNotificacao({ mensagem, tipo, id });
    setTimeout(() => {
      setNotificacao(prev => prev?.id === id ? null : prev);
    }, 5000);
  };

  const confirmarExclusao = (inscrito) => {
    setInscritoAExcluir(inscrito);
    setMostrarModalExcluir(true);
  };

  const executarExclusao = async () => {
    setMostrarModalExcluir(false);
    try {
      await axios.delete(`http://localhost:5005/api/Contato/newsletter/${inscritoAExcluir.id}`);
      setInscritos(inscritos.filter(sub => sub.id !== inscritoAExcluir.id));
      mostrarNotificacao('Inscrição removida com sucesso!', 'sucesso');
    } catch (err) {
      console.error('Erro ao remover inscrição:', err);
      mostrarNotificacao('Erro ao remover inscrição', 'erro');
    }
  };

  const adicionarInscrito = async (e) => {
    e.preventDefault();
    setErro(null);
    
    if (!novoInscrito || !novoInscrito.includes('@')) {
      setErro('Por favor, insira um e-mail válido');
      return;
    }

    setEnviando(true);
    try {
      const resposta = await axios.post('http://localhost:5005/api/Contato/newsletter', { 
        email: novoInscrito 
      });

      if (resposta.data.id) {
        const novo = {
          id: resposta.data.id,
          email: novoInscrito,
          dataInscricao: new Date().toISOString()
        };
        setInscritos([novo, ...inscritos]);
        setNovoInscrito('');
        mostrarNotificacao('Inscrição adicionada com sucesso!', 'sucesso');
      }
    } catch (err) {
      console.error('Erro ao adicionar inscrição:', err);
      if (err.response?.status === 409) {
        mostrarNotificacao('Este e-mail já está inscrito', 'erro');
      } else {
        mostrarNotificacao('Erro ao adicionar inscrição', 'erro');
      }
    } finally {
      setEnviando(false);
    }
  };

  const inscritosFiltrados = inscritos.filter(inscrito =>
    inscrito.email.toLowerCase().includes(termoBusca.toLowerCase())
  );

  if (carregando) {
    return (
      <div className="tela-carregamento">
        <div className="spinner"></div>
        <p>Carregando inscrições...</p>
      </div>
    );
  }

  return (
    <div className="container-newsletters">
      <AnimatePresence>
        {mostrarModalExcluir && (
          <ModalConfirmacao
            email={inscritoAExcluir?.email}
            onConfirmar={executarExclusao}
            onCancelar={() => setMostrarModalExcluir(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {notificacao && (
          <Notificacao
            mensagem={notificacao.mensagem}
            tipo={notificacao.tipo}
            onFechar={() => setNotificacao(null)}
          />
        )}
      </AnimatePresence>

      <div className="cabecalho-newsletters">
        <h1>Gerenciar Newsletter</h1>
        <p>Administre a lista de inscritos na newsletter</p>
      </div>

      <div className="controles-container">
        <div className="barra-busca">
          <div className="container-icone-input">
            <FiSearch className="icone-busca" />
            <input
              type="text"
              placeholder="Buscar por e-mail..."
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
            />
          </div>
        </div>

        <form onSubmit={adicionarInscrito} className="form-adicionar">
          <div className="grupo-adicionar">
            <div className="container-input-btn">
              <input
                type="email"
                placeholder="Digite o e-mail para adicionar..."
                value={novoInscrito}
                onChange={(e) => setNovoInscrito(e.target.value)}
                disabled={enviando}
              />
              <button 
                type="submit" 
                className="btn-primario"
                disabled={enviando || !novoInscrito}
              >
                <FiPlus /> Adicionar
              </button>
            </div>
            {erro && <p className="erro-formulario">{erro}</p>}
          </div>
        </form>
      </div>

      <div className="tabela-container">
        {inscritosFiltrados.length === 0 ? (
          <div className="estado-vazio">
            <img src="/email-vazio.svg" alt="Nenhum inscrito" />
            <h3>Nenhum inscrito encontrado</h3>
            {termoBusca && (
              <button 
                className="btn-texto"
                onClick={() => setTermoBusca('')}
              >
                Limpar busca
              </button>
            )}
          </div>
        ) : (
          <table className="tabela-inscritos">
            <thead>
              <tr>
                <th>E-mail</th>
                <th>Data de Inscrição</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {inscritosFiltrados.map((inscrito) => (
                <tr key={inscrito.id}>
                  <td>
                    <a href={`mailto:${inscrito.email}`}>{inscrito.email}</a>
                  </td>
                  <td>
                    <div className="celula-data">
                      <FiClock />
                      {new Date(inscrito.dataInscricao).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                      })}
                    </div>
                  </td>
                  <td>
                    <button 
                      className="btn-icone perigo"
                      onClick={() => confirmarExclusao(inscrito)}
                      title="Remover inscrição"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Newsletters;