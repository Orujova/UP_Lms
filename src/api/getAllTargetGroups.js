import axios from 'axios';
import { getToken } from '@/authtoken/auth.js';

const API_URL = 'https://demoadmin.databyte.app/api/';

export const fetchGetAllTargetGroups = async () => {
    try {
        const token = getToken(); // Tokeni auth.js dosyasından alın
        if (!token) {
            throw new Error('Token bulunamadı. Lütfen giriş yapınız.');
        }

        const response = await axios.get(`${API_URL}TargetGroup/GetAllTargetGroups`, {
            headers: {
                'accept': 'application/json',
                'Authorization': `Bearer ${token}` // Dinamik olarak alınan token kullanılır
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching target groups:', error); 
        throw error;
    }
};
