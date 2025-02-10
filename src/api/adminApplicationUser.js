import axios from "axios";
import { getToken } from "@/authtoken/auth.js";

const API_URL = "https://bravoadmin.uplms.org/api/";

export const fetchAdminApplicationUser = async (page = 1) => {
  try {
    // Tokeni getir
    const token = getToken();
    if (!token) {
      throw new Error("Token bulunamadı. Lütfen giriş yapın.");
    }

    const response = await axios.get(
      `${API_URL}AdminApplicationUser?Page=${page}&ShowMore.Take=10`,
      {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching AdminApplicationUser:", error);
    throw error;
  }
};
