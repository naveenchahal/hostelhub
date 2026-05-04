import axios from 'axios';
import toast from 'react-hot-toast';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token on every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('hh_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('hh_token');
      localStorage.removeItem('hh_user');
      window.location.href = '/login';
    }
    const msg = err.response?.data?.message || 'Something went wrong';
    toast.error(msg);
    return Promise.reject(err);
  }
);

export default client;