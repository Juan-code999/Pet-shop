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
  FaHeart,
  FaUserCircle,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaChevronDown,
  FaChevronUp
} from "react-icons/fa";
import "../styles/NavBar.css";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";

const NavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [shortName, setShortName] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setMobileMenuOpen(false);
        setShowUserMenu(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auth state listener
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        const nome = localStorage.getItem("usuarioNome") || currentUser.displayName || "Usuário";
        const isAdmin = localStorage.getItem("isAdmin") === "true";

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
    closeAllMenus();
  };

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      localStorage.clear();
      setUser(null);
      navigate("/login");
      closeAllMenus();
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    if (showUserMenu) setShowUserMenu(false);
  };

  const toggleUserMenu = () => {
    if (isMobile) {
      setShowUserMenu(!showUserMenu);
    }
  };

  const closeAllMenus = () => {
    setMobileMenuOpen(false);
    setShowUserMenu(false);
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (mobileMenuOpen && !document.querySelector('.nav-content').contains(e.target) &&
        !document.querySelector('.mobile-menu-button').contains(e.target)) {
        closeAllMenus();
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileMenuOpen]);

  return (
    <header className="nav">
      <div className="nav-middle">
        <div className="nav-logo-container">
          <Link to="/" className="nav-logo" style={{ textDecoration: 'none' }}>
            <img src="src/img/logop.png" alt="Logo" className="nav-logo-img" />
            <p className="logo-text">Lat Miau</p>
          </Link>
        </div>

        <button className="mobile-menu-button" onClick={toggleMobileMenu}>
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        <div className={`nav-content ${mobileMenuOpen ? 'mobile-menu-open' : ''}`}>
          <nav className="nav-links">
            <Link to="/" className={location.pathname === "/" ? "active" : ""} onClick={closeAllMenus}>
              <FaHome className="nav-icon" /> HOME
            </Link>
            <Link to="/produtos" className={location.pathname === "/produtos" ? "active" : ""} onClick={closeAllMenus}>
              <FaBoxOpen className="nav-icon" /> PRODUTOS
            </Link>
            <Link to="/contatos" className={location.pathname === "/contatos" ? "active" : ""} onClick={closeAllMenus}>
              <FaEnvelope className="nav-icon" /> CONTATOS
            </Link>
            <Link to="/empresa" className={location.pathname === "/empresa" ? "active" : ""} onClick={closeAllMenus}>
              <FaBuilding className="nav-icon" /> EMPRESA
            </Link>
            {user?.isAdmin && (
              <Link to="/admin" className={location.pathname.startsWith("/admin") ? "active" : ""} onClick={closeAllMenus}>
                <FaUserCog className="nav-icon" /> ADMIN
              </Link>
            )}
          </nav>

          <div className="nav-icons">
            <Link to="/favoritos" className="nav-icon-link" onClick={closeAllMenus}>
              <FaHeart className="nav-icon" />
            </Link>
            <Link to="/carrinho" className="nav-icon-link" onClick={closeAllMenus}>
              <FaShoppingCart className="nav-icon" />
            </Link>

            {user ? (
              <div
                className="nav-user-container"
                onMouseEnter={() => !isMobile && setShowUserMenu(true)}
                onMouseLeave={() => !isMobile && setShowUserMenu(false)}
              >
                <div className="nav-user-info" onClick={isMobile ? toggleUserMenu : undefined}>
                  {user?.photo ? (
                    <img src={user.photo} alt="User" className="nav-user-photo" />
                  ) : (
                    <FaUser className="user-placeholder" />
                  )}
                  <span className="nav-user-name">
                    {shortName}
                    {isMobile && (showUserMenu ? <FaChevronUp /> : <FaChevronDown />)}
                  </span>
                </div>

                {(showUserMenu || (!isMobile && showUserMenu)) && (
                  <div
                    className={`user-dropdown ${isMobile ? 'mobile-dropdown' : ''}`}
                    onMouseEnter={() => !isMobile && setShowUserMenu(true)}
                    onMouseLeave={() => !isMobile && setShowUserMenu(false)}
                  >
                    <Link
                      to="/perfil"
                      className="dropdown-item"
                      onClick={closeAllMenus}
                    >
                      <FaUserCircle className="dropdown-icon" />
                      <span>Perfil</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="dropdown-item"
                    >
                      <FaSignOutAlt className="dropdown-icon" />
                      <span>Sair</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button className="login-button" onClick={handleLogin}>
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavBar;