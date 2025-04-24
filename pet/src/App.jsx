import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavBar from './components/NavBar';
import Footer from './components/Footer';

import Home from './pages/Home';
import Login from "./pages/Login";
import Registrar from "./pages/Registrar";
import Agendamentos from "./pages/Agendamentos";



function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registrar" element={<Registrar/>} />
        <Route path="/agendamentos" element={<Agendamentos/>} />
        
        
        {/* <Route path="/conta" element={Contatos} /> */}

        
        
        <Route path="*" element={<h1>Página não encontrada</h1>} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
