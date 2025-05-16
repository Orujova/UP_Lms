// api/branding.js

const API_URL = "https://bravoadmin.uplms.org/api/BrendingSetting";

const brandingService = {
  /**
   * Fetch all branding settings
   * @param {string} type - Type of branding settings to fetch (appUser, announcement, etc.)
   * @returns {Promise<Array>} Array of branding settings
   */
  fetchBrandingSettings: async (type = "appUser") => {
    try {
      // Build query parameters based on type
      let queryParams = "";

      switch (type) {
        case "appUser":
          queryParams = "?IsAppUser=true";
          break;
        case "announcement":
          queryParams = "?IsAnnouncement=true";
          break;
        case "event":
          queryParams = "?IsEvent=true";
          break;
        case "news":
          queryParams = "?IsNews=true";
          break;
        case "course":
          queryParams = "?IsCourse=true";
          break;
        case "otpLogin":
          queryParams = "?IsOTPAndLogin=true";
          break;
        default:
          queryParams = "";
      }

      const response = await fetch(`${API_URL}${queryParams}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching branding settings:", error);
      throw error;
    }
  },

  /**
   * Fetch a single branding setting by ID
   * @param {number} id - ID of the branding setting to fetch
   * @returns {Promise<Object>} Branding setting object
   */
  fetchBrandingSettingById: async (id) => {
    try {
      const response = await fetch(`${API_URL}/id?id=${id}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching branding setting:", error);
      throw error;
    }
  },

  /**
   * Create a new branding setting
   * @param {FormData} formData - Form data containing branding setting information
   * @returns {Promise<Object>} Response from the server
   */
  createBrandingSetting: async (formData) => {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating branding setting:", error);
      throw error;
    }
  },

  /**
   * Update an existing branding setting
   * @param {FormData} formData - Form data containing branding setting information
   * @returns {Promise<Object>} Response from the server
   */
  updateBrandingSetting: async (formData) => {
    try {
      const response = await fetch(API_URL, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating branding setting:", error);
      throw error;
    }
  },

  /**
   * Delete a branding setting
   * @param {number} id - ID of the branding setting to delete
   * @returns {Promise<Object>} Response from the server
   */
  deleteBrandingSetting: async (id) => {
    try {
      const response = await fetch(API_URL, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error deleting branding setting:", error);
      throw error;
    }
  },
};

export default brandingService;
