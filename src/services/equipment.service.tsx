import axios from 'axios';
import apiClient from './apiClient';
import { BACKEND_ENDPOINTS } from '@/enums/backend-endpoints.enum';

class equipmentService {

    async create(data: any) {
        try {
            const response = await apiClient.post(BACKEND_ENDPOINTS.CREATE_EQUIPMENT, data);

            return response;
        } catch (error) {
            this.handleError(error);
        }
    }

    async list() {
        try {
            const response = await apiClient.get(BACKEND_ENDPOINTS.GET_EQUIPMENT);

            return response;
        } catch (error) {
            this.handleError(error);
        }
    }

    async listById(id: number) {
        try {
            const response = await apiClient.get(`${BACKEND_ENDPOINTS.GET_EQUIPMENT}/${id}`);

            return response;
        } catch (error) {
            this.handleError(error);
        }
    }

    async update(id: number, data: any,) {
        try {
            const response = await apiClient.put(`${BACKEND_ENDPOINTS.UPDATE_EQUIPMENT}/${id}`, data);

            return response;
        } catch (error) {
            this.handleError(error);
        }
    }

    async delete(id: number) {
        try {
            const response = await apiClient.delete(`${BACKEND_ENDPOINTS.DELETE_EQUIPMENT}/${id}`);

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
export const EquipmentService = new equipmentService();