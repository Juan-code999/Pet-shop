import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Registrar from './pages/Registrar';
import Agendamentos from './pages/Agendamentos';
import ProfilePage from './components/ProfilePage';
import Contatos from './pages/Contatos';
import Produtos from './pages/Produtos';
import AdminPage from './pages/Admin/AdminPage'; // Adicionando a importação da página de admin
import Empresa from './pages/Empresa';
import FormProduto from './components/FormProduto';
import ProdutosDetalhes from './pages/ProdutoDetalhes';
import Carrinho from './pages/Carrinho';
import Curtidas from './pages/Curtidas';

function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contatos" element={<Contatos />} />
        <Route path="/produtos" element={<Produtos />} />
        <Route path="/produto/:id" element={<ProdutosDetalhes />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registrar" element={<Registrar />} />
        <Route path="/agendamentos" element={<Agendamentos />} />
        <Route path="/perfil" element={<ProfilePage />} />
        <Route path="/empresa" element={<Empresa />} />
        <Route path="/Formprodutos" element={<FormProduto />} />
        <Route path="/Carrinho" element={<Carrinho />} />
        <Route path="/favoritos" element={<Curtidas />} />
        <Route path="/admin" element={<AdminPage />} /> {/* Rota para a página Admin */}
        
        <Route path="*" element={<h1>Página não encontrada</h1>} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
