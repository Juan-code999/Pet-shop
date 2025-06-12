import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  FaHome, 
  FaBoxOpen, 
  FaEnvelope, 
  FaBuilding,
  FaUserCog,
  FaUser,
  FaShoppingCart,
  FaHeart
} from "react-icons/fa";
import "../styles/NavBar.css";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";

const NavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [shortName, setShortName] = useState("");

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        const nome = localStorage.getItem("usuarioNome") || currentUser.displayName || "Usuário";
        const isAdmin = localStorage.getItem("isAdmin") === "true";
        
        // Formatar nome para mostrar apenas primeiro e último nome
        const nameParts = nome.split(' ');
        const formattedName = nameParts.length > 1 
          ? `${nameParts[0]} ${nameParts[nameParts.length - 1]}`
          : nome;
        
        setShortName(formattedName);
        setUser({
          name: nome,
          photo: currentUser.photoURL,
          isAdmin: isAdmin,
        });
      } else {
        setUser(null);
        setShortName("");
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <header className="revo-navbar">
      <div className="revo-navbar-middle">
        <div className="revo-logo-container">
          <div className="revo-logo">
            <img src="src/img/logop.png" alt="Logo" className="revo-logo-img" />
            <p className="logo-text">Lat Miau</p>
          </div>
        </div>

        <div className="revo-nav-center">
          <nav className="revo-nav-links">
            <Link to="/" className={location.pathname === "/" ? "active" : ""}>
              <FaHome className="nav-icon" /> HOME
            </Link>
            <Link to="/produtos" className={location.pathname === "/produtos" ? "active" : ""}>
              <FaBoxOpen className="nav-icon" /> PRODUTOS
            </Link>
            <Link to="/contatos" className={location.pathname === "/contatos" ? "active" : ""}>
              <FaEnvelope className="nav-icon" /> CONTATOS
            </Link>
            <Link to="/empresa" className={location.pathname === "/empresa" ? "active" : ""}>
              <FaBuilding className="nav-icon" /> EMPRESA
            </Link>
          </nav>
        </div>

        <div className="revo-nav-icons">
          <Link to="/favoritos" className="nav-icon-link">
            <FaHeart className="nav-icon" />
          </Link>
          <Link to="/carrinho" className="nav-icon-link">
            <FaShoppingCart className="nav-icon" />
          </Link>
          
          {user ? (
            <div className="revo-user-info">
              {user?.photo ? (
                <img src={user.photo} alt="User" className="revo-user-photo" />
              ) : (
                <FaUser className="user-placeholder" />
              )}
              <span className="revo-user-name">{shortName}</span>
            </div>
          ) : (
            <button className="login-button" onClick={handleLogin}>
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default NavBar;