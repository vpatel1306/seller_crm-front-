import { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const fetchUser = useCallback(async () => {
    const { data } = await api.get('/get-user');
    setUser(data);
    return data;
  }, []);

  const login = useCallback(async (credentials) => {
    const { data } = await api.post('/login', credentials);
    const token = data.data?.access_token || data.token;
    localStorage.setItem('token', token);
    setToken(token);
    await fetchUser();
    navigate('/dashboard');
  }, [fetchUser, navigate]);

  const register = useCallback(async (payload) => {
    await api.post('/register', payload);
    navigate('/');
  }, [navigate]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    navigate('/');
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
