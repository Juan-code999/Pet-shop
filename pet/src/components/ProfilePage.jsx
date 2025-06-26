import React, { useEffect, useState, useCallback } from "react";
import "../styles/ProfilePage.css";
import { 
  getAuth, 
  onAuthStateChanged, 
  reauthenticateWithCredential, 
  EmailAuthProvider, 
  updateEmail,
  sendEmailVerification
} from "firebase/auth";
import { 
  FiEdit, 
  FiSave, 
  FiUser, 
  FiPhone, 
  FiMail, 
  FiMapPin, 
  FiHome, 
  FiNavigation, 
  FiLock,
  FiAlertCircle,
  FiCheckCircle
} from "react-icons/fi";

const ProfilePage = () => {
  const [usuarioId, setUsuarioId] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState(null);
  const [emailSent, setEmailSent] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    telefone: "",
    email: "",
    rua: "",
    numero: "",
    cidade: "",
    estado: "",
    cep: "",
    pais: "Brasil",
    bairro: "",
    complemento: ""
  });

  const auth = getAuth();
  const [currentUser, setCurrentUser] = useState(auth.currentUser);

  const fetchUserData = useCallback(async (email) => {
    try {
      setLoading(true);
      setError(null);
      
      const resId = await fetch(`http://localhost:5005/api/Usuario/email/${encodeURIComponent(email)}`);
      if (!resId.ok) {
        throw new Error("Erro ao buscar usuário por email");
      }
      
      const dataId = await resId.json();
      if (!dataId.id) {
        throw new Error("ID do usuário não encontrado na resposta.");
      }
      
      setUsuarioId(dataId.id);

      const resDados = await fetch(`http://localhost:5005/api/Usuario/${dataId.id}`);
      if (!resDados.ok) {
        throw new Error("Erro ao buscar dados do usuário pelo id");
      }
      
      const data = await resDados.json();
      
      setForm({
        nome: data.nome || "",
        telefone: data.telefone || "",
        email: data.email || "",
        rua: data.endereco?.rua || "",
        numero: data.endereco?.numero || "",
        cidade: data.endereco?.cidade || "",
        estado: data.endereco?.estado || "",
        cep: data.endereco?.cep || "",
        pais: data.endereco?.pais || "Brasil",
        bairro: data.endereco?.bairro || "",
        complemento: data.endereco?.complemento || ""
      });
      
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user?.email) {
        fetchUserData(user.email);
      }
    });

    return () => unsubscribe();
  }, [auth, fetchUserData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!form.nome.trim()) {
      return "O nome é obrigatório";
    }
    if (!form.email.trim()) {
      return "O email é obrigatório";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      return "Email inválido";
    }
    if (form.telefone && !/^[\d\s()-]+$/.test(form.telefone)) {
      return "Telefone inválido";
    }
    return null;
  };

  const sendVerificationEmail = async (user) => {
    try {
      await sendEmailVerification(user);
      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 5000);
      alert("Email de verificação enviado. Por favor, verifique sua caixa de entrada.");
    } catch (error) {
      console.error("Erro ao enviar email de verificação:", error);
      alert(`Erro ao enviar email de verificação: ${error.message}`);
    }
  };

  const updateUserData = async () => {
    const body = {
      id: usuarioId,
      nome: form.nome,
      email: form.email,
      telefone: form.telefone,
      senha: "",
      endereco: {
        rua: form.rua,
        numero: form.numero,
        complemento: form.complemento,
        bairro: form.bairro,
        cidade: form.cidade,
        estado: form.estado,
        cep: form.cep,
        pais: form.pais
      },
      isAdmin: false
    };

    const response = await fetch(`http://localhost:5005/api/Usuario/${usuarioId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Falha na atualização");
    }
  };

  const handlePasswordSubmit = async () => {
    try {
      setAuthError(null);
      const user = auth.currentUser;
      
      if (!user || !user.email) {
        throw new Error("Usuário não autenticado");
      }

      if (!user.emailVerified) {
        await sendVerificationEmail(user);
        throw new Error("Por favor, verifique seu email atual antes de alterá-lo. Um email de verificação foi enviado.");
      }

      const credential = EmailAuthProvider.credential(
        user.email,
        password
      );

      await reauthenticateWithCredential(user, credential);
      await updateEmail(user, form.email);
      await sendVerificationEmail(user);
      await updateUserData();
      
      setShowPasswordModal(false);
      setEditMode(false);
      alert("Email atualizado com sucesso! Um email de verificação foi enviado para seu novo endereço.");
    } catch (error) {
      console.error("Erro na autenticação:", error);
      
      let errorMessage = error.message;
      
      if (error.code === 'auth/requires-recent-login') {
        errorMessage = "Sua sessão expirou. Por favor, faça login novamente para alterar seu email.";
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = "Este email já está em uso por outra conta.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "O email fornecido é inválido.";
      }
      
      setAuthError(errorMessage);
    }
  };

  const handleAtualizar = async () => {
    const validationError = validateForm();
    if (validationError) {
      alert(validationError);
      return;
    }

    if (!usuarioId) {
      alert("ID do usuário não está carregado ainda. Tente novamente em alguns segundos.");
      return;
    }

    try {
      setUpdating(true);
      
      if (form.email !== currentUser.email) {
        setShowPasswordModal(true);
        return;
      }
      
      await updateUserData();
      alert("Dados atualizados com sucesso!");
      setEditMode(false);
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      alert(`Erro ao atualizar os dados: ${error.message}`);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Carregando seus dados...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-error">
        <div className="error-icon">!</div>
        <h3>Ocorreu um erro</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Tentar novamente</button>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <FiLock size={24} />
              <h3>Confirmar Senha</h3>
            </div>
            <p>Para alterar seu email, por favor digite sua senha atual:</p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha atual"
              className="modal-input"
            />
            {authError && <div className="modal-error">{authError}</div>}
            <div className="modal-buttons">
              <button 
                className="modal-cancel" 
                onClick={() => {
                  setShowPasswordModal(false);
                  setUpdating(false);
                }}
                disabled={updating}
              >
                Cancelar
              </button>
              <button 
                className="modal-confirm" 
                onClick={handlePasswordSubmit}
                disabled={updating}
              >
                {updating ? "Verificando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="profile-header">
        <div className="profile-avatar">
          <img
            src={currentUser?.photoURL || "/default-avatar.jpg"}
            alt="Perfil"
            onError={(e) => {
              e.target.src = "/default-avatar.jpg";
            }}
          />
          {editMode && (
            <button className="edit-avatar-btn">
              <FiEdit size={16} />
            </button>
          )}
        </div>
        <h1>{form.nome}</h1>
        <p className="profile-email">{form.email}</p>
        
        <div className="profile-actions">
          {editMode ? (
            <>
              <button className="btn-save" onClick={handleAtualizar} disabled={updating}>
                <FiSave size={18} /> {updating ? "Salvando..." : "Salvar Alterações"}
              </button>
              <button className="btn-cancel" onClick={() => setEditMode(false)} disabled={updating}>
                Cancelar
              </button>
            </>
          ) : (
            <button className="btn-edit" onClick={() => setEditMode(true)}>
              <FiEdit size={18} /> Editar Perfil
            </button>
          )}
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-section">
          <h2><FiUser /> Informações Pessoais</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Nome Completo</label>
              <input 
                type="text" 
                name="nome" 
                value={form.nome} 
                onChange={handleChange} 
                required 
                disabled={!editMode}
              />
            </div>
            <div className="form-group">
              <label><FiMail /> Email</label>
              <input 
                type="email" 
                name="email" 
                value={form.email} 
                onChange={handleChange} 
                required 
                disabled={!editMode}
              />
              {currentUser && !currentUser.emailVerified && (
                <div className="verification-warning">
                  <FiAlertCircle />
                  <span>Email não verificado. </span>
                  <button 
                    type="button" 
                    className="verify-link"
                    onClick={() => sendVerificationEmail(currentUser)}
                  >
                    Reenviar email de verificação
                  </button>
                </div>
              )}
              {emailSent && (
                <div className="verification-success">
                  <FiCheckCircle />
                  <span>Email de verificação enviado!</span>
                </div>
              )}
            </div>
            <div className="form-group">
              <label><FiPhone /> Telefone</label>
              <input 
                type="tel" 
                name="telefone" 
                value={form.telefone} 
                onChange={handleChange} 
                pattern="[\d\s()-]+"
                disabled={!editMode}
              />
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h2><FiMapPin /> Endereço</h2>
          <div className="form-grid">
            <div className="form-group">
              <label><FiHome /> Rua</label>
              <input 
                type="text" 
                name="rua" 
                value={form.rua} 
                onChange={handleChange} 
                disabled={!editMode}
              />
            </div>
            <div className="form-group">
              <label>Número</label>
              <input 
                type="text" 
                name="numero" 
                value={form.numero} 
                onChange={handleChange} 
                disabled={!editMode}
              />
            </div>
            <div className="form-group">
              <label>Complemento</label>
              <input 
                type="text" 
                name="complemento" 
                value={form.complemento} 
                onChange={handleChange} 
                disabled={!editMode}
              />
            </div>
            <div className="form-group">
              <label>Bairro</label>
              <input 
                type="text" 
                name="bairro" 
                value={form.bairro} 
                onChange={handleChange} 
                disabled={!editMode}
              />
            </div>
            <div className="form-group">
              <label>Cidade</label>
              <input 
                type="text" 
                name="cidade" 
                value={form.cidade} 
                onChange={handleChange} 
                disabled={!editMode}
              />
            </div>
            <div className="form-group">
              <label>Estado</label>
              <input 
                type="text" 
                name="estado" 
                value={form.estado} 
                onChange={handleChange} 
                disabled={!editMode}
              />
            </div>
            <div className="form-group">
              <label>CEP</label>
              <input 
                type="text" 
                name="cep" 
                value={form.cep} 
                onChange={handleChange} 
                maxLength="9"
                disabled={!editMode}
              />
            </div>
            <div className="form-group">
              <label><FiNavigation /> País</label>
              <select 
                name="pais" 
                value={form.pais} 
                onChange={handleChange} 
                disabled={!editMode}
              >
                <option value="Brasil">Brasil</option>
                <option value="Estados Unidos">Estados Unidos</option>
                <option value="Canadá">Canadá</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;