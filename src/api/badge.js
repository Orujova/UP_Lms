// api/badge.js
import axios from 'axios';
import { getToken } from '@/authtoken/auth.js';

const API_URL = 'https://bravoadmin.uplms.org/api/';

const getHeaders = () => {
  const token = getToken();
  return {
    accept: '*/*',
    Authorization: `Bearer ${token}`,
  };
};

// ======================== BADGE ENDPOINTS ========================

// Fetch all badges with pagination
export const fetchBadges = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("Page", params.page);
    if (params.take) queryParams.append("ShowMore.Take", params.take);

    const url = `${API_URL}Badge${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const response = await axios.get(url, {
      headers: getHeaders(),
    });

    // Process badge photos to use correct URL
    const badges = response.data.map(badge => ({
      ...badge,
      badgePhoto: badge.badgePhoto ? 
        badge.badgePhoto.replace('https://100.42.179.27:7198/', 'https://bravoadmin.uplms.org/') 
        : null
    }));

    return badges;
  } catch (error) {
    console.error('Error fetching badges:', error);
    throw new Error("Failed to fetch badges: " + (error.response?.data?.detail || error.message));
  }
};

// Fetch single badge by ID
export const fetchBadgeById = async (badgeId) => {
  try {
    const response = await axios.get(`${API_URL}Badge/${badgeId}`, {
      headers: getHeaders(),
    });
    
    // Process badge photo URL
    const badge = response.data;
    if (badge.badgePhoto) {
      badge.badgePhoto = badge.badgePhoto.replace('https://100.42.179.27:7198/', 'https://bravoadmin.uplms.org/');
    }
    
    return badge;
  } catch (error) {
    console.error('Error fetching badge:', error);
    throw new Error("Failed to fetch badge: " + (error.response?.data?.detail || error.message));
  }
};

// Create new badge
export const createBadge = async (badgeData) => {
  try {
    const formData = new FormData();
    
    // Required fields
    formData.append("BadgeName", badgeData.badgeName || "");
    
    // Badge photo file
    if (badgeData.badgePhoto && badgeData.badgePhoto instanceof File) {
      formData.append("BadgePhoto", badgeData.badgePhoto);
    }

    const response = await axios.post(`${API_URL}Badge`, formData, {
      headers: {
        ...getHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error creating badge:', error);
    throw new Error("Failed to create badge: " + (error.response?.data?.detail || error.message));
  }
};

// Update badge
export const updateBadge = async (badgeData) => {
  try {
    const formData = new FormData();
    
    // Required fields
    if (badgeData.id) {
      formData.append("Id", badgeData.id.toString());
    }
    
    if (badgeData.badgeName) {
      formData.append("BadgeName", badgeData.badgeName);
    }
    
    // Badge photo file
    if (badgeData.badgePhoto && badgeData.badgePhoto instanceof File) {
      formData.append("BadgePhoto", badgeData.badgePhoto);
    }

    const response = await axios.put(`${API_URL}Badge`, formData, {
      headers: {
        ...getHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error updating badge:', error);
    throw new Error("Failed to update badge: " + (error.response?.data?.detail || error.message));
  }
};

// UPDATED: Delete badge with new API format - requires request body with id and language
export const deleteBadge = async (badgeDeleteData) => {
  try {
    // Handle both old format (just ID) and new format (object with id and language)
    let requestBody;
    
    if (typeof badgeDeleteData === 'number' || typeof badgeDeleteData === 'string') {
      // Old format - convert to new format
      requestBody = {
        id: parseInt(badgeDeleteData),
        language: "string" // Default language as per API spec
      };
    } else if (badgeDeleteData && typeof badgeDeleteData === 'object') {
      // New format - ensure required fields
      requestBody = {
        id: badgeDeleteData.id || badgeDeleteData.badgeId,
        language: badgeDeleteData.language || "string"
      };
    } else {
      throw new Error("Invalid delete data provided");
    }

    console.log('Deleting badge with data:', requestBody);

    const response = await axios.delete(`${API_URL}Badge`, {
      headers: {
        ...getHeaders(),
        'Content-Type': 'application/json',
      },
      data: requestBody
    });

    return response.data;
  } catch (error) {
    console.error('Error deleting badge:', error);
    throw new Error("Failed to delete badge: " + (error.response?.data?.detail || error.message));
  }
};

// Helper functions
export const formatBadgeForDisplay = (badge) => {
  if (!badge) return null;
  
  return {
    ...badge,
    badgePhoto: badge.badgePhoto ? 
      badge.badgePhoto.replace('https://100.42.179.27:7198/', 'https://bravoadmin.uplms.org/') 
      : null
  };
};

export default {
  fetchBadges,
  fetchBadgeById,
  createBadge,
  updateBadge,
  deleteBadge,
  formatBadgeForDisplay
};