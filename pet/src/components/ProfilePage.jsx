import React, { useState, useEffect, useCallback } from 'react';
import { 
  getAuth, 
  onAuthStateChanged, 
  reauthenticateWithCredential, 
  EmailAuthProvider, 
  updateEmail,
  sendEmailVerification
} from 'firebase/auth';
import { 
  FiEdit, 
  FiSave, 
  FiUser, 
  FiPhone, 
  FiMail, 
  FiMapPin, 
  FiHome, 
  FiLock,
  FiAlertCircle,
  FiCheckCircle,
  FiCamera,
  FiTrash2,
  FiCreditCard,
  FiHeart,
  FiShield,
  FiSettings
} from 'react-icons/fi';
import axios from 'axios';
import '../styles/ProfilePage.css';

const ProfilePage = () => {
  // Estados
  const [usuarioId, setUsuarioId] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState(null);
  const [emailSent, setEmailSent] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  
  // Estado do formulário
  const [form, setForm] = useState({
    nome: "",
    telefone: "",
    email: "",
    foto: "",
    endereco: {
      rua: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
      cep: "",
    }
  });

  const auth = getAuth();
  const [currentUser, setCurrentUser] = useState(auth.currentUser);

  // Buscar dados do usuário
  const fetchUserData = useCallback(async (email) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`http://localhost:5005/api/Usuario/email/${encodeURIComponent(email)}`);
      
      if (!response.ok) {
        throw new Error("Erro ao buscar usuário por email");
      }
      
      const data = await response.json();
      
      if (!data.id) {
        throw new Error("ID do usuário não encontrado na resposta.");
      }
      
      setUsuarioId(data.id);
      
      setForm({
        nome: data.nome || "",
        telefone: data.telefone || "",
        email: data.email || "",
        foto: data.foto || "",
        endereco: {
          rua: data.endereco?.rua || "",
          numero: data.endereco?.numero || "",
          complemento: data.endereco?.complemento || "",
          bairro: data.endereco?.bairro || "",
          cidade: data.endereco?.cidade || "",
          estado: data.endereco?.estado || "",
          cep: data.endereco?.cep || "",
        }
      });
      
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Efeito para carregar dados quando o usuário autenticado mudar
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user?.email) {
        fetchUserData(user.email);
      }
    });

    return () => unsubscribe();
  }, [auth, fetchUserData]);

  // Manipulador de mudanças no formulário
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setForm(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  // Upload de imagem para o Cloudinary
  const uploadImageToCloudinary = async (file) => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "LatMiau");

      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/dnuwa7gs2/image/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data.secure_url;
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };

  // Manipulador de upload de foto
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotoPreview(reader.result);
        };
        reader.readAsDataURL(file);

        const imageUrl = await uploadImageToCloudinary(file);
        setForm(prev => ({ ...prev, foto: imageUrl }));
        
      } catch (error) {
        console.error("Erro ao fazer upload da imagem:", error);
        alert("Erro ao fazer upload da imagem. Tente novamente.");
      }
    }
  };

  // Remover foto
  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    setForm(prev => ({ ...prev, foto: "" }));
  };

  // Validação do formulário
  const validateForm = () => {
    if (!form.nome.trim()) return "O nome é obrigatório";
    if (!form.email.trim()) return "O email é obrigatório";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Email inválido";
    if (form.telefone && !/^[\d\s()-]+$/.test(form.telefone)) return "Telefone inválido";
    
    if (!form.endereco.rua.trim()) return "A rua é obrigatória";
    if (!form.endereco.numero.trim()) return "O número é obrigatório";
    if (!form.endereco.bairro.trim()) return "O bairro é obrigatório";
    if (!form.endereco.cidade.trim()) return "A cidade é obrigatória";
    if (!form.endereco.estado.trim()) return "O estado é obrigatório";
    if (!form.endereco.cep.trim()) return "O CEP é obrigatório";
    
    return null;
  };

  // Enviar email de verificação
  const sendVerificationEmail = async (user) => {
    try {
      await sendEmailVerification(user);
      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 5000);
    } catch (error) {
      console.error("Erro ao enviar email de verificação:", error);
      throw error;
    }
  };

  // Atualizar dados do usuário na API
  const updateUserData = async () => {
    try {
      const userResponse = await fetch(`http://localhost:5005/api/Usuario/${usuarioId}`);
      if (!userResponse.ok) throw new Error("Falha ao obter dados do usuário");
      
      const currentUserData = await userResponse.json();
      const token = await currentUser.getIdToken();
      
      const body = {
        id: usuarioId,
        nome: form.nome,
        email: form.email,
        telefone: form.telefone || "",
        foto: form.foto || "",
        senha: currentUserData.senha,
        endereco: {
          rua: form.endereco.rua,
          numero: form.endereco.numero,
          complemento: form.endereco.complemento || "",
          bairro: form.endereco.bairro,
          cidade: form.endereco.cidade,
          estado: form.endereco.estado,
          cep: form.endereco.cep
        },
        isAdmin: currentUserData.isAdmin || false
      };

      const response = await fetch(`http://localhost:5005/api/Usuario/${usuarioId}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.title || "Falha na atualização");
      }

      return await response.json();
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      throw error;
    }
  };

  // Manipulador de envio de senha no modal
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

      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      
      await updateEmail(user, form.email);
      await sendVerificationEmail(user);
      await updateUserData();
      
      setShowPasswordModal(false);
      setEditMode(false);
    } catch (error) {
      console.error("Erro na autenticação:", error);
      setAuthError(
        error.code === 'auth/wrong-password' ? "Senha incorreta" :
        error.code === 'auth/requires-recent-login' ? "Sessão expirou. Faça login novamente." :
        error.message
      );
    }
  };

  // Manipulador de atualização de dados
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
      setEditMode(false);
      fetchUserData(form.email);
    } catch (error) {
      alert(`Erro ao atualizar os dados: ${error.message}`);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
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
      {/* Modal de Confirmação de Senha */}
      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <div className="modal-icon-circle">
                <FiLock size={20} />
              </div>
              <h3>Confirmação de Segurança</h3>
            </div>
            <p className="modal-description">Para proteger sua conta, precisamos que você confirme sua senha atual antes de alterar o email.</p>
            <div className="form-group">
              <label>Sua senha atual</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                className="modal-input"
              />
            </div>
            {authError && <div className="modal-error">{authError}</div>}
            <div className="modal-buttons">
              <button 
                className="btn btn-outline" 
                onClick={() => setShowPasswordModal(false)}
                disabled={updating}
              >
                Cancelar
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handlePasswordSubmit}
                disabled={updating}
              >
                {updating ? "Verificando..." : "Confirmar Alteração"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cabeçalho do Perfil */}
      <div className="profile-header">
        <div className="header-background"></div>
        <div className="profile-header-content">
          <div className="avatar-container">
            <div className="avatar-wrapper">
              <img
                src={photoPreview || form.foto || "/default-avatar.jpg"}
                alt="Perfil"
                className="avatar-image"
                onError={(e) => {
                  e.target.src = "/default-avatar.jpg";
                }}
              />
              {editMode && (
                <div className="avatar-actions">
                  <label className="avatar-action-btn">
                    <FiCamera size={16} />
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handlePhotoChange}
                      style={{ display: 'none' }}
                      disabled={uploadingImage}
                    />
                  </label>
                  {(photoPreview || form.foto) && (
                    <button 
                      className="avatar-action-btn danger"
                      onClick={handleRemovePhoto}
                      disabled={uploadingImage}
                    >
                      <FiTrash2 size={16} />
                    </button>
                  )}
                </div>
              )}
              {uploadingImage && (
                <div className="uploading-overlay">
                  <div className="spinner small"></div>
                </div>
              )}
            </div>
          </div>

          <div className="profile-info">
            <h1 className="profile-name">{form.nome}</h1>
            <p className="profile-email">
              {form.email}
              {currentUser && !currentUser.emailVerified && (
                <span className="verification-badge">
                  <FiAlertCircle /> Não verificado
                </span>
              )}
            </p>
          </div>

          <div className="profile-actions">
            {editMode ? (
              <>
                <button 
                  className="btn btn-primary" 
                  onClick={handleAtualizar} 
                  disabled={updating || uploadingImage}
                >
                  <FiSave /> {updating ? "Salvando..." : "Salvar Alterações"}
                </button>
                <button 
                  className="btn btn-outline" 
                  onClick={() => setEditMode(false)}
                  disabled={updating || uploadingImage}
                >
                  Cancelar
                </button>
              </>
            ) : (
              <button className="btn btn-primary" onClick={() => setEditMode(true)}>
                <FiEdit /> Editar Perfil
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="profile-content">
        {/* Menu Lateral */}
        <div className="profile-sidebar">
          <div className="sidebar-header">
            <h3>Minha Conta</h3>
          </div>
          <ul className="sidebar-menu">
            <li 
              className={`menu-item ${activeTab === 'personal' ? 'active' : ''}`}
              onClick={() => setActiveTab('personal')}
            >
              <div className="menu-icon">
                <FiUser />
              </div>
              <span>Informações Pessoais</span>
            </li>
            <li 
              className={`menu-item ${activeTab === 'address' ? 'active' : ''}`}
              onClick={() => setActiveTab('address')}
            >
              <div className="menu-icon">
                <FiMapPin />
              </div>
              <span>Endereço</span>
            </li>
            <li 
              className={`menu-item ${activeTab === 'payment' ? 'active' : ''}`}
              onClick={() => setActiveTab('payment')}
            >
              <div className="menu-icon">
                <FiCreditCard />
              </div>
              <span>Pagamentos</span>
            </li>
            <li 
              className={`menu-item ${activeTab === 'favorites' ? 'active' : ''}`}
              onClick={() => setActiveTab('favorites')}
            >
              <div className="menu-icon">
                <FiHeart />
              </div>
              <span>Favoritos</span>
            </li>
            <li 
              className={`menu-item ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <div className="menu-icon">
                <FiShield />
              </div>
              <span>Segurança</span>
            </li>
            <li 
              className={`menu-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <div className="menu-icon">
                <FiSettings />
              </div>
              <span>Configurações</span>
            </li>
          </ul>
        </div>

        {/* Conteúdo Dinâmico */}
        <div className="profile-main-content">
          {/* Informações Pessoais */}
          {activeTab === 'personal' && (
            <div className="profile-section">
              <div className="section-header">
                <h2 className="section-title">
                  <FiUser className="section-icon" />
                  <span>Informações Pessoais</span>
                </h2>
              </div>
              <div className="section-content">
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
                      className={editMode ? "input-edit-mode" : ""}
                    />
                  </div>

                  <div className="form-group">
                    <label>Email</label>
                    <div className="input-with-icon">
                      <FiMail className="input-icon" />
                      <input 
                        type="email" 
                        name="email" 
                        value={form.email} 
                        onChange={handleChange} 
                        required 
                        disabled={!editMode}
                        className={editMode ? "input-edit-mode" : ""}
                      />
                    </div>
                    {currentUser && !currentUser.emailVerified && (
                      <div className="verification-notice">
                        <FiAlertCircle />
                        <span>Seu email não está verificado. </span>
                        <button 
                          type="button" 
                          className="text-link"
                          onClick={() => sendVerificationEmail(currentUser)}
                        >
                          Reenviar verificação
                        </button>
                        {emailSent && (
                          <span className="text-success">
                            <FiCheckCircle /> Email enviado!
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Telefone</label>
                    <div className="input-with-icon">
                      <FiPhone className="input-icon" />
                      <input 
                        type="tel" 
                        name="telefone" 
                        value={form.telefone} 
                        onChange={handleChange} 
                        disabled={!editMode}
                        placeholder="(00) 00000-0000"
                        className={editMode ? "input-edit-mode" : ""}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Endereço */}
          {activeTab === 'address' && (
            <div className="profile-section">
              <div className="section-header">
                <h2 className="section-title">
                  <FiMapPin className="section-icon" />
                  <span>Endereço</span>
                </h2>
              </div>
              <div className="section-content">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Rua</label>
                    <div className="input-with-icon">
                      <FiHome className="input-icon" />
                      <input 
                        type="text" 
                        name="endereco.rua" 
                        value={form.endereco.rua} 
                        onChange={handleChange} 
                        required
                        disabled={!editMode}
                        className={editMode ? "input-edit-mode" : ""}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Número</label>
                    <input 
                      type="text" 
                      name="endereco.numero" 
                      value={form.endereco.numero} 
                      onChange={handleChange} 
                      required
                      disabled={!editMode}
                      className={editMode ? "input-edit-mode" : ""}
                    />
                  </div>

                  <div className="form-group">
                    <label>Complemento</label>
                    <input 
                      type="text" 
                      name="endereco.complemento" 
                      value={form.endereco.complemento} 
                      onChange={handleChange} 
                      disabled={!editMode}
                      className={editMode ? "input-edit-mode" : ""}
                    />
                  </div>

                  <div className="form-group">
                    <label>Bairro</label>
                    <input 
                      type="text" 
                      name="endereco.bairro" 
                      value={form.endereco.bairro} 
                      onChange={handleChange} 
                      required
                      disabled={!editMode}
                      className={editMode ? "input-edit-mode" : ""}
                    />
                  </div>

                  <div className="form-group">
                    <label>Cidade</label>
                    <input 
                      type="text" 
                      name="endereco.cidade" 
                      value={form.endereco.cidade} 
                      onChange={handleChange} 
                      required
                      disabled={!editMode}
                      className={editMode ? "input-edit-mode" : ""}
                    />
                  </div>

                  <div className="form-group">
                    <label>Estado</label>
                    <input 
                      type="text" 
                      name="endereco.estado" 
                      value={form.endereco.estado} 
                      onChange={handleChange} 
                      required
                      disabled={!editMode}
                      maxLength="2"
                      placeholder="UF"
                      className={editMode ? "input-edit-mode" : ""}
                    />
                  </div>

                  <div className="form-group">
                    <label>CEP</label>
                    <input 
                      type="text" 
                      name="endereco.cep" 
                      value={form.endereco.cep} 
                      onChange={handleChange} 
                      required
                      disabled={!editMode}
                      placeholder="00000-000"
                      className={editMode ? "input-edit-mode" : ""}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Métodos de Pagamento */}
          {activeTab === 'payment' && (
            <div className="profile-section">
              <div className="section-header">
                <h2 className="section-title">
                  <FiCreditCard className="section-icon" />
                  <span>Métodos de Pagamento</span>
                </h2>
              </div>
              <div className="section-content">
                <div className="empty-state">
                  <p>Você ainda não cadastrou nenhum método de pagamento.</p>
                  <button className="btn btn-primary">
                    Adicionar Cartão
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Favoritos */}
          {activeTab === 'favorites' && (
            <div className="profile-section">
              <div className="section-header">
                <h2 className="section-title">
                  <FiHeart className="section-icon" />
                  <span>Meus Favoritos</span>
                </h2>
              </div>
              <div className="section-content">
                <div className="empty-state">
                  <p>Você ainda não tem itens favoritados.</p>
                </div>
              </div>
            </div>
          )}

          {/* Segurança */}
          {activeTab === 'security' && (
            <div className="profile-section">
              <div className="section-header">
                <h2 className="section-title">
                  <FiShield className="section-icon" />
                  <span>Segurança</span>
                </h2>
              </div>
              <div className="section-content">
                <div className="security-item">
                  <h3>Alterar Senha</h3>
                  <p>Atualize sua senha periodicamente para manter sua conta segura</p>
                  <button className="btn btn-outline">
                    Alterar Senha
                  </button>
                </div>

                <div className="security-item">
                  <h3>Autenticação de Dois Fatores</h3>
                  <p>Adicione uma camada extra de segurança à sua conta</p>
                  <button className="btn btn-outline">
                    Ativar 2FA
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Configurações */}
          {activeTab === 'settings' && (
            <div className="profile-section">
              <div className="section-header">
                <h2 className="section-title">
                  <FiSettings className="section-icon" />
                  <span>Configurações</span>
                </h2>
              </div>
              <div className="section-content">
                <div className="settings-item">
                  <h3>Notificações</h3>
                  <p>Gerencie como você recebe notificações</p>
                  <button className="btn btn-outline">
                    Configurar Notificações
                  </button>
                </div>

                <div className="settings-item">
                  <h3>Privacidade</h3>
                  <p>Controle quem pode ver suas informações</p>
                  <button className="btn btn-outline">
                    Configurações de Privacidade
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;