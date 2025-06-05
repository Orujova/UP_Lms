import axios from "axios";
import { getToken, getUserId } from "@/authtoken/auth.js";

const API_URL = "https://bravoadmin.uplms.org/api/";

const getHeaders = () => {
  const token = getToken();
  return {
    accept: "*/*",
    Authorization: `Bearer ${token}`,
  };
};

// Fetch all courses with proper error handling
export const fetchCourses = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("Page", params.page);
    if (params.take) queryParams.append("ShowMore.Take", params.take);
    if (params.search) queryParams.append("Search", params.search);
    if (params.tagId) queryParams.append("TagId", params.tagId);
    if (params.hasCertificate !== undefined)
      queryParams.append("HasCertificate", params.hasCertificate);
    if (params.minDuration)
      queryParams.append("MinDuration", params.minDuration);
    if (params.maxDuration)
      queryParams.append("MaxDuration", params.maxDuration);
    if (params.orderBy) queryParams.append("OrderBy", params.orderBy);
    if (params.courseCategoryName)
      queryParams.append("CourseCategoryName", params.courseCategoryName);

    const url = `${API_URL}Course${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const response = await axios.get(url, {
      headers: getHeaders(),
    });

    // API'dən gələn cavabın strukturunu düzgün handle etmək
    const responseData = response.data;

    // Array və ya object olma vəziyyətini yoxlamaq
    if (Array.isArray(responseData) && responseData.length > 0) {
      if (responseData[0] && responseData[0].courses) {
        return {
          courses: responseData[0].courses,
          totalCourseCount: responseData[0].totalCourseCount || 0,
        };
      }
      // Əgər birbaşa courses array-i olarsa
      return {
        courses: responseData,
        totalCourseCount: responseData.length,
      };
    }

    return {
      courses: [],
      totalCourseCount: 0,
    };
  } catch (error) {
    console.error("Error fetching courses:", error);
    throw new Error("Failed to fetch courses: " + (error.response?.data?.message || error.message));
  }
};

// Fetch single course by ID with userid parameter
export const fetchCourseById = async (courseId) => {
  try {
    const userId =  getUserId();
  console.log(userId)
    const url = `${API_URL}Course/${courseId}?userid=${userId}`;
    
    const response = await axios.get(url, {
      headers: getHeaders(),
    });
    console.log(response.data)
    return response.data;
  } catch (error) {
    console.error("Error fetching course:", error);
    throw new Error("Failed to fetch course: " + (error.response?.data?.message || error.message));
  }
};

// Create new course using AddCourse endpoint
export const createCourse = async (courseData) => {
  try {
    const token = getToken();
    const userId = getUserId();

    if (!token) {
      throw new Error("Authentication token not found. Please login again.");
    }

    const formData = new FormData();

    // Required fields
    formData.append("Name", courseData.name || "");
    formData.append("Description", courseData.description || "");
    formData.append("Duration", (courseData.duration || 200).toString());
    formData.append("VerifiedCertificate", (courseData.verifiedCertificate || false).toString());
    formData.append("UserId", userId);
    formData.append("CategoryId", (courseData.categoryId || "").toString());

    // Optional image file
    if (courseData.imageFile && courseData.imageFile instanceof File) {
      formData.append("ImageFile", courseData.imageFile);
    }

    // Target Groups - API documentation göstərir ki, bu array olaraq göndərilməlidir
    if (courseData.targetGroupIds && Array.isArray(courseData.targetGroupIds)) {
      courseData.targetGroupIds.forEach((id) => {
        formData.append("TargetGroupIds", id.toString());
      });
    }

    // Certificate ID
    if (courseData.certificateId) {
      formData.append("CertificateId", courseData.certificateId.toString());
    }

    // Tags
    if (courseData.tagIds && Array.isArray(courseData.tagIds)) {
      courseData.tagIds.forEach((id) => {
        formData.append("TagIds", id.toString());
      });
    }

    // Succession Rates - API documentation göstərir ki, object array olaraq göndərilir
    if (courseData.successionRates && Array.isArray(courseData.successionRates)) {
      courseData.successionRates.forEach((rate, index) => {
        formData.append(`SuccessionRates[${index}].certificateId`, rate.certificateId.toString());
        formData.append(`SuccessionRates[${index}].minRange`, rate.minRange.toString());
        formData.append(`SuccessionRates[${index}].maxRange`, rate.maxRange.toString());
      });
    }

    // Optional timing fields
    if (courseData.startDuration) {
      formData.append("StartDuration", courseData.startDuration.toString());
    }

    if (courseData.deadline) {
      formData.append("DeadLine", courseData.deadline.toString()); // API-də DeadLine yazılıb, deadline deyil
    }

    if (courseData.autoReassign !== undefined) {
      formData.append("AutoReassign", courseData.autoReassign.toString());
    }

    // Cluster related fields - API documentation-da bu sahələr var
    if (courseData.clusterId) {
      formData.append("ClusterId", courseData.clusterId.toString());
      if (courseData.clusterOrderNumber) {
        formData.append("ClusterOrderNumber", courseData.clusterOrderNumber.toString());
      }
      if (courseData.clusterCoefficient) {
        formData.append("ClusterCoefficient", courseData.clusterCoefficient.toString());
      }
      if (courseData.clusterIsMandatory !== undefined) {
        formData.append("ClusterIsMandatory", courseData.clusterIsMandatory.toString());
      }
    }

    const response = await axios.post(`${API_URL}Course/AddCourse`, formData, {
      headers: {
        ...getHeaders(),
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error creating course:", error);
    throw new Error("Failed to create course: " + (error.response?.data?.detail || error.message));
  }
};

// Update course using UpdateCourse endpoint
export const updateCourse = async (courseData) => {
  try {
    const formData = new FormData();

    // Required ID for update
    if (courseData.id) {
      formData.append("Id", courseData.id.toString());
    }

    // Same fields as create but with ID
    if (courseData.name) formData.append("Name", courseData.name);
    if (courseData.description) formData.append("Description", courseData.description);
    if (courseData.duration) formData.append("Duration", courseData.duration.toString());
    if (courseData.verifiedCertificate !== undefined) {
      formData.append("VerifiedCertificate", courseData.verifiedCertificate.toString());
    }
    
    if (courseData.imageFile && courseData.imageFile instanceof File) {
      formData.append("ImageFile", courseData.imageFile);
    }

    if (courseData.certificateId) {
      formData.append("CertificateId", courseData.certificateId.toString());
    }

    if (courseData.categoryId) {
      formData.append("CategoryId", courseData.categoryId.toString());
    }

    // Arrays
    if (courseData.tagIds && Array.isArray(courseData.tagIds)) {
      courseData.tagIds.forEach((id) => {
        formData.append("TagIds", id.toString());
      });
    }

    if (courseData.targetGroupIds && Array.isArray(courseData.targetGroupIds)) {
      courseData.targetGroupIds.forEach((id) => {
        formData.append("TargetGroupIds", id.toString());
      });
    }

    if (courseData.successionRates && Array.isArray(courseData.successionRates)) {
      courseData.successionRates.forEach((rate, index) => {
        formData.append(`SuccessionRates[${index}].certificateId`, rate.certificateId.toString());
        formData.append(`SuccessionRates[${index}].minRange`, rate.minRange.toString());
        formData.append(`SuccessionRates[${index}].maxRange`, rate.maxRange.toString());
      });
    }

    // Optional fields
    if (courseData.startDuration) {
      formData.append("StartDuration", courseData.startDuration.toString());
    }

    if (courseData.deadline) {
      formData.append("DeadLine", courseData.deadline.toString());
    }

    if (courseData.autoReassign !== undefined) {
      formData.append("AutoReassign", courseData.autoReassign.toString());
    }

    if (courseData.publishCourse !== undefined) {
      formData.append("PublishCourse", courseData.publishCourse.toString());
    }

    if (courseData.hasEvalution !== undefined) {
      formData.append("HasEvalution", courseData.hasEvalution.toString());
    }

    if (courseData.userId) {
      formData.append("UserId", courseData.userId.toString());
    }

    // Cluster fields for update
    if (courseData.clusterId) {
      formData.append("ClusterId", courseData.clusterId.toString());
      if (courseData.clusterOrderNumber) {
        formData.append("ClusterOrderNumber", courseData.clusterOrderNumber.toString());
      }
      if (courseData.clusterCoefficient) {
        formData.append("ClusterCoefficient", courseData.clusterCoefficient.toString());
      }
      if (courseData.clusterIsMandatory !== undefined) {
        formData.append("ClusterIsMandatory", courseData.clusterIsMandatory.toString());
      }
    }

    const response = await axios.put(`${API_URL}Course/UpdateCourse`, formData, {
      headers: {
        ...getHeaders(),
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error updating course:", error);
    throw new Error("Failed to update course: " + (error.response?.data?.detail || error.message));
  }
};

// Delete course - API documentation göstərir ki, path parameter istifadə olunur
export const deleteCourse = async (courseId) => {
  try {
    const response = await axios.delete(`${API_URL}Course/${courseId}`, {
      headers: getHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting course:", error);
    throw new Error("Failed to delete course: " + (error.response?.data?.detail || error.message));
  }
};

// Publish course
export const publishCourse = async (courseId) => {
  try {
    const response = await axios.put(
      `${API_URL}Course/publish-course`,
      { courseId: parseInt(courseId) }, // Ensure courseId is a number
      {
        headers: {
          ...getHeaders(),
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error publishing course:", error);
    throw new Error("Failed to publish course: " + (error.response?.data?.detail || error.message));
  }
};

// Add section to course
export const addSection = async (sectionData) => {
  try {
    const formData = new FormData();
    formData.append("CourseId", sectionData.courseId.toString());
    formData.append("Description", sectionData.description || "");
    formData.append("Duration", (sectionData.duration || 0).toString());
    formData.append("HideSection", (sectionData.hideSection || false).toString());
    formData.append("Mandatory", (sectionData.mandatory || false).toString());

    const response = await axios.post(`${API_URL}Course/AddSection`, formData, {
      headers: {
        ...getHeaders(),
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error adding section:", error);
    throw new Error("Failed to add section: " + (error.response?.data?.detail || error.message));
  }
};

// Update section
export const updateSection = async (sectionData) => {
  try {
    const payload = {
      sectionId: sectionData.sectionId,
      courseId: sectionData.courseId,
      description: sectionData.description || "",
      duration: sectionData.duration || 0,
      hideSection: sectionData.hideSection || false,
      mandatory: sectionData.mandatory || false,
      courseContentIds: sectionData.courseContentIds || [],
    };

    const response = await axios.put(
      `${API_URL}Course/update-section`,
      payload,
      {
        headers: {
          ...getHeaders(),
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating section:", error);
    throw new Error("Failed to update section: " + (error.response?.data?.detail || error.message));
  }
};

// Delete section - path parameter istifadə olunur
export const deleteSection = async (sectionId) => {
  try {
    const response = await axios.delete(
      `${API_URL}Course/delete-section/${sectionId}`,
      {
        headers: getHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting section:", error);
    throw new Error("Failed to delete section: " + (error.response?.data?.detail || error.message));
  }
};

// Hide section
export const hideSection = async (sectionId) => {
  try {
    const response = await axios.post(
      `${API_URL}Course/hide-section`,
      { sectionId: parseInt(sectionId) },
      {
        headers: {
          ...getHeaders(),
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error hiding section:", error);
    throw new Error("Failed to hide section: " + (error.response?.data?.detail || error.message));
  }
};

// Update section duration
export const updateSectionDuration = async (sectionId, duration) => {
  try {
    const response = await axios.put(
      `${API_URL}Course/update-section-duration`,
      { 
        sectionId: parseInt(sectionId), 
        duration: parseInt(duration) 
      },
      {
        headers: {
          ...getHeaders(),
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating section duration:", error);
    throw new Error("Failed to update section duration: " + (error.response?.data?.detail || error.message));
  }
};

// Get course learners with pagination
export const getCourseLearners = async (courseId, page = 1, take = 10) => {
  try {
    const response = await axios.get(`${API_URL}Course/${courseId}/learners`, {
      params: { page, take },
      headers: getHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching course learners:", error);
    throw new Error("Failed to fetch course learners: " + (error.response?.data?.detail || error.message));
  }
};

// Assign users to course
export const assignUsersToCourse = async (assignmentData) => {
  try {
    const payload = {
      appUserIds: assignmentData.appUserIds || [],
      courseIds: assignmentData.courseIds || [],
    };

    const response = await axios.post(
      `${API_URL}Course/assign-users`,
      payload,
      {
        headers: {
          ...getHeaders(),
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error assigning users to course:", error);
    throw new Error("Failed to assign users: " + (error.response?.data?.detail || error.message));
  }
};

// Check if user is in target group
export const checkUserInTargetGroup = async (userId, targetGroupId) => {
  try {
    const response = await axios.get(
      `${API_URL}Course/check-user-in-target-group`,
      {
        params: { 
          UserId: parseInt(userId), 
          TargetGroupId: parseInt(targetGroupId) 
        },
        headers: getHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error checking user in target group:", error);
    throw new Error("Failed to check user in target group: " + (error.response?.data?.detail || error.message));
  }
};

// Create course evaluation
export const createCourseEvaluation = async (evaluationData) => {
  try {
    const payload = {
      appUserId: evaluationData.appUserId,
      courseId: evaluationData.courseId,
      contentRichnessRating: evaluationData.contentRichnessRating || 0,
      contentDesignRating: evaluationData.contentDesignRating || 0,
      topicRelevanceRating: evaluationData.topicRelevanceRating || 0,
      currentRequirementsResponseRating: evaluationData.currentRequirementsResponseRating || 0,
    };

    const response = await axios.post(
      `${API_URL}Course/create-evalution`,
      payload,
      {
        headers: {
          ...getHeaders(),
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating course evaluation:", error);
    throw new Error("Failed to create evaluation: " + (error.response?.data?.detail || error.message));
  }
};

// Assign courses to cluster
export const assignCoursesToCluster = async (clusterData) => {
  try {
    const payload = {
      clusterId: clusterData.clusterId,
      userId: clusterData.userId,
      courses: clusterData.courses || [],
    };

    const response = await axios.put(
      `${API_URL}Cluster/AssignCoursesToCluster`,
      payload,
      {
        headers: {
          ...getHeaders(),
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error assigning courses to cluster:", error);
    throw new Error("Failed to assign courses to cluster: " + (error.response?.data?.detail || error.message));
  }
};