// File: /api/eventApi.js
import { getToken } from "@/authtoken/auth";

const API_BASE_URL = "https://bravoadmin.uplms.org/api";

export const eventApi = {
  async getTargetGroups() {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("Authorization token is missing");
      }

      const response = await fetch(
        `${API_BASE_URL}/TargetGroup/GetAllTargetGroups?Page=1&ShowMore.Take=100`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch target groups");
      }

      const data = await response.json();
      return data[0].targetGroups;
    } catch (error) {
      console.error("Error fetching target groups:", error);
      throw error;
    }
  },

  async getPollUnits() {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("Authorization token is missing");
      }

      const response = await fetch(`${API_BASE_URL}/PollUnit/GetAll`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch poll units");
      }

      const data = await response.json();

      // Make sure we're returning an array of poll units with proper structure
      if (Array.isArray(data)) {
        return data.map((unit) => ({
          id: unit.id,
          title: unit.title || unit.name || `Poll Unit ${unit.id}`,
          description: unit.description || "",
        }));
      } else if (data && typeof data === "object") {
        // If the response is an object with a nested array
        const pollUnits = data.pollUnits || data.items || [];
        return pollUnits.map((unit) => ({
          id: unit.id,
          title: unit.title || unit.name || `Poll Unit ${unit.id}`,
          description: unit.description || "",
        }));
      }

      // Fallback to empty array if data structure is unexpected
      console.warn("Unexpected poll units data structure:", data);
      return [];
    } catch (error) {
      console.error("Error fetching poll units:", error);
      // Return empty array instead of throwing to prevent UI breakage
      return [];
    }
  },

  async createEvent(eventData) {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("Authorization token is missing");
      }

      // Create FormData for file upload
      const formData = new FormData();
      for (const key in eventData) {
        if (eventData[key] !== null && eventData[key] !== undefined) {
          formData.append(key, eventData[key]);
        }
      }

      const response = await fetch(`${API_BASE_URL}/Event`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw { response: { data: errorData } };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error creating event:", error);
      throw error;
    }
  },
};
