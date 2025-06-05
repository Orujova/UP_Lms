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

// Fetch all course categories with pagination
export const fetchCourseCategories = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("Page", params.page);
    if (params.take) queryParams.append("ShowMore.Take", params.take);

    const url = `${API_URL}CourseCategory${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const response = await axios.get(url, {
      headers: getHeaders(),
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching course categories:', error);
    throw new Error("Failed to fetch course categories: " + (error.response?.data?.detail || error.message));
  }
};

// Fetch single course category by ID
export const fetchCourseCategoryById = async (categoryId) => {
  try {
    const response = await axios.get(`${API_URL}CourseCategory/id`, {
      params: { id: parseInt(categoryId) },
      headers: getHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching course category:', error);
    throw new Error("Failed to fetch course category: " + (error.response?.data?.detail || error.message));
  }
};

// Create new course category
export const createCourseCategory = async (categoryData) => {
  try {
    const payload = {
      name: categoryData.name || "",
    };

    const response = await axios.post(`${API_URL}CourseCategory`, payload, {
      headers: {
        ...getHeaders(),
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error creating course category:', error);
    throw new Error("Failed to create course category: " + (error.response?.data?.detail || error.message));
  }
};

// Update course category
export const updateCourseCategory = async (categoryData) => {
  try {
    const payload = {
      id: categoryData.id,
      name: categoryData.name || "",
    };

    const response = await axios.put(`${API_URL}CourseCategory`, payload, {
      headers: {
        ...getHeaders(),
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error updating course category:', error);
    throw new Error("Failed to update course category: " + (error.response?.data?.detail || error.message));
  }
};

// Delete course category
export const deleteCourseCategory = async (categoryId) => {
  try {
    const payload = {
      id: parseInt(categoryId),
    };

    const response = await axios.delete(`${API_URL}CourseCategory`, {
      data: payload,
      headers: {
        ...getHeaders(),
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error deleting course category:', error);
    throw new Error("Failed to delete course category: " + (error.response?.data?.detail || error.message));
  }
};

// Get courses by category ID - API documentation göstərir ki, bu endpoint error verir
// Amma biz onu düzgün parametrlərlə çağırmağa çalışacağıq
export const getCoursesByCategoryId = async (categoryId) => {
  try {
    const response = await axios.get(`${API_URL}CourseCategory/GetCourseByCourseCategoryId`, {
      params: { CourseCategoryId: parseInt(categoryId) },
      headers: getHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching courses by category:', error);
    // API-də problem olduğuna görə, empty array qaytarırıq
    if (error.response?.status === 500) {
      console.warn('GetCourseByCourseCategoryId endpoint has issues, returning empty array');
      return [];
    }
    throw new Error("Failed to fetch courses by category: " + (error.response?.data?.detail || error.message));
  }
};

// Validate category data
export const validateCategoryData = (categoryData) => {
  const errors = [];

  if (!categoryData.name || !categoryData.name.trim()) {
    errors.push("Category name is required");
  }

  if (categoryData.name && categoryData.name.length > 100) {
    errors.push("Category name must be less than 100 characters");
  }

  return errors;
};

// Default function for backward compatibility
export const fetchCourseCategory = fetchCourseCategories;