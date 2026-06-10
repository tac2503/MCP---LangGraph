import { useState, useEffect } from "react";
import Login from "./components/Auth/Login";
import Chat from "./components/Chat/Chat";
import { authService } from "./services/authService";
import "./App.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay token al cargar la app
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        // Opcional: verificar que el token sea válido
        const user = await authService.getCurrentUser();
        setIsAuthenticated(!!user);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        color: '#7a7f98'
      }}>
        Cargando...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app">
      <Chat onLogout={handleLogout} />
    </div>
  );
}

export default App;
