import { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [activeAccount, setActiveAccount] = useState(() => {
    // Try to load active account from localStorage
    const saved = localStorage.getItem('activeAccount');
    return saved ? JSON.parse(saved) : null;
  });
  const navigate = useNavigate();

  const fetchUser = useCallback(async () => {
    const { data } = await api.get('/get-user');
    setUser(data.data);
    return data.data;
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
    localStorage.removeItem('activeAccount');
    setToken(null);
    setUser(null);
    setActiveAccount(null);
    navigate('/');
  }, [navigate]);

  const setActiveAccountWithPersist = useCallback((account) => {
    setActiveAccount(account);
    if (account) {
      localStorage.setItem('activeAccount', JSON.stringify(account));
    } else {
      localStorage.removeItem('activeAccount');
    }
  }, []);

  return (
    <AuthContext.Provider value={{ 
      token, 
      user, 
      activeAccount, 
      setActiveAccount: setActiveAccountWithPersist,
      login, 
      register, 
      logout, 
      fetchUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
