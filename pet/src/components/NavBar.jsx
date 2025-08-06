import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logoDark from '../img/logo1.png';
import logoLight from '../img/logo1.png';
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

// Função auxiliar para gerar hash do nome
const hashCode = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
};

// Função para gerar avatar padrão
const generateDefaultAvatar = (name) => {
  if (!name) return '';
  const initial = name.charAt(0).toUpperCase();
  const hue = hashCode(name) % 360;
  return `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='hsl(${hue}, 70%, 60%)'/><text x='50' y='60' text-anchor='middle' font-size='50' fill='white'>${initial}</text></svg>`;
};

const NavBar = ({ cartCount = 0, favoritesCount = 0 }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [shortName, setShortName] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const mobileMenuRef = useRef(null);
  const userMenuRef = useRef(null);
  const userButtonRef = useRef(null);
  const userMenuTimer = useRef(null);

  // Debounce resize handler
  const handleResize = useCallback(() => {
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);
    if (!mobile) {
      setMobileMenuOpen(false);
    }
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
          photo: currentUser.photoURL || generateDefaultAvatar(nome),
          isAdmin: isAdmin,
        });
      } else {
        setUser(null);
        setShortName("");
      }
    });

    return () => unsubscribe();
  }, []);

  // Event listeners setup
  useEffect(() => {
    const debouncedResize = debounce(handleResize, 200);
    window.addEventListener('resize', debouncedResize);
    return () => window.removeEventListener('resize', debouncedResize);
  }, [handleResize]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuOpen && 
          mobileMenuRef.current && 
          !mobileMenuRef.current.contains(event.target) &&
          !event.target.closest('.mobile-menu-button')) {
        closeAllMenus();
      }
      
      if (showUserMenu && 
          userMenuRef.current && 
          !userMenuRef.current.contains(event.target) &&
          (!userButtonRef.current || !userButtonRef.current.contains(event.target))) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen, showUserMenu]);

  const debounce = (func, wait) => {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  };

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
    setMobileMenuOpen(prev => !prev);
    setShowUserMenu(false);
  };

  const toggleUserMenu = () => {
    setShowUserMenu(prev => !prev);
  };

  const closeAllMenus = () => {
    setMobileMenuOpen(false);
    setShowUserMenu(false);
  };

  const handleUserMenuEnter = () => {
    if (!isMobile) {
      clearTimeout(userMenuTimer.current);
      setShowUserMenu(true);
    }
  };

  const handleUserMenuLeave = () => {
    if (!isMobile) {
      userMenuTimer.current = setTimeout(() => {
        setShowUserMenu(false);
      }, 300);
    }
  };

  const handleDropdownEnter = () => {
    clearTimeout(userMenuTimer.current);
  };

  const handleDropdownLeave = () => {
    if (!isMobile) {
      userMenuTimer.current = setTimeout(() => {
        setShowUserMenu(false);
      }, 300);
    }
  };

  // Navigation links data for cleaner JSX
  const navLinks = [
    { path: "/", icon: <FaHome className="nav-icon" />, label: "HOME" },
    { path: "/produtos", icon: <FaBoxOpen className="nav-icon" />, label: "PRODUTOS" },
    { path: "/contato", icon: <FaEnvelope className="nav-icon" />, label: "CONTATO" },
    { path: "/empresa", icon: <FaBuilding className="nav-icon" />, label: "EMPRESA" },
    ...(user?.isAdmin ? [{ path: "/admin", icon: <FaUserCog className="nav-icon" />, label: "ADMIN" }] : [])
  ];

  return (
    <header className="nav">
      <div className="nav-middle">
        <div className="nav-logo-container">
          <Link to="/" className="nav-logo" onClick={closeAllMenus}>
            <img 
              src={isMobile ? logoLight : logoDark} 
              alt="Logo" 
              className="nav-logo-img"
            /> 
            <p className="brand-name">Lat Miau</p>
          </Link>
        </div>

        <button 
          className="mobile-menu-button" 
          onClick={toggleMobileMenu}
          aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        <div 
          className={`nav-content ${mobileMenuOpen ? 'mobile-menu-open' : ''}`}
          ref={mobileMenuRef}
        >
          <nav className="nav-links">
            {navLinks.map((link) => (
              <Link 
                key={link.path}
                to={link.path} 
                className={location.pathname === link.path ? "active" : ""} 
                onClick={closeAllMenus}
                aria-current={location.pathname === link.path ? "page" : undefined}
              >
                {link.icon} {link.label}
              </Link>
            ))}
          </nav>

          <div className="nav-icons">
            <Link 
              to="/favoritos" 
              className="nav-icon-link" 
              onClick={closeAllMenus}
              aria-label="Favoritos"
            >
              <FaHeart className="nav-icon" />
              {favoritesCount > 0 && <span className="icon-badge">{favoritesCount}</span>}
            </Link>
            <Link 
              to="/carrinho" 
              className="nav-icon-link" 
              onClick={closeAllMenus}
              aria-label="Carrinho"
            >
              <FaShoppingCart className="nav-icon" />
              {cartCount > 0 && <span className="icon-badge">{cartCount}</span>}
            </Link>

            {user ? (
              <div
                className="nav-user-container"
                ref={userMenuRef}
                onMouseEnter={handleUserMenuEnter}
                onMouseLeave={handleUserMenuLeave}
              >
                <div 
                  className="nav-user-info" 
                  onClick={toggleUserMenu}
                  ref={userButtonRef}
                  aria-haspopup="true"
                  aria-expanded={showUserMenu}
                >
                  {user?.photo ? (
                    <img 
                      src={user.photo} 
                      alt={`Foto de ${shortName}`} 
                      className="nav-user-photo" 
                      onError={(e) => {
                        e.target.src = generateDefaultAvatar(user.name);
                      }}
                    />
                  ) : (
                    <div 
                      className="user-avatar"
                      style={{ 
                        backgroundColor: `hsl(${hashCode(user.name) % 360}, 70%, 60%)`,
                        color: 'white'
                      }}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="nav-user-name">
                    {shortName}
                    {isMobile ? (showUserMenu ? <FaChevronUp /> : <FaChevronDown />) : <FaChevronDown />}
                  </span>
                </div>

                {showUserMenu && (
                  <div 
                    className={`user-dropdown ${isMobile ? 'mobile-dropdown' : ''}`}
                    onMouseEnter={handleDropdownEnter}
                    onMouseLeave={handleDropdownLeave}
                  >
                    <div className="dropdown-header">
                      <div className="dropdown-user-info">
                        {user?.photo ? (
                          <img 
                            src={user.photo} 
                            alt={`Foto de ${shortName}`} 
                            className="dropdown-user-photo" 
                            onError={(e) => {
                              e.target.src = generateDefaultAvatar(user.name);
                            }}
                          />
                        ) : (
                          <div 
                            className="dropdown-user-avatar"
                            style={{ 
                              backgroundColor: `hsl(${hashCode(user.name) % 360}, 70%, 60%)`,
                              color: 'white'
                            }}
                          >
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="dropdown-user-name">{user.name}</span>
                      </div>
                    </div>
                    <div className="dropdown-divider"></div>
                    <Link
                      to="/perfil"
                      className="dropdown-item"
                      onClick={closeAllMenus}
                    >
                      <FaUserCircle className="dropdown-icon" />
                      <span>Meu Perfil</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="dropdown-item"
                      aria-label="Sair"
                    >
                      <FaSignOutAlt className="dropdown-icon" />
                      <span>Sair</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button 
                className="login-button" 
                onClick={handleLogin}
                aria-label="Login"
              >
                Entrar
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavBar;