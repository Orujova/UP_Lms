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

// ======================== IMAGE URL HELPER ========================

export const getImageUrl = (url) => {
  if (!url) return null;
  if (url.includes("https://100.42.179.27:7198/")) {
    return `https://bravoadmin.uplms.org/uploads/${url.replace(
      "https://100.42.179.27:7198/",
      ""
    )}`;
  }
  return url;
};

// ======================== COURSE ENDPOINTS ========================

// Fetch all courses (FIXED ORDER BY)
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
    if (params.courseCategoryName)
      queryParams.append("CourseCategoryName", params.courseCategoryName);

    // FIXED: Add proper orderBy parameter based on API documentation
    if (params.orderBy) {
      const orderByMap = {
        'nameasc': 'nameasc',
        'namedesc': 'namedesc',
        'dateasc': 'dateasc',
        'datedesc': 'datedesc',
        'durationasc': 'durationasc',
        'durationdesc': 'durationdesc'
      };
      queryParams.append("OrderBy", orderByMap[params.orderBy.toLowerCase()] || 'nameasc');
    }

    const url = `${API_URL}Course${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const response = await axios.get(url, {
      headers: getHeaders(),
    });

    const responseData = response.data;
    let courses = [];
    let totalCount = 0;

    if (Array.isArray(responseData) && responseData.length > 0) {
      if (responseData[0] && responseData[0].courses) {
        courses = responseData[0].courses;
        totalCount = responseData[0].totalCourseCount || courses.length;
      } else {
        courses = responseData;
        totalCount = courses.length;
      }
    }

    // Process image URLs
    const processedCourses = courses.map(course => ({
      ...course,
      imageUrl: getImageUrl(course.imageUrl),
      topAssignedUsers: course.topAssignedUsers?.map(user => ({
        ...user,
        profilePictureUrl: getImageUrl(user.profilePictureUrl)
      })) || []
    }));

    return {
      courses: processedCourses,
      totalCourseCount: totalCount,
    };
  } catch (error) {
    console.error("Error fetching courses:", error);
    throw new Error("Failed to fetch courses: " + (error.response?.data?.message || error.message));
  }
};

// Fetch single course by ID
export const fetchCourseById = async (courseId, userId = null) => {
  try {
    const userIdParam = userId || getUserId();
    const url = `${API_URL}Course/${courseId}${userIdParam ? `?userid=${userIdParam}` : ''}`;
    
    const response = await axios.get(url, {
      headers: getHeaders(),
    });

    const course = response.data;
    
    // Process the course data according to the actual API response structure
    return {
      ...course,
      imageUrl: getImageUrl(course.imageUrl),
      // Map sections with their contents
      sections: course.sections?.map(section => ({
        ...section,
        contents: section.contents?.map(content => ({
          ...content,
          // Process content data based on type
          contentString: content.data, // API returns data field as contentString
          quizzes: content.quizzes || []
        })) || []
      })) || []
    };
  } catch (error) {
    console.error("Error fetching course:", error);
    throw new Error("Failed to fetch course: " + (error.response?.data?.message || error.message));
  }
};

// Fixed createCourse function in course.js
export const createCourse = async (courseData) => {
  try {
    const token = getToken();
    const userId = getUserId();

    if (!token) {
      throw new Error("Authentication token not found. Please login again.");
    }

    console.log("Creating course with data:", courseData);

    const formData = new FormData();

    // Required fields - these MUST be provided
    formData.append("Name", courseData.name || "");
    formData.append("Description", courseData.description || "");
    formData.append("Duration", (courseData.duration || 60).toString());
    formData.append("CategoryId", (courseData.categoryId || "").toString());
    formData.append("UserId", (userId || "").toString());

    // Boolean fields - always include with explicit true/false
    formData.append("VerifiedCertificate", (courseData.verifiedCertificate || false).toString());
    formData.append("AutoReassign", (courseData.autoReassign || false).toString());
    formData.append("ClusterIsMandatory", (courseData.clusterIsMandatory || false).toString());

    // Optional integer fields - only add if they have valid values
    if (courseData.certificateId && courseData.certificateId !== null && courseData.certificateId !== "") {
      formData.append("CertificateId", courseData.certificateId.toString());
    }

    if (courseData.startDuration && courseData.startDuration !== null && courseData.startDuration !== "") {
      formData.append("StartDuration", courseData.startDuration.toString());
    }

    if (courseData.deadline && courseData.deadline !== null && courseData.deadline !== "") {
      formData.append("DeadLine", courseData.deadline.toString());
    }

    // Cluster settings - DÜZƏLDILMIŞ HISSƏ
    if (courseData.clusterId && courseData.clusterId !== null && courseData.clusterId !== "") {
      formData.append("ClusterId", courseData.clusterId.toString());
      
      // ClusterCoefficient - BURA ƏHƏMİYYƏTLİDİR: 0 dəyərini də daxil et
      if (courseData.clusterCoefficient !== null && courseData.clusterCoefficient !== undefined) {
        console.log('🔧 Adding ClusterCoefficient to FormData:', courseData.clusterCoefficient);
        formData.append("ClusterCoefficient", courseData.clusterCoefficient.toString());
      } else {
        // Əgər clusterId var amma coefficient yoxdursa, avtomatik 0 təyin et
        console.log('🔧 No coefficient provided for cluster, setting to 0');
        formData.append("ClusterCoefficient", "0");
      }
    }

    if (courseData.clusterOrderNumber && courseData.clusterOrderNumber !== null && courseData.clusterOrderNumber !== "") {
      formData.append("ClusterOrderNumber", courseData.clusterOrderNumber.toString());
    }

    // Image file - only add if provided
    if (courseData.imageFile && courseData.imageFile instanceof File) {
      formData.append("ImageFile", courseData.imageFile);
    }

    // Arrays - Target Groups (only add if array has items)
    if (courseData.targetGroupIds && Array.isArray(courseData.targetGroupIds) && courseData.targetGroupIds.length > 0) {
      courseData.targetGroupIds.forEach((id) => {
        if (id !== null && id !== undefined && id !== "") {
          formData.append("TargetGroupIds", id.toString());
        }
      });
    }

    // Arrays - Tags (only add if array has items)  
    if (courseData.tagIds && Array.isArray(courseData.tagIds) && courseData.tagIds.length > 0) {
      courseData.tagIds.forEach((id) => {
        if (id !== null && id !== undefined && id !== "") {
          formData.append("TagIds", id.toString());
        }
      });
    }

    if (courseData.successionRates && Array.isArray(courseData.successionRates) && courseData.successionRates.length > 0) {
  console.log('🔧 Processing SuccessionRates:', courseData.successionRates);
  
  // Her bir succession rate üçün JSON formatda göndər
  courseData.successionRates.forEach((rate, index) => {
    // Only add succession rates that have valid data
    if (rate.minRange !== null && rate.minRange !== undefined && 
        rate.maxRange !== null && rate.maxRange !== undefined) {
      
      // JSON obyekti yarad
      const rateObject = {
        minRange: parseInt(rate.minRange),
        maxRange: parseInt(rate.maxRange)
      };
      
      // Badge ID - yalnız valid olanları əlavə et
      if (rate.badgeId && rate.badgeId !== null && rate.badgeId !== undefined && 
          typeof rate.badgeId === 'number' && !isNaN(rate.badgeId)) {
        rateObject.badgeId = parseInt(rate.badgeId);
      }
      
      console.log(`🔧 Adding SuccessionRate[${index}]:`, rateObject);
      
      // JSON string kimi göndər - Swagger-də olduğu kimi
      formData.append(`SuccessionRates`, JSON.stringify(rateObject));
    }
  });
}

    // Debug: Log what we're sending
    console.log("FormData contents:");
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    const response = await axios.post(`${API_URL}Course/AddCourse`, formData, {
      headers: {
        ...getHeaders(),
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("Course created successfully:", response.data);

    // Handle API response - check if it's actually successful
    if (response.data && response.data.success === false) {
      // This is a business logic error, not a technical error
      throw new Error(response.data.message || "Course creation failed due to business rules");
    }

    return response.data;
  } catch (error) {
    console.error("Error creating course:", error);
    
    // Log more details about the error
    if (error.response) {
      console.error("Error response status:", error.response.status);
      console.error("Error response data:", error.response.data);
      console.error("Error response headers:", error.response.headers);
    }
    
    // Provide more specific error messages
    let errorMessage = "Failed to create course";
    
    if (error.message && error.message.includes("katsayısı")) {
      // Turkish cluster coefficient error
      errorMessage = "Cannot add course: Adding this course would exceed the cluster's maximum coefficient limit (100). Please reduce the coefficient or choose a different cluster.";
    } else if (error.response?.data?.detail) {
      errorMessage += ": " + error.response.data.detail;
    } else if (error.response?.data?.title) {
      errorMessage += ": " + error.response.data.title;
    } else if (error.response?.data?.message) {
      errorMessage += ": " + error.response.data.message;
    } else if (error.response?.status === 500) {
      errorMessage += ": Server error - please check your data and try again";
    } else {
      errorMessage += ": " + error.message;
    }
    
    throw new Error(errorMessage);
  }
};

// Update course using UpdateCourse endpoint - DÜZƏLDILMIŞ
export const updateCourse = async (courseData) => {
  try {
    const formData = new FormData();

    // Required for update
    if (courseData.id) {
      formData.append("Id", courseData.id.toString());
    }

    if (courseData.name) formData.append("Name", courseData.name);
    if (courseData.description) formData.append("Description", courseData.description);
    if (courseData.duration) formData.append("Duration", courseData.duration.toString());
    if (courseData.categoryId) formData.append("CategoryId", courseData.categoryId.toString());
    
    if (courseData.verifiedCertificate !== undefined) {
      formData.append("VerifiedCertificate", courseData.verifiedCertificate.toString());
    }
    
    if (courseData.imageFile && courseData.imageFile instanceof File) {
      formData.append("ImageFile", courseData.imageFile);
    }

    if (courseData.certificateId) {
      formData.append("CertificateId", courseData.certificateId.toString());
    }

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

    if (courseData.userId) {
      formData.append("UserId", courseData.userId.toString());
    }

    // Cluster settings - DÜZƏLDILMIŞ
    if (courseData.clusterId) {
      formData.append("ClusterId", courseData.clusterId.toString());
      
      // ClusterCoefficient - 0 dəyərini də daxil et
      if (courseData.clusterCoefficient !== null && courseData.clusterCoefficient !== undefined) {
        formData.append("ClusterCoefficient", courseData.clusterCoefficient.toString());
      }
    }

    if (courseData.clusterOrderNumber) {
      formData.append("ClusterOrderNumber", courseData.clusterOrderNumber.toString());
    }

    if (courseData.clusterIsMandatory !== undefined) {
      formData.append("ClusterIsMandatory", courseData.clusterIsMandatory.toString());
    }

    // FIXED: Succession rates - proper structure
    if (courseData.successionRates && Array.isArray(courseData.successionRates)) {
      courseData.successionRates.forEach((rate, index) => {
        formData.append(`SuccessionRates[${index}].MinRange`, (rate.minRange || 0).toString());
        formData.append(`SuccessionRates[${index}].MaxRange`, (rate.maxRange || 100).toString());
        if (rate.badgeId && rate.badgeId !== null) {
          formData.append(`SuccessionRates[${index}].BadgeId`, rate.badgeId.toString());
        }
      });
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
// Delete course
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
      { courseId: parseInt(courseId) },
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

// ======================== SECTION MANAGEMENT ========================

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
      courseContentIds: sectionData.courseContentIds || []
    };

    const response = await axios.put(`${API_URL}Course/update-section`, payload, {
      headers: {
        ...getHeaders(),
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error updating section:", error);
    throw new Error("Failed to update section: " + (error.response?.data?.detail || error.message));
  }
};

// Delete section
export const deleteSection = async (sectionId) => {
  try {
    const response = await axios.delete(`${API_URL}Course/delete-section/${sectionId}`, {
      headers: getHeaders(),
    });
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

// Get sections by course ID
export const getSectionsByCourseId = async (courseId) => {
  try {
    const response = await axios.get(`${API_URL}Course/by-course/getsections`, {
      params: { CourseId: parseInt(courseId) },
      headers: getHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching sections:", error);
    throw new Error("Failed to fetch sections: " + (error.response?.data?.detail || error.message));
  }
};

// Get course syllabus
export const getCourseSyllabus = async (courseId) => {
  try {
    const response = await axios.get(`${API_URL}Course/syllabus`, {
      params: { CourseId: parseInt(courseId) },
      headers: getHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching course syllabus:", error);
    throw new Error("Failed to fetch course syllabus: " + (error.response?.data?.detail || error.message));
  }
};

// ======================== USER MANAGEMENT ========================

// Get course learners
export const getCourseLearners = async (courseId, page = 1, take = 10) => {
  try {
    const response = await axios.get(`${API_URL}Course/${courseId}/learners`, {
      params: { page, take },
      headers: getHeaders(),
    });
    
    const data = response.data;
    if (data && data.learnerUsers && data.learnerUsers[0]) {
      return {
        totalLearnerCount: data.totalLearnerCount || 0,
        learnerUsers: data.learnerUsers[0].learnerUsers || []
      };
    }
    
    return {
      totalLearnerCount: 0,
      learnerUsers: []
    };
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
    const response = await axios.get(`${API_URL}Course/check-user-in-target-group`, {
      params: { 
        UserId: parseInt(userId),
        TargetGroupId: parseInt(targetGroupId)
      },
      headers: getHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error checking user in target group:", error);
    throw new Error("Failed to check user in target group: " + (error.response?.data?.detail || error.message));
  }
};

// ======================== QUIZ MANAGEMENT ========================

// Get quizzes by content ID
export const getQuizzesByContentId = async (courseContentId) => {
  try {
    const response = await axios.get(`${API_URL}Course/by-content/getquizzes`, {
      params: { CourseContentId: parseInt(courseContentId) },
      headers: getHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    throw new Error("Failed to fetch quizzes: " + (error.response?.data?.detail || error.message));
  }
};

// ======================== EVALUATION ========================

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

    const response = await axios.post(`${API_URL}Course/create-evalution`, payload, {
      headers: {
        ...getHeaders(),
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error creating course evaluation:", error);
    throw new Error("Failed to create course evaluation: " + (error.response?.data?.detail || error.message));
  }
};

// ======================== VALIDATION HELPERS ========================

// Course validation helper
export const validateCourseData = (courseData) => {
  const errors = [];

  if (!courseData.name?.trim()) {
    errors.push("Course name is required");
  }

  if (!courseData.description?.trim()) {
    errors.push("Course description is required");
  }

  if (!courseData.categoryId) {
    errors.push("Course category is required");
  }

  if (courseData.duration && (courseData.duration < 1 || courseData.duration > 10080)) {
    errors.push("Duration must be between 1 and 10080 minutes");
  }

  if (courseData.startDuration && courseData.deadline && courseData.startDuration >= courseData.deadline) {
    errors.push("Start duration must be less than deadline");
  }

  // FIXED: Validate succession rates structure
  if (courseData.successionRates && Array.isArray(courseData.successionRates)) {
    courseData.successionRates.forEach((rate, index) => {
      if (rate.minRange === undefined || rate.minRange === null) {
        errors.push(`Succession rate ${index + 1}: Min range is required`);
      }
      if (rate.maxRange === undefined || rate.maxRange === null) {
        errors.push(`Succession rate ${index + 1}: Max range is required`);
      }
      if (rate.minRange >= rate.maxRange) {
        errors.push(`Succession rate ${index + 1}: Min range must be less than max range`);
      }
      if (rate.minRange < 0 || rate.maxRange > 100) {
        errors.push(`Succession rate ${index + 1}: Range must be between 0 and 100`);
      }
    });
  }

  return errors;
};

// Section validation helper
export const validateSectionData = (sectionData) => {
  const errors = [];

  if (!sectionData.courseId) {
    errors.push("Course ID is required");
  }

  if (!sectionData.description?.trim()) {
    errors.push("Section description is required");
  }

  if (sectionData.duration && sectionData.duration < 0) {
    errors.push("Duration cannot be negative");
  }

  return errors;
};

// ======================== HELPER FUNCTIONS ========================

// Format course for display
export const formatCourseForDisplay = (course) => {
  if (!course) return null;

  return {
    ...course,
    imageUrl: getImageUrl(course.imageUrl),
    formattedDuration: formatDuration(course.duration),
    formattedCreatedDate: new Date(course.createdDate).toLocaleDateString(),
    isPublished: course.publishCourse,

    sectionsCount: course.totalSection || 0,
    contentsCount: course.totalContent || 0,
    videosCount: course.totalVideos || 0,
    quizzesCount: course.totalQuizzes || 0,
    completionRate: course.courseProgress || 0,
  };
};

// Format duration to readable string
export const formatDuration = (minutes) => {
  if (!minutes) return "0 min";
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${remainingMinutes}min`;
  }
  
  return `${remainingMinutes}min`;
};

// Get course difficulty based on content count and duration
export const getCourseDifficulty = (course) => {
  if (!course) return 'unknown';
  
  const contentCount = course.totalContent || 0;
  const duration = course.duration || 0;
  
  if (contentCount <= 5 && duration <= 60) {
    return 'beginner';
  } else if (contentCount <= 15 && duration <= 300) {
    return 'intermediate';
  } else {
    return 'advanced';
  }
};

// Calculate course completion percentage
export const calculateCourseCompletion = (course) => {
  if (!course || !course.sections) return 0;
  
  const totalContent = course.sections.reduce((sum, section) => 
    sum + (section.contents?.length || 0), 0);
  
  const completedContent = course.sections.reduce((sum, section) => 
    sum + (section.contents?.filter(content => content.isContentCompleted).length || 0), 0);
  
  return totalContent > 0 ? Math.round((completedContent / totalContent) * 100) : 0;
};

// ======================== CONSTANTS ========================

// Course order by options - FIXED based on API documentation
export const COURSE_ORDER_OPTIONS = {
  NAME_ASC: 'nameasc',
  NAME_DESC: 'namedesc',
  DATE_ASC: 'dateasc', 
  DATE_DESC: 'datedesc',
  DURATION_ASC: 'durationasc',
  DURATION_DESC: 'durationdesc'
};

// Course difficulty levels
export const COURSE_DIFFICULTY_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced'
};

// Succession rate validation constants
export const SUCCESSION_RATE_LIMITS = {
  MIN_RANGE: 0,
  MAX_RANGE: 100,
  MIN_ITEMS: 1,
  MAX_ITEMS: 10
};

export default {
  // Core operations
  fetchCourses,
  fetchCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  publishCourse,
  
  // Section management
  addSection,
  updateSection,
  deleteSection,
  hideSection,
  updateSectionDuration,
  getSectionsByCourseId,
  getCourseSyllabus,
  
  // User management
  getCourseLearners,
  assignUsersToCourse,
  checkUserInTargetGroup,
  
  // Quiz management
  getQuizzesByContentId,
  
  // Evaluation
  createCourseEvaluation,
  
  // Validation
  validateCourseData,
  validateSectionData,
  
  // Helpers
  getImageUrl,
  formatCourseForDisplay,
  formatDuration,
  getCourseDifficulty,
  calculateCourseCompletion,
  
  // Constants
  COURSE_ORDER_OPTIONS,
  COURSE_DIFFICULTY_LEVELS,
  SUCCESSION_RATE_LIMITS,
};