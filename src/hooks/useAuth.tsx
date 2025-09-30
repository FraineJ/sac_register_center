import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/services/apiClient';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
  });
  const navigate = useNavigate();

  const checkAuthStatus = async () => {
    try {
      // Verificar si hay datos del usuario en localStorage como fallback
      const userData = localStorage.getItem('dataUser');
      
      if (userData) {
        const user = JSON.parse(userData);
        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          user,
        });
      } else {
        // Si no hay datos locales, redirigir al login
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
        });
        navigate('/', { replace: true });
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      });
      navigate('/', { replace: true });
    }
  };

  const logout = () => {
    localStorage.removeItem('dataUser');
    localStorage.removeItem('access_token');
    setAuthState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });
    navigate('/', { replace: true });
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  return {
    ...authState,
    logout,
    checkAuthStatus,
  };
};