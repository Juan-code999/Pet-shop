import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaHome, FaProjectDiagram, FaUser, FaBuilding } from "react-icons/fa";
import "../styles/NavBar.css";

// Supondo Firebase, você pode adaptar para qualquer auth
import { getAuth, onAuthStateChanged } from "firebase/auth";

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
        setUser({
          name: currentUser.displayName,
          photo: currentUser.photoURL,
        });
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

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
        <li className="Nav__Login__Mobile">
          {user ? (
            <div className="Nav__User__Info">
              <img src={user.photo} alt="Avatar" className="Nav__User__Avatar" />
              <span>{user.name}</span>
            </div>
          ) : (
            <Link to="/login" className="Nav__Login__Button" onClick={closeMenu}>
              Login
            </Link>
          )}
        </li>
      </ul>

      {/* Desktop login ou nome do usuário */}
      <div className="Nav__Login__Desktop">
        {user ? (
          <div className="Nav__User__Info">
            <img src={user.photo} alt="Avatar" className="Nav__User__Avatar" />
            <span>{user.name}</span>
          </div>
        ) : (
          <Link to="/login" className="Nav__Login__Button" onClick={closeMenu}>
            Login
          </Link>
        )}
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
