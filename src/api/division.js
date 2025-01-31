import axios from 'axios';
import { getToken } from '@/authtoken/auth.js';

const API_URL = 'https://bravoadmin.uplms.org/api/';

export const fetchDivision = async () => {
    try {
        const token = getToken(); // Tokeni auth dosyasından alın
        if (!token) {
            throw new Error('Token bulunamadı. Lütfen giriş yapınız.');
        }

        const response = await axios.get(`${API_URL}Division`, {
            headers: {
                'accept': 'application/json',
                'Authorization': `Bearer ${token}` // Dinamik olarak alınan token kullanılır
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching divisions:', error); 
        throw error;
    }
};
