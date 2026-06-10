import { useState } from "react";
import { authService } from "../../services/authService";
import "./Login.css";

function Login({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Login form
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  // Register form
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regFullName, setRegFullName] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      await authService.login(username, password);
      onLoginSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      await authService.register({
        username: regUsername,
        email: regEmail,
        password: regPassword,
        full_name: regFullName || null
      });
      
      // Auto-login después de registro exitoso
      await authService.login(regUsername, regPassword);
      onLoginSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <div className="login__container">
        
        {/* Logo */}
        <div className="login__logo">
          <HexIcon />
        </div>
        
        <h1 className="login__title">MCP Assistant</h1>
        <p className="login__subtitle">
          {isRegister ? "Crear una cuenta" : "Inicia sesión para continuar"}
        </p>

        {/* Error message */}
        {error && (
          <div className="login__error">
            <ErrorIcon />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        {!isRegister && (
          <form className="login__form" onSubmit={handleLogin}>
            <div className="login__field">
              <label className="login__label">Usuario o Email</label>
              <input
                type="text"
                className="login__input"
                placeholder="tu_usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            
            <div className="login__field">
              <label className="login__label">Contraseña</label>
              <input
                type="password"
                className="login__input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <button 
              type="submit" 
              className="login__button"
              disabled={loading}
            >
              {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>
          </form>
        )}

        {/* Register Form */}
        {isRegister && (
          <form className="login__form" onSubmit={handleRegister}>
            <div className="login__field">
              <label className="login__label">Usuario</label>
              <input
                type="text"
                className="login__input"
                placeholder="usuario123"
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="login__field">
              <label className="login__label">Email</label>
              <input
                type="email"
                className="login__input"
                placeholder="tu@email.com"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="login__field">
              <label className="login__label">Nombre completo (opcional)</label>
              <input
                type="text"
                className="login__input"
                placeholder="Tu nombre"
                value={regFullName}
                onChange={(e) => setRegFullName(e.target.value)}
                disabled={loading}
              />
            </div>
            
            <div className="login__field">
              <label className="login__label">Contraseña</label>
              <input
                type="password"
                className="login__input"
                placeholder="••••••••"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <button 
              type="submit" 
              className="login__button"
              disabled={loading}
            >
              {loading ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>
        )}

        {/* Toggle */}
        <div className="login__toggle">
          {isRegister ? (
            <>
              ¿Ya tienes cuenta?{" "}
              <button
                type="button"
                className="login__link"
                onClick={() => {
                  setIsRegister(false);
                  setError("");
                }}
                disabled={loading}
              >
                Inicia sesión
              </button>
            </>
          ) : (
            <>
              ¿No tienes cuenta?{" "}
              <button
                type="button"
                className="login__link"
                onClick={() => {
                  setIsRegister(true);
                  setError("");
                }}
                disabled={loading}
              >
                Regístrate
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}

function HexIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <polygon points="24,4 41,13.5 41,34.5 24,44 7,34.5 7,13.5"
        stroke="url(#h1)" strokeWidth="2" fill="none" />
      <polygon points="24,12 35,18 35,30 24,36 13,30 13,18"
        stroke="url(#h1)" strokeWidth="1.5" fill="#111420" />
      <circle cx="24" cy="24" r="3.5" fill="url(#h1)" />
      <defs>
        <linearGradient id="h1" x1="7" y1="4" x2="41" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7c85f5" />
          <stop offset="1" stopColor="#a78bfa" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
    </svg>
  );
}

export default Login;
