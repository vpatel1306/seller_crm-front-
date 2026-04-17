import { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext(null);

const parseStoredJson = (value, fallback = null) => {
  if (!value || value === 'undefined' || value === 'null') return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

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
    const saved = localStorage.getItem('activeAccount');
    return parseStoredJson(saved, null);
  });
  const [selectedDateRange, setSelectedDateRange] = useState(() => {
    const saved = localStorage.getItem('selectedDateRange');
    return parseStoredJson(saved, getCurrentMonthRange());
  });
  const navigate = useNavigate();

  const fetchUser = useCallback(async () => {
    const { data } = await api.get('/get-user');
    setUser(data.data);
    return data.data;
  }, []);

  const login = useCallback(async (credentials) => {
    const { data } = await api.post('/login', credentials);
    const accessToken = data.data?.access_token || data.token;
    const activeAccountId = data.data?.active_account_id ?? null;

    localStorage.setItem('token', accessToken);
    localStorage.removeItem('activeAccount');
    setToken(accessToken);

    // Fetch accounts and set matching account as activeAccount in state + localStorage
    try {
      const res = await api.get('/accounts-list/?skip=0&limit=100', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const list = res.data?.data || [];
      const matched = activeAccountId
        ? list.find((acc) => String(acc.id) === String(activeAccountId))
        : null;
      const resolved = matched || list[0] || null;
      if (resolved) {
        localStorage.setItem('activeAccount', JSON.stringify(resolved));
        localStorage.setItem('activeAccountId', String(resolved.id));
        setActiveAccount(resolved);
      }
    } catch {
      setActiveAccount(null);
    }

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
    localStorage.removeItem('activeAccountId');
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
      // Keep activeAccountId in sync when user manually changes account
      localStorage.setItem('activeAccountId', String(account.id));
    } else {
      localStorage.removeItem('activeAccount');
      localStorage.removeItem('activeAccountId');
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
      fetchUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
