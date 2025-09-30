import axios from 'axios';
import apiClient from './apiClient';
import { BACKEND_ENDPOINTS } from '@/enums/backend-endpoints.enum';

class RolService {

    async create(data: any) {
        try {
            const response = await apiClient.post(BACKEND_ENDPOINTS.CREATE_ROL, data);

            return response;
        } catch (error) {
            this.handleError(error);
        }
    }

    async list() {
        try {
            const response = await apiClient.get(BACKEND_ENDPOINTS.GET_ROL);

            return response;
        } catch (error) {
            this.handleError(error);
        }
    }

    async update(data: any, id: String) {
        try {
            const response = await apiClient.put(`${BACKEND_ENDPOINTS.UPDATE_ROL}/${id}`, data);

            return response;
        } catch (error) {
            this.handleError(error);
        }
    }

    async delete(id: String) {
        try {
            const response = await apiClient.delete(`${BACKEND_ENDPOINTS.DELETE_ROL}/${id}`);

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
export const rolService = new RolService();