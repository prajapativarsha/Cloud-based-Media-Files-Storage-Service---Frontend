import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: true, // Required for httpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;