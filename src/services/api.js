import axios from 'axios';
import { toast } from '../context/ToastContext';

const rawBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').trim();

function resolveBaseUrl() {
  if (!rawBaseUrl) return import.meta.env.DEV ? '/api' : '';

  if (!import.meta.env.DEV) return rawBaseUrl.replace(/\/$/, '');

  try {
    const parsed = new URL(rawBaseUrl, window.location.origin);
    const proxyPath = parsed.pathname.replace(/\/$/, '');
    return proxyPath || '/api';
  } catch {
    return rawBaseUrl.replace(/\/$/, '') || '/api';
  }
}

const BASE = resolveBaseUrl();

const api = axios.create({ baseURL: BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  const twoFa = localStorage.getItem('2fa_token');
  if (twoFa) config.headers['x-2fa-token'] = twoFa;
  return config;
});

api.interceptors.response.use(
  (res) => {
    const method = res.config.method?.toUpperCase();
    const isMutation = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);
    
    // Only show success toast if there is a message provided by API
    if (isMutation && res.data && typeof res.data === 'object' && res.data.message) {
      toast.success(res.data.message);
    }
    return res;
  },
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
    } else if (err.code === 'ERR_NETWORK') {
      toast.error('Network error. Please check your connection.');
    } else {
      const data = err.response?.data;
      const errMsg = (data && typeof data === 'object' ? (data.message || data.detail) : null) || 'Something went wrong';
      toast.error(errMsg);
    }
    return Promise.reject(err);
  }
);

export default api;
