import axios from 'axios';

const DEFAULT_BASE_URL = import.meta.env.DEV ? 'http://localhost:8000' : '/api';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      // Clear invalid token
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authApi = {
  signup: async (data: { full_name: string; email: string; password: string }) => {
    const response = await api.post('/auth/signup', data);
    return response.data;
  },

  verifyOtp: async (data: { email: string; otp: string }) => {
    const response = await api.post('/auth/verify-otp', data);
    return response.data;
  },

  login: async (data: { email: string; password: string }) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  forgotPassword: async (data: { email: string }) => {
    const response = await api.post('/auth/forgot-password', data);
    return response.data;
  },

  resetPassword: async (data: { token: string; new_password: string }) => {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
  },
};

export default api;
