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
  FiCheckCircle,
  FiCamera,
  FiTrash2
} from "react-icons/fi";
import axios from "axios";

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

  // Função para upload de imagem para o Cloudinary
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

      if (response.status !== 200) {
        throw new Error('Falha no upload da imagem');
      }

      return response.data.secure_url;
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };

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
      alert("Email de verificação enviado. Por favor, verifique sua caixa de entrada.");
    } catch (error) {
      console.error("Erro ao enviar email de verificação:", error);
      alert(`Erro ao enviar email de verificação: ${error.message}`);
    }
  };

  // Atualizar dados do usuário na API - VERSÃO CORRIGIDA
  const updateUserData = async () => {
    try {
      // 1. Obter os dados atuais do usuário para pegar a senha hashada
      const userResponse = await fetch(`http://localhost:5005/api/Usuario/${usuarioId}`);
      if (!userResponse.ok) {
        throw new Error("Falha ao obter dados do usuário");
      }
      const currentUserData = await userResponse.json();

      // 2. Preparar os dados para atualização
      const body = {
        id: usuarioId,
        nome: form.nome,
        email: form.email,
        telefone: form.telefone || "",
        foto: form.foto || "",
        senha: currentUserData.senha, // Usar a senha já hashada
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

      const token = await currentUser.getIdToken();
      
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
        console.error("Erro na resposta da API:", errorData);
        
        let errorMessage = "Falha na atualização";
        if (errorData.errors) {
          errorMessage = Object.entries(errorData.errors)
            .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
            .join('; ');
        } else if (errorData.title) {
          errorMessage = errorData.title;
        }
        
        throw new Error(errorMessage);
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
      alert("Dados atualizados com sucesso! Um email de verificação foi enviado para seu novo endereço.");
    } catch (error) {
      console.error("Erro na autenticação:", error);
      
      let errorMessage = error.message;
      
      if (error.code === 'auth/requires-recent-login') {
        errorMessage = "Sua sessão expirou. Por favor, faça login novamente para alterar seu email.";
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = "Este email já está em uso por outra conta.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "O email fornecido é inválido.";
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = "Senha incorreta. Por favor, tente novamente.";
      }
      
      setAuthError(errorMessage);
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
      
      const updatedUser = await updateUserData();
      console.log("Usuário atualizado:", updatedUser);
      
      alert("Dados atualizados com sucesso!");
      setEditMode(false);
      
      fetchUserData(form.email);
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
            src={photoPreview || form.foto || "/default-avatar.jpg"}
            alt="Perfil"
            onError={(e) => {
              e.target.src = "/default-avatar.jpg";
            }}
          />
          {editMode && (
            <div className="avatar-actions">
              <label className="edit-avatar-btn">
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
                  className="remove-avatar-btn"
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
              <div className="uploading-spinner"></div>
            </div>
          )}
        </div>
        <h1>{form.nome}</h1>
        <p className="profile-email">{form.email}</p>
        
        <div className="profile-actions">
          {editMode ? (
            <>
              <button className="btn-save" onClick={handleAtualizar} disabled={updating || uploadingImage}>
                <FiSave size={18} /> {updating ? "Salvando..." : "Salvar Alterações"}
              </button>
              <button className="btn-cancel" onClick={() => setEditMode(false)} disabled={updating || uploadingImage}>
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
                name="endereco.rua" 
                value={form.endereco.rua} 
                onChange={handleChange} 
                required
                disabled={!editMode}
              />
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
                maxLength="9"
                disabled={!editMode}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;