import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaHome, FaProjectDiagram, FaUser, FaBuilding } from "react-icons/fa";
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

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // Verifica se há nome salvo no localStorage
        const nome = localStorage.getItem("tutorNome") || currentUser.displayName || "Usuário";
        setUser({
          name: nome,
          photo: currentUser.photoURL,
        });
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
      setUser(null);
    });
  };

  const renderLoginSection = () =>
    user ? (
      <div className="Nav__User__Info">
        {user.photo && <img src={user.photo} alt="Avatar" className="Nav__User__Avatar" />}
        <span>{user.name}</span>
        <button onClick={handleLogout} className="Nav__Logout__Button">Sair</button>
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
          <Link to="/conta" className={location.pathname === "/conta" ? "active" : ""} onClick={closeMenu}>
            <FaUser /> Contatos
          </Link>
        </li>
        <li>
          <Link to="/empresa" className={location.pathname === "/empresa" ? "active" : ""} onClick={closeMenu}>
            <FaBuilding /> Empresa
          </Link>
        </li>

        {/* Mobile login ou nome do usuário */}
        <li className="Nav__Login__Mobile">{renderLoginSection()}</li>
      </ul>

      {/* Desktop login ou nome do usuário */}
      <div className="Nav__Login__Desktop">{renderLoginSection()}</div>

      <button className={`Nav__Hamburger ${isOpen ? "open" : ""}`} onClick={toggleMenu} aria-label="Menu">
        <div className="Hamburger__Box">
          <div className="Hamburger__Inner"></div>
        </div>
      </button>
    </nav>
  );
};

export default NavBar;
