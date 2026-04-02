import { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext(null);
const getCurrentMonthRange = () => {
  const now = new Date();
  const formatDate = (date) => date.toISOString().split('T')[0];

  return {
    from: formatDate(new Date(now.getFullYear(), now.getMonth(), 1)),
    to: formatDate(now),
  };
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [activeAccount, setActiveAccount] = useState(() => {
    // Try to load active account from localStorage
    const saved = localStorage.getItem('activeAccount');
    return saved ? JSON.parse(saved) : null;
  });
  const [selectedDateRange, setSelectedDateRange] = useState(() => {
    const saved = localStorage.getItem('selectedDateRange');
    return saved ? JSON.parse(saved) : getCurrentMonthRange();
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
    localStorage.removeItem('selectedDateRange');
    setToken(null);
    setUser(null);
    setActiveAccount(null);
    setSelectedDateRange(getCurrentMonthRange());
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

  const setSelectedDateRangeWithPersist = useCallback((range) => {
    const nextRange = range || getCurrentMonthRange();
    setSelectedDateRange(nextRange);
    localStorage.setItem('selectedDateRange', JSON.stringify(nextRange));
  }, []);

  return (
    <AuthContext.Provider value={{ 
      token, 
      user, 
      activeAccount, 
      selectedDateRange,
      setActiveAccount: setActiveAccountWithPersist,
      setSelectedDateRange: setSelectedDateRangeWithPersist,
      login, 
      register, 
      logout, 
      fetchUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
