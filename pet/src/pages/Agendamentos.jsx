import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../Db/firebaseConfig';
import "../styles/Agendamentos.css";

const Agendamento = () => {
  const [formDataAgendamento, setFormDataAgendamento] = useState({
    NomePet: '',
    DataAgendamento: '',
    HoraAgendamento: '',
  });
  
  const navigate = useNavigate();

  // Pegar o UID do usuário logado
  const usuarioId = auth.currentUser?.uid;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormDataAgendamento((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
