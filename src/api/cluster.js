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

// Create new cluster
export const createCluster = async (clusterData) => {
  try {
    const payload = {
      userId: clusterData.userId || getUserId(),
      subject: clusterData.subject || "",
      description: clusterData.description || "",
      imageFile: clusterData.imageFile || "", // Base64 string
      targetGroupIds: clusterData.targetGroupIds || [],
      hasNotification: clusterData.hasNotification || false,
      paralel: clusterData.paralel || false, // API documentation uses "paralel"
      orderly: clusterData.orderly || false,
      courses: (clusterData.courses || []).map(course => ({
        courseId: course.courseId,
        isMandatory: course.isMandatory || false,
        orderNumber: course.orderNumber || 0,
        coefficient: course.coefficient || 0,
      })),
    };

    const response = await axios.post(`${API_URL}Cluster`, payload, {
      headers: {
        ...getHeaders(),
        'Content-Type': 'application/json',
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
        formData.append(`Courses[${index}].courseId`, course.courseId.toString());
        formData.append(`Courses[${index}].isMandatory`, course.isMandatory.toString());
        formData.append(`Courses[${index}].orderNumber`, course.orderNumber.toString());
        formData.append(`Courses[${index}].coefficient`, course.coefficient.toString());
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
  };

  if (cluster.courses && cluster.courses.length > 0) {
    const totalCoefficient = cluster.courses.reduce((sum, course) => sum + (course.coefficient || 0), 0);
    stats.averageCoefficient = Math.round(totalCoefficient / cluster.courses.length);
    
    // Estimate total duration based on course count
    stats.totalDuration = cluster.courses.length * 60; // Assume 60 minutes per course average
  }

  return stats;
};

// Helper function to format cluster for display
export const formatClusterForDisplay = (cluster) => {
  if (!cluster) return null;

  return {
    ...cluster,
    formattedCreatedDate: new Date(cluster.createdDate).toLocaleDateString(),
    isParallel: cluster.paralel, // Fix the typo in API
    isOrderly: cluster.orderly,
    statistics: getClusterStatistics(cluster),
  };
};