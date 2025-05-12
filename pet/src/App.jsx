import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Registrar from './pages/Registrar';
import Agendamentos from './pages/Agendamentos';
import Settings from './components/Settings';
import Contatos from './pages/Contatos';
import Produtos from './pages/Produtos';
import AdminPage from './pages/AdminPage'; // Adicionando a importação da página de admin

function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contatos" element={<Contatos />} />
        <Route path="/produtos" element={<Produtos />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registrar" element={<Registrar />} />
        <Route path="/agendamentos" element={<Agendamentos />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/admin" element={<AdminPage />} /> {/* Rota para a página Admin */}
        <Route path="*" element={<h1>Página não encontrada</h1>} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
