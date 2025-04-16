<<<<<<< HEAD
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../Db/firebaseConfig';
=======
import React, { useState, useEffect } from "react";
import { auth } from "../Db/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
>>>>>>> 8a9e0db70a78c586f3098988e31aea8f2741c144
import "../styles/Agendamentos.css";

const Agendamento = () => {
  const [formDataAgendamento, setFormDataAgendamento] = useState({
    NomePet: '',
    DataAgendamento: '',
    HoraAgendamento: '',
  });
  
  const navigate = useNavigate();

<<<<<<< HEAD
  // Pegar o UID do usuário logado
  const usuarioId = auth.currentUser?.uid;
=======
  const [tutorId, setTutorId] = useState(null);
  const [mensagem, setMensagem] = useState("");
>>>>>>> 8a9e0db70a78c586f3098988e31aea8f2741c144

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
<<<<<<< HEAD
    setFormDataAgendamento((prev) => ({ ...prev, [name]: value }));
=======
    setFormData((prev) => ({ ...prev, [name]: value }));
>>>>>>> 8a9e0db70a78c586f3098988e31aea8f2741c144
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
<<<<<<< HEAD

    if (!usuarioId) {
      alert('Você precisa estar logado para agendar.');
      return;
    }

    const { NomePet, DataAgendamento, HoraAgendamento } = formDataAgendamento;

    // Validando os campos
    if (!NomePet || !DataAgendamento || !HoraAgendamento) {
      alert('Preencha todos os campos!');
      return;
    }

    try {
      const response = await fetch('http://localhost:5005/api/agendamento', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          NomePet,
          DataAgendamento,
          HoraAgendamento,
          UsuarioId: usuarioId,  // Enviando o ID do usuário
        }),
      });

      if (response.ok) {
        alert('Agendamento realizado com sucesso!');
        navigate('/dashboard'); // Redireciona para o dashboard
      } else {
        const err = await response.json();
        alert('Erro ao criar agendamento: ' + err.message);
      }
    } catch (error) {
      alert('Erro ao registrar agendamento: ' + error.message);
=======
  
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
>>>>>>> 8a9e0db70a78c586f3098988e31aea8f2741c144
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
