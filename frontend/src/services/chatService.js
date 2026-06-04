import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const sendMessage = async (message) => {

    const response = await axios.post(
        `${API_URL}/chat`,
        {
            session_id: "test",
            message: message
        }
    );

    return response.data;
};