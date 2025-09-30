import axios from 'axios';
import apiClient from './apiClient';
import { BACKEND_ENDPOINTS } from '@/enums/backend-endpoints.enum';

class MunicipalityService {


    async list() {
        try {
            const response = await apiClient.get(BACKEND_ENDPOINTS.GET_COUNTRY);

            return response;
        } catch (error) {
            this.handleError(error);
        }
    }

     async getByCountry(data: any) {
        try {
            const response = await apiClient.get(`${BACKEND_ENDPOINTS.GET_CMUNICIPALIT_COUNTRY}/${data.code}`);

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

export const municipalityService = new MunicipalityService();