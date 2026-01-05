import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (identifier, password) => {
    try {
      const response = await authAPI.login({ identifier, password });
      if (response.success) {
        const { user: userData, token } = response.data;
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', token);
        return { success: true, user: userData };
      }
      return { success: false, message: response.message };
    } catch (error) {
      const message = error.response?.data?.message || 'Login gagal. Coba lagi.';
      return { success: false, message };
    }
  };

  const register = async (data) => {
    try {
      const response = await authAPI.register(data);
      if (response.success) {
        const { user: userData, token } = response.data;
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', token);
        return { success: true, user: userData };
      }
      return { success: false, message: response.message };
    } catch (error) {
      const message = error.response?.data?.message || 'Registrasi gagal. Coba lagi.';
      return { success: false, message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const isAuthenticated = () => !!user;

  const isAdmin = () => user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, isAuthenticated, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};