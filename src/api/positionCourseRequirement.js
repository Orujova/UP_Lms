// src/api/positionCourseRequirement.js
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

// ======================== POSITION COURSE REQUIREMENT ENDPOINTS ========================

// Get distinct course names
export const fetchDistinctCourseNames = async (language = 'az') => {
  try {
    const response = await axios.get(`${API_URL}PositionCourseRequirement/GetDistinctCourseNames`, {
      params: { Language: language },
      headers: getHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching distinct course names:', error);
    throw new Error("Failed to fetch course names: " + (error.response?.data?.detail || error.message));
  }
};

// Fetch all position course requirements with filters
export const fetchPositionCourseRequirements = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append("Page", params.page);
    if (params.take) queryParams.append("ShowMore.Take", params.take);
    if (params.language) queryParams.append("Language", params.language);
    
    // Array parameters
    if (params.positionIds && params.positionIds.length > 0) {
      params.positionIds.forEach(id => queryParams.append("PositionIds", id));
    }
    if (params.functionalAreaIds && params.functionalAreaIds.length > 0) {
      params.functionalAreaIds.forEach(id => queryParams.append("FunctionalAreaIds", id));
    }
    if (params.courseNames && params.courseNames.length > 0) {
      params.courseNames.forEach(name => queryParams.append("CourseNames", name));
    }

    const url = `${API_URL}PositionCourseRequirement${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const response = await axios.get(url, {
      headers: getHeaders(),
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching position course requirements:', error);
    throw new Error("Failed to fetch position course requirements: " + (error.response?.data?.detail || error.message));
  }
};

// Fetch single position course requirement by ID
export const fetchPositionCourseRequirementById = async (id, language = 'az') => {
  try {
    const response = await axios.get(`${API_URL}PositionCourseRequirement/GetById`, {
      params: { 
        Id: parseInt(id),
        Language: language 
      },
      headers: getHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching position course requirement:', error);
    throw new Error("Failed to fetch position course requirement: " + (error.response?.data?.detail || error.message));
  }
};

// Create new position course requirement
export const createPositionCourseRequirement = async (data) => {
  try {
    const payload = {
      positionFunctionalAreaPairs: data.positionFunctionalAreaPairs || [],
      courseName: data.courseName || "",
      language: data.language || "az"
    };

    const response = await axios.post(`${API_URL}PositionCourseRequirement`, payload, {
      headers: {
        ...getHeaders(),
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error creating position course requirement:', error);
    throw new Error("Failed to create position course requirement: " + (error.response?.data?.detail || error.message));
  }
};

// Update position course requirement (only position and functional area)
export const updatePositionCourseRequirement = async (data) => {
  try {
    const payload = {
      id: parseInt(data.id),
      newPositionId: parseInt(data.newPositionId),
      newFunctionalAreaId: parseInt(data.newFunctionalAreaId),
      language: data.language || "az"
    };

    const response = await axios.put(`${API_URL}PositionCourseRequirement`, payload, {
      headers: {
        ...getHeaders(),
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error updating position course requirement:', error);
    throw new Error("Failed to update position course requirement: " + (error.response?.data?.detail || error.message));
  }
};

// Delete position course requirements (bulk delete)
export const deletePositionCourseRequirements = async (ids, language = 'az') => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append("Language", language);
    
    // Add multiple IDs as array
    ids.forEach(id => queryParams.append("Ids", parseInt(id)));

    const response = await axios.delete(`${API_URL}PositionCourseRequirement?${queryParams.toString()}`, {
      headers: getHeaders()
    });

    return response.data;
  } catch (error) {
    console.error('Error deleting position course requirements:', error);
    throw new Error("Failed to delete position course requirements: " + (error.response?.data?.detail || error.message));
  }
};

// Upload Excel file for training matrix
export const uploadTrainingMatrixExcel = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(
      `${API_URL}PositionCourseRequirement/trainingmatriximportexceldata`,
      formData,
      {
        headers: {
          ...getHeaders(),
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error uploading training matrix excel:', error);
    throw new Error("Failed to upload training matrix excel: " + (error.response?.data?.detail || error.message));
  }
};

// Download template Excel file
export const downloadTemplateExcel = () => {
  // Template file path - adjust according to your project structure
  const templatePath = '/templates/BGS_təlimlər.xlsx';
  const link = document.createElement('a');
  link.href = templatePath;
  link.download = 'BGS_təlimlər.xlsx';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Helper function to format data for display
export const formatRequirementForDisplay = (requirement) => {
  if (!requirement) return null;
  
  return {
    ...requirement,
    displayName: `${requirement.positionName} - ${requirement.functionalAreaName} - ${requirement.courseName}`
  };
};

// Helper function to group requirements by course
export const groupRequirementsByCourse = (requirements) => {
  if (!requirements || !Array.isArray(requirements)) return {};
  
  return requirements.reduce((acc, req) => {
    const courseName = req.courseName || 'Unknown';
    if (!acc[courseName]) {
      acc[courseName] = [];
    }
    acc[courseName].push(req);
    return acc;
  }, {});
};

// Helper function to group requirements by position
export const groupRequirementsByPosition = (requirements) => {
  if (!requirements || !Array.isArray(requirements)) return {};
  
  return requirements.reduce((acc, req) => {
    const positionName = req.positionName || 'Unknown';
    if (!acc[positionName]) {
      acc[positionName] = [];
    }
    acc[positionName].push(req);
    return acc;
  }, {});
};

export default {
  fetchPositionCourseRequirements,
  fetchPositionCourseRequirementById,
  createPositionCourseRequirement,
  updatePositionCourseRequirement,
  deletePositionCourseRequirements,
  uploadTrainingMatrixExcel,
  downloadTemplateExcel,
  formatRequirementForDisplay,
  groupRequirementsByCourse,
  groupRequirementsByPosition
};