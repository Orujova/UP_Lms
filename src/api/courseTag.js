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

// ======================== COURSE TAG ENDPOINTS ========================

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
    // API documentation göstərir ki, bu endpoint 500 error verir mapping məsələsindən
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
    const response = await axios.delete(`${API_URL}CourseTag`, {
      params: {
        Id: parseInt(tagId),
        Language: 'az' // və ya dinamik dil
      },
      headers: getHeaders()
    });

    return response.data;
  } catch (error) {
    console.error('Error deleting course tag:', error);
    throw new Error("Failed to delete course tag: " + (error.response?.data?.detail || error.message));
  }
};

// ======================== VALIDATION HELPERS ========================

// Validate tag data
export const validateTagData = (tagData) => {
  const errors = [];

  if (!tagData.name || !tagData.name.trim()) {
    errors.push("Tag name is required");
  }

  if (tagData.name && tagData.name.length > 50) {
    errors.push("Tag name must be less than 50 characters");
  }

  if (tagData.name && tagData.name.length < 2) {
    errors.push("Tag name must be at least 2 characters");
  }

  // Check for special characters (tags typically use alphanumeric and common separators)
  if (tagData.name && !/^[a-zA-Z0-9\s\-_.,#&+]+$/.test(tagData.name)) {
    errors.push("Tag name contains invalid characters");
  }

  return errors;
};

// ======================== HELPER FUNCTIONS ========================

// Format tag for display
export const formatTagForDisplay = (tag) => {
  if (!tag) return null;

  return {
    ...tag,
    formattedName: tag.name || 'Unnamed Tag',
    slug: generateTagSlug(tag.name),
    color: generateTagColor(tag.name), // Generate consistent color based on name
  };
};

// Generate URL-friendly slug from tag name
export const generateTagSlug = (name) => {
  if (!name) return '';
  
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
};

// Generate consistent color for tag based on name
export const generateTagColor = (name) => {
  if (!name) return '#gray';
  
  const colors = [
    '#blue', '#green', '#red', '#yellow', '#purple', 
    '#pink', '#indigo', '#teal', '#orange', '#cyan'
  ];
  
  // Simple hash function to get consistent color
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

// Sort tags by different criteria
export const sortTags = (tags, sortBy = 'name', order = 'asc') => {
  if (!Array.isArray(tags)) return [];

  return [...tags].sort((a, b) => {
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
      case 'usageCount':
        valueA = a.usageCount || 0;
        valueB = b.usageCount || 0;
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

// Filter tags by search term
export const filterTags = (tags, searchTerm) => {
  if (!Array.isArray(tags) || !searchTerm?.trim()) {
    return tags;
  }

  const searchLower = searchTerm.toLowerCase().trim();
  
  return tags.filter(tag => {
    return (
      tag.name?.toLowerCase().includes(searchLower) ||
      tag.id?.toString().includes(searchTerm)
    );
  });
};

// Find tags by name (case-insensitive search)
export const findTagsByName = async (searchName) => {
  try {
    const tags = await fetchCourseTags();
    
    if (!searchName?.trim()) return tags;
    
    const searchLower = searchName.toLowerCase().trim();
    
    return tags.filter(tag => 
      tag.name?.toLowerCase().includes(searchLower)
    );
  } catch (error) {
    console.error('Error finding tags by name:', error);
    return []; // Return empty array instead of throwing
  }
};

// Check if tag name already exists
export const checkTagNameExists = async (name, excludeId = null) => {
  try {
    const tags = await fetchCourseTags();
    
    return tags.some(tag => 
      tag.name?.toLowerCase() === name?.toLowerCase() && 
      tag.id !== excludeId
    );
  } catch (error) {
    console.error('Error checking tag name:', error);
    return false;
  }
};

// Get popular tags (most commonly used)
export const getPopularTags = (tags, limit = 10) => {
  if (!Array.isArray(tags)) return [];
  
  return tags
    .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
    .slice(0, limit);
};

// Get tag suggestions based on partial input
export const getTagSuggestions = async (partialName, limit = 5) => {
  try {
    if (!partialName?.trim()) return [];
    
    const tags = await fetchCourseTags();
    const searchLower = partialName.toLowerCase().trim();
    
    return tags
      .filter(tag => tag.name?.toLowerCase().startsWith(searchLower))
      .slice(0, limit)
      .map(tag => tag.name);
  } catch (error) {
    console.error('Error getting tag suggestions:', error);
    return [];
  }
};

// ======================== TAG CLOUD FUNCTIONALITY ========================

// Generate tag cloud data with weights
export const generateTagCloudData = (tags) => {
  if (!Array.isArray(tags)) return [];
  
  const maxUsage = Math.max(...tags.map(tag => tag.usageCount || 0));
  const minUsage = Math.min(...tags.map(tag => tag.usageCount || 0));
  
  return tags.map(tag => {
    const usage = tag.usageCount || 0;
    // Normalize weight between 1 and 5
    const weight = maxUsage > minUsage 
      ? Math.round(((usage - minUsage) / (maxUsage - minUsage)) * 4 + 1)
      : 3;
    
    return {
      ...tag,
      weight,
      size: `${weight * 0.8 + 0.5}rem`, // Convert weight to CSS size
      opacity: weight * 0.15 + 0.4, // Convert weight to opacity
    };
  });
};

// ======================== BATCH OPERATIONS ========================

// Create multiple tags at once
export const createTagsBatch = async (tagsData) => {
  try {
    const results = [];
    const errors = [];

    for (const tagData of tagsData) {
      try {
        // Validate each tag
        const validationErrors = validateTagData(tagData);
        if (validationErrors.length > 0) {
          errors.push(`Tag "${tagData.name}": ${validationErrors.join(', ')}`);
          continue;
        }

        // Check if name already exists
        const nameExists = await checkTagNameExists(tagData.name);
        if (nameExists) {
          errors.push(`Tag "${tagData.name}": Name already exists`);
          continue;
        }

        const result = await createCourseTag(tagData);
        results.push(result);
      } catch (error) {
        errors.push(`Tag "${tagData.name}": ${error.message}`);
      }
    }

    return {
      success: results,
      errors: errors,
      successCount: results.length,
      errorCount: errors.length,
    };
  } catch (error) {
    console.error('Error creating tags batch:', error);
    throw new Error("Failed to create tags batch: " + error.message);
  }
};

// Delete multiple tags at once
export const deleteTagsBatch = async (tagIds) => {
  try {
    const results = [];
    const errors = [];

    for (const tagId of tagIds) {
      try {
        await deleteCourseTag(tagId);
        results.push(tagId);
      } catch (error) {
        errors.push(`Tag ID ${tagId}: ${error.message}`);
      }
    }

    return {
      success: results,
      errors: errors,
      successCount: results.length,
      errorCount: errors.length,
    };
  } catch (error) {
    console.error('Error deleting tags batch:', error);
    throw new Error("Failed to delete tags batch: " + error.message);
  }
};

// ======================== TAG ANALYTICS ========================

// Get tag usage statistics
export const getTagUsageStats = async () => {
  try {
    const tags = await fetchCourseTags();
    
    const totalTags = tags.length;
    const usedTags = tags.filter(tag => (tag.usageCount || 0) > 0).length;
    const unusedTags = totalTags - usedTags;
    
    const totalUsage = tags.reduce((sum, tag) => sum + (tag.usageCount || 0), 0);
    const avgUsagePerTag = totalTags > 0 ? totalUsage / totalTags : 0;
    
    const mostUsedTag = tags.reduce((prev, current) => 
      (prev.usageCount || 0) > (current.usageCount || 0) ? prev : current, 
      tags[0] || {}
    );

    return {
      totalTags,
      usedTags,
      unusedTags,
      totalUsage,
      avgUsagePerTag: Math.round(avgUsagePerTag * 10) / 10,
      mostUsedTag: mostUsedTag?.name || 'N/A',
      utilizationRate: Math.round((usedTags / totalTags) * 100),
    };
  } catch (error) {
    console.error('Error getting tag usage stats:', error);
    return {
      totalTags: 0,
      usedTags: 0,
      unusedTags: 0,
      totalUsage: 0,
      avgUsagePerTag: 0,
      mostUsedTag: 'N/A',
      utilizationRate: 0,
    };
  }
};

// ======================== TAG MANAGEMENT UTILITIES ========================

// Clean up unused tags
export const cleanupUnusedTags = async (dryRun = true) => {
  try {
    const tags = await fetchCourseTags();
    const unusedTags = tags.filter(tag => (tag.usageCount || 0) === 0);
    
    if (dryRun) {
      return {
        wouldDelete: unusedTags.length,
        tags: unusedTags.map(tag => ({ id: tag.id, name: tag.name })),
      };
    }
    
    const deleteResults = await deleteTagsBatch(unusedTags.map(tag => tag.id));
    
    return {
      deleted: deleteResults.successCount,
      failed: deleteResults.errorCount,
      errors: deleteResults.errors,
    };
  } catch (error) {
    console.error('Error cleaning up unused tags:', error);
    throw new Error("Failed to cleanup unused tags: " + error.message);
  }
};

// Merge duplicate tags
export const mergeDuplicateTags = async (dryRun = true) => {
  try {
    const tags = await fetchCourseTags();
    const duplicates = [];
    const seen = new Map();
    
    tags.forEach(tag => {
      const normalizedName = tag.name?.toLowerCase().trim();
      if (seen.has(normalizedName)) {
        duplicates.push({
          keep: seen.get(normalizedName),
          merge: tag,
        });
      } else {
        seen.set(normalizedName, tag);
      }
    });
    
    if (dryRun) {
      return {
        duplicatesFound: duplicates.length,
        duplicates: duplicates.map(dup => ({
          keep: { id: dup.keep.id, name: dup.keep.name },
          merge: { id: dup.merge.id, name: dup.merge.name },
        })),
      };
    }
    
    // In a real implementation, this would involve updating course references
    // and then deleting the duplicate tags
    const mergeResults = {
      merged: 0,
      failed: 0,
      errors: [],
    };
    
    for (const duplicate of duplicates) {
      try {
        // TODO: Update all courses using duplicate.merge.id to use duplicate.keep.id
        // await updateCourseTagReferences(duplicate.merge.id, duplicate.keep.id);
        
        await deleteCourseTag(duplicate.merge.id);
        mergeResults.merged++;
      } catch (error) {
        mergeResults.failed++;
        mergeResults.errors.push(`Failed to merge tag ${duplicate.merge.name}: ${error.message}`);
      }
    }
    
    return mergeResults;
  } catch (error) {
    console.error('Error merging duplicate tags:', error);
    throw new Error("Failed to merge duplicate tags: " + error.message);
  }
};

// ======================== DEFAULT EXPORT ========================

// Default function for backward compatibility
export const fetchCourseTag = fetchCourseTags;

export default {
  // Core operations
  fetchCourseTags,
  fetchCourseTagById,
  createCourseTag,
  updateCourseTag,
  deleteCourseTag,
  
  // Validation
  validateTagData,
  
  // Helper functions
  formatTagForDisplay,
  generateTagSlug,
  generateTagColor,
  sortTags,
  filterTags,
  findTagsByName,
  checkTagNameExists,
  getPopularTags,
  getTagSuggestions,
  
  // Tag cloud
  generateTagCloudData,
  
  // Batch operations
  createTagsBatch,
  deleteTagsBatch,
  
  // Analytics
  getTagUsageStats,
  
  // Management utilities
  cleanupUnusedTags,
  mergeDuplicateTags,
  
  // Backward compatibility
  fetchCourseTag,
};