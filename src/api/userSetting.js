// api/api.js
import { getToken } from "@/authtoken/auth.js"; // Make sure the path is correct

const API_URL = "https://demoadmin.databyte.app/api/";

const userSetting = {
  fetchPositionGroups: async () => {
    const token = getToken();
    try {
      const response = await fetch(`${API_URL}PositionGroup`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch position groups");
      }

      const data = await response.json();
      return data && data[0].positionGroups ? data[0].positionGroups : [];
    } catch (error) {
      throw error;
    }
  },

  fetchPositions: async (page, itemsPerPage) => {
    const token = getToken();
    try {
      const response = await fetch(
        `${API_URL}Position?Page=${page}&ShowMore.Take=${itemsPerPage}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch positions");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },

  createPosition: async (positionData) => {
    const token = getToken();
    try {
      const response = await fetch(`${API_URL}Position`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(positionData),
      });

      if (!response.ok) {
        throw new Error("Failed to create position");
      }
      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  updatePosition: async (positionData) => {
    const token = getToken();
    try {
      const response = await fetch(`${API_URL}Position`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(positionData),
      });

      if (!response.ok) {
        throw new Error("Failed to update position");
      }
      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  deletePosition: async (id) => {
    const token = getToken();
    try {
      const response = await fetch(`${API_URL}Position`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete position");
      }
      return;
    } catch (error) {
      throw error;
    }
  },
};

export default userSetting;
