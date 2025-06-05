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
  getCourseLearners,
  assignUsersToCourse,
} from "@/api/course";
import {
  addContent as apiAddContent,
  updateContent as apiUpdateContent,
  deleteContent as apiDeleteContent,
  getContentsBySection,
} from "@/api/courseContent";
import { getUserId } from "@/authtoken/auth.js";

// Async thunks
export const fetchCoursesAsync = createAsyncThunk(
  "course/fetchCourses",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await fetchCourses(params);
      return response;
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
      return response;
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
        verifiedCertificate:
          courseData.verifiedCertificate ??
          state.formData.verifiedCertificate ??
          false,
        categoryId: courseData.categoryId || state.formData.categoryId,
        imageFile: courseData.imageFile || state.formData.imageFile,
        targetGroupIds: courseData.targetGroupIds || state.formData.targetGroupIds || [],
        certificateId: courseData.certificateId || state.formData.certificateId,
        tagIds: courseData.tagIds || state.formData.tagIds || [],
        successionRates: courseData.successionRates || state.successionRates,
        startDuration: courseData.startDuration || state.formData.startDuration,
        deadline: courseData.deadline || state.formData.deadline,
        autoReassign: courseData.autoReassign ?? state.formData.autoReassign ?? false,
        clusterId: courseData.clusterId || state.formData.clusterId,
        clusterOrderNumber: courseData.clusterOrderNumber || state.formData.clusterOrderNumber,
        clusterCoefficient: courseData.clusterCoefficient || state.formData.clusterCoefficient,
        clusterIsMandatory: courseData.clusterIsMandatory ?? state.formData.clusterIsMandatory ?? false,
      };

      const response = await apiCreateCourse(apiData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to create course");
    }
  }
);

export const updateCourseAsync = createAsyncThunk(
  "course/updateCourse",
  async (courseData, { rejectWithValue }) => {
    try {
      const response = await apiUpdateCourse(courseData);
      return response;
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

export const addSectionAsync = createAsyncThunk(
  "course/addSection",
  async (sectionData, { rejectWithValue }) => {
    try {
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

// Initial state
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

    // Cluster settings
    clusterId: null,
    clusterOrderNumber: 0,
    clusterCoefficient: 0,
    clusterIsMandatory: false,
  },

  // Succession rates for certificates
  successionRates: [
    { certificateId: 1, minRange: 0, maxRange: 60 },
    { certificateId: 2, minRange: 60, maxRange: 100 },
  ],

  // Sections and content
  sections: [],
  activeSection: null,

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
    deleteConfirm: false,
    assignUsers: false,
  },

  // Quiz builder state
  quizBuilder: {
    questions: [],
    currentQuestion: null,
    isEditing: false,
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
};

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

    // Form data
    setFormData: (state, action) => {
      console.log("Redux setFormData called with:", action.payload);
      state.formData = { ...state.formData, ...action.payload };
    },

    resetFormData: (state) => {
      state.formData = initialState.formData;
      state.sections = [];
      state.activeSection = null;
      state.currentStep = 1;
      state.quizBuilder = initialState.quizBuilder;
    },

    setImagePreview: (state, action) => {
      state.formData.imagePreview = action.payload;
    },

    setImageFile: (state, action) => {
      state.formData.imageFile = action.payload;
    },

    // Succession rates
    setSuccessionRates: (state, action) => {
      state.successionRates = action.payload;
    },

    updateSuccessionRate: (state, action) => {
      const { index, updates } = action.payload;
      if (state.successionRates[index]) {
        state.successionRates[index] = {
          ...state.successionRates[index],
          ...updates,
        };
      }
    },

    // Sections
    addSection: (state) => {
      const newSection = {
        id: `temp-${Date.now()}`,
        title: `Section ${state.sections.length + 1}`,
        description: "",
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
      if (state.activeSection === sectionId) {
        state.activeSection =
          state.sections.length > 0 ? state.sections[0].id : null;
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

    // Content
    addContentToSection: (state, action) => {
      const { sectionId, content } = action.payload;
      const section = state.sections.find((s) => s.id === sectionId);
      if (section) {
        const newContent = {
          id: `temp-${Date.now()}`,
          ...content,
          isTemp: true,
        };
        section.contents.push(newContent);
      }
    },

    updateContentInSection: (state, action) => {
      const { sectionId, contentId, updates } = action.payload;
      const section = state.sections.find((s) => s.id === sectionId);
      if (section) {
        const contentIndex = section.contents.findIndex(
          (c) => c.id === contentId
        );
        if (contentIndex !== -1) {
          section.contents[contentIndex] = {
            ...section.contents[contentIndex],
            ...updates,
          };
        }
      }
    },

    removeContentFromSection: (state, action) => {
      const { sectionId, contentId } = action.payload;
      const section = state.sections.find((s) => s.id === sectionId);
      if (section) {
        section.contents = section.contents.filter((c) => c.id !== contentId);
      }
    },

    reorderContentInSection: (state, action) => {
      const { sectionId, sourceIndex, destinationIndex } = action.payload;
      const section = state.sections.find((s) => s.id === sectionId);
      if (section) {
        const contents = Array.from(section.contents);
        const [movedContent] = contents.splice(sourceIndex, 1);
        contents.splice(destinationIndex, 0, movedContent);
        section.contents = contents;
      }
    },

    // Content editing
    setEditingContent: (state, action) => {
      state.editingContent = action.payload;
    },

    setContentModalType: (state, action) => {
      state.contentModalType = action.payload;
    },

    // Modals
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

    clearQuizBuilder: (state) => {
      state.quizBuilder = {
        questions: [],
        currentQuestion: null,
        isEditing: false,
      };
    },

    // Analytics
    setAnalytics: (state, action) => {
      state.analytics = { ...state.analytics, ...action.payload };
    },

    // Clear errors
    clearError: (state) => {
      state.error = null;
      state.courseError = null;
      state.courseLearners.error = null;
    },

    clearCourseData: (state) => {
      state.currentCourse = null;
      state.courseLearners = initialState.courseLearners;
      state.analytics = initialState.analytics;
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
        
        if (action.payload && typeof action.payload === 'object') {
          if (action.payload.courses && Array.isArray(action.payload.courses)) {
            // Response has courses property
            state.courses = action.payload.courses;
            state.totalCourseCount = action.payload.totalCourseCount || action.payload.courses.length;
          } else if (Array.isArray(action.payload)) {
            // Response is directly an array
            state.courses = action.payload;
            state.totalCourseCount = action.payload.length;
          } else {
            // Response is an object, try to find courses data
            const courses = action.payload[0]?.courses || [];
            state.courses = courses;
            state.totalCourseCount = action.payload[0]?.totalCourseCount || courses.length;
          }
        } else {
          state.courses = [];
          state.totalCourseCount = 0;
        }
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
        // Add to courses list
        state.courses.unshift(action.payload);
        state.totalCourseCount += 1;
        // Reset form after successful creation
        state.formData = initialState.formData;
        state.sections = [];
        state.activeSection = null;
        state.currentStep = 1;
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
        const courseIndex = state.courses.findIndex(
          (c) => c.id === action.payload.id
        );
        if (courseIndex !== -1) {
          state.courses[courseIndex] = action.payload;
        }
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
          state.currentCourse = null;
        }
      })
      .addCase(deleteCourseAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Publish course
      .addCase(publishCourseAsync.fulfilled, (state, action) => {
        const courseIndex = state.courses.findIndex(
          (c) => c.id === action.payload.courseId
        );
        if (courseIndex !== -1) {
          state.courses[courseIndex].publishCourse = true;
        }
        if (state.currentCourse?.id === action.payload.courseId) {
          state.currentCourse.publishCourse = true;
        }
      })
      .addCase(publishCourseAsync.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
      })

      // Course learners
      .addCase(fetchCourseLearnersAsync.pending, (state) => {
        state.courseLearners.loading = true;
        state.courseLearners.error = null;
      })
      .addCase(fetchCourseLearnersAsync.fulfilled, (state, action) => {
        state.courseLearners.loading = false;
        if (action.payload && action.payload.learnerUsers) {
          state.courseLearners.data = action.payload.learnerUsers[0]?.learnerUsers || [];
          state.courseLearners.totalCount = action.payload.totalLearnerCount || 0;
        }
      })
      .addCase(fetchCourseLearnersAsync.rejected, (state, action) => {
        state.courseLearners.loading = false;
        state.courseLearners.error = action.payload || action.error.message;
      })

      // Add section
      .addCase(addSectionAsync.fulfilled, (state, action) => {
        const tempSectionIndex = state.sections.findIndex((s) => s.isTemp);
        if (tempSectionIndex !== -1) {
          state.sections[tempSectionIndex] = {
            ...action.payload,
            contents: state.sections[tempSectionIndex].contents,
          };
        }
      })

      // Update section
      .addCase(updateSectionAsync.fulfilled, (state, action) => {
        const sectionIndex = state.sections.findIndex(
          (s) => s.id === action.payload.id
        );
        if (sectionIndex !== -1) {
          state.sections[sectionIndex] = {
            ...state.sections[sectionIndex],
            ...action.payload,
          };
        }
      })

      // Delete section
      .addCase(deleteSectionAsync.fulfilled, (state, action) => {
        state.sections = state.sections.filter((s) => s.id !== action.payload);
        if (state.activeSection === action.payload) {
          state.activeSection =
            state.sections.length > 0 ? state.sections[0].id : null;
        }
      })

      // Add content
      .addCase(addContentAsync.fulfilled, (state, action) => {
        const section = state.sections.find(
          (s) => s.id === action.meta.arg.sectionId
        );
        if (section) {
          const tempContentIndex = section.contents.findIndex((c) => c.isTemp);
          if (tempContentIndex !== -1) {
            section.contents[tempContentIndex] = action.payload;
          }
        }
      })

      // Update content
      .addCase(updateContentAsync.fulfilled, (state, action) => {
        const section = state.sections.find((s) =>
          s.contents.some((c) => c.id === action.payload.id)
        );
        if (section) {
          const contentIndex = section.contents.findIndex(
            (c) => c.id === action.payload.id
          );
          if (contentIndex !== -1) {
            section.contents[contentIndex] = action.payload;
          }
        }
      })

      // Delete content
      .addCase(deleteContentAsync.fulfilled, (state, action) => {
        state.sections.forEach((section) => {
          section.contents = section.contents.filter(
            (c) => c.id !== action.payload
          );
        });
      })

      // Fetch section contents
      .addCase(fetchSectionContentsAsync.fulfilled, (state, action) => {
        const section = state.sections.find(
          (s) => s.id === action.payload.sectionId
        );
        if (section) {
          section.contents = action.payload.contents;
        }
      });
  },
});

export const {
  setCurrentStep,
  nextStep,
  prevStep,
  setFormData,
  resetFormData,
  setImagePreview,
  setImageFile,
  setSuccessionRates,
  updateSuccessionRate,
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
  clearQuizBuilder,
  setAnalytics,
  clearError,
  clearCourseData,
} = courseSlice.actions;

export default courseSlice.reducer;