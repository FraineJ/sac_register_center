import axios from 'axios';
import apiClient from './apiClient';
import { BACKEND_ENDPOINTS } from '@/enums/backend-endpoints.enum';

class ClientService {

    async create(data: any) {
        try {
            const response = await apiClient.post(BACKEND_ENDPOINTS.CREATE_CLIENT, data);

            return response;
        } catch (error) {
            this.handleError(error);
        }
    }

    async list() {
        try {
            const response = await apiClient.get(BACKEND_ENDPOINTS.GET_CLIENT);

            return response;
        } catch (error) {
            this.handleError(error);
        }
    }

    async update(clientId: number, data: any) {
        try {
            const response = await apiClient.put(`${BACKEND_ENDPOINTS.UPDATE_CLIENT}/${clientId}`, data);

            return response;
        } catch (error) {
            this.handleError(error);
        }
    }

    async blocked(clientId: string, data: any) {
        try {
            const response = await apiClient.put(`${BACKEND_ENDPOINTS.BLOCKED_CLIENT}/${clientId}`, data);

            return response;
        } catch (error) {
            this.handleError(error);
        }
    }

    async delete(clientId: number) {
        try {
            const response = await apiClient.delete(`${BACKEND_ENDPOINTS.DELETE_CLIENT}/${clientId}`);

            return response;
        } catch (error) {
            this.handleError(error);
        }
    }

     async deleteWithVessel(clientId: number) {
        try {
            const response = await apiClient.delete(`${BACKEND_ENDPOINTS.DELETE_WITH_VESSEL_CLIENT}/${clientId}`);

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
export const clientService = new ClientService();