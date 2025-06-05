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
  getClusterStatistics,
  formatClusterForDisplay,
} from '@/api/cluster';

export const fetchClustersAsync = createAsyncThunk(
  'cluster/fetchClusters',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await fetchClusters(params);
      return response;
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
      const response = await assignCoursesToCluster(assignmentData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const clusterInitialState = {
  clusters: [],
  currentCluster: null,
  totalClusterCount: 0,
  loading: false,
  clusterLoading: false,
  error: null,
  clusterError: null,
  formData: {
    subject: '',
    description: '',
    imageFile: null,
    targetGroupIds: [],
    hasNotification: false,
    paralel: false,
    orderly: false,
    courses: [],
  },
  courseAssignment: {
    selectedCourses: [],
    searchTerm: '',
    loading: false,
    error: null,
  },
  showCreateModal: false,
  showEditModal: false,
  showDeleteModal: false,
  showCourseAssignModal: false,
  selectedCluster: null,
  filters: {
    search: '',
    page: 1,
    take: 10,
    orderBy: 'CreatedDate',
  },
  statistics: {
    totalClusters: 0,
    parallelClusters: 0,
    orderlyeClusters: 0,
    averageCourses: 0,
  },
};

const clusterSlice = createSlice({
  name: 'cluster',
  initialState: clusterInitialState,
  reducers: {
    setFormData: (state, action) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    resetFormData: (state) => {
      state.formData = clusterInitialState.formData;
    },
    setCourseAssignment: (state, action) => {
      state.courseAssignment = { ...state.courseAssignment, ...action.payload };
    },
    addCourseToCluster: (state, action) => {
      const course = action.payload;
      if (!state.formData.courses.find(c => c.courseId === course.courseId)) {
        state.formData.courses.push(course);
      }
    },
    removeCourseFromCluster: (state, action) => {
      const courseId = action.payload;
      state.formData.courses = state.formData.courses.filter(c => c.courseId !== courseId);
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
    setShowCreateModal: (state, action) => {
      state.showCreateModal = action.payload;
    },
    setShowEditModal: (state, action) => {
      state.showEditModal = action.payload;
    },
    setShowDeleteModal: (state, action) => {
      state.showDeleteModal = action.payload;
    },
    setShowCourseAssignModal: (state, action) => {
      state.showCourseAssignModal = action.payload;
    },
    setSelectedCluster: (state, action) => {
      state.selectedCluster = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    updateStatistics: (state) => {
      const clusters = state.clusters;
      state.statistics = {
        totalClusters: clusters.length,
        parallelClusters: clusters.filter(c => c.paralel).length,
        orderlyeClusters: clusters.filter(c => c.orderly).length,
        averageCourses: clusters.length > 0 ? 
          Math.round(clusters.reduce((sum, c) => sum + (c.courses?.length || 0), 0) / clusters.length) : 0,
      };
    },
    clearError: (state) => {
      state.error = null;
      state.clusterError = null;
      state.courseAssignment.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClustersAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClustersAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.clusters = action.payload.map(formatClusterForDisplay);
        state.totalClusterCount = action.payload.length;
        clusterSlice.caseReducers.updateStatistics(state);
      })
      .addCase(fetchClustersAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createClusterAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.clusters.unshift(action.payload);
        state.totalClusterCount += 1;
        state.showCreateModal = false;
        state.formData = clusterInitialState.formData;
        clusterSlice.caseReducers.updateStatistics(state);
      })
      .addCase(deleteClusterAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.clusters = state.clusters.filter(cluster => cluster.id !== action.payload);
        state.totalClusterCount = Math.max(0, state.totalClusterCount - 1);
        state.showDeleteModal = false;
        state.selectedCluster = null;
        clusterSlice.caseReducers.updateStatistics(state);
      });
  },
});

export const clusterActions = clusterSlice.actions;
export default clusterSlice.reducer;
