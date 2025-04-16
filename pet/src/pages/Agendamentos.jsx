import React, { useState, useEffect } from "react";
import { auth } from "../Db/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import "../styles/Agendamentos.css";

const racasBrasil = [
  "Akita", "Beagle", "Bichon Frisé", "Border Collie", "Boxer", "Bulldog Francês", "Bulldog Inglês",
  "Cane Corso", "Chihuahua", "Cocker Spaniel", "Dachshund (Salsicha)", "Dálmata", "Doberman",
  "Golden Retriever", "Husky Siberiano", "Labrador", "Lhasa Apso", "Maltês", "Pastor Alemão",
  "Pinscher", "Poodle", "Pug", "Rottweiler", "Schnauzer", "Shar Pei", "Shih Tzu", "Spitz Alemão",
  "Vira-lata", "Yorkshire Terrier", "Outros"
];

const Agendamentos = () => {
  const [formData, setFormData] = useState({
    nome: "",
    pet: "",
    raca: "",
    data: "",
    hora: "",
    servico: "Banho"
  });

  const [tutorId, setTutorId] = useState(null);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setTutorId(user.uid);
      } else {
        setTutorId(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!tutorId) {
      alert("Você precisa estar logado para agendar.");
      return;
    }
  
    try {
      // Junta data e hora em um único DateTime ISO
      const dataHoraISO = new Date(`${formData.data}T${formData.hora}`).toISOString();
  
      const payload = {
        PetId: formData.pet, // aqui você precisa garantir que formData.pet seja o ID do pet
        DataHora: dataHoraISO,
        Servicos: [formData.servico] // transforma o serviço em array
      };
  
      const response = await fetch("http://localhost:5005/Agendamento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
  
      if (response.ok) {
        setMensagem("✅ Agendamento realizado com sucesso!");
        setFormData({ nome: "", pet: "", raca: "", data: "", hora: "", servico: "Banho" });
        setTimeout(() => setMensagem(""), 3000);
      } else {
        const errorData = await response.json();
        alert("Erro ao agendar: " + errorData.message);
      }
    } catch (err) {
      alert("Erro de conexão com a API: " + err.message);
    }
  };
  return (
    <div className="agendamento-container">
      <h2>Agendar Banho e Tosa</h2>
      {mensagem && <div className="mensagem">{mensagem}</div>}
      <form className="agendamento-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="nome"
          placeholder="Seu nome"
          value={formData.nome}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="pet"
          placeholder="Nome do pet"
          value={formData.pet}
          onChange={handleChange}
          required
        />
        <select name="raca" value={formData.raca} onChange={handleChange} required>
          <option value="">Selecione a raça</option>
          {racasBrasil.map((raca, index) => (
            <option key={index} value={raca}>{raca}</option>
          ))}
        </select>
        <div className="data-hora-group">
          <input
            type="date"
            name="data"
            value={formData.data}
            onChange={handleChange}
            required
          />
          <input
            type="time"
            name="hora"
            value={formData.hora}
            onChange={handleChange}
            required
          />
        </div>
        <select name="servico" value={formData.servico} onChange={handleChange}>
          <option value="Banho">Banho</option>
          <option value="Tosa">Tosa</option>
          <option value="Banho e Tosa">Banho e Tosa</option>
        </select>
        <button type="submit">Agendar</button>
      </form>
    </div>
  );
};

export default Agendamentos;
