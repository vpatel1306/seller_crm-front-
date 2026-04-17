import axios from 'axios';

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
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(err);
  }
);

export default api;
