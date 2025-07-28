// api/badge.js
import axios from 'axios';
import { getToken } from '@/authtoken/auth.js';

const API_URL = 'https://bravoadmin.uplms.org/api/';

const getHeaders = () => {
  const token = getToken();
  if (!token) {
    console.warn('No authentication token found');
    return {
      accept: '*/*',
    };
  }
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
    
    // API documentation göstərir ki, parametrlər Page və ShowMore.Take olmalıdır
    if (params.page) queryParams.append("Page", params.page);
    if (params.take) queryParams.append("ShowMore.Take", params.take);

    const url = `${API_URL}Badge${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    console.log('Fetching badges from URL:', url);
    console.log('Headers:', getHeaders());

    const response = await axios.get(url, {
      headers: getHeaders(),
    });

    console.log('Badge API response:', response.data);

    // API response'unu yoxlayırıq
    if (!response.data) {
      console.warn('Badge API returned no data');
      return [];
    }

    // Response array olmalıdır
    if (!Array.isArray(response.data)) {
      console.warn('Badge API response is not an array:', response.data);
      return [];
    }

    // Process badge photos to use correct URL
    const badges = response.data.map(badge => {
      if (!badge) return null;
      
      return {
        ...badge,
        badgePhoto: badge.badgePhoto ? 
          badge.badgePhoto.replace('https://100.42.179.27:7198/', 'https://bravoadmin.uplms.org/') 
          : null,
        // API'dən gələn data strukturunu normalize edirik
        name: badge.badgeName || badge.name || 'Unknown Badge',
        id: badge.id || null
      };
    }).filter(badge => badge && badge.id); // null və invalid badge'ləri filter edirik

    console.log('Processed badges:', badges);
    return badges;

  } catch (error) {
    console.error('Error fetching badges:', error);
    
    // Network və auth errorları üçün daha detallı məlumat
    if (error.response) {
      console.error('Badge API Error Response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
      
      // 401 Unauthorized error
      if (error.response.status === 401) {
        throw new Error("Authentication failed. Please login again.");
      }
      
      // 403 Forbidden error
      if (error.response.status === 403) {
        throw new Error("Access denied. You don't have permission to view badges.");
      }
      
      // 404 Not Found error
      if (error.response.status === 404) {
        throw new Error("Badge API endpoint not found.");
      }
      
      // Server error (5xx)
      if (error.response.status >= 500) {
        throw new Error("Server error. Please try again later.");
      }
      
      throw new Error(`Failed to fetch badges: ${error.response.data?.detail || error.response.statusText}`);
    } else if (error.request) {
      console.error('Badge API Network Error:', error.request);
      throw new Error("Network error. Please check your connection and try again.");
    } else {
      console.error('Badge API Setup Error:', error.message);
      throw new Error("Request setup error: " + error.message);
    }
  }
};

// Fetch single badge by ID
export const fetchBadgeById = async (badgeId) => {
  try {
    if (!badgeId) {
      throw new Error("Badge ID is required");
    }

    console.log('Fetching badge by ID:', badgeId);
    
    const response = await axios.get(`${API_URL}Badge/id?id=${badgeId}`, {
      headers: getHeaders(),
    });
    
    console.log('Single badge API response:', response.data);
    
    if (!response.data) {
      throw new Error("Badge not found");
    }
    
    // Process badge photo URL
    const badge = {
      ...response.data,
      badgePhoto: response.data.badgePhoto ? 
        response.data.badgePhoto.replace('https://100.42.179.27:7198/', 'https://bravoadmin.uplms.org/') 
        : null,
      name: response.data.badgeName || response.data.name || 'Unknown Badge'
    };
    
    return badge;
  } catch (error) {
    console.error('Error fetching badge by ID:', error);
    
    if (error.response?.status === 404) {
      throw new Error("Badge not found");
    }
    
    throw new Error("Failed to fetch badge: " + (error.response?.data?.detail || error.message));
  }
};

// Create new badge
export const createBadge = async (badgeData) => {
  try {
    if (!badgeData.badgeName || !badgeData.badgeName.trim()) {
      throw new Error("Badge name is required");
    }

    const formData = new FormData();
    
    // Required fields
    formData.append("BadgeName", badgeData.badgeName.trim());
    
    // Badge photo file
    if (badgeData.badgePhoto && badgeData.badgePhoto instanceof File) {
      formData.append("BadgePhoto", badgeData.badgePhoto);
    }

    console.log('Creating badge with data:', {
      badgeName: badgeData.badgeName,
      hasPhoto: !!badgeData.badgePhoto
    });

    const response = await axios.post(`${API_URL}Badge`, formData, {
      headers: {
        ...getHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('Create badge response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating badge:', error);
    throw new Error("Failed to create badge: " + (error.response?.data?.detail || error.message));
  }
};

// Update badge
export const updateBadge = async (badgeData) => {
  try {
    if (!badgeData.id) {
      throw new Error("Badge ID is required for update");
    }

    const formData = new FormData();
    
    // Required fields
    formData.append("Id", badgeData.id.toString());
    
    if (badgeData.badgeName) {
      formData.append("BadgeName", badgeData.badgeName.trim());
    }
    
    // Badge photo file
    if (badgeData.badgePhoto && badgeData.badgePhoto instanceof File) {
      formData.append("BadgePhoto", badgeData.badgePhoto);
    }

    console.log('Updating badge with ID:', badgeData.id);

    const response = await axios.put(`${API_URL}Badge`, formData, {
      headers: {
        ...getHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('Update badge response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating badge:', error);
    throw new Error("Failed to update badge: " + (error.response?.data?.detail || error.message));
  }
};

// Delete badge
export const deleteBadge = async (badgeId) => {
  try {
    if (!badgeId) {
      throw new Error("Badge ID is required for deletion");
    }

    console.log('Deleting badge with ID:', badgeId);

    // API documentation göstərir ki, DELETE request body istəyir
    const response = await axios.delete(`${API_URL}Badge`, {
      headers: getHeaders(),
      data: {
        id: badgeId
      }
    });

    console.log('Delete badge response:', response.data);
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
      : null,
    name: badge.badgeName || badge.name || 'Unknown Badge'
  };
};

// Test connection function
export const testBadgeAPI = async () => {
  try {
    const response = await axios.get(`${API_URL}Badge?Page=1&ShowMore.Take=1`, {
      headers: getHeaders(),
    });
    console.log('Badge API test successful:', response.status);
    return true;
  } catch (error) {
    console.error('Badge API test failed:', error.response?.status, error.message);
    return false;
  }
};

export default {
  fetchBadges,
  fetchBadgeById,
  createBadge,
  updateBadge,
  deleteBadge,
  formatBadgeForDisplay,
  testBadgeAPI
};