import axios from 'axios';
import apiClient from './apiClient';
import { BACKEND_ENDPOINTS } from '@/enums/backend-endpoints.enum';

class CompanyService {



    async list() {
        try {
            const response = await apiClient.get(BACKEND_ENDPOINTS.GET_BUSINESSES);

            return response;
        } catch (error) {
            this.handleError(error);
        }
    }

     async update(companyId:number, data: any) {
        try {
            const response = await apiClient.put(`${BACKEND_ENDPOINTS.GET_BUSINESSES}/${companyId}`, data);

            return response;
        } catch (error) {
            this.handleError(error);
        }
    }

    private handleError(error: unknown) {
        if (axios.isAxiosError(error)) {
            // Puedes personalizar el manejo de errores de Axios aquí
            console.error('Error en la solicitud:', error.response?.data || error.message);
            throw error.response?.data || error.message;
        }
        console.error('Error desconocido:', error);
        throw error;
    }
}

// Exporta una instancia única del servicio (patrón Singleton)
export const companyService = new CompanyService();