import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const sendMessage = async (message) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
        throw {
            response: {
                data: { error: 'No estás autenticado. Por favor inicia sesión.' }
            }
        };
    }

    try {
        const response = await axios.post(
            `${API_URL}/chat`,
            {
                session_id: "test",
                message: message
            },
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        return response.data;
    } catch (error) {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            throw {
                response: {
                    data: { error: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.' }
                }
            };
        }
        throw error;
    }
};