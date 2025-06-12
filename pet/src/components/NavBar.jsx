import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaProjectDiagram,
  FaUser,
  FaBuilding,
  FaStore,
  FaShoppingCart,
  FaCog,
} from "react-icons/fa";
import "../styles/NavBar.css";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";

const NavBar = () => {
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        const nome = localStorage.getItem("usuarioNome") || currentUser.displayName || "Usuário";
        const isAdmin = localStorage.getItem("isAdmin") === "true";
        setUser({
          name: nome,
          photo: currentUser.photoURL,
          isAdmin: isAdmin,
        });
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      localStorage.clear();
      setUser(null);
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  return (
    <header className="navbar">
      <div className="navbar__top">
        <div className="navbar__logo">
          <Link to="/">
            <img src="src/img/logo.png" alt="Logo" />
          </Link>
        </div>

        {/* Centro vazio (onde era a busca) */}
        <div className="navbar__center"></div>

        {/* Info do usuário no canto direito */}
        <div className="navbar__user">
          {user?.photo && <img src={user.photo} alt="Avatar" className="user-avatar" />}
          <div className="user-name">{user?.name || "Bem-vindo"}</div>
        </div>
      </div>

      <div className="navbar__bottom">
        <div className="navbar__left">
          <span className="all-departments">ALL DEPARTMENTS</span>
        </div>

        <nav className="navbar__links">
          <Link to="/" className={location.pathname === "/" ? "active" : ""}>
            <FaHome /> Home
          </Link>
          <Link to="/produtos" className={location.pathname === "/produtos" ? "active" : ""}>
            <FaStore /> Produtos
          </Link>
          <Link to="/Formprodutos" className={location.pathname === "/Formprodutos" ? "active" : ""}>
            <FaStore /> Adicionar
          </Link>
          <Link to="/contatos" className={location.pathname === "/contatos" ? "active" : ""}>
            <FaUser /> Contatos
          </Link>
          <Link to="/empresa" className={location.pathname === "/empresa" ? "active" : ""}>
            <FaBuilding /> Empresa
          </Link>
          {user?.isAdmin && (
            <Link to="/admin" className={location.pathname.startsWith("/admin") ? "active" : ""}>
              <FaProjectDiagram /> Página Admin
            </Link>
          )}
        </nav>

        <div className="navbar__icons">
          <Link to="/contatos"><FaUser /></Link>
          <Link to="/carrinho"><FaShoppingCart /></Link>
          <Link to="/settings"><FaCog /></Link>
        </div>
      </div>
    </header>
  );
};

export default NavBar;
