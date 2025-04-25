
import React, { useState, useEffect } from "react";
import { auth } from "../Db/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import "../styles/Agendamentos.css";

const Agendamento = () => {
  const [formDataAgendamento, setFormDataAgendamento] = useState({
    NomePet: '',
    DataAgendamento: '',
    HoraAgendamento: '',
  });
  
  const navigate = useNavigate();


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
      <h2>Agendar Serviço</h2>
      <form className="agendamento-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="NomePet"
          placeholder="Nome do pet"
          value={formDataAgendamento.NomePet}
          onChange={handleChange}
        />
        <input
          type="date"
          name="DataAgendamento"
          value={formDataAgendamento.DataAgendamento}
          onChange={handleChange}
        />
        <input
          type="time"
          name="HoraAgendamento"
          value={formDataAgendamento.HoraAgendamento}
          onChange={handleChange}
        />
        <button type="submit">Agendar</button>
      </form>
    </div>
  );
};

export default Agendamento;
