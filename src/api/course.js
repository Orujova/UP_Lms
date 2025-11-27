import axios from "axios";
import { getToken, getUserId } from "@/authtoken/auth.js";

const API_URL = "https://demoadmin.databyte.app/api/";

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
  if (url.includes("https://100.42.179.27:7298/")) {
    return `https://demoadmin.databyte.app/uploads/${url.replace(
      "https://100.42.179.27:7298/",
      ""
    )}`;
  }
  return url;
};

// ======================== COURSE ENDPOINTS ========================
export const getDistinctCourseNames = async (language = null) => {
  try {
    const params = language ? `?Language=${language}` : '';
    const response = await axios.get(
      `${API_URL}PositionCourseRequirement/GetDistinctCourseNames${params}`,
      { headers: getHeaders() }
    );
    return response.data || [];
  } catch (error) {
    console.error("Error fetching course names:", error);
    throw new Error("Failed to fetch course names: " + (error.response?.data?.message || error.message));
  }
};

// Get positions info for selected course name
export const getCoursePositionsInfo = async (courseName, language = null) => {
  try {
    const params = new URLSearchParams();
    params.append('CourseName', courseName);
    if (language) params.append('Language', language);
    
    const response = await axios.get(
      `${API_URL}PositionCourseRequirement/GetDistinctCoursePositionsInfo?${params.toString()}`,
      { headers: getHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching course positions info:", error);
    throw new Error("Failed to fetch positions info: " + (error.response?.data?.message || error.message));
  }
};
// ======================== COURSE ENDPOINTS ========================

// Fetch all courses (FIXED ORDER BY)
export const fetchCourses = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Pagination
    if (params.page) queryParams.append("Page", params.page);
    if (params.take) queryParams.append("ShowMore.Take", params.take);
    
    // Search and filtering
    if (params.search) queryParams.append("Search", params.search);
    if (params.tagId) queryParams.append("TagId", params.tagId);
    if (params.courseCategoryName) queryParams.append("CourseCategoryName", params.courseCategoryName);
    
    // Boolean filters
    if (params.hasCertificate !== undefined) {
      queryParams.append("HasCertificate", params.hasCertificate);
    }
    if (params.isPromoted !== undefined) {
      queryParams.append("IsPromoted", params.isPromoted);
    }
    
    // Duration filters
    if (params.minDuration) queryParams.append("MinDuration", params.minDuration);
    if (params.maxDuration) queryParams.append("MaxDuration", params.maxDuration);

    // FIXED: OrderBy parameter - match exactly with backend enum
    if (params.orderBy) {
      // Convert our frontend values to backend expected values
      const orderByMapping = {
        'nameasc': 'nameasc',
        'namedesc': 'namedesc', 
        'dateasc': 'dateasc',
        'datedesc': 'datedesc',
        'durationasc': 'durationasc',
        'durationdesc': 'durationdesc',
        // Fallback mappings
        'newest': 'datedesc',
        'oldest': 'dateasc',
        'nameAsc': 'nameasc',
        'nameDesc': 'namedesc',
        'durationAsc': 'durationasc',
        'durationDesc': 'durationdesc'
      };
      
      const mappedOrderBy = orderByMapping[params.orderBy.toLowerCase()] || 'nameasc';
      queryParams.append("OrderBy", mappedOrderBy);
      console.log('Sending OrderBy parameter:', mappedOrderBy);
    }

    const url = `${API_URL}Course${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    console.log('Fetching courses with URL:', url);

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

    // Process image URLs and add computed fields
    const processedCourses = courses.map(course => ({
      ...course,
      imageUrl: getImageUrl(course.imageUrl),
      topAssignedUsers: course.topAssignedUsers?.map(user => ({
        ...user,
        profilePictureUrl: getImageUrl(user.profilePictureUrl)
      })) || [],
      // Add computed fields for better filtering
      isPublished: course.publishCourse || false,
      hasVerifiedCertificate: course.verifiedCertificate || false,
      isPromotedCourse: course.isPromoted || false,
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


// Updated createCourse function with new fields
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

    // NEW FIELD: AboutCourse (rich text content)
    formData.append("AboutCourse", courseData.aboutCourse || "");

    // Boolean fields - always include with explicit true/false
    formData.append("VerifiedCertificate", (courseData.verifiedCertificate || false).toString());
    formData.append("AutoReassign", (courseData.autoReassign || false).toString());
    formData.append("HasNotification", (courseData.hasNotification || false).toString());
    
    // NEW FIELDS: IsPromoted and PublishCourse
    formData.append("IsPromoted", (courseData.isPromoted || false).toString());
    formData.append("PublishCourse", (courseData.publishCourse || false).toString());

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

    // UPDATED: ExpirationDate - now in months instead of days
    if (courseData.expirationDate && courseData.expirationDate !== null && courseData.expirationDate !== "") {
      formData.append("ExpirationDate", courseData.expirationDate.toString());
    }

    // Cluster settings (ClusterIsMandatory field removed as per API)
    if (courseData.clusterId && courseData.clusterId !== null && courseData.clusterId !== "") {
      formData.append("ClusterId", courseData.clusterId.toString());
      
      if (courseData.clusterCoefficient !== null && courseData.clusterCoefficient !== undefined) {
        formData.append("ClusterCoefficient", courseData.clusterCoefficient.toString());
      } else {
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

   

    // Arrays - Tags
    if (courseData.tagIds && Array.isArray(courseData.tagIds) && courseData.tagIds.length > 0) {
      courseData.tagIds.forEach((id) => {
        if (id !== null && id !== undefined && id !== "") {
          formData.append("TagIds", id.toString());
        }
      });
    }

    // Succession rates - using SuccessionRatesJson as string
    if (courseData.successionRates && Array.isArray(courseData.successionRates) && courseData.successionRates.length > 0) {
      const validRates = courseData.successionRates.filter(rate => 
        rate.minRange !== null && rate.minRange !== undefined && 
        rate.maxRange !== null && rate.maxRange !== undefined
      ).map(rate => ({
        minRange: parseInt(rate.minRange),
        maxRange: parseInt(rate.maxRange),
        badgeId: (rate.badgeId && typeof rate.badgeId === 'number' && !isNaN(rate.badgeId)) 
          ? parseInt(rate.badgeId) 
          : null
      }));

      if (validRates.length > 0) {
        formData.append("SuccessionRatesJson", JSON.stringify(validRates));
      }
    }

    // Create course
    const response = await axios.post(`${API_URL}Course/AddCourse`, formData, {
      headers: {
        ...getHeaders(),
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("Course created successfully:", response.data);

    // Handle API response
    if (response.data && response.data.success === false) {
      throw new Error(response.data.message || "Course creation failed due to business rules");
    }

    // Return response with proper handling
    if (response.data?.success) {
      // Wait for course to be fully created
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      try {
        // Fetch latest courses to find the one we just created
        const latestCoursesResponse = await fetchCourses({ 
          orderBy: 'datedesc', 
          take: 10,
          page: 1 
        });
        
        if (latestCoursesResponse.courses && latestCoursesResponse.courses.length > 0) {
          const createdCourse = latestCoursesResponse.courses.find(course => 
            course.name === courseData.name && 
            course.description === courseData.description
          );
          
          if (createdCourse) {
            console.log('Found created course with ID:', createdCourse.id);
            
            return {
              ...response.data,
              id: createdCourse.id,
              courseId: createdCourse.id,
              ...createdCourse,
              success: true,
              message: response.data.message
            };
          }
        }
      } catch (fetchError) {
        console.warn('Could not fetch created course details:', fetchError);
      }
      
      return {
        ...response.data,
        id: null,
        courseId: null,
        success: true,
        message: response.data.message,
        needsRefresh: true
      };
    }

    return response.data;
  } catch (error) {
    console.error("Error creating course:", error);
    
    let errorMessage = "Failed to create course";
    
    if (error.message && error.message.includes("katsayısı")) {
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

// Updated updateCourse function with new fields
export const updateCourse = async (courseData) => {
  try {
    const formData = new FormData();

    // Required for update
    if (courseData.id) {
      formData.append("Id", courseData.id.toString());
    }

    if (courseData.name) formData.append("Name", courseData.name);
    if (courseData.description) formData.append("Description", courseData.description);
    
    // NEW FIELD: AboutCourse
    if (courseData.aboutCourse !== undefined) {
      formData.append("AboutCourse", courseData.aboutCourse || "");
    }
    
    if (courseData.duration) formData.append("Duration", courseData.duration.toString());
    if (courseData.categoryId) formData.append("CategoryId", courseData.categoryId.toString());
    
    if (courseData.verifiedCertificate !== undefined) {
      formData.append("VerifiedCertificate", courseData.verifiedCertificate.toString());
    }
     const userId = getUserId();
    if (userId) {
      formData.append("UserId", userId.toString());
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



    if (courseData.startDuration) {
      formData.append("StartDuration", courseData.startDuration.toString());
    }

    if (courseData.deadline) {
      formData.append("DeadLine", courseData.deadline.toString());
    }

    // UPDATED: ExpirationDate in months
    if (courseData.expirationDate) {
      formData.append("ExpirationDate", courseData.expirationDate.toString());
    }

    if (courseData.autoReassign !== undefined) {
      formData.append("AutoReassign", courseData.autoReassign.toString());
    }

    if (courseData.hasNotification !== undefined) {
      formData.append("HasNotification", courseData.hasNotification.toString());
    }

    // NEW FIELDS: IsPromoted and PublishCourse
    if (courseData.isPromoted !== undefined) {
      formData.append("IsPromoted", courseData.isPromoted.toString());
    }

    if (courseData.publishCourse !== undefined) {
      formData.append("PublishCourse", courseData.publishCourse.toString());
    }

   

    // Cluster settings (removed ClusterIsMandatory)
    if (courseData.clusterId) {
      formData.append("ClusterId", courseData.clusterId.toString());
      
      if (courseData.clusterCoefficient !== null && courseData.clusterCoefficient !== undefined) {
        formData.append("ClusterCoefficient", courseData.clusterCoefficient.toString());
      }
    }

    if (courseData.clusterOrderNumber) {
      formData.append("ClusterOrderNumber", courseData.clusterOrderNumber.toString());
    }

    // Succession rates
    if (courseData.successionRates && Array.isArray(courseData.successionRates)) {
      const validRates = courseData.successionRates.filter(rate => 
        rate.minRange !== null && rate.minRange !== undefined && 
        rate.maxRange !== null && rate.maxRange !== undefined
      ).map(rate => ({
        minRange: parseInt(rate.minRange),
        maxRange: parseInt(rate.maxRange),
        badgeId: rate.badgeId && !isNaN(parseInt(rate.badgeId)) ? parseInt(rate.badgeId) : null
      }));

      if (validRates.length > 0) {
        formData.append("SuccessionRatesJson", JSON.stringify(validRates));
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
export const findCourseByDetails = async (name, description, userId = null) => {
  try {
    // Search for courses with the given name
    const response = await fetchCourses({
      search: name,
      orderBy: 'datedesc',
      take: 20,
      page: 1
    });

    if (response.courses && response.courses.length > 0) {
      // Find exact match by name and description
      const exactMatch = response.courses.find(course => 
        course.name.trim() === name.trim() && 
        course.description.trim() === description.trim()
      );

      if (exactMatch) {
        return exactMatch;
      }

      // If no exact match, try to find by name only (in case description was truncated)
      const nameMatch = response.courses.find(course => 
        course.name.trim() === name.trim()
      );

      return nameMatch || null;
    }

    return null;
  } catch (error) {
    console.error("Error finding course by details:", error);
    return null;
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

// course.js-də addSection funksiyasında
export const addSection = async (sectionData) => {
  try {
    const formData = new FormData();
    formData.append("CourseId", sectionData.courseId.toString());
    formData.append("Description", sectionData.description || "");
    formData.append("Duration", (sectionData.duration || 0).toString());
    formData.append("Order", (sectionData.order || 0).toString()); // Add order field
    formData.append("HideSection", (sectionData.hideSection || false).toString());
    formData.append("Mandatory", (sectionData.mandatory || false).toString());

    const response = await axios.post(`${API_URL}Course/AddSection`, formData, {
      headers: {
        ...getHeaders(),
        "Content-Type": "multipart/form-data",
      },
    });

    console.log('API Response for addSection:', response.data);
    
    // Return properly structured response
    return {
      id: response.data.id || response.data.sectionId,
      description: sectionData.description,
      duration: sectionData.duration,
      order: sectionData.order, // Include order in response
      hideSection: sectionData.hideSection,
      mandatory: sectionData.mandatory,
      courseId: sectionData.courseId,
      ...response.data
    };
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
      order: sectionData.order || 0, // Add order field
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

    return {
      ...response.data,
      order: sectionData.order // Ensure order is returned
    };
  } catch (error) {
    console.error("Error updating section:", error);
    throw new Error("Failed to update section: " + (error.response?.data?.detail || error.message));
  }
};



export const calculateOptimalSectionOrders = (sections) => {
  if (!sections || sections.length === 0) return [];
  
  return sections
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map((section, index) => ({
      sectionId: section.id,
      order: (index + 1) * 10 // Use increments of 10 for easier reordering
    }));
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

  // Validate order
  if (sectionData.order !== undefined) {
    if (typeof sectionData.order !== 'number' || sectionData.order < 1) {
      errors.push("Order must be a positive number");
    }
    if (sectionData.order > 999) {
      errors.push("Order cannot exceed 999");
    }
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
 
  // Quiz management
  getQuizzesByContentId,
  
  
  
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