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

// ======================== CERTIFICATE ENDPOINTS ========================

// Fetch all certificates with pagination
export const fetchCertificates = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("Page", params.page);
    if (params.take) queryParams.append("ShowMore.Take", params.take);

    const url = `${API_URL}Certificate${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const response = await axios.get(url, {
      headers: getHeaders(),
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching certificates:', error);
    throw new Error("Failed to fetch certificates: " + (error.response?.data?.detail || error.message));
  }
};

// Fetch single certificate by ID
export const fetchCertificateById = async (certificateId) => {
  try {
    const response = await axios.get(`${API_URL}Certificate/id`, {
      params: { id: parseInt(certificateId) },
      headers: getHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching certificate:', error);
    throw new Error("Failed to fetch certificate: " + (error.response?.data?.detail || error.message));
  }
};

// Create new certificate
export const createCertificate = async (certificateData) => {
  try {
    const formData = new FormData();
    
    // Required fields
    formData.append("Name", certificateData.name || "");
    formData.append("CertificateTypeId", (certificateData.certificateTypeId || "").toString());
    
    // Template file
    if (certificateData.templateFile && certificateData.templateFile instanceof File) {
      formData.append("TemplateFile", certificateData.templateFile);
    }

    const response = await axios.post(`${API_URL}Certificate`, formData, {
      headers: {
        ...getHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error creating certificate:', error);
    throw new Error("Failed to create certificate: " + (error.response?.data?.detail || error.message));
  }
};

// Update certificate
export const updateCertificate = async (certificateData) => {
  try {
    const formData = new FormData();
    
    // Required fields for update
    formData.append("Id", certificateData.id.toString());
    formData.append("Name", certificateData.name || "");
    formData.append("CertificateTypeId", (certificateData.certificateTypeId || "").toString());
    
    // Template file (optional for update)
    if (certificateData.templateFile && certificateData.templateFile instanceof File) {
      formData.append("TemplateFile", certificateData.templateFile);
    }

    const response = await axios.put(`${API_URL}Certificate`, formData, {
      headers: {
        ...getHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error updating certificate:', error);
    throw new Error("Failed to update certificate: " + (error.response?.data?.detail || error.message));
  }
};

// Delete certificate
export const deleteCertificate = async (certificateId) => {
  try {
    const payload = {
      id: parseInt(certificateId),
    };

    const response = await axios.delete(`${API_URL}Certificate`, {
      data: payload,
      headers: {
        ...getHeaders(),
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error deleting certificate:', error);
    throw new Error("Failed to delete certificate: " + (error.response?.data?.detail || error.message));
  }
};

// ======================== CERTIFICATE TYPE ENDPOINTS ========================

// Fetch all certificate types
export const fetchCertificateTypes = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("Page", params.page);
    if (params.take) queryParams.append("ShowMore.Take", params.take);

    const url = `${API_URL}CertificateType${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const response = await axios.get(url, {
      headers: getHeaders(),
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching certificate types:', error);
    throw new Error("Failed to fetch certificate types: " + (error.response?.data?.detail || error.message));
  }
};

// Fetch single certificate type by ID
export const fetchCertificateTypeById = async (typeId) => {
  try {
    const response = await axios.get(`${API_URL}CertificateType/id`, {
      params: { id: parseInt(typeId) },
      headers: getHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching certificate type:', error);
    throw new Error("Failed to fetch certificate type: " + (error.response?.data?.detail || error.message));
  }
};

// Create new certificate type
export const createCertificateType = async (typeData) => {
  try {
    const payload = {
      name: typeData.name || "",
    };

    const response = await axios.post(`${API_URL}CertificateType`, payload, {
      headers: {
        ...getHeaders(),
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error creating certificate type:', error);
    throw new Error("Failed to create certificate type: " + (error.response?.data?.detail || error.message));
  }
};

// Update certificate type
export const updateCertificateType = async (typeData) => {
  try {
    const payload = {
      id: typeData.id,
      name: typeData.name || "",
    };

    const response = await axios.put(`${API_URL}CertificateType`, payload, {
      headers: {
        ...getHeaders(),
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error updating certificate type:', error);
    throw new Error("Failed to update certificate type: " + (error.response?.data?.detail || error.message));
  }
};

// Delete certificate type
export const deleteCertificateType = async (typeId) => {
  try {
    const payload = {
      id: parseInt(typeId),
    };

    const response = await axios.delete(`${API_URL}CertificateType`, {
      data: payload,
      headers: {
        ...getHeaders(),
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error deleting certificate type:', error);
    throw new Error("Failed to delete certificate type: " + (error.response?.data?.detail || error.message));
  }
};

// Get certificates by certificate type ID
export const getCertificatesByCertificateTypeId = async (certificateTypeId) => {
  try {
    const response = await axios.get(`${API_URL}CertificateType/GetCertificateByCertificateTypeId`, {
      params: { CertificateTypeId: parseInt(certificateTypeId) },
      headers: getHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching certificates by type:', error);
    // API-də problem olduğuna görə, empty array qaytarırıq
    if (error.response?.status === 500) {
      console.warn('GetCertificateByCertificateTypeId endpoint has issues, returning empty array');
      return [];
    }
    throw new Error("Failed to fetch certificates by type: " + (error.response?.data?.detail || error.message));
  }
};

// ======================== VALIDATION HELPERS ========================

// Validate certificate data
export const validateCertificateData = (certificateData) => {
  const errors = [];

  if (!certificateData.name || !certificateData.name.trim()) {
    errors.push("Certificate name is required");
  }

  if (!certificateData.certificateTypeId) {
    errors.push("Certificate type is required");
  }

  if (certificateData.name && certificateData.name.length > 100) {
    errors.push("Certificate name must be less than 100 characters");
  }

  return errors;
};

// Validate certificate type data
export const validateCertificateTypeData = (typeData) => {
  const errors = [];

  if (!typeData.name || !typeData.name.trim()) {
    errors.push("Certificate type name is required");
  }

  if (typeData.name && typeData.name.length > 50) {
    errors.push("Certificate type name must be less than 50 characters");
  }

  return errors;
};

// ======================== HELPER FUNCTIONS ========================

// Get certificate status
export const getCertificateStatus = (certificate) => {
  if (!certificate) return 'unknown';
  
  if (certificate.templateFilePath) {
    return 'active';
  }
  
  return 'draft';
};

// Format certificate for display
export const formatCertificateForDisplay = (certificate) => {
  if (!certificate) return null;

  return {
    ...certificate,
    status: getCertificateStatus(certificate),
    hasTemplate: Boolean(certificate.templateFilePath),
    templateUrl: certificate.templateFilePath || null,
    formattedName: certificate.name || 'Unnamed Certificate',
  };
};

// Get certificate type statistics
export const getCertificateTypeStats = async (typeId) => {
  try {
    const certificates = await getCertificatesByCertificateTypeId(typeId);
    return {
      total: certificates.length,
      active: certificates.filter(cert => cert.templateFilePath).length,
      draft: certificates.filter(cert => !cert.templateFilePath).length,
    };
  } catch (error) {
    console.warn('Could not fetch certificate type stats:', error.message);
    return { total: 0, active: 0, draft: 0 };
  }
};

export default {
  // Certificate operations
  fetchCertificates,
  fetchCertificateById,
  createCertificate,
  updateCertificate,
  deleteCertificate,
  
  // Certificate type operations
  fetchCertificateTypes,
  fetchCertificateTypeById,
  createCertificateType,
  updateCertificateType,
  deleteCertificateType,
  getCertificatesByCertificateTypeId,
  
  // Validation
  validateCertificateData,
  validateCertificateTypeData,
  
  // Helpers
  getCertificateStatus,
  formatCertificateForDisplay,
  getCertificateTypeStats,
};