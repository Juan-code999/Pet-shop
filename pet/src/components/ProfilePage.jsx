import React, { useEffect, useState } from "react";
import "../styles/ProfilePage.css";
import { getAuth } from "firebase/auth";

const ProfilePage = () => {
  const auth = getAuth();
  const user = auth.currentUser;

  const [usuarioId, setUsuarioId] = useState("");
  const [form, setForm] = useState({
    nome: "",
    sobrenome: "",
    telefone: "",
    email: "",
    cidade: "",
    estado: "",
    cep: "",
    pais: "Brasil",
  });

  useEffect(() => {
    const carregarDados = async () => {
      if (!user || !user.email) return;

      try {
        const resId = await fetch(`http://localhost:5005/api/Usuario/email/${user.email}`);
        const dataId = await resId.json();
        setUsuarioId(dataId.id);

        const resDados = await fetch(`http://localhost:5005/api/Usuario/${dataId.id}`);
        const data = await resDados.json();

        const [nome, sobrenome] = (data.nome || "").split(" ");

        setForm({
          nome: nome || "",
          sobrenome: sobrenome || "",
          telefone: data.telefone || "",
          email: data.email || "",
          cidade: data.endereco?.cidade || "",
          estado: data.endereco?.estado || "",
          cep: data.endereco?.cep || "",
          pais: data.endereco?.pais || "Brasil",
        });
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    };

    carregarDados();
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAtualizar = async () => {
    if (!window.confirm("Deseja atualizar os dados?")) return;

    try {
      const body = {
        nome: `${form.nome} ${form.sobrenome}`,
        email: form.email,
        telefone: form.telefone,
        senha: "",
        endereco: {
          cidade: form.cidade,
          estado: form.estado,
          cep: form.cep,
          pais: form.pais,
        },
        isAdmin: false,
      };

      await fetch(`http://localhost:5005/api/Usuario/${usuarioId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      alert("Dados atualizados com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      alert("Erro ao atualizar os dados.");
    }
  };

  return (
    <div className="profile-page">
      <div className="cover">
        <button className="change-cover">📷 Mudar Capa</button>
      </div>
      <div className="content">
        <div className="sidebar">
          <img
            src={user?.photoURL || "https://randomuser.me/api/portraits/men/75.jpg"}
            alt="Perfil"
          />
          <h2>{form.nome} {form.sobrenome}</h2>
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
              <label>Sobrenome</label>
              <input type="text" name="sobrenome" value={form.sobrenome} onChange={handleChange} />
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
