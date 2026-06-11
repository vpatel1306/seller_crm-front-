import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from '../context/ToastContext';
import Loader from '../components/common/Loader';

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
  const [verifyingMobile, setVerifyingMobile] = useState(false);
  const navigate = useNavigate();

  const fetchUser = useCallback(async () => {
    const { data } = await api.get('/get-user');
    setUser(data.data);
    return data.data;
  }, []);

  // Handle mobile token verification if ?token=... is present in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const mobileToken = urlParams.get('token');
    const accountId = urlParams.get('account_id');
    if (mobileToken) {
      // Clean up token and account_id from URL so it doesn't linger in address bar
      let searchStr = window.location.search;
      searchStr = searchStr.replace(/[?&]token=[^&]+/, '');
      searchStr = searchStr.replace(/[?&]account_id=[^&]+/, '');
      searchStr = searchStr.replace(/^&/, '?').replace(/\?$/, '').replace(/\?$/, '');
      const newUrl = window.location.pathname + searchStr;
      window.history.replaceState({}, document.title, newUrl);

      setVerifyingMobile(true);
      api.post('/verify-mobile-token', { token: mobileToken }, {
        headers: accountId ? { account: accountId } : {}
      })
        .then(async (res) => {
          if (res.data?.status && res.data?.data) {
            const { access_token, active_account_id, admin } = res.data.data;
            
            // Save token and profile to local storage & state
            localStorage.setItem('token', access_token);
            localStorage.setItem('isMobileScannerSession', 'true');
            setToken(access_token);
            setUser(admin);

            // Fetch accounts and set active account
            try {
              const accsRes = await api.get('/accounts-list/?skip=0&limit=100', {
                headers: { Authorization: `Bearer ${access_token}` },
              });
              const list = accsRes.data?.data || [];
              const matched = active_account_id
                ? list.find((acc) => String(acc.id) === String(active_account_id))
                : list[0] || null;
              if (matched) {
                localStorage.setItem('activeAccount', JSON.stringify(matched));
                localStorage.setItem('activeAccountId', String(matched.id));
                setActiveAccount(matched);
              } else {
                localStorage.removeItem('activeAccount');
                localStorage.removeItem('activeAccountId');
                setActiveAccount(null);
              }
            } catch (accErr) {
              console.error('Failed to fetch accounts list on mobile verify:', accErr);
            }

            toast.success('Mobile login successful!');
            navigate('/return-entry-account-wise');
          } else {
            throw new Error(res.data?.message || 'Verification failed.');
          }
        })
        .catch((err) => {
          console.error('Mobile token verification failed:', err);
          const errMsg = err.response?.data?.message || err.message || 'Mobile verification failed.';
          toast.error(errMsg);
        })
        .finally(() => {
          setVerifyingMobile(false);
        });
    }
  }, [navigate]);

  // Auto-fetch user profile if token is set but user is null
  useEffect(() => {
    if (token && !user) {
      fetchUser().catch((err) => {
        console.error('Failed to fetch user:', err);
      });
    }
  }, [token, user, fetchUser]);

  // Auto-fetch and select active account on token authorization if none is selected
  useEffect(() => {
    if (token && !activeAccount) {
      api.get('/accounts-list/?skip=0&limit=100')
        .then((res) => {
          const list = res.data?.data || [];
          if (list.length > 0) {
            const first = list[0];
            localStorage.setItem('activeAccount', JSON.stringify(first));
            localStorage.setItem('activeAccountId', String(first.id));
            setActiveAccount(first);
          }
        })
        .catch((err) => {
          console.error('Failed to auto-fetch accounts on token login:', err);
        });
    }
  }, [token, activeAccount]);

  const login = useCallback(async (credentials) => {
    const { data } = await api.post('/login', credentials);
    const accessToken = data.data?.access_token || data.token;
    const activeAccountId = data.data?.active_account_id ?? null;

    localStorage.setItem('token', accessToken);
    localStorage.removeItem('activeAccount');
    localStorage.removeItem('isMobileScannerSession');
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
      if (matched) {
        localStorage.setItem('activeAccount', JSON.stringify(matched));
        localStorage.setItem('activeAccountId', String(matched.id));
        setActiveAccount(matched);
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
    localStorage.removeItem('isMobileScannerSession');
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
      {verifyingMobile && <Loader />}
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
