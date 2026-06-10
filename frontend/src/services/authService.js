const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const authService = {
  /**
   * Login de usuario
   */
  async login(username, password) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error en login');
    }
    
    const data = await response.json();
    localStorage.setItem('token', data.access_token);
    return data;
  },

  /**
   * Registro de usuario
   */
  async register(userData) {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error en registro');
    }
    
    return response.json();
  },

  /**
   * Obtener información del usuario autenticado
   */
  async getCurrentUser() {
    const token = this.getToken();
    if (!token) return null;

    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      this.logout();
      return null;
    }
    
    return response.json();
  },

  /**
   * Cerrar sesión
   */
  logout() {
    localStorage.removeItem('token');
  },

  /**
   * Obtener token almacenado
   */
  getToken() {
    return localStorage.getItem('token');
  },

  /**
   * Verificar si hay token
   */
  isAuthenticated() {
    return !!this.getToken();
  }
};
