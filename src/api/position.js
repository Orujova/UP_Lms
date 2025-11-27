import axios from "axios";
import { getToken } from "@/authtoken/auth.js";

const API_URL = "https://demoadmin.databyte.app/api/";

export const fetchPosition = async () => {
  try {
    const token = getToken(); // Tokeni auth.js dosyasından alın
    if (!token) {
      throw new Error("Token bulunamadı. Lütfen giriş yapınız.");
    }

    const response = await axios.get(`${API_URL}Position`, {
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching positions:", error);
    throw error;
  }
};
