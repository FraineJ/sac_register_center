import axios from 'axios';
import apiClient from './apiClient';
import { BACKEND_ENDPOINTS } from '@/enums/backend-endpoints.enum';

class UserService {

    async create(data: any) {
        try {
            const response = await apiClient.post(BACKEND_ENDPOINTS.REGISTER_USER, data, );

            return response;
        } catch (error) {
            this.handleError(error);
        }
    }

    async list() {
        try {
            const response = await apiClient.get(BACKEND_ENDPOINTS.GET_USERS);

            return response;
        } catch (error) {
            this.handleError(error);
        }
    }


     async getInfoUser(id:  number) {
        try {
            const response = await apiClient.get(`${BACKEND_ENDPOINTS.GET_USERS}/${id}`);

            return response;
        } catch (error) {
            this.handleError(error);
        }
    }

    async update(userId: string, data: any) {
        try {
            const response = await apiClient.put(`${BACKEND_ENDPOINTS.UPDATE_USERS}/${userId}`, data);

            return response;
        } catch (error) {
            this.handleError(error);
        }
    }

     async blocked(userId: string, data: any) {
        try {
            const response = await apiClient.put(`${BACKEND_ENDPOINTS.BLOCKED_USERS}/${userId}`, data);

            return response;
        } catch (error) {
            this.handleError(error);
        }
    }

    async delete(userId: string) {
        try {
            const response = await apiClient.delete(`${BACKEND_ENDPOINTS.DELETE_USERS}/${userId}`);

            return response;
        } catch (error) {
            this.handleError(error);
        }
    }

    async deleteUserWithSchedule(userId: string) {
        try {
            const response = await apiClient.delete(`${BACKEND_ENDPOINTS.DELETE_USERS_WITH_SCHEDULE}/${userId}`);

            return response;
        } catch (error) {
            this.handleError(error);
        }
    }


    private handleError(error: unknown) {
        if (axios.isAxiosError(error)) {
            // Puedes personalizar el manejo de errores de Axios aquí
            throw error.response?.data || error.message;
        }
        throw error;
    }
}

// Exporta una instancia única del servicio (patrón Singleton)
export const userService = new UserService();