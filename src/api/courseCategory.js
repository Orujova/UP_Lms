import axios from 'axios';
import { getToken } from '@/authtoken/auth.js';

const API_URL = 'https://demoadmin.databyte.app/api/';

const getHeaders = () => {
  const token = getToken();
  return {
    accept: '*/*',
    Authorization: `Bearer ${token}`,
  };
};

// ======================== COURSE CATEGORY ENDPOINTS ========================

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
    const response = await axios.delete(`${API_URL}CourseCategory`, {
      params: {
        Id: parseInt(categoryId),
        Language: 'az' // və ya dinamik dil
      },
      headers: getHeaders()
    });

    return response.data;
  } catch (error) {
    console.error('Error deleting course category:', error);
    throw new Error("Failed to delete course category: " + (error.response?.data?.detail || error.message));
  }
};

// Get courses by category ID
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

// ======================== VALIDATION HELPERS ========================

// Validate category data
export const validateCategoryData = (categoryData) => {
  const errors = [];

  if (!categoryData.name || !categoryData.name.trim()) {
    errors.push("Category name is required");
  }

  if (categoryData.name && categoryData.name.length > 100) {
    errors.push("Category name must be less than 100 characters");
  }

  if (categoryData.name && categoryData.name.length < 2) {
    errors.push("Category name must be at least 2 characters");
  }

  // Check for special characters (only allow letters, numbers, spaces, and common punctuation)
  if (categoryData.name && !/^[a-zA-Z0-9\s\-_.,()&]+$/.test(categoryData.name)) {
    errors.push("Category name contains invalid characters");
  }

  return errors;
};

// ======================== HELPER FUNCTIONS ========================

// Get category statistics
export const getCategoryStatistics = async (categoryId) => {
  try {
    const courses = await getCoursesByCategoryId(categoryId);
    
    return {
      totalCourses: courses.length,
      courseNames: courses.map(course => course.name),
      avgCoursesPerCategory: courses.length, // This would be calculated across all categories
    };
  } catch (error) {
    console.warn('Could not fetch category statistics:', error.message);
    return {
      totalCourses: 0,
      courseNames: [],
      avgCoursesPerCategory: 0,
    };
  }
};

// Format category for display
export const formatCategoryForDisplay = (category) => {
  if (!category) return null;

  return {
    ...category,
    formattedName: category.name || 'Unnamed Category',
    slug: generateCategorySlug(category.name),
    courseCount: 0, // This would be populated when fetching with course counts
  };
};

// Generate URL-friendly slug from category name
export const generateCategorySlug = (name) => {
  if (!name) return '';
  
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
};

// Sort categories by different criteria
export const sortCategories = (categories, sortBy = 'name', order = 'asc') => {
  if (!Array.isArray(categories)) return [];

  return [...categories].sort((a, b) => {
    let valueA, valueB;

    switch (sortBy) {
      case 'name':
        valueA = a.name?.toLowerCase() || '';
        valueB = b.name?.toLowerCase() || '';
        break;
      case 'id':
        valueA = a.id || 0;
        valueB = b.id || 0;
        break;
      case 'courseCount':
        valueA = a.courseCount || 0;
        valueB = b.courseCount || 0;
        break;
      default:
        valueA = a.id || 0;
        valueB = b.id || 0;
    }

    if (order === 'asc') {
      return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
    } else {
      return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
    }
  });
};

// Filter categories by search term
export const filterCategories = (categories, searchTerm) => {
  if (!Array.isArray(categories) || !searchTerm?.trim()) {
    return categories;
  }

  const searchLower = searchTerm.toLowerCase().trim();
  
  return categories.filter(category => {
    return (
      category.name?.toLowerCase().includes(searchLower) ||
      category.id?.toString().includes(searchTerm)
    );
  });
};

// Get categories with course counts
export const getCategoriesWithCounts = async (params = {}) => {
  try {
    const categories = await fetchCourseCategories(params);
    
    // Fetch course counts for each category
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        try {
          const courses = await getCoursesByCategoryId(category.id);
          return {
            ...category,
            courseCount: courses.length,
            courses: courses,
          };
        } catch (error) {
          console.warn(`Failed to fetch courses for category ${category.id}:`, error.message);
          return {
            ...category,
            courseCount: 0,
            courses: [],
          };
        }
      })
    );

    return categoriesWithCounts;
  } catch (error) {
    console.error('Error fetching categories with counts:', error);
    throw error;
  }
};

// Find categories by name (case-insensitive search)
export const findCategoriesByName = async (searchName) => {
  try {
    const categories = await fetchCourseCategories();
    
    if (!searchName?.trim()) return categories;
    
    const searchLower = searchName.toLowerCase().trim();
    
    return categories.filter(category => 
      category.name?.toLowerCase().includes(searchLower)
    );
  } catch (error) {
    console.error('Error finding categories by name:', error);
    throw error;
  }
};

// Check if category name already exists
export const checkCategoryNameExists = async (name, excludeId = null) => {
  try {
    const categories = await fetchCourseCategories();
    
    return categories.some(category => 
      category.name?.toLowerCase() === name?.toLowerCase() && 
      category.id !== excludeId
    );
  } catch (error) {
    console.error('Error checking category name:', error);
    return false;
  }
};

// Get category usage statistics
export const getCategoryUsageStats = async () => {
  try {
    const categoriesWithCounts = await getCategoriesWithCounts();
    
    const totalCategories = categoriesWithCounts.length;
    const totalCourses = categoriesWithCounts.reduce((sum, cat) => sum + cat.courseCount, 0);
    const usedCategories = categoriesWithCounts.filter(cat => cat.courseCount > 0).length;
    const unusedCategories = totalCategories - usedCategories;
    
    const mostUsedCategory = categoriesWithCounts.reduce((prev, current) => 
      (prev.courseCount > current.courseCount) ? prev : current, 
      categoriesWithCounts[0] || {}
    );
    
    const avgCoursesPerCategory = totalCategories > 0 ? totalCourses / totalCategories : 0;

    return {
      totalCategories,
      totalCourses,
      usedCategories,
      unusedCategories,
      mostUsedCategory: mostUsedCategory?.name || 'N/A',
      avgCoursesPerCategory: Math.round(avgCoursesPerCategory * 10) / 10,
      utilizationRate: Math.round((usedCategories / totalCategories) * 100),
    };
  } catch (error) {
    console.error('Error getting category usage stats:', error);
    return {
      totalCategories: 0,
      totalCourses: 0,
      usedCategories: 0,
      unusedCategories: 0,
      mostUsedCategory: 'N/A',
      avgCoursesPerCategory: 0,
      utilizationRate: 0,
    };
  }
};

// ======================== BATCH OPERATIONS ========================

// Create multiple categories at once
export const createCategoriesBatch = async (categoriesData) => {
  try {
    const results = [];
    const errors = [];

    for (const categoryData of categoriesData) {
      try {
        // Validate each category
        const validationErrors = validateCategoryData(categoryData);
        if (validationErrors.length > 0) {
          errors.push(`Category "${categoryData.name}": ${validationErrors.join(', ')}`);
          continue;
        }

        // Check if name already exists
        const nameExists = await checkCategoryNameExists(categoryData.name);
        if (nameExists) {
          errors.push(`Category "${categoryData.name}": Name already exists`);
          continue;
        }

        const result = await createCourseCategory(categoryData);
        results.push(result);
      } catch (error) {
        errors.push(`Category "${categoryData.name}": ${error.message}`);
      }
    }

    return {
      success: results,
      errors: errors,
      successCount: results.length,
      errorCount: errors.length,
    };
  } catch (error) {
    console.error('Error creating categories batch:', error);
    throw new Error("Failed to create categories batch: " + error.message);
  }
};

// Delete multiple categories at once
export const deleteCategoriesBatch = async (categoryIds) => {
  try {
    const results = [];
    const errors = [];

    for (const categoryId of categoryIds) {
      try {
        // Check if category has courses before deleting
        const courses = await getCoursesByCategoryId(categoryId);
        if (courses.length > 0) {
          errors.push(`Category ID ${categoryId}: Cannot delete category with ${courses.length} course(s)`);
          continue;
        }

        await deleteCourseCategory(categoryId);
        results.push(categoryId);
      } catch (error) {
        errors.push(`Category ID ${categoryId}: ${error.message}`);
      }
    }

    return {
      success: results,
      errors: errors,
      successCount: results.length,
      errorCount: errors.length,
    };
  } catch (error) {
    console.error('Error deleting categories batch:', error);
    throw new Error("Failed to delete categories batch: " + error.message);
  }
};

// ======================== DEFAULT EXPORT ========================

// Default function for backward compatibility
export const fetchCourseCategory = fetchCourseCategories;

export default {
  // Core operations
  fetchCourseCategories,
  fetchCourseCategoryById,
  createCourseCategory,
  updateCourseCategory,
  deleteCourseCategory,
  getCoursesByCategoryId,
  
  // Validation
  validateCategoryData,
  
  // Helper functions
  getCategoryStatistics,
  formatCategoryForDisplay,
  generateCategorySlug,
  sortCategories,
  filterCategories,
  getCategoriesWithCounts,
  findCategoriesByName,
  checkCategoryNameExists,
  getCategoryUsageStats,
  
  // Batch operations
  createCategoriesBatch,
  deleteCategoriesBatch,
  
  // Backward compatibility
  fetchCourseCategory,
};