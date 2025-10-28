import axios from 'axios';
import apiClient from './apiClient'
import { BACKEND_ENDPOINTS } from '@/enums/backend-endpoints.enum';

const API_URL = import.meta.env.VITE_API_URL;

const authApi = axios.create({
  baseURL: `${API_URL}/auth`,
});

// Opcional: interceptor para inyectar token
authApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


export const login = async (email: string, password: string) => {
  const response = await apiClient.post(BACKEND_ENDPOINTS.LOGIN, { email, password }); 
 return response;
};

export const forgotPassword = async (email: string) => {
  const response = await apiClient.post(BACKEND_ENDPOINTS.FORGOT_PASSWORD, { email }); 
 return response;
};





export const register = async (data: {
  name: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  password: string;
}) => {
  const response = await apiClient.post(BACKEND_ENDPOINTS.REGISTER_USER, data);
  return response;
};

/**
 * Obtener perfil del usuario actual
 */
export const getProfile = async () => {
  const response = await apiClient.get('/profile');
  return response.data;
};


export const logout = () => {
  localStorage.removeItem('access_token');
};
