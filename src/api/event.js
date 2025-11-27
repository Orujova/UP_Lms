import { getToken, getUserId } from "@/authtoken/auth";

const API_BASE_URL = "https://demoadmin.databyte.app/api";

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

      // Handle different response formats
      if (
        data &&
        Array.isArray(data) &&
        data.length > 0 &&
        data[0].targetGroups
      ) {
        return data[0].targetGroups;
      } else if (data && Array.isArray(data)) {
        return data;
      } else if (data && data.targetGroups) {
        return data.targetGroups;
      }

      console.warn("Unexpected target groups data structure:", data);
      return [];
    } catch (error) {
      console.error("Error fetching target groups:", error);
      return [];
    }
  },

  async getPollUnits() {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("Authorization token is missing");
      }

      const response = await fetch(
        `${API_BASE_URL}/PollUnit?Page=1&ShowMore.Take=100`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch poll units: ${response.status}`);
      }

      const data = await response.json();

      if (Array.isArray(data) && data.length > 0 && data[0].pollUnits) {
        return data[0].pollUnits;
      } else {
        console.warn("Unexpected poll units data structure:", data);
        return [];
      }
    } catch (error) {
      console.error("Error fetching poll units:", error);
      return [];
    }
  },

  async createEvent(eventData) {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("Authorization token is missing");
      }

      const formData = new FormData();
      for (const key in eventData) {
        if (eventData[key] !== null && eventData[key] !== undefined) {
          if (Array.isArray(eventData[key])) {
            eventData[key].forEach((item, index) => {
              formData.append(`${key}[${index}]`, item);
            });
          } else {
            formData.append(key, eventData[key]);
          }
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

  async updateEvent(eventData) {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("Authorization token is missing");
      }

      const formData = new FormData();
      for (const key in eventData) {
        if (eventData[key] !== null && eventData[key] !== undefined) {
          if (Array.isArray(eventData[key])) {
            eventData[key].forEach((item, index) => {
              formData.append(`${key}[${index}]`, item);
            });
          } else {
            formData.append(key, eventData[key]);
          }
        }
      }

      if (eventData.eventId && !formData.has("EventId")) {
        formData.append("EventId", eventData.eventId);
      }

      const response = await fetch(`${API_BASE_URL}/Event`, {
        method: "PUT",
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
      console.error("Error updating event:", error);
      throw error;
    }
  },

  // UPDATED DELETE METHOD
  async deleteEvent(eventId, language = 'az') {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("Authorization token is missing");
      }

      // NEW API endpoint: DELETE /api/Event?EventId={id}&Language={language}
      const queryParams = new URLSearchParams({
        EventId: eventId.toString(),
        Language: language,
      });

      const response = await fetch(
        `${API_BASE_URL}/Event?${queryParams.toString()}`,
        {
          method: "DELETE",
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(errorText || `Failed to delete event: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error("Error deleting event:", error);
      throw error;
    }
  },

  // UPDATED GET EVENT METHOD
  async getEvent(eventId, userId = null, device = 1, language = 'az') {
    try {
      const token = getToken();
      const userIdToUse = userId || getUserId();

      if (!token) {
        throw new Error("Authorization token is missing");
      }

      // NEW API endpoint: GET /api/Event/GetById
      const queryParams = new URLSearchParams({
        Id: eventId.toString(),
        UserId: userIdToUse.toString(),
        Device: device.toString(), // 1 for web, 2 for mobile
        Language: language,
      });

      const response = await fetch(
        `${API_BASE_URL}/Event/GetById?${queryParams.toString()}`,
        {
          method: "GET",
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch event: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching event:", error);
      throw error;
    }
  },
};

export default eventApi;