// redux/course/courseSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
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
  checkUserInTargetGroup,
  getQuizzesByContentId,
  createCourseEvaluation,
  validateCourseData,
  validateSectionData,
  formatCourseForDisplay,
  formatDuration,
  getCourseDifficulty,
  calculateCourseCompletion,
} from "@/api/course";
import {
  addContent as apiAddContent,
  updateContent as apiUpdateContent,
  deleteContent as apiDeleteContent,
  getContentsBySection,
} from "@/api/courseContent";
import { getUserId } from "@/authtoken/auth.js";

// ======================== ASYNC THUNKS ========================

export const fetchCoursesAsync = createAsyncThunk(
  "course/fetchCourses",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await fetchCourses(params);
      return {
        courses: response.courses.map(course => formatCourseForDisplay(course)),
        totalCourseCount: response.totalCourseCount,
      };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch courses");
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
  async (courseData, { getState, rejectWithValue }) => {
    try {
      const state = getState().course;
      const userId = getUserId();

      const apiData = {
        name: courseData.name || state.formData.name,
        description: courseData.description || state.formData.description,
        duration: courseData.duration || state.formData.duration || 200,
        verifiedCertificate: courseData.verifiedCertificate ?? state.formData.verifiedCertificate ?? false,
        categoryId: courseData.categoryId || state.formData.categoryId,
        imageFile: courseData.imageFile || state.formData.imageFile,
        targetGroupIds: courseData.targetGroupIds || state.formData.targetGroupIds || [],
        certificateId: courseData.certificateId || state.formData.certificateId,
        tagIds: courseData.tagIds || state.formData.tagIds || [],
        startDuration: courseData.startDuration || state.formData.startDuration,
        deadline: courseData.deadline || state.formData.deadline,
        autoReassign: courseData.autoReassign ?? state.formData.autoReassign ?? false,
        clusterId: courseData.clusterId || state.formData.clusterId,
        clusterOrderNumber: courseData.clusterOrderNumber || state.formData.clusterOrderNumber,
        clusterCoefficient: courseData.clusterCoefficient || state.formData.clusterCoefficient,
        clusterIsMandatory: courseData.clusterIsMandatory ?? state.formData.clusterIsMandatory,
        successionRates: courseData.successionRates || state.formData.successionRates || [],
      };

      const response = await apiCreateCourse(apiData);
      return formatCourseForDisplay(response);
    } catch (error) {
      return rejectWithValue(error.message || "Failed to create course");
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
      
      const response = await apiUpdateCourse(courseData);
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

export const checkUserInTargetGroupAsync = createAsyncThunk(
  "course/checkUserInTargetGroup",
  async ({ userId, targetGroupId }, { rejectWithValue }) => {
    try {
      const response = await checkUserInTargetGroup(userId, targetGroupId);
      return { userId, targetGroupId, ...response };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to check user in target group");
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

// Evaluation
export const createCourseEvaluationAsync = createAsyncThunk(
  "course/createCourseEvaluation",
  async (evaluationData, { rejectWithValue }) => {
    try {
      const response = await createCourseEvaluation(evaluationData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to create course evaluation");
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
    autoReassign: false,
    hasEvaluation: false,
    publishCourse: false,
    
    // Cluster settings
    clusterId: null,
    clusterOrderNumber: null,
    clusterCoefficient: null,
    clusterIsMandatory: false,
    
    // Succession rates
    successionRates: [],
  },

  // Sections and content
  sections: [],
  activeSection: null,
  sectionContents: {}, // { sectionId: [contents] }

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
    orderBy: 'createdDate',
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

    // Succession rates management
    addSuccessionRate: (state, action) => {
      state.formData.successionRates.push({
        rate: action.payload.rate || 0,
        description: action.payload.description || '',
      });
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

    // Sections management
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

    removeSection: (state, action) => {
      const sectionId = action.payload;
      state.sections = state.sections.filter((s) => s.id !== sectionId);
      
      // Remove section contents
      delete state.sectionContents[sectionId];
      
      if (state.activeSection === sectionId) {
        state.activeSection = state.sections.length > 0 ? state.sections[0].id : null;
      }
    },

    setActiveSection: (state, action) => {
      state.activeSection = action.payload;
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

    // Filters management
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
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
      .addCase(createCourseAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCourse = action.payload;
        state.courses.unshift(action.payload);
        state.totalCourseCount += 1;
        courseSlice.caseReducers.updateStatistics(state);
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

      // Section management
      .addCase(addSectionAsync.fulfilled, (state, action) => {
        // Replace temp section with real section
        if (state.activeSection?.toString().startsWith('temp-')) {
          const tempIndex = state.sections.findIndex(s => s.id === state.activeSection);
          if (tempIndex !== -1) {
            state.sections[tempIndex] = { ...action.payload, contents: [] };
            state.activeSection = action.payload.id;
          }
        } else {
          state.sections.push({ ...action.payload, contents: [] });
        }
      })

      .addCase(updateSectionAsync.fulfilled, (state, action) => {
        const sectionIndex = state.sections.findIndex(s => s.id === action.payload.id);
        if (sectionIndex !== -1) {
          state.sections[sectionIndex] = { ...state.sections[sectionIndex], ...action.payload };
        }
      })

      .addCase(deleteSectionAsync.fulfilled, (state, action) => {
        courseSlice.caseReducers.removeSection(state, action);
      })

      .addCase(getSectionsByCourseIdAsync.fulfilled, (state, action) => {
        const { courseId, sections } = action.payload;
        if (state.currentCourse?.id === courseId) {
          state.sections = sections;
          state.activeSection = sections.length > 0 ? sections[0].id : null;
        }
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

      // Evaluation
      .addCase(createCourseEvaluationAsync.fulfilled, (state, action) => {
        state.modals.evaluation = false;
        // Update course with evaluation data if needed
        if (state.currentCourse) {
          state.currentCourse.hasEvaluation = true;
        }
      });
  },
});

// ======================== ACTIONS EXPORT ========================

export const {
  setCurrentStep,
  nextStep,
  prevStep,
  setFormData,
  resetFormData,
  setImagePreview,
  setImageFile,
  addSuccessionRate,
  updateSuccessionRate,
  removeSuccessionRate,
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
export const selectQuizBuilder = (state) => state.course.quizBuilder;
export const selectFilters = (state) => state.course.filters;

// Data selectors
export const selectCourseLearners = (state) => state.course.courseLearners;
export const selectUserAssignment = (state) => state.course.userAssignment;
export const selectAnalytics = (state) => state.course.analytics;
export const selectStatistics = (state) => state.course.statistics;

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

export default courseSlice.reducer;