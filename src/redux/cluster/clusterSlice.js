// redux/cluster/clusterSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  fetchClusters,
  fetchClusterById,
  createCluster,
  updateCluster,
  deleteCluster,
  assignCoursesToCluster,
  validateClusterData,
  validateCourseAssignmentData,
  getClusterStatistics,
  formatClusterForDisplay,
  getClusterType,
  getClusterCompletionRequirements,
  sortClusters,
  filterClusters,
} from '@/api/cluster';

// ======================== ASYNC THUNKS ========================

export const fetchClustersAsync = createAsyncThunk(
  'cluster/fetchClusters',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await fetchClusters(params);
      // Process response - API returns array wrapped in another array
      const clusters = Array.isArray(response) && response.length > 0 && response[0].clusters
        ? response[0].clusters
        : response;
      
      return clusters.map(cluster => formatClusterForDisplay(cluster));
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchClusterByIdAsync = createAsyncThunk(
  'cluster/fetchClusterById',
  async ({ clusterId, userId = null }, { rejectWithValue }) => {
    try {
      const response = await fetchClusterById(clusterId, userId);
      return formatClusterForDisplay(response);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createClusterAsync = createAsyncThunk(
  'cluster/createCluster',
  async (clusterData, { rejectWithValue }) => {
    try {
      const errors = validateClusterData(clusterData);
      if (errors.length > 0) {
        return rejectWithValue(errors.join(', '));
      }
      const response = await createCluster(clusterData);
      return formatClusterForDisplay(response);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateClusterAsync = createAsyncThunk(
  'cluster/updateCluster',
  async (clusterData, { rejectWithValue }) => {
    try {
      const errors = validateClusterData(clusterData);
      if (errors.length > 0) {
        return rejectWithValue(errors.join(', '));
      }
      const response = await updateCluster(clusterData);
      return formatClusterForDisplay(response);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteClusterAsync = createAsyncThunk(
  'cluster/deleteCluster',
  async (clusterId, { rejectWithValue }) => {
    try {
      await deleteCluster(clusterId);
      return clusterId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const assignCoursesToClusterAsync = createAsyncThunk(
  'cluster/assignCoursesToCluster',
  async (assignmentData, { rejectWithValue }) => {
    try {
      const errors = validateCourseAssignmentData(assignmentData);
      if (errors.length > 0) {
        return rejectWithValue(errors.join(', '));
      }
      const response = await assignCoursesToCluster(assignmentData);
      return { clusterId: assignmentData.clusterId, ...response };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ======================== INITIAL STATE ========================

const clusterInitialState = {
  // Cluster data
  clusters: [],
  currentCluster: null,
  totalClusterCount: 0,
  
  // Loading states
  loading: false,
  clusterLoading: false,
  assignmentLoading: false,
  
  // Error states
  error: null,
  clusterError: null,
  assignmentError: null,
  
  // Form data
  formData: {
    subject: '',
    description: '',
    imageFile: null,
    targetGroupIds: [],
    hasNotification: false,
    paralel: false, // API uses "paralel" not "parallel"
    orderly: false,
    courses: [],
  },
  
  // Course assignment state
  courseAssignment: {
    selectedCourses: [],
    searchTerm: '',
    loading: false,
    error: null,
    availableCourses: [],
  },
  
  // UI state
  showCreateModal: false,
  showEditModal: false,
  showDeleteModal: false,
  showCourseAssignModal: false,
  showCourseSelectionModal: false,
  selectedCluster: null,
  
  // Filters and search
  filters: {
    search: '',
    type: '', // 'parallel', 'sequential', 'flexible', 'mixed'
    targetGroupId: '',
    minCourses: '',
    maxCourses: '',
    page: 1,
    take: 10,
    orderBy: 'createdDate',
  },
  
  // Statistics
  statistics: {
    totalClusters: 0,
    parallelClusters: 0,
    sequentialClusters: 0,
    flexibleClusters: 0,
    averageCourses: 0,
    averageLearners: 0,
    totalCourses: 0,
    totalLearners: 0,
  },
  
  // Bulk operations
  selectedClusters: [],
  bulkOperation: null, // 'delete', 'export', etc.
  
  // Sorting and display
  sortBy: 'createdDate',
  sortOrder: 'desc',
  viewMode: 'grid', // 'grid', 'list'
};

// ======================== SLICE ========================

const clusterSlice = createSlice({
  name: 'cluster',
  initialState: clusterInitialState,
  reducers: {
    // Form data management
    setFormData: (state, action) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    
    resetFormData: (state) => {
      state.formData = clusterInitialState.formData;
      state.courseAssignment.selectedCourses = [];
    },
    
    // Course management in form
    addCourseToCluster: (state, action) => {
      const course = action.payload;
      const existingIndex = state.formData.courses.findIndex(c => c.courseId === course.courseId);
      
      if (existingIndex === -1) {
        state.formData.courses.push({
          courseId: course.courseId,
          name: course.name,
          isMandatory: course.isMandatory || false,
          orderNumber: state.formData.courses.length + 1,
          coefficient: course.coefficient || 0,
        });
      }
    },
    
    removeCourseFromCluster: (state, action) => {
      const courseId = action.payload;
      state.formData.courses = state.formData.courses.filter(c => c.courseId !== courseId);
      // Reorder remaining courses
      state.formData.courses.forEach((course, index) => {
        course.orderNumber = index + 1;
      });
    },
    
    updateCourseInCluster: (state, action) => {
      const { courseId, updates } = action.payload;
      const courseIndex = state.formData.courses.findIndex(c => c.courseId === courseId);
      if (courseIndex !== -1) {
        state.formData.courses[courseIndex] = { 
          ...state.formData.courses[courseIndex], 
          ...updates 
        };
      }
    },
    
    reorderCoursesInCluster: (state, action) => {
      const { sourceIndex, destinationIndex } = action.payload;
      const courses = Array.from(state.formData.courses);
      const [movedCourse] = courses.splice(sourceIndex, 1);
      courses.splice(destinationIndex, 0, movedCourse);
      
      // Update order numbers
      courses.forEach((course, index) => {
        course.orderNumber = index + 1;
      });
      
      state.formData.courses = courses;
    },
    
    // Course assignment management
    setCourseAssignment: (state, action) => {
      state.courseAssignment = { ...state.courseAssignment, ...action.payload };
    },
    
    addSelectedCourse: (state, action) => {
      const course = action.payload;
      const exists = state.courseAssignment.selectedCourses.find(c => c.courseId === course.courseId);
      if (!exists) {
        state.courseAssignment.selectedCourses.push({
          ...course,
          isMandatory: false,
          orderNumber: state.courseAssignment.selectedCourses.length + 1,
          coefficient: 0,
        });
      }
    },
    
    removeSelectedCourse: (state, action) => {
      const courseId = action.payload;
      state.courseAssignment.selectedCourses = state.courseAssignment.selectedCourses.filter(
        c => c.courseId !== courseId
      );
    },
    
    updateSelectedCourse: (state, action) => {
      const { courseId, updates } = action.payload;
      const courseIndex = state.courseAssignment.selectedCourses.findIndex(c => c.courseId === courseId);
      if (courseIndex !== -1) {
        state.courseAssignment.selectedCourses[courseIndex] = {
          ...state.courseAssignment.selectedCourses[courseIndex],
          ...updates,
        };
      }
    },
    
    clearSelectedCourses: (state) => {
      state.courseAssignment.selectedCourses = [];
    },
    
    // Modal management
    setShowCreateModal: (state, action) => {
      state.showCreateModal = action.payload;
      if (!action.payload) {
        clusterSlice.caseReducers.resetFormData(state);
      }
    },
    
    setShowEditModal: (state, action) => {
      state.showEditModal = action.payload;
      if (!action.payload) {
        clusterSlice.caseReducers.resetFormData(state);
      }
    },
    
    setShowDeleteModal: (state, action) => {
      state.showDeleteModal = action.payload;
    },
    
    setShowCourseAssignModal: (state, action) => {
      state.showCourseAssignModal = action.payload;
      if (!action.payload) {
        state.courseAssignment.selectedCourses = [];
        state.courseAssignment.error = null;
      }
    },
    
    setShowCourseSelectionModal: (state, action) => {
      state.showCourseSelectionModal = action.payload;
    },
    
    // Selection management
    setSelectedCluster: (state, action) => {
      state.selectedCluster = action.payload;
      if (action.payload) {
        // Populate form with selected cluster data
        state.formData = {
          subject: action.payload.subject || '',
          description: action.payload.description || '',
          imageFile: null,
          targetGroupIds: action.payload.targetGroupIds || [],
          hasNotification: action.payload.hasNotification || false,
          paralel: action.payload.paralel || false,
          orderly: action.payload.orderly || false,
          courses: action.payload.courses || [],
        };
      }
    },
    
    // Filter management
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    resetFilters: (state) => {
      state.filters = clusterInitialState.filters;
    },
    
    // Sorting and display
    setSortBy: (state, action) => {
      const newSortBy = action.payload;
      if (state.sortBy === newSortBy) {
        state.sortOrder = state.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        state.sortBy = newSortBy;
        state.sortOrder = 'desc';
      }
    },
    
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
    
    // Bulk operations
    toggleClusterSelection: (state, action) => {
      const clusterId = action.payload;
      const index = state.selectedClusters.indexOf(clusterId);
      if (index > -1) {
        state.selectedClusters.splice(index, 1);
      } else {
        state.selectedClusters.push(clusterId);
      }
    },
    
    selectAllClusters: (state) => {
      state.selectedClusters = state.clusters.map(cluster => cluster.id);
    },
    
    deselectAllClusters: (state) => {
      state.selectedClusters = [];
    },
    
    setBulkOperation: (state, action) => {
      state.bulkOperation = action.payload;
    },
    
    // Statistics update
    updateStatistics: (state) => {
      const clusters = state.clusters;
      
      const totalCourses = clusters.reduce((sum, cluster) => 
        sum + (cluster.courses?.length || 0), 0);
      const totalLearners = clusters.reduce((sum, cluster) => 
        sum + (cluster.topAssignedUsers?.length || 0), 0);
      
      state.statistics = {
        totalClusters: clusters.length,
        parallelClusters: clusters.filter(c => c.paralel && !c.orderly).length,
        sequentialClusters: clusters.filter(c => c.orderly && !c.paralel).length,
        flexibleClusters: clusters.filter(c => !c.paralel && !c.orderly).length,
        mixedClusters: clusters.filter(c => c.paralel && c.orderly).length,
        averageCourses: clusters.length > 0 ? Math.round(totalCourses / clusters.length * 10) / 10 : 0,
        averageLearners: clusters.length > 0 ? Math.round(totalLearners / clusters.length * 10) / 10 : 0,
        totalCourses,
        totalLearners,
      };
    },
    
    // Error management
    clearError: (state) => {
      state.error = null;
      state.clusterError = null;
      state.assignmentError = null;
      state.courseAssignment.error = null;
    },
    
    // Cluster type validation
    validateClusterType: (state) => {
      const { paralel, orderly, courses } = state.formData;
      const errors = [];
      
      if (paralel && courses.length > 0) {
        const totalCoefficient = courses.reduce((sum, course) => sum + (course.coefficient || 0), 0);
        if (totalCoefficient !== 100) {
          errors.push('Parallel clusters must have courses with coefficients totaling 100%');
        }
      }
      
      if (orderly && courses.length > 0) {
        const hasInvalidOrder = courses.some((course, index) => course.orderNumber !== index + 1);
        if (hasInvalidOrder) {
          errors.push('Sequential clusters must have properly ordered courses');
        }
      }
      
      return errors;
    },
  },
  
  extraReducers: (builder) => {
    builder
      // Fetch clusters
      .addCase(fetchClustersAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClustersAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.clusters = action.payload;
        state.totalClusterCount = action.payload.length;
        clusterSlice.caseReducers.updateStatistics(state);
      })
      .addCase(fetchClustersAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch single cluster
      .addCase(fetchClusterByIdAsync.pending, (state) => {
        state.clusterLoading = true;
        state.clusterError = null;
      })
      .addCase(fetchClusterByIdAsync.fulfilled, (state, action) => {
        state.clusterLoading = false;
        state.currentCluster = action.payload;
      })
      .addCase(fetchClusterByIdAsync.rejected, (state, action) => {
        state.clusterLoading = false;
        state.clusterError = action.payload;
      })
      
      // Create cluster
      .addCase(createClusterAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createClusterAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.clusters.unshift(action.payload);
        state.totalClusterCount += 1;
        state.showCreateModal = false;
        clusterSlice.caseReducers.resetFormData(state);
        clusterSlice.caseReducers.updateStatistics(state);
      })
      .addCase(createClusterAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update cluster
      .addCase(updateClusterAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateClusterAsync.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.clusters.findIndex(cluster => cluster.id === action.payload.id);
        if (index !== -1) {
          state.clusters[index] = action.payload;
        }
        if (state.currentCluster?.id === action.payload.id) {
          state.currentCluster = action.payload;
        }
        state.showEditModal = false;
        clusterSlice.caseReducers.resetFormData(state);
        clusterSlice.caseReducers.updateStatistics(state);
      })
      .addCase(updateClusterAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete cluster
      .addCase(deleteClusterAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteClusterAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.clusters = state.clusters.filter(cluster => cluster.id !== action.payload);
        state.totalClusterCount = Math.max(0, state.totalClusterCount - 1);
        state.showDeleteModal = false;
        state.selectedCluster = null;
        if (state.currentCluster?.id === action.payload) {
          state.currentCluster = null;
        }
        // Remove from selected clusters if present
        const selectedIndex = state.selectedClusters.indexOf(action.payload);
        if (selectedIndex > -1) {
          state.selectedClusters.splice(selectedIndex, 1);
        }
        clusterSlice.caseReducers.updateStatistics(state);
      })
      .addCase(deleteClusterAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Assign courses to cluster
      .addCase(assignCoursesToClusterAsync.pending, (state) => {
        state.assignmentLoading = true;
        state.assignmentError = null;
        state.courseAssignment.loading = true;
        state.courseAssignment.error = null;
      })
      .addCase(assignCoursesToClusterAsync.fulfilled, (state, action) => {
        state.assignmentLoading = false;
        state.courseAssignment.loading = false;
        state.showCourseAssignModal = false;
        state.courseAssignment.selectedCourses = [];
        
        // Update the cluster in the list
        const clusterId = action.payload.clusterId;
        const clusterIndex = state.clusters.findIndex(c => c.id === clusterId);
        if (clusterIndex !== -1) {
          // Refresh cluster data - in a real app you might want to refetch
          // For now, we'll just mark it as updated
          state.clusters[clusterIndex].lastUpdated = new Date().toISOString();
        }
      })
      .addCase(assignCoursesToClusterAsync.rejected, (state, action) => {
        state.assignmentLoading = false;
        state.assignmentError = action.payload;
        state.courseAssignment.loading = false;
        state.courseAssignment.error = action.payload;
      });
  },
});

// ======================== ACTIONS EXPORT ========================

export const clusterActions = clusterSlice.actions;

export const {
  setFormData,
  resetFormData,
  addCourseToCluster,
  removeCourseFromCluster,
  updateCourseInCluster,
  reorderCoursesInCluster,
  setCourseAssignment,
  addSelectedCourse,
  removeSelectedCourse,
  updateSelectedCourse,
  clearSelectedCourses,
  setShowCreateModal,
  setShowEditModal,
  setShowDeleteModal,
  setShowCourseAssignModal,
  setShowCourseSelectionModal,
  setSelectedCluster,
  setFilters,
  resetFilters,
  setSortBy,
  setViewMode,
  toggleClusterSelection,
  selectAllClusters,
  deselectAllClusters,
  setBulkOperation,
  updateStatistics,
  clearError,
  validateClusterType,
} = clusterSlice.actions;

// ======================== SELECTORS ========================

// Basic selectors
export const selectClusters = (state) => state.cluster.clusters;
export const selectCurrentCluster = (state) => state.cluster.currentCluster;
export const selectClusterLoading = (state) => state.cluster.loading;
export const selectClusterError = (state) => state.cluster.error;

// Form selectors
export const selectFormData = (state) => state.cluster.formData;
export const selectCourseAssignment = (state) => state.cluster.courseAssignment;
export const selectSelectedCluster = (state) => state.cluster.selectedCluster;

// UI selectors
export const selectFilters = (state) => state.cluster.filters;
export const selectSortBy = (state) => state.cluster.sortBy;
export const selectSortOrder = (state) => state.cluster.sortOrder;
export const selectViewMode = (state) => state.cluster.viewMode;

// Statistics selectors
export const selectStatistics = (state) => state.cluster.statistics;
export const selectSelectedClusters = (state) => state.cluster.selectedClusters;

// Computed selectors
export const selectFilteredAndSortedClusters = (state) => {
  const clusters = state.cluster.clusters;
  const filters = state.cluster.filters;
  const sortBy = state.cluster.sortBy;
  const sortOrder = state.cluster.sortOrder;
  
  // Filter clusters
  const filtered = filterClusters(clusters, filters);
  
  // Sort clusters
  const sorted = sortClusters(filtered, sortBy, sortOrder);
  
  return sorted;
};

export const selectClusterById = (clusterId) => (state) => {
  return state.cluster.clusters.find(cluster => cluster.id === clusterId);
};

export const selectClusterTypes = (state) => {
  const clusters = state.cluster.clusters;
  const types = {
    parallel: clusters.filter(c => c.paralel && !c.orderly),
    sequential: clusters.filter(c => c.orderly && !c.paralel),
    flexible: clusters.filter(c => !c.paralel && !c.orderly),
    mixed: clusters.filter(c => c.paralel && c.orderly),
  };
  
  return types;
};

export const selectClusterCompletionRequirements = (clusterId) => (state) => {
  const cluster = state.cluster.clusters.find(c => c.id === clusterId);
  if (!cluster) return null;
  
  return getClusterCompletionRequirements(cluster);
};

export const selectClusterStatistics = (clusterId) => (state) => {
  const cluster = state.cluster.clusters.find(c => c.id === clusterId);
  if (!cluster) return null;
  
  return getClusterStatistics(cluster);
};

export const selectCanCreateCluster = (state) => {
  const formData = state.cluster.formData;
  const errors = validateClusterData(formData);
  return errors.length === 0;
};

export const selectFormValidationErrors = (state) => {
  const formData = state.cluster.formData;
  return validateClusterData(formData);
};

export default clusterSlice.reducer;