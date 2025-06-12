import React, { useEffect, useState } from "react";
import "../styles/ProfilePage.css";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const ProfilePage = () => {
  const [usuarioId, setUsuarioId] = useState("");
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

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser || !currentUser.email) return;

      try {
        // Busca o usuário pelo email para pegar o id
        const resId = await fetch(`http://localhost:5005/api/Usuario/email/${encodeURIComponent(currentUser.email)}`);
        if (!resId.ok) {
          console.error("Erro ao buscar usuário por email");
          return;
        }
        const dataId = await resId.json();
        console.log("Dados do usuário por email:", dataId);

        if (!dataId.id) {
          console.error("ID do usuário não encontrado na resposta.");
          return;
        }
        setUsuarioId(dataId.id);

        // Busca os dados completos do usuário pelo id
        const resDados = await fetch(`http://localhost:5005/api/Usuario/${dataId.id}`);
        if (!resDados.ok) {
          console.error("Erro ao buscar dados do usuário pelo id");
          return;
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
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAtualizar = async () => {
    if (!usuarioId) {
      alert("ID do usuário não está carregado ainda. Tente novamente em alguns segundos.");
      return;
    }

    if (!window.confirm("Deseja atualizar os dados?")) return;

    try {
      const body = {
        id: usuarioId,
        nome: form.nome,
        email: form.email,
        telefone: form.telefone,
        senha: "", // deixar vazio se não for atualizar
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
        throw new Error("Falha na atualização");
      }

      alert("Dados atualizados com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      alert("Erro ao atualizar os dados.");
    }
  };

  // Pegando foto do usuário firebase para mostrar
  const auth = getAuth();
  const currentUser = auth.currentUser;

  return (
    <div className="profile-page">
      <div className="cover">
        <button className="change-cover">📷 Mudar Capa</button>
      </div>
      <div className="content">
        <div className="sidebar">
          <img
            src={currentUser?.photoURL || "https://randomuser.me/api/portraits/men/75.jpg"}
            alt="Perfil"
          />
          <h2>{form.nome}</h2>
          <p>Conta Pessoal</p>
          <button>Ver Perfil Público</button>
          <a href="#">https://minhaplataforma.com</a>
        </div>
        <div className="main">
          <h3>Configurações da Conta</h3>
          <div className="form">
            <div className="form-group">
              <label>Nome</label>
              <input type="text" name="nome" value={form.nome} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Telefone</label>
              <input type="text" name="telefone" value={form.telefone} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Rua</label>
              <input type="text" name="rua" value={form.rua} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Número</label>
              <input type="text" name="numero" value={form.numero} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Cidade</label>
              <input type="text" name="cidade" value={form.cidade} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Estado/Região</label>
              <input type="text" name="estado" value={form.estado} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>CEP</label>
              <input type="text" name="cep" value={form.cep} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>País</label>
              <select name="pais" value={form.pais} onChange={handleChange}>
                <option>Brasil</option>
                <option>Estados Unidos</option>
                <option>Canadá</option>
              </select>
            </div>
            <div className="form-group">
              <label>Bairro</label>
              <input type="text" name="bairro" value={form.bairro} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Complemento</label>
              <input type="text" name="complemento" value={form.complemento} onChange={handleChange} />
            </div>
          </div>
          <button className="update" onClick={handleAtualizar}>
            Atualizar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
