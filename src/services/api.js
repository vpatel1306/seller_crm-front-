import axios from 'axios';

const BASE = (import.meta.env.VITE_API_BASE_URL || 'http://192.168.1.14:8005').replace(/\/$/, '');

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
