// src/api/course.js - Updated fetchCourseById to match API response structure
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

// Image URL helper function
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

// Fetch all courses with proper error handling and image processing
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

// FIXED: Fetch single course by ID - Updated to match API response structure
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
      // Map sections with their contents and quizzes
      sections: course.sections?.map(section => ({
        ...section,
        contents: section.contents?.map(content => ({
          ...content,
          // Process content data based on type
          data: content.type === 5 ? getImageUrl(content.data) : content.data, // Type 5 is file
          quizzes: content.quizzes || []
        })) || []
      })) || []
    };
  } catch (error) {
    console.error("Error fetching course:", error);
    throw new Error("Failed to fetch course: " + (error.response?.data?.message || error.message));
  }
};

// Rest of the functions remain the same...
export const createCourse = async (courseData) => {
  try {
    const token = getToken();
    const userId = getUserId();

    if (!token) {
      throw new Error("Authentication token not found. Please login again.");
    }

    const formData = new FormData();

    // Basic required fields
    formData.append("Name", courseData.name || "");
    formData.append("Description", courseData.description || "");
    formData.append("Duration", (courseData.duration || 200).toString());
    formData.append("CategoryId", (courseData.categoryId || "").toString());
    formData.append("UserId", userId);

    // Optional fields
    if (courseData.verifiedCertificate !== undefined) {
      formData.append("VerifiedCertificate", courseData.verifiedCertificate.toString());
    }

    if (courseData.imageFile && courseData.imageFile instanceof File) {
      formData.append("ImageFile", courseData.imageFile);
    }

    if (courseData.certificateId) {
      formData.append("CertificateId", courseData.certificateId.toString());
    }

    // Arrays
    if (courseData.targetGroupIds && Array.isArray(courseData.targetGroupIds)) {
      courseData.targetGroupIds.forEach((id) => {
        formData.append("TargetGroupIds", id.toString());
      });
    }

    if (courseData.tagIds && Array.isArray(courseData.tagIds)) {
      courseData.tagIds.forEach((id) => {
        formData.append("TagIds", id.toString());
      });
    }

    // Advanced settings
    if (courseData.startDuration) {
      formData.append("StartDuration", courseData.startDuration.toString());
    }

    if (courseData.deadline) {
      formData.append("DeadLine", courseData.deadline.toString());
    }

    if (courseData.autoReassign !== undefined) {
      formData.append("AutoReassign", courseData.autoReassign.toString());
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

// Update course
export const updateCourse = async (courseData) => {
  try {
    const formData = new FormData();

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

  return errors;
};

export default {
  fetchCourses,
  fetchCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  publishCourse,
  getCourseLearners,
  assignUsersToCourse,
  checkUserInTargetGroup,
  validateCourseData,
  getImageUrl
};