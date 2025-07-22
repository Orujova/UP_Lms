import axios from 'axios';
import { getToken, getUserId } from '@/authtoken/auth.js';

const API_URL = 'https://bravoadmin.uplms.org/api/';

const getHeaders = () => {
  const token = getToken();
  return {
    accept: '*/*',
    Authorization: `Bearer ${token}`,
  };
};

// ======================== CLUSTER ENDPOINTS ========================

// Fetch all clusters with pagination and search
export const fetchClusters = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("Page", params.page);
    if (params.take) queryParams.append("ShowMore.Take", params.take);
    if (params.search) queryParams.append("Search", params.search);
    if (params.orderBy) queryParams.append("OrderBy", params.orderBy);

    const url = `${API_URL}Cluster${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const response = await axios.get(url, {
      headers: getHeaders(),
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching clusters:', error);
    throw new Error("Failed to fetch clusters: " + (error.response?.data?.detail || error.message));
  }
};

// Fetch single cluster by ID with user ID
export const fetchClusterById = async (clusterId, userId = null) => {
  try {
    const userIdParam = userId || getUserId();
    const response = await axios.get(`${API_URL}Cluster/${clusterId}`, {
      params: userIdParam ? { userid: userIdParam } : {},
      headers: getHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching cluster:', error);
    throw new Error("Failed to fetch cluster: " + (error.response?.data?.detail || error.message));
  }
};

// Create new cluster - multipart/form-data format based on API docs
export const createCluster = async (clusterData) => {
  try {
    const formData = new FormData();

    // Required fields
    formData.append("UserId", (clusterData.userId || getUserId()).toString());
    formData.append("Subject", clusterData.subject || "");
    formData.append("Description", clusterData.description || "");

    // Image file
    if (clusterData.imageFile && clusterData.imageFile instanceof File) {
      formData.append("ImageFile", clusterData.imageFile);
    }

    // Target groups
    if (clusterData.targetGroupIds && Array.isArray(clusterData.targetGroupIds)) {
      clusterData.targetGroupIds.forEach((id) => {
        formData.append("TargetGroupIds", id.toString());
      });
    }

    // Boolean fields
    formData.append("HasNotification", (clusterData.hasNotification || false).toString());
    formData.append("Paralel", (clusterData.paralel || false).toString()); // API uses "Paralel" not "Parallel"
    formData.append("Orderly", (clusterData.orderly || false).toString());

    // Courses - complex object array
    if (clusterData.courses && Array.isArray(clusterData.courses)) {
      clusterData.courses.forEach((course, index) => {
        formData.append(`Courses[${index}].CourseId`, course.courseId.toString());
        formData.append(`Courses[${index}].IsMandatory`, (course.isMandatory || false).toString());
        formData.append(`Courses[${index}].OrderNumber`, (course.orderNumber || index + 1).toString());
        formData.append(`Courses[${index}].Coefficient`, (course.coefficient || 0).toString());
      });
    }

    const response = await axios.post(`${API_URL}Cluster`, formData, {
      headers: {
        ...getHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error creating cluster:', error);
    throw new Error("Failed to create cluster: " + (error.response?.data?.detail || error.message));
  }
};

// Update cluster - multipart/form-data format
export const updateCluster = async (clusterData) => {
  try {
    const formData = new FormData();
    
    // Required fields
    if (clusterData.clusterId) {
      formData.append("ClusterId", clusterData.clusterId.toString());
    }
    
    if (clusterData.userId) {
      formData.append("UserId", clusterData.userId.toString());
    }
    
    if (clusterData.subject) {
      formData.append("Subject", clusterData.subject);
    }
    
    if (clusterData.description) {
      formData.append("Description", clusterData.description);
    }

    // Image file
    if (clusterData.imageFile && clusterData.imageFile instanceof File) {
      formData.append("ImageFile", clusterData.imageFile);
    }

    // Target groups
    if (clusterData.targetGroupIds && Array.isArray(clusterData.targetGroupIds)) {
      clusterData.targetGroupIds.forEach((id) => {
        formData.append("TargetGroupIds", id.toString());
      });
    }

    // Boolean fields
    if (clusterData.hasNotification !== undefined) {
      formData.append("HasNotification", clusterData.hasNotification.toString());
    }
    
    if (clusterData.paralel !== undefined) {
      formData.append("Paralel", clusterData.paralel.toString());
    }
    
    if (clusterData.orderly !== undefined) {
      formData.append("Orderly", clusterData.orderly.toString());
    }

    // Courses
    if (clusterData.courses && Array.isArray(clusterData.courses)) {
      clusterData.courses.forEach((course, index) => {
        formData.append(`Courses[${index}].CourseId`, course.courseId.toString());
        formData.append(`Courses[${index}].IsMandatory`, (course.isMandatory || false).toString());
        formData.append(`Courses[${index}].OrderNumber`, (course.orderNumber || index + 1).toString());
        formData.append(`Courses[${index}].Coefficient`, (course.coefficient || 0).toString());
      });
    }

    const response = await axios.put(`${API_URL}Cluster`, formData, {
      headers: {
        ...getHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error updating cluster:', error);
    throw new Error("Failed to update cluster: " + (error.response?.data?.detail || error.message));
  }
};

// Delete cluster - path parameter
export const deleteCluster = async (clusterId) => {
  try {
    const response = await axios.delete(`${API_URL}Cluster/${clusterId}`, {
      headers: getHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting cluster:', error);
    throw new Error("Failed to delete cluster: " + (error.response?.data?.detail || error.message));
  }
};

// Assign courses to cluster
export const assignCoursesToCluster = async (assignmentData) => {
  try {
    const payload = {
      clusterId: assignmentData.clusterId,
      userId: assignmentData.userId || getUserId(),
      courses: (assignmentData.courses || []).map(course => ({
        courseId: course.courseId,
        isMandatory: course.isMandatory || false,
        orderNumber: course.orderNumber || 0,
        coefficient: course.coefficient || 0,
      })),
    };

    const response = await axios.put(
      `${API_URL}Cluster/AssignCoursesToCluster`,
      payload,
      {
        headers: {
          ...getHeaders(),
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error assigning courses to cluster:', error);
    throw new Error("Failed to assign courses to cluster: " + (error.response?.data?.detail || error.message));
  }
};

// ======================== VALIDATION HELPERS ========================

// Validate cluster data
export const validateClusterData = (clusterData) => {
  const errors = [];

  if (!clusterData.subject || !clusterData.subject.trim()) {
    errors.push("Cluster subject is required");
  }

  if (!clusterData.description || !clusterData.description.trim()) {
    errors.push("Cluster description is required");
  }

  if (!clusterData.targetGroupIds || clusterData.targetGroupIds.length === 0) {
    errors.push("At least one target group is required");
  }

  if (clusterData.courses && clusterData.courses.length > 0) {
    clusterData.courses.forEach((course, index) => {
      if (!course.courseId) {
        errors.push(`Course ${index + 1}: Course ID is required`);
      }
      
      if (course.coefficient < 0 || course.coefficient > 100) {
        errors.push(`Course ${index + 1}: Coefficient must be between 0 and 100`);
      }
    });

    // Check if coefficient sum equals 100 for parallel clusters
    if (clusterData.paralel) {
      const totalCoefficient = clusterData.courses.reduce((sum, course) => sum + (course.coefficient || 0), 0);
      if (totalCoefficient !== 100) {
        errors.push("Total coefficient must equal 100% for parallel clusters");
      }
    }
  }

  return errors;
};

// Validate course assignment data
export const validateCourseAssignmentData = (assignmentData) => {
  const errors = [];

  if (!assignmentData.clusterId) {
    errors.push("Cluster ID is required");
  }

  if (!assignmentData.courses || assignmentData.courses.length === 0) {
    errors.push("At least one course is required");
  }

  if (assignmentData.courses) {
    assignmentData.courses.forEach((course, index) => {
      if (!course.courseId) {
        errors.push(`Course ${index + 1}: Course ID is required`);
      }
      
      if (course.coefficient < 0 || course.coefficient > 100) {
        errors.push(`Course ${index + 1}: Coefficient must be between 0 and 100`);
      }
      
      if (course.orderNumber < 1) {
        errors.push(`Course ${index + 1}: Order number must be at least 1`);
      }
    });
  }

  return errors;
};

// ======================== HELPER FUNCTIONS ========================

// Get cluster statistics
export const getClusterStatistics = (cluster) => {
  if (!cluster) return null;

  const stats = {
    totalCourses: cluster.courses?.length || 0,
    mandatoryCourses: cluster.courses?.filter(c => c.isMandatory).length || 0,
    totalLearners: cluster.topAssignedUsers?.length || 0,
    targetGroups: cluster.targetGroups?.length || 0,
    averageCoefficient: 0,
    totalDuration: 0,
    isParallel: cluster.paralel,
    isOrderly: cluster.orderly,
  };

  if (cluster.courses && cluster.courses.length > 0) {
    const totalCoefficient = cluster.courses.reduce((sum, course) => sum + (course.coefficient || 0), 0);
    stats.averageCoefficient = Math.round(totalCoefficient / cluster.courses.length);
    
    // Estimate total duration based on course count (assuming average 60 minutes per course)
    stats.totalDuration = cluster.courses.length * 60;
  }

  return stats;
};

// Format cluster for display
export const formatClusterForDisplay = (cluster) => {
  if (!cluster) return null;

  return {
    ...cluster,
    formattedCreatedDate: new Date(cluster.createdDate).toLocaleDateString(),
    isParallel: cluster.paralel, // Fix the typo in API
    isOrderly: cluster.orderly,
    statistics: getClusterStatistics(cluster),
    imageUrl: cluster.imageUrl || null,
    coursesCount: cluster.courses?.length || 0,
    learnersCount: cluster.topAssignedUsers?.length || 0,
  };
};

// Get cluster type based on settings
export const getClusterType = (cluster) => {
  if (!cluster) return 'unknown';
  
  if (cluster.paralel && cluster.orderly) {
    return 'mixed'; // Both parallel and ordered
  } else if (cluster.paralel) {
    return 'parallel';
  } else if (cluster.orderly) {
    return 'sequential';
  }
  
  return 'flexible';
};

// Calculate cluster completion requirements
export const getClusterCompletionRequirements = (cluster) => {
  if (!cluster || !cluster.courses) {
    return { required: 0, optional: 0, total: 0 };
  }

  const mandatory = cluster.courses.filter(c => c.isMandatory);
  const optional = cluster.courses.filter(c => !c.isMandatory);

  return {
    required: mandatory.length,
    optional: optional.length,
    total: cluster.courses.length,
    mandatoryCoefficient: mandatory.reduce((sum, c) => sum + (c.coefficient || 0), 0),
    optionalCoefficient: optional.reduce((sum, c) => sum + (c.coefficient || 0), 0),
  };
};

// Sort clusters by different criteria
export const sortClusters = (clusters, sortBy = 'createdDate', order = 'desc') => {
  if (!Array.isArray(clusters)) return [];

  return [...clusters].sort((a, b) => {
    let valueA, valueB;

    switch (sortBy) {
      case 'subject':
        valueA = a.subject?.toLowerCase() || '';
        valueB = b.subject?.toLowerCase() || '';
        break;
      case 'createdDate':
        valueA = new Date(a.createdDate);
        valueB = new Date(b.createdDate);
        break;
      case 'coursesCount':
        valueA = a.courses?.length || 0;
        valueB = b.courses?.length || 0;
        break;
      case 'learnersCount':
        valueA = a.topAssignedUsers?.length || 0;
        valueB = b.topAssignedUsers?.length || 0;
        break;
      default:
        valueA = a.id;
        valueB = b.id;
    }

    if (order === 'asc') {
      return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
    } else {
      return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
    }
  });
};

// Filter clusters by criteria
export const filterClusters = (clusters, filters = {}) => {
  if (!Array.isArray(clusters)) return [];

  return clusters.filter(cluster => {
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const matchesSearch = 
        cluster.subject?.toLowerCase().includes(searchTerm) ||
        cluster.description?.toLowerCase().includes(searchTerm) ||
        cluster.targetGroups?.some(group => group.toLowerCase().includes(searchTerm));
      
      if (!matchesSearch) return false;
    }

    // Type filter
    if (filters.type) {
      const clusterType = getClusterType(cluster);
      if (clusterType !== filters.type) return false;
    }

    // Course count filter
    if (filters.minCourses && (cluster.courses?.length || 0) < filters.minCourses) {
      return false;
    }

    if (filters.maxCourses && (cluster.courses?.length || 0) > filters.maxCourses) {
      return false;
    }

    // Target group filter
    if (filters.targetGroupId) {
      if (!cluster.targetGroupIds?.includes(filters.targetGroupId)) {
        return false;
      }
    }

    return true;
  });
};

export default {
  // Core operations
  fetchClusters,
  fetchClusterById,
  createCluster,
  updateCluster,
  deleteCluster,
  assignCoursesToCluster,
  
  // Validation
  validateClusterData,
  validateCourseAssignmentData,
  
  // Helper functions
  getClusterStatistics,
  formatClusterForDisplay,
  getClusterType,
  getClusterCompletionRequirements,
  sortClusters,
  filterClusters,
};