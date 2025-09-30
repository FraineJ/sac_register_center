import axios from 'axios';
import apiClient from './apiClient';
import { BACKEND_ENDPOINTS } from '@/enums/backend-endpoints.enum';

class FleetService {

    async create(data: any) {
        try {
            const response = await apiClient.post(BACKEND_ENDPOINTS.CREATE_FLEET, data);

            return response;
        } catch (error) {
            this.handleError(error);
        }
    }

    async list() {
        try {
            const response = await apiClient.get(BACKEND_ENDPOINTS.LIST_FLEET);

            return response;
        } catch (error) {
            this.handleError(error);
        }
    }

    async update(vesselId: number, data: any) {
        try {
            const response = await apiClient.put(`${BACKEND_ENDPOINTS.UPDATE_FLEET}/${vesselId}`, data);

            return response;
        } catch (error) {
            this.handleError(error);
        }
    }

    async delete(fleetId: string) {
        try {
            const response = await apiClient.delete(`${BACKEND_ENDPOINTS.DELETE_FLEET}/${fleetId}`);

            return response;
        } catch (error) {
            this.handleError(error);
        }
    }

    async deleteWithDocuments(fleetId: string) {
        try {
            const response = await apiClient.delete(`${BACKEND_ENDPOINTS.DELETE_WITH_DOCUMENT_FLEET}/${fleetId}`);

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

export const fleetService = new FleetService();