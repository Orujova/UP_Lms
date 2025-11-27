// api/newsCategory.js
import axios from "axios";
import { getToken } from "@/authtoken/auth.js";

const API_URL = "https://demoadmin.databyte.app/api/";

export const fetchNewsCategory = async () => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("Token bulunamadı. Lütfen giriş yapınız.");
    }

    const response = await axios.get(`${API_URL}NewsCategory`, {
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching news categories:", error);
    throw error;
  }
};

export const addNewsCategory = async (categoryName) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("Token bulunamadı. Lütfen giriş yapınız.");
    }

    const response = await axios.post(
      `${API_URL}NewsCategory`,
      { categoryName },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          accept: "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding news category:", error);
    throw error;
  }
};

export const updateNewsCategory = async (id, categoryName) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("Token bulunamadı. Lütfen giriş yapınız.");
    }

    const response = await axios.put(
      `${API_URL}NewsCategory`,
      { id, categoryName },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          accept: "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating news category:", error);
    throw error;
  }
};

export const deleteNewsCategory = async (id, language = "") => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("Token bulunamadı. Lütfen giriş yapınız.");
    }

    const params = new URLSearchParams({ Id: id });
    if (language) {
      params.append("Language", language);
    }

    const response = await axios.delete(
      `${API_URL}NewsCategory?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting news category:", error);
    throw error;
  }
};
