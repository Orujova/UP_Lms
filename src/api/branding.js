import axios from "axios";
import { toast } from "sonner";

const api = axios.create({
  baseURL: "https://demoadmin.databyte.app/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMessage = error.response?.data?.message || "An error occurred";
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);

const BRANDING_TYPES = {
  APP_USER: {
    key: "appUser",
    apiFlag: "IsAppUser",
    imageFields: [
      { key: "image", apiField: "imageUrl", formName: "AppUserImage" },
      {
        key: "coverPhoto",
        apiField: "coverPhotoUrl",
        formName: "AppUserCoverPhoto",
      },
    ],
  },
  ANNOUNCEMENT: {
    key: "announcement",
    apiFlag: "IsAnnouncement",
    imageFields: [
      {
        key: "bgImage",
        apiField: "announcBGImageUrl",
        formName: "AnnouncBGImage",
      },
    ],
  },
  EVENT: {
    key: "event",
    apiFlag: "IsEvent",
    imageFields: [
      {
        key: "coverPhoto",
        apiField: "eventCoverPhotoUrl",
        formName: "EventCoverPhoto",
      },
    ],
  },
  NEWS: {
    key: "news",
    apiFlag: "IsNews",
    imageFields: [
      { key: "image", apiField: "newsImageUrl", formName: "NewsImage" },
    ],
  },
  COURSE: {
    key: "course",
    apiFlag: "IsCourse",
    imageFields: [
      {
        key: "coverPhoto",
        apiField: "courseCoverPhotoUrl",
        formName: "CourseCoverPhoto",
      },
    ],
  },
  OTP_LOGIN: {
    key: "otpLogin",
    apiFlag: "IsOTPAndLogin",
    imageFields: [
      {
        key: "uploadedImages",
        apiField: "otpAndLoginImages",
        formName: "OTPAndLoginImages",
        isMultiple: true,
      },
    ],
  },
  COMPANY: {
    key: "company",
    apiFlag: "IsCompany",
    imageFields: [
      { key: "logo", apiField: "companyLogoUrl", formName: "CompanyLogo" },
    ],
    hasNameField: true,
    nameField: "companyName",
    formNameField: "CompanyName",
  },
  CUSTOMER: {
    key: "customer",
    apiFlag: "IsCustomer",
    imageFields: [
      { key: "logo", apiField: "customerLogoUrl", formName: "CustomerLogo" },
    ],
    hasNameField: true,
    nameField: "customerName",
    formNameField: "CustomerName",
  },
  CLUSTER: {
    key: "cluster",
    apiFlag: "IsCluster",
    imageFields: [
      {
        key: "coverPhoto",
        apiField: "clusterCoverPhotoUrl",
        formName: "ClusterCoverPhoto",
      },
    ],
  },
};

// Improved URL fixing function to handle various URL formats
const fixImageUrl = (url) => {
  if (!url) return null;

  // Handle object URLs with url property
  const urlStr = typeof url === "object" && url.url ? url.url : url;
  if (typeof urlStr !== "string") return null;

  // Handle old IP-based URLs
  if (urlStr.includes("100.42.179.27:7298")) {
    const baseDir = urlStr.includes("brending/") ? "" : "brending/";
    const fileName = urlStr.split("/").pop();
    return `https://demoadmin.databyte.app/uploads/brending/${baseDir}${fileName}`;
  }

  // Already correctly formatted URLs
  if (urlStr.startsWith("https://demoadmin.databyte.app/uploads/brending/")) {
    return urlStr;
  }

  // Relative paths with brending prefix
  if (urlStr.startsWith("brending/")) {
    return `https://demoadmin.databyte.app/uploads/${urlStr}`;
  }

  // Other relative paths without protocol
  if (!urlStr.startsWith("http") && !urlStr.startsWith("https")) {
    const baseDir = urlStr.includes("brending/") ? "" : "brending/";
    const cleanPath = urlStr.replace(/^\/+/, "");
    return `https://demoadmin.databyte.app/uploads/brending/${baseDir}${cleanPath}`;
  }

  return urlStr;
};

// Updated ID extraction function that works with OTP login IDs
const extractImageId = (url, otpIds = [], index = null) => {
  if (!url) return null;

  try {
    // For OTP login images, use the corresponding ID from otpAndLoginIds array
    if (otpIds && Array.isArray(otpIds) && index !== null && otpIds[index]) {
      console.log("Using OTP ID from array:", otpIds[index]);
      return otpIds[index].toString();
    }

    // Extract the filename from the URL
    const fileName = url.split("/").pop();

    // First try to extract a UUID pattern if one exists
    const uuidPattern =
      /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;
    const uuidMatch = url.match(uuidPattern);
    if (uuidMatch && uuidMatch[1]) {
      console.log("Found UUID in URL:", uuidMatch[1]);
      return uuidMatch[1];
    }

    // If no UUID, look for any numeric part in the filename
    const numericMatches = fileName.match(/\d+/);
    if (numericMatches && numericMatches[0]) {
      console.log("Found numeric ID in filename:", numericMatches[0]);
      return numericMatches[0];
    }

    // If no numeric part, just return the filename without extension as fallback
    const fileNameWithoutExt = fileName.split(".")[0];
    console.log("Using filename as ID:", fileNameWithoutExt);
    return fileNameWithoutExt;
  } catch (err) {
    console.error("Error extracting ID from URL:", err);
    return url;
  }
};

const normalizeBrandingData = (data, brandingTypeKey) => {
  if (!data) {
    return null;
  }

  const brandingType = Object.values(BRANDING_TYPES).find(
    (type) => type.key === brandingTypeKey
  );
  if (!brandingType) {
    return null;
  }

  let isEnabled = false;
  if (brandingTypeKey === "appUser") {
    isEnabled = !!data.isAppuser;
  } else {
    const flagName = `is${
      brandingTypeKey.charAt(0).toUpperCase() + brandingTypeKey.slice(1)
    }`;
    isEnabled = !!data[flagName];
  }

  const normalizedData = {
    id: data.id,
    enabled: isEnabled,
    images: {},
    name: brandingType.hasNameField ? data[brandingType.nameField] || "" : "",
    otpAndLoginIds: data.otpAndLoginIds || [], // Add this for OTP login
  };

  brandingType.imageFields.forEach((field) => {
    if (brandingTypeKey === "otpLogin" && field.key === "uploadedImages") {
      if (data.otpAndLoginImages && Array.isArray(data.otpAndLoginImages)) {
        normalizedData.images[field.key] = data.otpAndLoginImages
          .filter((img) => img)
          .map((img) => fixImageUrl(img))
          .filter((url) => url);
      } else {
        normalizedData.images[field.key] = [];
      }
    } else if (brandingTypeKey === "appUser") {
      if (field.key === "image") {
        normalizedData.images[field.key] = data.imageUrl
          ? fixImageUrl(data.imageUrl)
          : data.image
          ? fixImageUrl(data.image)
          : null;
      } else if (field.key === "coverPhoto") {
        normalizedData.images[field.key] = data.coverPhotoUrl
          ? fixImageUrl(data.coverPhotoUrl)
          : data.coverPhoto
          ? fixImageUrl(data.coverPhoto)
          : null;
      }
    } else if (brandingTypeKey === "course") {
      if (field.key === "coverPhoto") {
        normalizedData.images[field.key] = data.courseCoverPhotoUrl
          ? fixImageUrl(data.courseCoverPhotoUrl)
          : data.courseCoverPhoto
          ? fixImageUrl(data.courseCoverPhoto)
          : null;
      }
    } else if (field.isMultiple) {
      if (Array.isArray(data[field.apiField])) {
        normalizedData.images[field.key] = data[field.apiField]
          .filter((img) => img)
          .map((img) => fixImageUrl(img))
          .filter((url) => url);
      } else {
        normalizedData.images[field.key] = [];
      }
    } else {
      normalizedData.images[field.key] = data[field.apiField]
        ? fixImageUrl(data[field.apiField])
        : data[field.key]
        ? fixImageUrl(data[field.key])
        : null;
    }
  });

  return normalizedData;
};

const brandingService = {
  getBrandingTypes() {
    return BRANDING_TYPES;
  },

  async fetchBrandingSettings(filters = {}) {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value);
        }
      });
      params.append("_t", Date.now()); // Cache-busting parameter
      const response = await api.get("/BrendingSetting", { params });
      return response.data || [];
    } catch (error) {
      console.error("Error fetching branding settings:", error);
      return [];
    }
  },

  async fetchBrandingByType(brandingTypeKey) {
    try {
      const brandingType = Object.values(BRANDING_TYPES).find(
        (type) => type.key === brandingTypeKey
      );
      if (!brandingType) {
        throw new Error(`Invalid branding type: ${brandingTypeKey}`);
      }

      const queryParams = { [brandingType.apiFlag]: true };
      const settings = await this.fetchBrandingSettings(queryParams);
      let relevantSetting = null;

      if (brandingTypeKey === "otpLogin") {
        relevantSetting = settings.find(
          (s) => s.isOTPAndLogin || Array.isArray(s.otpAndLoginImages)
        );
      } else if (brandingTypeKey === "appUser") {
        relevantSetting = settings.find((s) => !!s.isAppuser);
      } else if (brandingTypeKey === "course") {
        relevantSetting = settings.find(
          (s) => !!s.isCourse || !!s.courseCoverPhotoUrl
        );
      } else {
        const flagName = `is${
          brandingTypeKey.charAt(0).toUpperCase() + brandingTypeKey.slice(1)
        }`;
        relevantSetting = settings.find((s) => !!s[flagName]);
      }

      const normalizedData = normalizeBrandingData(
        relevantSetting,
        brandingTypeKey
      ) || {
        id: null,
        enabled: true,
        images: {},
        name: "",
        otpAndLoginIds: [],
      };
      return normalizedData;
    } catch (error) {
      console.error(`Error fetching branding type ${brandingTypeKey}:`, error);
      return {
        id: null,
        enabled: true,
        images: {},
        name: "",
        otpAndLoginIds: [],
      };
    }
  },

  async fetchBrandingById(id) {
    try {
      const response = await api.get("/BrendingSetting/id", {
        params: { id },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async createBrandingSetting(formData, brandingTypeKey) {
    try {
      // Debug log
      const formDataDebug = {};
      formData.forEach((value, key) => {
        formDataDebug[key] =
          value instanceof File
            ? `File: ${value.name} (${value.size} bytes)`
            : value;
      });
      console.log("Creating branding with data:", formDataDebug);

      // Ensure all flag fields are properly set
      const brandingType = Object.values(BRANDING_TYPES).find(
        (type) => type.key === brandingTypeKey
      );

      if (!brandingType) {
        throw new Error(`Invalid branding type: ${brandingTypeKey}`);
      }

      // Ensure all branding type flags are set to false except the current one
      Object.values(BRANDING_TYPES).forEach((type) => {
        if (!formData.has(type.apiFlag)) {
          formData.append(
            type.apiFlag,
            (type.key === brandingTypeKey).toString()
          );
        }
      });

      const response = await axios.post(
        "https://demoadmin.databyte.app/api/BrendingSetting",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Create response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error creating branding setting:", error);
      if (error.response) {
        console.error("Server response:", error.response.data);
      }
      throw error;
    }
  },

  async updateBrandingSetting(formData, brandingTypeKey) {
    try {
      if (!formData.has("Id")) {
        throw new Error("ID is required for updating a branding setting");
      }

      // Debug log
      const formDataDebug = {};
      formData.forEach((value, key) => {
        formDataDebug[key] =
          value instanceof File
            ? `File: ${value.name} (${value.size} bytes)`
            : value;
      });
      console.log("Updating branding with data:", formDataDebug);

      // Ensure all flag fields are properly set
      const brandingType = Object.values(BRANDING_TYPES).find(
        (type) => type.key === brandingTypeKey
      );

      if (!brandingType) {
        throw new Error(`Invalid branding type: ${brandingTypeKey}`);
      }

      // Ensure all branding type flags are set to false except the current one
      Object.values(BRANDING_TYPES).forEach((type) => {
        if (!formData.has(type.apiFlag)) {
          formData.append(
            type.apiFlag,
            (type.key === brandingTypeKey).toString()
          );
        }
      });

      const response = await axios.put(
        "https://demoadmin.databyte.app/api/BrendingSetting",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Update response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error updating branding setting:", error);
      if (error.response) {
        console.error("Server response:", error.response.data);
      }
      throw error;
    }
  },

  async deleteBrandingSetting(id) {
    try {
      if (!id) {
        throw new Error("ID is required for deleting a branding setting");
      }

      // For DELETE requests, use application/json content type
      console.log("Deleting branding setting with ID:", id);

      const response = await api.delete("/BrendingSetting", {
        data: { id },
        headers: { "Content-Type": "application/json" },
      });

      if (!response.data || !response.data.isSuccess) {
        console.error("Delete failed:", response.data);
        throw new Error(
          "Delete operation failed: " + JSON.stringify(response.data)
        );
      }

      console.log("Delete successful:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error deleting branding setting:", error);
      if (error.response) {
        console.error("Server response:", error.response.data);
      }
      throw error;
    }
  },

  async resetBrandingSettings() {
    try {
      const response = await api.post("/BrendingSetting/CancelReset");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  fixImageUrl,
  extractImageId,
};

export default brandingService;