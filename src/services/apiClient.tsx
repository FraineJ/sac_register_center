
import axios, { AxiosInstance } from "axios";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const apiClient: AxiosInstance = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para manejar respuestas con status 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        // Llamar al endpoint de logout
        await axios.post('http://localhost:3000/api/auth/logout', {}, { withCredentials: true });
      } catch (logoutError) {
        console.error('Error during logout:', logoutError);
      }
      
      // Limpiar datos locales
      localStorage.removeItem('dataUser');
      localStorage.removeItem('access_token');
      
      // Redirigir al inicio
      window.location.href = '/';
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
