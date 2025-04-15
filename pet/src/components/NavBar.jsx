import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaHome, FaProjectDiagram, FaUser, FaBuilding } from "react-icons/fa";
import "../styles/NavBar.css";

const NavBar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

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
          <Link to="/projetos" className={location.pathname === "/projetos" ? "active" : ""} onClick={closeMenu}>
            <FaProjectDiagram /> Projetos
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

        {/* LOGIN dentro do menu quando for responsivo */}
        <li className="Nav__Login__Mobile">
          <Link to="/login" className="Nav__Login__Button" onClick={closeMenu}>
            Login
          </Link>
        </li>
      </ul>

      {/* LOGIN fora do menu (só no desktop) */}
      <div className="Nav__Login__Desktop">
        <Link to="/login" className="Nav__Login__Button" onClick={closeMenu}>
          Login
        </Link>
      </div>

      <button className={`Nav__Hamburger ${isOpen ? "open" : ""}`} onClick={toggleMenu} aria-label="Menu">
        <div className="Hamburger__Box">
          <div className="Hamburger__Inner"></div>
        </div>
      </button>
    </nav>
  );
};

export default NavBar;
