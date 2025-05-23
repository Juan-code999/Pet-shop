import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaProjectDiagram,
  FaUser,
  FaBuilding,
  FaStore,
} from "react-icons/fa";
import "../styles/NavBar.css";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";

const NavBar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userId = currentUser.uid;
          const response = await fetch(`http://localhost:5005/api/Usuario/${id}`);


          if (response.ok) {
            const usuario = await response.json();
            const nome = usuario.Nome || "Usuário";
            const isAdmin = Boolean(usuario.IsAdmin);

            localStorage.setItem("tutorNome", nome);
            localStorage.setItem("tutorId", userId);
            localStorage.setItem("isAdmin", isAdmin);

            const newUser = {
              name: nome,
              photo: currentUser.photoURL,
              isAdmin: isAdmin,
            };

            setUser(newUser);
          } else {
            setUser({
              name: currentUser.displayName || "Usuário",
              photo: currentUser.photoURL,
              isAdmin: false,
            });
          }
        } catch (error) {
          console.error("Erro ao buscar usuário:", error);
          setUser({
            name: currentUser.displayName || "Usuário",
            photo: currentUser.photoURL,
            isAdmin: false,
          });
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth).then(() => {
      localStorage.removeItem("tutorNome");
      localStorage.removeItem("tutorId");
      localStorage.removeItem("isAdmin");
      setUser(null);
    });
  };

  const renderLoginSection = () =>
    user ? (
      <div className="Nav__User__Dropdown">
        {user.photo && (
          <img src={user.photo} alt="Avatar" className="Nav__User__Avatar" />
        )}
        <div className="Nav__User__Name">
          {user.name}
          <div className="Nav__Dropdown__Content">
            <Link to="/settings" onClick={closeMenu}>
              Configurações
            </Link>
            {user.isAdmin && (
              <Link to="/admin" onClick={closeMenu}>
                Página Admin
              </Link>
            )}
            <button onClick={handleLogout}>Sair</button>
          </div>
        </div>
      </div>
    ) : (
      <Link to="/login" className="Nav__Login__Button" onClick={closeMenu}>
        Login
      </Link>
    );

  return (
    <nav className="Nav__Container">
      <Link to="/" className="Nav__logo__wrapper" onClick={closeMenu}>
        <img src="src/img/logo.png" alt="Logo" className="Nav__logo" />
      </Link>

      <ul className={`Nav__Bar ${isOpen ? "active" : ""}`}>
        <li>
          <Link to="/" className={location.pathname === "/" ? "active" : ""} onClick={closeMenu}>
            <FaHome /> Home
          </Link>
        </li>

        <li>
          <Link to="/produtos" className={location.pathname === "/produtos" ? "active" : ""} onClick={closeMenu}>
            <FaStore /> Produtos
          </Link>
        </li>

        <li>
          <Link to="/contatos" className={location.pathname === "/contatos" ? "active" : ""} onClick={closeMenu}>
            <FaUser /> Contatos
          </Link>
        </li>

        <li>
          <Link to="/empresa" className={location.pathname === "/empresa" ? "active" : ""} onClick={closeMenu}>
            <FaBuilding /> Empresa
          </Link>
        </li>

        {/* Página Admin visível apenas para admin */}
        {user && user.isAdmin && (
          <Link to="/admin" className={`admin-link ${location.pathname.startsWith("/admin") ? "active" : ""}`} onClick={closeMenu}>
            <FaProjectDiagram /> Página Admin
          </Link>
        )}

        {/* Mobile login */}
        <li className="Nav__Login__Mobile">{renderLoginSection()}</li>
      </ul>

      {/* Desktop login */}
      <div className="Nav__Login__Desktop">{renderLoginSection()}</div>

      <button
        className={`Nav__Hamburger ${isOpen ? "open" : ""}`}
        onClick={toggleMenu}
        aria-label="Menu"
      >
        <div className="Hamburger__Box">
          <div className="Hamburger__Inner"></div>
        </div>
      </button>
    </nav>
  );
};

export default NavBar;
