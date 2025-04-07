import axios from "axios";
import { toast } from "sonner";

const API_URL = "https://bravoadmin.uplms.org/api/BrendingSetting";

const brandingService = {
  /**
   * Fetch all branding settings with advanced filtering and pagination
   * @param {Object} options - Query parameters for filtering and pagination
   * @returns {Promise<Array>} Array of branding settings
   */
  fetchBrandingSettings: async (options = {}) => {
    try {
      const params = new URLSearchParams();

      // Pagination parameters
      if (options.page) params.append("Page", options.page);
      if (options.take) params.append("ShowMore.Take", options.take);

      // Filter parameters
      const filterMap = {
        isAppUser: "IsAppUser",
        isAnnouncement: "IsAnnouncement",
        isEvent: "IsEvent",
        isNews: "IsNews",
        isCourse: "IsCourse",
        isCluster: "IsCluster",
        isCompany: "IsCompany",
        isCustomer: "IsCustomer",
        isOTPAndLogin: "IsOTPAndLogin",
      };

      Object.entries(filterMap).forEach(([key, param]) => {
        if (options[key] !== undefined) {
          params.append(param, options[key]);
        }
      });

      const response = await axios.get(API_URL, { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching branding settings:", error);
      toast.error("Failed to fetch branding settings");
      throw error;
    }
  },

  /**
   * Fetch a single branding setting by ID
   * @param {number} id - ID of the branding setting
   * @returns {Promise<Object>} Branding setting details
   */
  fetchBrandingSettingById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/id`, {
        params: { id },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching branding setting:", error);
      toast.error("Failed to fetch branding setting");
      throw error;
    }
  },

  /**
   * Create a new branding setting
   * @param {FormData} formData - Branding setting data
   * @returns {Promise<Object>} Created branding setting
   */
  createBrandingSetting: async (formData) => {
    try {
      // Ensure all potential flags are set
      const flagsToSet = [
        "IsAppUser",
        "IsAnnouncement",
        "IsEvent",
        "IsNews",
        "IsCourse",
        "IsCluster",
        "IsCompany",
        "IsCustomer",
        "IsOTPAndLogin",
      ];

      flagsToSet.forEach((flag) => {
        if (!formData.has(flag)) {
          formData.append(flag, "false");
        }
      });

      const response = await axios.post(API_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Branding setting created successfully");
      return response.data;
    } catch (error) {
      console.error("Error creating branding setting:", error);
      toast.error("Failed to create branding setting");
      throw error;
    }
  },

  /**
   * Update an existing branding setting
   * @param {FormData} formData - Updated branding setting data
   * @returns {Promise<Object>} Updated branding setting
   */
  updateBrandingSetting: async (formData) => {
    try {
      // Ensure ID is present for update
      if (!formData.has("Id")) {
        throw new Error("ID is required for updating a branding setting");
      }

      // Ensure all potential flags are set
      const flagsToSet = [
        "IsAppUser",
        "IsAnnouncement",
        "IsEvent",
        "IsNews",
        "IsCourse",
        "IsCluster",
        "IsCompany",
        "IsCustomer",
        "IsOTPAndLogin",
      ];

      flagsToSet.forEach((flag) => {
        if (!formData.has(flag)) {
          formData.append(flag, "false");
        }
      });

      const response = await axios.put(API_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Branding setting updated successfully");
      return response.data;
    } catch (error) {
      console.error("Error updating branding setting:", error);
      toast.error("Failed to update branding setting");
      throw error;
    }
  },

  /**
   * Delete a branding setting
   * @param {number} id - ID of the branding setting to delete
   * @returns {Promise<Object>} Delete response
   */
  deleteBrandingSetting: async (id) => {
    try {
      const response = await axios.delete(API_URL, {
        data: { id },
      });

      toast.success("Branding setting deleted successfully");
      return response.data;
    } catch (error) {
      console.error("Error deleting branding setting:", error);
      toast.error("Failed to delete branding setting");
      throw error;
    }
  },

  /**
   * Cancel or reset branding settings
   * @returns {Promise<Object>} Cancel/reset response
   */
  cancelReset: async () => {
    try {
      const response = await axios.post(`${API_URL}/CancelReset`);

      toast.success("Branding settings reset successfully");
      return response.data;
    } catch (error) {
      console.error("Error canceling/resetting branding settings:", error);
      toast.error("Failed to reset branding settings");
      throw error;
    }
  },

  /**
   * Utility method to fix image URLs
   * @param {string} url - Input URL
   * @returns {string|null} Corrected URL
   */
  fixImageUrl: (url) => {
    if (!url) return null;

    // Handle direct string URLs
    if (typeof url === "string" && url.includes("100.42.179.27:7198")) {
      return `https://bravoadmin.uplms.org/uploads/${url.replace(
        "https://100.42.179.27:7198/",
        ""
      )}`;
    }

    // If it's already in the correct format
    if (
      typeof url === "string" &&
      url.startsWith("https://bravoadmin.uplms.org/uploads/")
    ) {
      return url;
    }

    // For relative URLs, prepend the admin URL
    if (typeof url === "string" && url.startsWith("brending/")) {
      return `https://bravoadmin.uplms.org/uploads/${url}`;
    }

    return url;
  },
};

export default brandingService;
