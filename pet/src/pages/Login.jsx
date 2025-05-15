// ... (imports e configurações mantidos)

const Login = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;

      const response = await fetch(`http://localhost:5005/api/Usuario/${user.uid}`);
      const usuario = await response.json();
      const isAdmin = Boolean(usuario.IsAdmin);

      localStorage.setItem('tutorId', user.uid);
      localStorage.setItem('tutorNome', user.displayName || '');
      localStorage.setItem('isAdmin', isAdmin);

      alert("Login realizado com sucesso!");
      navigate('/dashboard');
    } catch (error) {
      alert("Erro no login: " + error.message);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-box">
        <div className="login-left">
          <div className="logo">
            <img src="src/img/logop.png" alt="Pet Care" />
            <h2>Lat Miau</h2>
          </div>
          <h3>Sign In To Continue</h3>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
            <div className="options">
              <Link to="/registrar" className="forgot">Don't have an account? Register</Link>
            </div>
            <button type="submit">Login</button>
          </form>
          <div className="terms">
            <Link to="/termos">Terms & Conditions</Link> | <Link to="/privacidade">Privacy Policy</Link>
          </div>
        </div>
        <div className="login-right">
          <img src="src/img/dog.jpg" alt="Dog" />
        </div>
      </div>
    </div>
  );
};

export default Login;
