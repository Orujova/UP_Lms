// redux/course/courseSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  // Core CRUD operations
  fetchCourses,
  fetchCourseById,
  createCourse as apiCreateCourse,
  updateCourse as apiUpdateCourse,
  deleteCourse as apiDeleteCourse,
  publishCourse as apiPublishCourse,
  addSection as apiAddSection,
  updateSection as apiUpdateSection,
  deleteSection as apiDeleteSection,
  hideSection as apiHideSection,
  updateSectionDuration as apiUpdateSectionDuration,
  getSectionsByCourseId,
  getCourseSyllabus,
  getCourseLearners,
  assignUsersToCourse,

  getQuizzesByContentId,
 
  validateCourseData,
  validateSectionData,
  formatCourseForDisplay,
  formatDuration,
  getCourseDifficulty,
  calculateCourseCompletion,
  COURSE_ORDER_OPTIONS,
} from "@/api/course";
import {
  addContent as apiAddContent,
  updateContent as apiUpdateContent,
  deleteContent as apiDeleteContent,
  getContentsBySection,
} from "@/api/courseContent";
import { 
  addQuiz as apiAddQuiz, 
  addQuestions as apiAddQuestions, 
  addOptions as apiAddOptions 
} from "@/api/quiz";
import { getUserId } from "@/authtoken/auth.js";

// ======================== ASYNC THUNKS ========================

export const fetchCoursesAsync = createAsyncThunk(
  "course/fetchCourses",
  async (params = {}, { rejectWithValue }) => {
    try {
      // FIXED: Ensure proper orderBy parameter
      const apiParams = {
        ...params,
        orderBy: params.orderBy ? COURSE_ORDER_OPTIONS[params.orderBy.toUpperCase()] || COURSE_ORDER_OPTIONS.NAME_ASC : undefined
      };
      
      const response = await fetchCourses(apiParams);
      return {
        courses: response.courses.map(course => formatCourseForDisplay(course)),
        totalCourseCount: response.totalCourseCount,
      };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch courses");
    }
  }
);

export const addQuizAsync = createAsyncThunk(
  "course/addQuiz",
  async (quizData, { rejectWithValue }) => {
    try {
      console.log('🚀 Redux: Adding Quiz with data:', quizData);
      
      // Validate required fields
      if (!quizData.contentId) {
        throw new Error("Content ID is required");
      }

      // Call the API
      const result = await apiAddQuiz({
        contentId: quizData.contentId,
        duration: quizData.duration || 60, // Keep as minutes - API handles conversion
        canSkip: quizData.canSkip || false
      });

      console.log('✅ Redux: Quiz added successfully:', result);

      // Return the result which should contain quizId
      return {
        id: result.quizId,
        quizId: result.quizId,
        contentId: quizData.contentId,
        duration: quizData.duration,
        canSkip: quizData.canSkip,
        success: result.success,
        message: result.message
      };
    } catch (error) {
      console.error('❌ Redux: Failed to add quiz:', error);
      return rejectWithValue(error.message || "Failed to add quiz");
    }
  }
);

// Enhanced Add Questions Async Thunk
export const addQuestionsAsync = createAsyncThunk(
  "course/addQuestions",
  async (questionsData, { rejectWithValue }) => {
    try {
      console.log('🚀 Redux: Adding Questions with data:', questionsData);
      
      // Validate questions data
      if (!questionsData.questions || !Array.isArray(questionsData.questions)) {
        throw new Error("Questions array is required");
      }

      if (questionsData.questions.length === 0) {
        throw new Error("At least one question is required");
      }

      // Validate each question
      questionsData.questions.forEach((question, index) => {
        if (!question.quizId) {
          throw new Error(`Question ${index + 1}: Quiz ID is required`);
        }
        if (!question.text?.trim()) {
          throw new Error(`Question ${index + 1}: Question text is required`);
        }
        if (!question.title?.trim()) {
          throw new Error(`Question ${index + 1}: Question title is required`);
        }
      });

      // Call the API
      const result = await apiAddQuestions(questionsData);

      console.log('✅ Redux: Questions added successfully:', result);

      // Return the result which should contain questionIds array
      return {
        questionIds: result.questionIds,
        questions: questionsData.questions,
        success: result.success,
        message: result.message
      };
    } catch (error) {
      console.error('❌ Redux: Failed to add questions:', error);
      return rejectWithValue(error.message || "Failed to add questions");
    }
  }
);

// Enhanced Add Options Async Thunk
export const addOptionsAsync = createAsyncThunk(
  "course/addOptions",
  async (optionsData, { rejectWithValue }) => {
    try {
      console.log('🚀 Redux: Adding Options with data:', optionsData);
      
      // Validate options data
      if (!optionsData.options || !Array.isArray(optionsData.options)) {
        throw new Error("Options array is required");
      }

      if (optionsData.options.length === 0) {
        throw new Error("At least one option is required");
      }

      // Validate each option
      optionsData.options.forEach((option, index) => {
        if (!option.questionId) {
          throw new Error(`Option ${index + 1}: Question ID is required`);
        }
        if (!option.text?.trim()) {
          throw new Error(`Option ${index + 1}: Option text is required`);
        }
      });

      // Call the API
      const result = await apiAddOptions(optionsData);

      console.log('✅ Redux: Options added successfully:', result);

      // Return the result which should contain optionIds array
      return {
        optionIds: result.optionIds,
        options: optionsData.options,
        success: result.success,
        message: result.message
      };
    } catch (error) {
      console.error('❌ Redux: Failed to add options:', error);
      return rejectWithValue(error.message || "Failed to add options");
    }
  }
);

export const fetchCourseByIdAsync = createAsyncThunk(
  "course/fetchCourseById",
  async ({ courseId, userId = null }, { rejectWithValue }) => {
    try {
      const response = await fetchCourseById(courseId, userId);
      return formatCourseForDisplay(response);
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch course");
    }
  }
);

export const createCourseAsync = createAsyncThunk(
  "course/createCourse",
  async (courseData, { getState, rejectWithValue, dispatch }) => {
    try {
      const state = getState().course;
      const userId = getUserId();

      // Validate required fields first
      const requiredFields = ['name', 'description', 'categoryId'];
      const missingFields = requiredFields.filter(field => {
        const value = courseData[field] || state.formData[field];
        return !value || (typeof value === 'string' && !value.trim());
      });

      if (missingFields.length > 0) {
        return rejectWithValue(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Clean and validate succession rates
      const rawSuccessionRates = courseData.successionRates || state.formData.successionRates || [];
      const cleanSuccessionRates = rawSuccessionRates
        .filter(rate => {
          return rate.minRange !== null && rate.minRange !== undefined && 
                 rate.maxRange !== null && rate.maxRange !== undefined &&
                 typeof rate.minRange === 'number' && typeof rate.maxRange === 'number' &&
                 rate.minRange >= 0 && rate.maxRange <= 100 && rate.minRange < rate.maxRange;
        })
        .map(rate => ({
          minRange: parseInt(rate.minRange),
          maxRange: parseInt(rate.maxRange),
          badgeId: (rate.badgeId && typeof rate.badgeId === 'number' && !isNaN(rate.badgeId)) 
            ? parseInt(rate.badgeId) 
            : null
        }));

      // Clean target group IDs
      const rawTargetGroupIds = courseData.targetGroupIds || state.formData.targetGroupIds || [];
      const cleanTargetGroupIds = rawTargetGroupIds
        .filter(id => id !== null && id !== undefined && id !== "")
        .map(id => parseInt(id))
        .filter(id => !isNaN(id));

      // Clean tag IDs
      const rawTagIds = courseData.tagIds || state.formData.tagIds || [];
      const cleanTagIds = rawTagIds
        .filter(id => id !== null && id !== undefined && id !== "")
        .map(id => parseInt(id))
        .filter(id => !isNaN(id));

      // Prepare API data with proper validation and defaults - INCLUDING NEW FIELDS
      const apiData = {
        userId: userId,
        name: (courseData.name || state.formData.name || "").trim(),
        description: (courseData.description || state.formData.description || "").trim(),
        duration: parseInt(courseData.duration || state.formData.duration || 60),
        verifiedCertificate: Boolean(courseData.verifiedCertificate ?? state.formData.verifiedCertificate ?? false),
        categoryId: parseInt(courseData.categoryId || state.formData.categoryId),
        imageFile: courseData.imageFile || state.formData.imageFile,
        targetGroupIds: cleanTargetGroupIds,
        certificateId: (courseData.certificateId || state.formData.certificateId) 
          ? parseInt(courseData.certificateId || state.formData.certificateId) 
          : null,
        tagIds: cleanTagIds,
        startDuration: (courseData.startDuration || state.formData.startDuration) 
          ? parseInt(courseData.startDuration || state.formData.startDuration) 
          : null,
        deadline: (courseData.deadline || state.formData.deadline) 
          ? parseInt(courseData.deadline || state.formData.deadline) 
          : null,
        // NEW FIELD: expirationDate
        expirationDate: (courseData.expirationDate || state.formData.expirationDate) 
          ? parseInt(courseData.expirationDate || state.formData.expirationDate) 
          : null,
        autoReassign: Boolean(courseData.autoReassign ?? state.formData.autoReassign ?? false),
        // NEW FIELD: hasNotification
        hasNotification: Boolean(courseData.hasNotification ?? state.formData.hasNotification ?? false),
        clusterId: (courseData.clusterId || state.formData.clusterId) 
          ? parseInt(courseData.clusterId || state.formData.clusterId) 
          : null,
        clusterOrderNumber: (courseData.clusterOrderNumber || state.formData.clusterOrderNumber) 
          ? parseInt(courseData.clusterOrderNumber || state.formData.clusterOrderNumber) 
          : null,
        clusterCoefficient: (courseData.clusterCoefficient || state.formData.clusterCoefficient) 
          ? parseFloat(courseData.clusterCoefficient || state.formData.clusterCoefficient) 
          : null,
        clusterIsMandatory: Boolean(courseData.clusterIsMandatory ?? state.formData.clusterIsMandatory ?? false),
        successionRates: cleanSuccessionRates,
      };

      // Additional validation
      if (isNaN(apiData.duration) || apiData.duration < 1) {
        return rejectWithValue("Duration must be a valid number greater than 0");
      }

      if (isNaN(apiData.categoryId)) {
        return rejectWithValue("Please select a valid category");
      }

      console.log("Sending clean API data:", apiData);

      const response = await apiCreateCourse(apiData);

      console.log("Course created successfully:", response);

      // Handle the response properly - now includes real course ID and new fields
      if (response?.success) {
        let courseId = response.id || response.courseId;
        
        // If we got a real course ID from the response
        if (courseId && !courseId.toString().startsWith('temp_')) {
          console.log('Got real course ID from response:', courseId);
          
          const realCourse = {
            id: courseId,
            courseId: courseId,
            name: apiData.name,
            description: apiData.description,
            duration: apiData.duration,
            categoryId: apiData.categoryId,
            verifiedCertificate: apiData.verifiedCertificate,
            targetGroupIds: apiData.targetGroupIds,
            certificateId: apiData.certificateId,
            tagIds: apiData.tagIds,
            startDuration: apiData.startDuration,
            deadline: apiData.deadline,
            expirationDate: apiData.expirationDate, // NEW FIELD
            autoReassign: apiData.autoReassign,
            hasNotification: apiData.hasNotification, // NEW FIELD
            clusterId: apiData.clusterId,
            clusterOrderNumber: apiData.clusterOrderNumber,
            clusterCoefficient: apiData.clusterCoefficient,
            clusterIsMandatory: apiData.clusterIsMandatory,
            successionRates: apiData.successionRates,
            success: true,
            message: response.message,
            createdDate: new Date().toISOString(),
            isPublished: false,
            sections: [],
            contents: [],
            totalSection: 0,
            totalContent: 0,
            totalVideos: 0,
            totalQuizzes: 0,
            courseProgress: 0,
            topAssignedUsers: [],
            courseTags: [],
            imageUrl: response.imageUrl || null,
            formattedDuration: formatDuration(apiData.duration),
            formattedCreatedDate: new Date().toLocaleDateString(),
            publishCourse: false
          };
          
          // Update formData with the real course ID for immediate use
          dispatch(setFormData({ 
            ...state.formData, 
            courseId: courseId,
            id: courseId 
          }));
          
          return realCourse;
        }
        
        // If no real ID in response, we need to handle this differently
        console.log('No real course ID in response, course creation successful but ID pending');
        
        const pendingCourse = {
          id: null,
          courseId: null,
          name: apiData.name,
          description: apiData.description,
          duration: apiData.duration,
          categoryId: apiData.categoryId,
          verifiedCertificate: apiData.verifiedCertificate,
          targetGroupIds: apiData.targetGroupIds,
          certificateId: apiData.certificateId,
          tagIds: apiData.tagIds,
          startDuration: apiData.startDuration,
          deadline: apiData.deadline,
          expirationDate: apiData.expirationDate, // NEW FIELD
          autoReassign: apiData.autoReassign,
          hasNotification: apiData.hasNotification, // NEW FIELD
          clusterId: apiData.clusterId,
          clusterOrderNumber: apiData.clusterOrderNumber,
          clusterCoefficient: apiData.clusterCoefficient,
          clusterIsMandatory: apiData.clusterIsMandatory,
          successionRates: apiData.successionRates,
          success: true,
          message: response.message,
          createdDate: new Date().toISOString(),
          isPublished: false,
          sections: [],
          contents: [],
          needsRefresh: response.needsRefresh || false,
          totalSection: 0,
          totalContent: 0,
          totalVideos: 0,
          totalQuizzes: 0,
          courseProgress: 0,
          topAssignedUsers: [],
          courseTags: [],
          imageUrl: response.imageUrl || null,
          formattedDuration: formatDuration(apiData.duration),
          formattedCreatedDate: new Date().toLocaleDateString(),
          publishCourse: false
        };
        
        return pendingCourse;
      }
      
      throw new Error('Course creation did not return success');
    } catch (error) {
      console.error("Course creation failed:", error);
      return rejectWithValue(error.message || "Failed to create course");
    }
  }
);
export const fetchCreatedCourseIdAsync = createAsyncThunk(
  "course/fetchCreatedCourseId",
  async ({ name, description }, { rejectWithValue, dispatch }) => {
    try {
      // Import the find function
      const { findCourseByDetails } = await import("@/api/course");
      
      const foundCourse = await findCourseByDetails(name, description);
      
      if (foundCourse && foundCourse.id) {
        console.log('Successfully found created course:', foundCourse);
        
        // Update the current course with real ID
        dispatch(setFormData({ 
          courseId: foundCourse.id,
          id: foundCourse.id 
        }));
        
        return foundCourse;
      }
      
      throw new Error('Could not find created course');
    } catch (error) {
      console.error("Error fetching created course ID:", error);
      return rejectWithValue(error.message || "Failed to fetch created course ID");
    }
  }
);
export const updateCourseAsync = createAsyncThunk(
  "course/updateCourse",
  async (courseData, { rejectWithValue }) => {
    try {
      const errors = validateCourseData(courseData);
      if (errors.length > 0) {
        return rejectWithValue(errors.join(', '));
      }
      
      // FIXED: Ensure proper succession rates structure for update
      const apiData = {
        ...courseData,
        successionRates: (courseData.successionRates || []).map(rate => ({
          minRange: rate.minRange || 0,
          maxRange: rate.maxRange || 100,
          badgeId: rate.badgeId || null
        }))
      };
      
      const response = await apiUpdateCourse(apiData);
      return formatCourseForDisplay(response);
    } catch (error) {
      return rejectWithValue(error.message || "Failed to update course");
    }
  }
);

export const deleteCourseAsync = createAsyncThunk(
  "course/deleteCourse",
  async (courseId, { rejectWithValue }) => {
    try {
      await apiDeleteCourse(courseId);
      return courseId;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to delete course");
    }
  }
);

export const publishCourseAsync = createAsyncThunk(
  "course/publishCourse",
  async (courseId, { rejectWithValue }) => {
    try {
      const response = await apiPublishCourse(courseId);
      return { courseId, ...response };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to publish course");
    }
  }
);

// Section management
export const addSectionAsync = createAsyncThunk(
  "course/addSection",
  async (sectionData, { rejectWithValue }) => {
    try {
      const errors = validateSectionData(sectionData);
      if (errors.length > 0) {
        return rejectWithValue(errors.join(', '));
      }
      
      const response = await apiAddSection(sectionData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to add section");
    }
  }
);

export const updateSectionAsync = createAsyncThunk(
  "course/updateSection",
  async (sectionData, { rejectWithValue }) => {
    try {
      const errors = validateSectionData(sectionData);
      if (errors.length > 0) {
        return rejectWithValue(errors.join(', '));
      }
      
      const response = await apiUpdateSection(sectionData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to update section");
    }
  }
);

export const deleteSectionAsync = createAsyncThunk(
  "course/deleteSection",
  async (sectionId, { rejectWithValue }) => {
    try {
      await apiDeleteSection(sectionId);
      return sectionId;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to delete section");
    }
  }
);

export const hideSectionAsync = createAsyncThunk(
  "course/hideSection",
  async (sectionId, { rejectWithValue }) => {
    try {
      await apiHideSection(sectionId);
      return sectionId;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to hide section");
    }
  }
);

export const updateSectionDurationAsync = createAsyncThunk(
  "course/updateSectionDuration",
  async ({ sectionId, duration }, { rejectWithValue }) => {
    try {
      await apiUpdateSectionDuration(sectionId, duration);
      return { sectionId, duration };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to update section duration");
    }
  }
);

export const getSectionsByCourseIdAsync = createAsyncThunk(
  "course/getSectionsByCourseId",
  async (courseId, { rejectWithValue }) => {
    try {
      const response = await getSectionsByCourseId(courseId);
      return { courseId, sections: response };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch sections");
    }
  }
);

export const getCourseSyllabusAsync = createAsyncThunk(
  "course/getCourseSyllabus",
  async (courseId, { rejectWithValue }) => {
    try {
      const response = await getCourseSyllabus(courseId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch course syllabus");
    }
  }
);

// Content management
export const addContentAsync = createAsyncThunk(
  "course/addContent",
  async (contentData, { rejectWithValue }) => {
    try {
      const response = await apiAddContent(contentData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to add content");
    }
  }
);

export const updateContentAsync = createAsyncThunk(
  "course/updateContent",
  async (contentData, { rejectWithValue }) => {
    try {
      const response = await apiUpdateContent(contentData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to update content");
    }
  }
);

export const deleteContentAsync = createAsyncThunk(
  "course/deleteContent",
  async (contentId, { rejectWithValue }) => {
    try {
      await apiDeleteContent(contentId);
      return contentId;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to delete content");
    }
  }
);

export const fetchSectionContentsAsync = createAsyncThunk(
  "course/fetchSectionContents",
  async (sectionId, { rejectWithValue }) => {
    try {
      const response = await getContentsBySection(sectionId);
      return { sectionId, contents: response };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch section contents");
    }
  }
);

// User management
export const fetchCourseLearnersAsync = createAsyncThunk(
  "course/fetchCourseLearners",
  async ({ courseId, page = 1, take = 10 }, { rejectWithValue }) => {
    try {
      const response = await getCourseLearners(courseId, page, take);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch course learners");
    }
  }
);

export const assignUsersAsync = createAsyncThunk(
  "course/assignUsers",
  async (assignmentData, { rejectWithValue }) => {
    try {
      const response = await assignUsersToCourse(assignmentData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to assign users");
    }
  }
);

export const reorderSectionsAsync = createAsyncThunk(
  "course/reorderSections",
  async ({ courseId, sectionOrders }, { rejectWithValue }) => {
    try {
      console.log('🔄 Redux: Reordering sections:', { courseId, sectionOrders });
      
      const { reorderSections } = await import("@/api/course");
      const result = await reorderSections(courseId, sectionOrders);

      console.log('✅ Redux: Sections reordered successfully:', result);

      return {
        courseId,
        sectionOrders,
        success: result.success,
        message: result.message
      };
    } catch (error) {
      console.error('❌ Redux: Failed to reorder sections:', error);
      return rejectWithValue(error.message || "Failed to reorder sections");
    }
  }
);

// Quiz management
export const getQuizzesByContentIdAsync = createAsyncThunk(
  "course/getQuizzesByContentId",
  async (courseContentId, { rejectWithValue }) => {
    try {
      const response = await getQuizzesByContentId(courseContentId);
      return { courseContentId, quizzes: response };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch quizzes");
    }
  }
);



// ======================== INITIAL STATE ========================

const initialState = {
  // Course list state
  courses: [],
  totalCourseCount: 0,
  loading: false,
  error: null,

  // Single course state
  currentCourse: null,
  courseLoading: false,
  courseError: null,
  syllabus: null,

  // Course learners
  courseLearners: {
    data: [],
    totalCount: 0,
    loading: false,
    error: null,
  },

  // Form state
  currentStep: 1,
    formData: {
    // Basic Info
    name: "",
    description: "",
    categoryId: "",
    duration: 200,
    verifiedCertificate: false,
    imageFile: null,
    imagePreview: null,

    // Advanced settings  
    certificateId: null,
    tagIds: [],
    targetGroupIds: [],
    startDuration: null,
    deadline: null,
    expirationDate: null, // NEW FIELD
    autoReassign: false,
    hasNotification: false, // NEW FIELD
    hasEvaluation: false,
    publishCourse: false,
    
    // Cluster settings
    clusterId: null,
    clusterOrderNumber: null,
    clusterCoefficient: null,
    clusterIsMandatory: false,
    
    // Succession rates with proper structure
    successionRates: [],
  },

  // Sections and content
  sections: [],
  activeSection: null,
  sectionContents: {}, // { sectionId: [contents] }
 lastSectionUpdate: null, 
  // Content editing
  editingContent: null,
  contentModalType: null,

  // UI state
  modals: {
    addContent: false,
    editContent: false,
    addQuiz: false,
    editQuiz: false,
    addSection: false,
    editSection: false,
    deleteConfirm: false,
    assignUsers: false,
    publishConfirm: false,
    evaluation: false,
  },

  // Quiz builder state
  quizBuilder: {
    questions: [],
    currentQuestion: null,
    isEditing: false,
    contentId: null,
  },

  

  // Analytics data
  analytics: {
    completion: {
      started: 0,
      inProgress: 0,
      completed: 0,
      completionRate: 0,
    },
    performance: {
      averageTime: 0,
      averageScore: 0,
      certificatesIssued: 0,
    },
    engagement: {
      totalViews: 0,
      averageEngagement: 0,
      dropOffRate: 0,
    },
  },
  
  // Filters and search
  filters: {
    search: '',
    categoryId: '',
    tagId: '',
    hasCertificate: null,
    minDuration: '',
    maxDuration: '',
    orderBy: 'nameasc', // FIXED: Use proper enum value
    page: 1,
    take: 10,
  },
  
  // User assignment
  userAssignment: {
    selectedUsers: [],
    selectedCourses: [],
    loading: false,
    error: null,
  },
  
  // Bulk operations
  selectedCourses: [],
  bulkOperation: null,
  
  // Statistics
  statistics: {
    totalCourses: 0,
    publishedCourses: 0,
    draftCourses: 0,
    averageDuration: 0,
    totalSections: 0,
    totalContents: 0,
    totalLearners: 0,
  },
};

// ======================== SLICE ========================

const courseSlice = createSlice({
  name: "course",
  initialState,
  reducers: {
    // Step navigation
    setCurrentStep: (state, action) => {
      state.currentStep = action.payload;
    },

    nextStep: (state) => {
      if (state.currentStep < 3) {
        state.currentStep += 1;
      }
    },

    prevStep: (state) => {
      if (state.currentStep > 1) {
        state.currentStep -= 1;
      }
    },

    // Form data management
    setFormData: (state, action) => {
      state.formData = { ...state.formData, ...action.payload };
    },

    resetFormData: (state) => {
      state.formData = initialState.formData;
      state.sections = [];
      state.activeSection = null;
      state.currentStep = 1;
      state.quizBuilder = initialState.quizBuilder;
      state.sectionContents = {};
    },

    setImagePreview: (state, action) => {
      state.formData.imagePreview = action.payload;
    },

    setImageFile: (state, action) => {
      state.formData.imageFile = action.payload;
    },

   // FIXED: Succession rates management with proper structure
   addSuccessionRate: (state, action) => {
      const newRate = {
        minRange: action.payload.minRange || 0,
        maxRange: action.payload.maxRange || 100,
        badgeId: action.payload.badgeId || null,
      };
      state.formData.successionRates.push(newRate);
    },

    updateSuccessionRate: (state, action) => {
      const { index, updates } = action.payload;
      if (state.formData.successionRates[index]) {
        state.formData.successionRates[index] = {
          ...state.formData.successionRates[index],
          ...updates,
        };
      }
    },

    removeSuccessionRate: (state, action) => {
      const index = action.payload;
      state.formData.successionRates.splice(index, 1);
    },

    // Bulk update succession rates (useful for reordering or bulk changes)
    setSuccessionRates: (state, action) => {
      state.formData.successionRates = action.payload || [];
    },

    // FIXED: Validate and auto-fix succession rate ranges
    validateSuccessionRates: (state) => {
      // Sort by minRange
      state.formData.successionRates.sort((a, b) => a.minRange - b.minRange);
      
      // Ensure no overlapping ranges
      for (let i = 0; i < state.formData.successionRates.length - 1; i++) {
        if (state.formData.successionRates[i].maxRange >= state.formData.successionRates[i + 1].minRange) {
          state.formData.successionRates[i].maxRange = state.formData.successionRates[i + 1].minRange - 1;
        }
      }
    },

    // Helper to create default succession rates based on badges
    createDefaultSuccessionRates: (state, action) => {
      const badges = action.payload || [];
      state.formData.successionRates = [];
      
      if (badges.length > 0) {
        const rangeSize = Math.floor(100 / badges.length);
        badges.forEach((badge, index) => {
          const minRange = index * rangeSize;
          const maxRange = index === badges.length - 1 ? 100 : (index + 1) * rangeSize - 1;
          
          state.formData.successionRates.push({
            minRange,
            maxRange,
            badgeId: badge.id,
          });
        });
      }
    },
 updateCourseWithRealId: (state, action) => {
      const { courseId, courseData } = action.payload;
      
      if (state.currentCourse) {
        state.currentCourse.id = courseId;
        state.currentCourse.courseId = courseId;
        
        if (courseData) {
          Object.assign(state.currentCourse, courseData);
        }
      }
      
      if (state.formData) {
        state.formData.id = courseId;
        state.formData.courseId = courseId;
      }
    },
    
    // FIXED: Better course ID extraction from various sources
    extractCourseId: (state) => {
      // Try to extract course ID from available sources
      let courseId = null;
      
      if (state.currentCourse?.id && !state.currentCourse.id.toString().startsWith('temp_')) {
        courseId = state.currentCourse.id;
      } else if (state.formData?.id && !state.formData.id.toString().startsWith('temp_')) {
        courseId = state.formData.id;
      } else if (state.formData?.courseId && !state.formData.courseId.toString().startsWith('temp_')) {
        courseId = state.formData.courseId;
      }
      
      if (courseId) {
        // Update all relevant places with the found ID
        if (state.currentCourse) {
          state.currentCourse.id = courseId;
          state.currentCourse.courseId = courseId;
        }
        if (state.formData) {
          state.formData.id = courseId;
          state.formData.courseId = courseId;
        }
      }
      
      return courseId;
    },
  
    addSection: (state) => {
  const newSection = {
    id: `temp-${Date.now()}`,
    description: `Section ${state.sections.length + 1}`,
    duration: 60,
    hideSection: false,
    mandatory: false,
    contents: [],
    isTemp: true,
  };
  state.sections.push(newSection);
  // FIXED: Always set the new section as active
  state.activeSection = newSection.id;
},

updateSection: (state, action) => {
  const { sectionId, updates } = action.payload;
  const sectionIndex = state.sections.findIndex((s) => s.id === sectionId);
  if (sectionIndex !== -1) {
    state.sections[sectionIndex] = {
      ...state.sections[sectionIndex],
      ...updates,
    };
  }
},

// FIXED: Enhanced section removal with active section handling
removeSection: (state, action) => {
  const sectionId = action.payload;
  const sectionIndex = state.sections.findIndex(s => s.id === sectionId);
  
  // Remove the section
  state.sections = state.sections.filter((s) => s.id !== sectionId);
  
  // Remove section contents
  delete state.sectionContents[sectionId];
  
  // FIXED: Handle active section when removing
  if (state.activeSection === sectionId) {
    if (state.sections.length > 0) {
      // Set the first available real section as active
      const firstRealSection = state.sections.find(s => 
        s.id && !s.id.toString().startsWith('temp_')
      );
      state.activeSection = firstRealSection ? firstRealSection.id : state.sections[0].id;
    } else {
      state.activeSection = null;
    }
  }
},

setActiveSection: (state, action) => {
  const sectionId = action.payload;
  console.log('Setting active section:', sectionId);
  
  // Validate that the section exists
  const sectionExists = state.sections.find(s => s.id === sectionId);
  if (sectionExists || sectionId === null) {
    state.activeSection = sectionId;
  } else {
    console.warn('Trying to set non-existent section as active:', sectionId);
  }
},

// FIXED: Add a new action to set editing section specifically for modal
setEditingSection: (state, action) => {
  const sectionId = action.payload;
  console.log('Setting editing section:', sectionId);
  
  // Set both active section and ensure modal knows we're editing
  state.activeSection = sectionId;
  
  // Make sure the section exists in our state
  const section = state.sections.find(s => s.id === sectionId);
  if (section) {
    console.log('Found section for editing:', section);
  }
},


    reorderSections: (state, action) => {
      const { sourceIndex, destinationIndex } = action.payload;
      const sections = Array.from(state.sections);
      const [movedSection] = sections.splice(sourceIndex, 1);
      sections.splice(destinationIndex, 0, movedSection);
      state.sections = sections;
    },

    // Content management
    addContentToSection: (state, action) => {
      const { sectionId, content } = action.payload;
      
      if (!state.sectionContents[sectionId]) {
        state.sectionContents[sectionId] = [];
      }
      
      const newContent = {
        id: `temp-${Date.now()}`,
        ...content,
        isTemp: true,
      };
      
      state.sectionContents[sectionId].push(newContent);
    },

    updateContentInSection: (state, action) => {
      const { sectionId, contentId, updates } = action.payload;
      
      if (state.sectionContents[sectionId]) {
        const contentIndex = state.sectionContents[sectionId].findIndex((c) => c.id === contentId);
        if (contentIndex !== -1) {
          state.sectionContents[sectionId][contentIndex] = {
            ...state.sectionContents[sectionId][contentIndex],
            ...updates,
          };
        }
      }
    },

    removeContentFromSection: (state, action) => {
      const { sectionId, contentId } = action.payload;
      
      if (state.sectionContents[sectionId]) {
        state.sectionContents[sectionId] = state.sectionContents[sectionId].filter(
          (c) => c.id !== contentId
        );
      }
    },

    reorderContentInSection: (state, action) => {
      const { sectionId, sourceIndex, destinationIndex } = action.payload;
      
      if (state.sectionContents[sectionId]) {
        const contents = Array.from(state.sectionContents[sectionId]);
        const [movedContent] = contents.splice(sourceIndex, 1);
        contents.splice(destinationIndex, 0, movedContent);
        state.sectionContents[sectionId] = contents;
      }
    },

    // Content editing
    setEditingContent: (state, action) => {
      state.editingContent = action.payload;
    },

    setContentModalType: (state, action) => {
      state.contentModalType = action.payload;
    },

    // Modals management
    setModalOpen: (state, action) => {
      const { modal, isOpen } = action.payload;
      state.modals[modal] = isOpen;
    },

    closeAllModals: (state) => {
      Object.keys(state.modals).forEach((key) => {
        state.modals[key] = false;
      });
      state.editingContent = null;
      state.contentModalType = null;
    },


    setQuizBuilder: (state, action) => {
      state.quizBuilder = { ...state.quizBuilder, ...action.payload };
    },

    resetQuizBuilder: (state) => {
      state.quizBuilder = {
        quizId: null,
        contentId: null,
        questions: [],
        currentStep: 'settings'
      };
    },

    addQuestionToBuilder: (state, action) => {
      state.quizBuilder.questions.push(action.payload);
    },

    updateQuestionInBuilder: (state, action) => {
      const { index, question } = action.payload;
      if (state.quizBuilder.questions[index]) {
        state.quizBuilder.questions[index] = question;
      }
    },

    removeQuestionFromBuilder: (state, action) => {
      const index = action.payload;
      state.quizBuilder.questions.splice(index, 1);
    },
  

    // Quiz builder
    setQuizQuestions: (state, action) => {
      state.quizBuilder.questions = action.payload;
    },

    addQuizQuestion: (state, action) => {
      state.quizBuilder.questions.push(action.payload);
    },

    updateQuizQuestion: (state, action) => {
      const { index, question } = action.payload;
      if (state.quizBuilder.questions[index]) {
        state.quizBuilder.questions[index] = question;
      }
    },

    removeQuizQuestion: (state, action) => {
      const index = action.payload;
      state.quizBuilder.questions.splice(index, 1);
    },

    setCurrentQuestion: (state, action) => {
      state.quizBuilder.currentQuestion = action.payload;
    },

    setQuizContentId: (state, action) => {
      state.quizBuilder.contentId = action.payload;
    },

    clearQuizBuilder: (state) => {
      state.quizBuilder = {
        questions: [],
        currentQuestion: null,
        isEditing: false,
        contentId: null,
      };
    },

    // Filters management (FIXED: Proper orderBy handling)
    setFilters: (state, action) => {
      const newFilters = { ...state.filters, ...action.payload };
      
      // FIXED: Ensure orderBy uses proper enum values
      if (newFilters.orderBy) {
        const validOrderValues = Object.values(COURSE_ORDER_OPTIONS);
        if (!validOrderValues.includes(newFilters.orderBy.toLowerCase())) {
          newFilters.orderBy = COURSE_ORDER_OPTIONS.NAME_ASC;
        }
      }
      
      state.filters = newFilters;
    },

    resetFilters: (state) => {
      state.filters = initialState.filters;
    },

    // User assignment
    setUserAssignment: (state, action) => {
      state.userAssignment = { ...state.userAssignment, ...action.payload };
    },

    addSelectedUser: (state, action) => {
      const user = action.payload;
      if (!state.userAssignment.selectedUsers.find(u => u.id === user.id)) {
        state.userAssignment.selectedUsers.push(user);
      }
    },

    removeSelectedUser: (state, action) => {
      const userId = action.payload;
      state.userAssignment.selectedUsers = state.userAssignment.selectedUsers.filter(
        u => u.id !== userId
      );
    },

    clearSelectedUsers: (state) => {
      state.userAssignment.selectedUsers = [];
    },

    // Bulk operations
    toggleCourseSelection: (state, action) => {
      const courseId = action.payload;
      const index = state.selectedCourses.indexOf(courseId);
      
      if (index > -1) {
        state.selectedCourses.splice(index, 1);
      } else {
        state.selectedCourses.push(courseId);
      }
    },

    selectAllCourses: (state) => {
      state.selectedCourses = state.courses.map(course => course.id);
    },

    deselectAllCourses: (state) => {
      state.selectedCourses = [];
    },

    setBulkOperation: (state, action) => {
      state.bulkOperation = action.payload;
    },

    // Analytics
    setAnalytics: (state, action) => {
      state.analytics = { ...state.analytics, ...action.payload };
    },

    updateAnalytics: (state, action) => {
      const { section, data } = action.payload;
      if (state.analytics[section]) {
        state.analytics[section] = { ...state.analytics[section], ...data };
      }
    },

    // Statistics update
    updateStatistics: (state) => {
      const courses = state.courses;
      
      state.statistics = {
        totalCourses: courses.length,
        publishedCourses: courses.filter(c => c.publishCourse || c.isPublished).length,
        draftCourses: courses.filter(c => !c.publishCourse && !c.isPublished).length,
        averageDuration: courses.length > 0 
          ? Math.round(courses.reduce((sum, c) => sum + (c.duration || 0), 0) / courses.length)
          : 0,
        totalSections: courses.reduce((sum, c) => sum + (c.sectionsCount || c.totalSection || 0), 0),
        totalContents: courses.reduce((sum, c) => sum + (c.contentsCount || c.totalContent || 0), 0),
        totalLearners: courses.reduce((sum, c) => sum + (c.topAssignedUsers?.length || 0), 0),
      };
    },

    // Error management
    clearError: (state) => {
      state.error = null;
      state.courseError = null;
      state.courseLearners.error = null;
      state.userAssignment.error = null;
    },

    clearCourseData: (state) => {
      state.currentCourse = null;
      state.courseLearners = initialState.courseLearners;
      state.analytics = initialState.analytics;
      state.syllabus = null;
      state.sections = [];
      state.sectionContents = {};
    },

    // Course difficulty calculation
    calculateCourseDifficulty: (state, action) => {
      const courseId = action.payload;
      const course = state.courses.find(c => c.id === courseId);
      
      if (course) {
        const difficulty = getCourseDifficulty(course);
        const courseIndex = state.courses.findIndex(c => c.id === courseId);
        if (courseIndex !== -1) {
          state.courses[courseIndex].difficulty = difficulty;
        }
      }
    },

    // Course completion calculation
    calculateCourseCompletionRate: (state, action) => {
      const courseId = action.payload;
      const course = state.currentCourse;
      
      if (course && course.id === courseId) {
        const completionRate = calculateCourseCompletion(course);
        state.currentCourse.completionRate = completionRate;
      }
    },
  },

  extraReducers: (builder) => {
    builder
      // Fetch courses
      .addCase(fetchCoursesAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCoursesAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload.courses;
        state.totalCourseCount = action.payload.totalCourseCount;
        courseSlice.caseReducers.updateStatistics(state);
      })
      .addCase(fetchCoursesAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
        state.courses = [];
        state.totalCourseCount = 0;
      })

      // Fetch single course
      .addCase(fetchCourseByIdAsync.pending, (state) => {
        state.courseLoading = true;
        state.courseError = null;
      })
       .addCase(createCourseAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCourse = action.payload;
        
        // If we have a real course ID, update everything
        if (action.payload.id && !action.payload.id.toString().startsWith('temp_')) {
          state.formData.id = action.payload.id;
          state.formData.courseId = action.payload.id;
        }
        
        // Add to courses list if not already there
        const existingIndex = state.courses.findIndex(c => c.id === action.payload.id);
        if (existingIndex === -1) {
          state.courses.unshift(action.payload);
          state.totalCourseCount += 1;
        }
        
        courseSlice.caseReducers.updateStatistics(state);
      })
      
      // FIXED: Handle fetched course ID
      .addCase(fetchCreatedCourseIdAsync.fulfilled, (state, action) => {
        const foundCourse = action.payload;
        
        if (foundCourse && foundCourse.id) {
          // Update current course with real data
          state.currentCourse = {
            ...state.currentCourse,
            ...foundCourse,
            id: foundCourse.id,
            courseId: foundCourse.id
          };
          
          // Update formData
          state.formData.id = foundCourse.id;
          state.formData.courseId = foundCourse.id;
          
          // Update in courses list
          const existingIndex = state.courses.findIndex(c => 
            (c.id === foundCourse.id) || 
            (c.name === foundCourse.name && c.description === foundCourse.description)
          );
          
          if (existingIndex !== -1) {
            state.courses[existingIndex] = foundCourse;
          } else {
            state.courses.unshift(foundCourse);
            state.totalCourseCount += 1;
          }
        }
      })
      
      .addCase(fetchCreatedCourseIdAsync.rejected, (state, action) => {
        console.warn('Could not fetch created course ID:', action.payload);
        // Don't treat this as a fatal error - course was created successfully
      })
      .addCase(fetchCourseByIdAsync.fulfilled, (state, action) => {
        state.courseLoading = false;
        state.currentCourse = action.payload;
        // Populate sections from API response
        if (action.payload.sections) {
          state.sections = action.payload.sections;
          state.activeSection = action.payload.sections.length > 0 ? action.payload.sections[0].id : null;
          
          // Populate section contents
          action.payload.sections.forEach(section => {
            if (section.contents) {
              state.sectionContents[section.id] = section.contents;
            }
          });
        }
      })
      .addCase(fetchCourseByIdAsync.rejected, (state, action) => {
        state.courseLoading = false;
        state.courseError = action.payload || action.error.message;
      })

      // Create course
      .addCase(createCourseAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      
      .addCase(createCourseAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Update course
      .addCase(updateCourseAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCourseAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCourse = action.payload;
        const courseIndex = state.courses.findIndex((c) => c.id === action.payload.id);
        if (courseIndex !== -1) {
          state.courses[courseIndex] = action.payload;
        }
        courseSlice.caseReducers.updateStatistics(state);
      })
      .addCase(updateCourseAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Delete course
      .addCase(deleteCourseAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteCourseAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = state.courses.filter((c) => c.id !== action.payload);
        state.totalCourseCount = Math.max(0, state.totalCourseCount - 1);
        if (state.currentCourse?.id === action.payload) {
          courseSlice.caseReducers.clearCourseData(state);
        }
        courseSlice.caseReducers.updateStatistics(state);
      })
      .addCase(deleteCourseAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Publish course
      .addCase(publishCourseAsync.fulfilled, (state, action) => {
        const courseIndex = state.courses.findIndex((c) => c.id === action.payload.courseId);
        if (courseIndex !== -1) {
          state.courses[courseIndex].publishCourse = true;
          state.courses[courseIndex].isPublished = true;
        }
        if (state.currentCourse?.id === action.payload.courseId) {
          state.currentCourse.publishCourse = true;
          state.currentCourse.isPublished = true;
        }
        courseSlice.caseReducers.updateStatistics(state);
      })
      .addCase(publishCourseAsync.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
      })


      

     
      .addCase(addSectionAsync.pending, (state) => {
  state.loading = true;
  state.error = null;
})


.addCase(addSectionAsync.fulfilled, (state, action) => {
  state.loading = false;
  
  const newSection = action.payload;
  console.log('Section created successfully:', newSection);
  
  // FIXED: API cavabından düzgün ID götürmək
  const sectionId = newSection?.id || newSection?.sectionId || newSection?.data?.id;
  
  if (!sectionId) {
    console.error('No section ID returned from API:', newSection);
    return;
  }
  
  // FIXED: Section obyektini düzgün strukturda saxlamaq
  const formattedSection = {
    id: sectionId,
    description: newSection.description || newSection.title || `Section ${state.sections.length + 1}`,
    duration: newSection.duration || 60,
    hideSection: newSection.hideSection || false,
    mandatory: newSection.mandatory || false,
    contents: []
  };
  
  // FIXED: Temp section-u real section ilə əvəz etmək
  if (state.activeSection?.toString().startsWith('temp-')) {
    const tempIndex = state.sections.findIndex(s => s.id === state.activeSection);
    if (tempIndex !== -1) {
      state.sections[tempIndex] = formattedSection;
    }
  } else {
    state.sections.push(formattedSection);
  }
  
  // FIXED: Active section-u real ID ilə yeniləmək
  state.activeSection = sectionId;
  
  console.log('Section added to state:', formattedSection);
  console.log('Active section set to:', sectionId);
})
.addCase(addSectionAsync.rejected, (state, action) => {
  state.loading = false;
  state.error = action.payload;
})

.addCase(updateSectionAsync.pending, (state) => {
  state.loading = true;
  state.error = null;
})
.addCase(updateSectionAsync.fulfilled, (state, action) => {
  state.loading = false;
  
  const updatedSection = action.payload;
  console.log('Section updated successfully:', updatedSection);
  console.log('Full action meta:', action.meta);
  
  // FIXED: Get the section data from the original request (meta.arg)
  const formData = action.meta.arg;
  const sectionId = formData.sectionId || formData.id || state.activeSection;
  
  console.log('Form data sent to API:', formData);
  console.log('Extracted section ID for update:', sectionId);
  
  if (!sectionId) {
    console.error('No section ID found in form data or active section');
    return;
  }
  
  const sectionIndex = state.sections.findIndex(s => s.id == sectionId);
  
  if (sectionIndex !== -1) {
    const existingSection = state.sections[sectionIndex];
    
    // FIXED: Use form data to update section (since API only returns success message)
    const newSection = { 
      ...existingSection,
      // Update with form data that was sent to API
      description: formData.description || existingSection.description,
      duration: formData.duration || existingSection.duration,
      hideSection: formData.hideSection !== undefined ? formData.hideSection : existingSection.hideSection,
      mandatory: formData.mandatory !== undefined ? formData.mandatory : existingSection.mandatory,
      courseId: formData.courseId || existingSection.courseId,
      // Preserve existing fields
      id: sectionId,
      contents: formData.contents || existingSection.contents || [],
      courseContentIds: formData.courseContentIds || existingSection.courseContentIds || [],
      // Add success indicators
      success: updatedSection.success,
      message: updatedSection.message,
      lastUpdated: Date.now() // Force unique reference for React re-render
    };
    
    // FIXED: Create new sections array to ensure immutability
    state.sections = [
      ...state.sections.slice(0, sectionIndex),
      newSection,
      ...state.sections.slice(sectionIndex + 1)
    ];
    
    console.log('Section updated in state at index:', sectionIndex);
    console.log('Updated section data:', newSection);
  } else {
    console.warn('Could not find section to update:', sectionId);
    console.log('Available section IDs:', state.sections.map(s => ({ id: s.id, desc: s.description })));
  }
  
  // FIXED: Close edit modal after successful update
  state.modals.editSection = false;
  
  // FIXED: Force component re-render by updating a timestamp
  state.lastSectionUpdate = Date.now();
})

.addCase(updateSectionAsync.rejected, (state, action) => {
  state.loading = false;
  state.error = action.payload;
})

.addCase(deleteSectionAsync.pending, (state) => {
  state.loading = true;
  state.error = null;
})
.addCase(deleteSectionAsync.fulfilled, (state, action) => {
  state.loading = false;
  const deletedSectionId = action.payload;
  
  // Use the existing removeSection reducer
  courseSlice.caseReducers.removeSection(state, { payload: deletedSectionId });
})
.addCase(deleteSectionAsync.rejected, (state, action) => {
  state.loading = false;
  state.error = action.payload;
})

// FIXED: Enhanced getSectionsByCourseId with proper section loading
.addCase(getSectionsByCourseIdAsync.pending, (state) => {
  state.loading = true;
  state.error = null;
})
.addCase(getSectionsByCourseIdAsync.fulfilled, (state, action) => {
  state.loading = false;
  
  const { courseId, sections } = action.payload;
  console.log('Loaded sections for course:', courseId, sections);
  
  if (state.currentCourse?.id === courseId) {
    state.sections = sections || [];
    
    // FIXED: Set first section as active if none is set
    if (state.sections.length > 0 && !state.activeSection) {
      const firstRealSection = state.sections.find(s => 
        s.id && !s.id.toString().startsWith('temp_')
      );
      state.activeSection = firstRealSection ? firstRealSection.id : state.sections[0].id;
    }
    
    // FIXED: Load section contents
    state.sections.forEach(section => {
      if (section.contents && section.contents.length > 0) {
        state.sectionContents[section.id] = section.contents;
      }
    });
  }
})
.addCase(getSectionsByCourseIdAsync.rejected, (state, action) => {
  state.loading = false;
  state.error = action.payload;
})
      

      

   

      .addCase(getCourseSyllabusAsync.fulfilled, (state, action) => {
        state.syllabus = action.payload;
        if (action.payload.sections) {
          state.sections = action.payload.sections;
          state.activeSection = action.payload.sections.length > 0 ? action.payload.sections[0].id : null;
        }
      })

      // Content management
      .addCase(addContentAsync.fulfilled, (state, action) => {
        // Handle content addition success
        if (state.editingContent?.isTemp) {
          // Replace temp content with real content
          const sectionId = state.editingContent.sectionId;
          if (state.sectionContents[sectionId]) {
            const contentIndex = state.sectionContents[sectionId].findIndex(
              c => c.id === state.editingContent.id
            );
            if (contentIndex !== -1) {
              state.sectionContents[sectionId][contentIndex] = action.payload;
            }
          }
        }
        state.editingContent = null;
        state.modals.addContent = false;
      })

      .addCase(updateContentAsync.fulfilled, (state, action) => {
        // Handle content update success
        if (state.editingContent) {
          const sectionId = state.editingContent.sectionId;
          if (state.sectionContents[sectionId]) {
            const contentIndex = state.sectionContents[sectionId].findIndex(
              c => c.id === action.payload.id
            );
            if (contentIndex !== -1) {
              state.sectionContents[sectionId][contentIndex] = action.payload;
            }
          }
        }
        state.editingContent = null;
        state.modals.editContent = false;
      })

      .addCase(deleteContentAsync.fulfilled, (state, action) => {
        // Remove content from all sections
        Object.keys(state.sectionContents).forEach(sectionId => {
          state.sectionContents[sectionId] = state.sectionContents[sectionId].filter(
            c => c.id !== action.payload
          );
        });
      })

      .addCase(fetchSectionContentsAsync.fulfilled, (state, action) => {
        const { sectionId, contents } = action.payload;
        state.sectionContents[sectionId] = contents;
      })

      // Course learners
      .addCase(fetchCourseLearnersAsync.pending, (state) => {
        state.courseLearners.loading = true;
        state.courseLearners.error = null;
      })
      .addCase(fetchCourseLearnersAsync.fulfilled, (state, action) => {
        state.courseLearners.loading = false;
        state.courseLearners.data = action.payload.learnerUsers || [];
        state.courseLearners.totalCount = action.payload.totalLearnerCount || 0;
      })
      .addCase(fetchCourseLearnersAsync.rejected, (state, action) => {
        state.courseLearners.loading = false;
        state.courseLearners.error = action.payload || action.error.message;
      })

      // User assignment
      .addCase(assignUsersAsync.pending, (state) => {
        state.userAssignment.loading = true;
        state.userAssignment.error = null;
      })
      .addCase(assignUsersAsync.fulfilled, (state, action) => {
        state.userAssignment.loading = false;
        state.userAssignment.selectedUsers = [];
        state.modals.assignUsers = false;
        // Refresh course learners if current course is being updated
        // This would trigger a refetch of learners in the component
      })
      .addCase(assignUsersAsync.rejected, (state, action) => {
        state.userAssignment.loading = false;
        state.userAssignment.error = action.payload || action.error.message;
      })

      // Quiz management
      .addCase(getQuizzesByContentIdAsync.fulfilled, (state, action) => {
        const { courseContentId, quizzes } = action.payload;
        // Update content with quiz information
        Object.values(state.sectionContents).forEach(contents => {
          const content = contents.find(c => c.id === courseContentId);
          if (content) {
            content.quizzes = quizzes;
          }
        });
      })

      .addCase(addQuizAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addQuizAsync.fulfilled, (state, action) => {
        state.loading = false;
        console.log('📝 Redux State: Quiz added successfully:', action.payload);
        
        // Update quiz builder with created quiz ID
        if (state.quizBuilder.contentId) {
          state.quizBuilder.quizId = action.payload.quizId;
        }

        // Update content in sections if exists
        Object.values(state.sectionContents).forEach(contents => {
          const content = contents.find(c => c.id === action.payload.contentId);
          if (content) {
            content.quiz = action.payload;
            content.quizId = action.payload.quizId;
          }
        });
      })
      .addCase(addQuizAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
        console.error('❌ Redux State: Quiz addition failed:', action.payload);
      })

      // Add questions
      .addCase(addQuestionsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addQuestionsAsync.fulfilled, (state, action) => {
        state.loading = false;
        console.log('📝 Redux State: Questions added successfully:', action.payload);
        
        // Update questions with returned IDs
        if (action.payload?.questionIds && Array.isArray(action.payload.questionIds)) {
          action.payload.questionIds.forEach((questionId, index) => {
            if (state.quizBuilder.questions[index]) {
              state.quizBuilder.questions[index].id = questionId;
              state.quizBuilder.questions[index].questionId = questionId;
            }
          });
        }
      })
      .addCase(addQuestionsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
        console.error('❌ Redux State: Questions addition failed:', action.payload);
      })

      // Add options
      .addCase(addOptionsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addOptionsAsync.fulfilled, (state, action) => {
        state.loading = false;
        console.log('📝 Redux State: Options added successfully:', action.payload);
        // Options added successfully - no specific state updates needed
      })
      .addCase(addOptionsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
        console.error('❌ Redux State: Options addition failed:', action.payload);
      })
      
  },
});

// ======================== ACTIONS EXPORT ========================

export const {
  setCurrentStep,
  nextStep,
  prevStep,
  setFormData,
  setEditingSection,
  resetFormData,
  setImagePreview,
  setImageFile,
  addSuccessionRate,
  updateSuccessionRate,
  removeSuccessionRate,
  setSuccessionRates,
  validateSuccessionRates,
  createDefaultSuccessionRates,
  addSection,
  updateSection,
  removeSection,
  setActiveSection,
  reorderSections,
  addContentToSection,
  updateContentInSection,
  removeContentFromSection,
  reorderContentInSection,
  setEditingContent,
  setContentModalType,
  setModalOpen,
  closeAllModals,
  setQuizQuestions,
  addQuizQuestion,
  updateQuizQuestion,
  removeQuizQuestion,
  setCurrentQuestion,
  setQuizContentId,
  clearQuizBuilder,
  setFilters,
  resetFilters,
  setUserAssignment,
  addSelectedUser,
  removeSelectedUser,
  clearSelectedUsers,
  toggleCourseSelection,
  selectAllCourses,
  deselectAllCourses,
  setBulkOperation,
  setAnalytics,
  updateAnalytics,
  updateStatistics,
  clearError,
  clearCourseData,
  calculateCourseDifficulty,
  calculateCourseCompletionRate,
   updateCourseWithRealId,
  extractCourseId,
  setQuizBuilder,
  resetQuizBuilder,
  addQuestionToBuilder,
  updateQuestionInBuilder,
  removeQuestionFromBuilder,
} = courseSlice.actions;

// ======================== SELECTORS ========================

// Basic selectors
export const selectCourses = (state) => state.course.courses;
export const selectCurrentCourse = (state) => state.course.currentCourse;
export const selectCourseLoading = (state) => state.course.loading;
export const selectCourseError = (state) => state.course.error;

// Form selectors
export const selectCurrentStep = (state) => state.course.currentStep;
export const selectFormData = (state) => state.course.formData;
export const selectSections = (state) => state.course.sections;
export const selectActiveSection = (state) => state.course.activeSection;
export const selectSectionContents = (state) => state.course.sectionContents;

// UI selectors
export const selectModals = (state) => state.course.modals;

export const selectFilters = (state) => state.course.filters;

// Data selectors
export const selectCourseLearners = (state) => state.course.courseLearners;
export const selectUserAssignment = (state) => state.course.userAssignment;
export const selectAnalytics = (state) => state.course.analytics;
export const selectStatistics = (state) => state.course.statistics;

// FIXED: Succession rates selectors
export const selectSuccessionRates = (state) => state.course.formData.successionRates;
export const selectSuccessionRateByIndex = (index) => (state) => state.course.formData.successionRates[index];
export const selectSuccessionRatesCount = (state) => state.course.formData.successionRates.length;

// Computed selectors
export const selectFilteredCourses = (state) => {
  const courses = state.course.courses;
  const filters = state.course.filters;
  
  return courses.filter(course => {
    if (filters.search && !course.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    if (filters.categoryId && course.courseCategoryId !== parseInt(filters.categoryId)) {
      return false;
    }
    
    if (filters.tagId && !course.courseTags?.some(tag => tag.id === parseInt(filters.tagId))) {
      return false;
    }
    
    if (filters.hasCertificate !== null && course.verifiedCertificate !== filters.hasCertificate) {
      return false;
    }
    
    if (filters.minDuration && course.duration < parseInt(filters.minDuration)) {
      return false;
    }
    
    if (filters.maxDuration && course.duration > parseInt(filters.maxDuration)) {
      return false;
    }
    
    return true;
  });
};
export const selectQuizBuilder = (state) => state.course.quizBuilder;
export const selectQuizBuilderQuestions = (state) => state.course.quizBuilder.questions;
export const selectQuizBuilderStep = (state) => state.course.quizBuilder.currentStep;
export const selectActiveSectionContents = (state) => {
  const activeSection = state.course.activeSection;
  const sectionContents = state.course.sectionContents;
  
  return activeSection ? sectionContents[activeSection] || [] : [];
};

export const selectCourseById = (courseId) => (state) => {
  return state.course.courses.find(course => course.id === courseId);
};

export const selectCanPublishCourse = (state) => {
  const course = state.course.currentCourse;
  if (!course) return false;
  
  return course.sections && course.sections.length > 0 && 
         course.sections.some(section => section.contents && section.contents.length > 0);
};

export const selectFormValidationErrors = (state) => {
  const formData = state.course.formData;
  return validateCourseData(formData);
};

export const selectCourseProgress = (state) => {
  const course = state.course.currentCourse;
  if (!course) return 0;
  
  return calculateCourseCompletion(course);
};

// FIXED: Succession rates with badges selector
export const selectSuccessionRatesWithBadges = (state) => {
  const successionRates = state.course.formData.successionRates;
  const badges = state.badge?.badges || [];
  
  return successionRates.map(rate => {
    const badge = badges.find(b => b.id === rate.badgeId);
    return {
      ...rate,
      badge: badge || null
    };
  });
};

// FIXED: Validation selector for succession rates
export const selectSuccessionRatesValidation = (state) => {
  const rates = state.course.formData.successionRates;
  const errors = [];
  
  // Check for overlapping ranges
  for (let i = 0; i < rates.length - 1; i++) {
    for (let j = i + 1; j < rates.length; j++) {
      const rate1 = rates[i];
      const rate2 = rates[j];
      
      if ((rate1.minRange <= rate2.maxRange && rate1.maxRange >= rate2.minRange)) {
        errors.push(`Range ${i + 1} overlaps with range ${j + 1}`);
      }
    }
  }
  
  // Check for gaps in coverage
  const sortedRates = [...rates].sort((a, b) => a.minRange - b.minRange);
  for (let i = 0; i < sortedRates.length - 1; i++) {
    if (sortedRates[i].maxRange + 1 < sortedRates[i + 1].minRange) {
      errors.push(`Gap between range ${i + 1} and ${i + 2}`);
    }
  }
  
  // Check if full range is covered (0-100)
  if (sortedRates.length > 0) {
    if (sortedRates[0].minRange > 0) {
      errors.push('Range does not start from 0');
    }
    if (sortedRates[sortedRates.length - 1].maxRange < 100) {
      errors.push('Range does not end at 100');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export default courseSlice.reducer;