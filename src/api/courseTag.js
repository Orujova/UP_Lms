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

// Fetch all course tags with pagination
export const fetchCourseTags = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("Page", params.page);
    if (params.take) queryParams.append("ShowMore.Take", params.take);

    const url = `${API_URL}CourseTag${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const response = await axios.get(url, {
      headers: getHeaders(),
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching course tags:', error);
    // API documentation göstərir ki, bu endpoint 500 error verir
    // Mapping məsələsi olduğuna görə, fallback olaraq empty array qaytarırıq
    if (error.response?.status === 500 && error.response?.data?.detail?.includes('Error mapping types')) {
      console.warn('CourseTag endpoint has mapping issues, returning empty array');
      return [];
    }
    throw new Error("Failed to fetch course tags: " + (error.response?.data?.detail || error.message));
  }
};

// Fetch single course tag by ID
export const fetchCourseTagById = async (tagId) => {
  try {
    const response = await axios.get(`${API_URL}CourseTag/id`, {
      params: { id: parseInt(tagId) },
      headers: getHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching course tag:', error);
    throw new Error("Failed to fetch course tag: " + (error.response?.data?.detail || error.message));
  }
};

// Create new course tag
export const createCourseTag = async (tagData) => {
  try {
    const payload = {
      name: tagData.name || "",
    };

    const response = await axios.post(`${API_URL}CourseTag`, payload, {
      headers: {
        ...getHeaders(),
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error creating course tag:', error);
    throw new Error("Failed to create course tag: " + (error.response?.data?.detail || error.message));
  }
};

// Update course tag
export const updateCourseTag = async (tagData) => {
  try {
    const payload = {
      id: tagData.id,
      name: tagData.name || "",
    };

    const response = await axios.put(`${API_URL}CourseTag`, payload, {
      headers: {
        ...getHeaders(),
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error updating course tag:', error);
    throw new Error("Failed to update course tag: " + (error.response?.data?.detail || error.message));
  }
};

// Delete course tag
export const deleteCourseTag = async (tagId) => {
  try {
    const payload = {
      id: parseInt(tagId),
    };

    const response = await axios.delete(`${API_URL}CourseTag`, {
      data: payload,
      headers: {
        ...getHeaders(),
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error deleting course tag:', error);
    throw new Error("Failed to delete course tag: " + (error.response?.data?.detail || error.message));
  }
};

// Validate tag data
export const validateTagData = (tagData) => {
  const errors = [];

  if (!tagData.name || !tagData.name.trim()) {
    errors.push("Tag name is required");
  }

  if (tagData.name && tagData.name.length > 50) {
    errors.push("Tag name must be less than 50 characters");
  }

  return errors;
};

// Default function for backward compatibility
export const fetchCourseTag = fetchCourseTags;