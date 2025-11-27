// src/redux/positionCourseRequirement/positionCourseRequirementSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  fetchPositionCourseRequirements,
  fetchPositionCourseRequirementById,
  createPositionCourseRequirement,
  updatePositionCourseRequirement,
  deletePositionCourseRequirements,
  uploadTrainingMatrixExcel,
  fetchDistinctCourseNames,
  formatRequirementForDisplay,
} from '@/api/positionCourseRequirement';

// ======================== ASYNC THUNKS ========================

// Fetch distinct course names
export const fetchCourseNamesAsync = createAsyncThunk(
  'positionCourseRequirement/fetchCourseNames',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchDistinctCourseNames();
      return response || [];
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch course names');
    }
  }
);

// Fetch all requirements with filters
export const fetchRequirementsAsync = createAsyncThunk(
  'positionCourseRequirement/fetchRequirements',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await fetchPositionCourseRequirements(params);
      return {
        requirements: response.positionCourseRequirements?.map(req => formatRequirementForDisplay(req)) || [],
        totalCount: response.totalPositionCourseRequirementCount || 0
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch requirements');
    }
  }
);

// Fetch single requirement by ID
export const fetchRequirementByIdAsync = createAsyncThunk(
  'positionCourseRequirement/fetchRequirementById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetchPositionCourseRequirementById(id);
      return formatRequirementForDisplay(response);
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch requirement');
    }
  }
);

// Create new requirement
export const createRequirementAsync = createAsyncThunk(
  'positionCourseRequirement/createRequirement',
  async (data, { rejectWithValue }) => {
    try {
      const response = await createPositionCourseRequirement(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create requirement');
    }
  }
);

// Update existing requirement
export const updateRequirementAsync = createAsyncThunk(
  'positionCourseRequirement/updateRequirement',
  async (data, { rejectWithValue }) => {
    try {
      const response = await updatePositionCourseRequirement(data);
      return formatRequirementForDisplay(response);
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update requirement');
    }
  }
);

// Delete multiple requirements (bulk delete)
export const deleteRequirementsAsync = createAsyncThunk(
  'positionCourseRequirement/deleteRequirements',
  async (ids, { rejectWithValue }) => {
    try {
      if (!ids || ids.length === 0) {
        throw new Error('No IDs provided for deletion');
      }
      await deletePositionCourseRequirements(ids);
      return ids;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete requirements');
    }
  }
);

// Upload Excel file
export const uploadExcelAsync = createAsyncThunk(
  'positionCourseRequirement/uploadExcel',
  async (file, { rejectWithValue }) => {
    try {
      const response = await uploadTrainingMatrixExcel(file);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to upload Excel file');
    }
  }
);

// ======================== INITIAL STATE ========================

const initialState = {
  // Data
  requirements: [],
  totalCount: 0,
  currentRequirement: null,
  courseNames: [],
  
  // Loading states
  loading: false,
  coursesLoading: false,
  uploadLoading: false,
  
  // Error states
  error: null,
  uploadError: null,
  
  // Selection
  selectedRequirements: [],
  
  // Filters
  filters: {
    positionIds: [],
    functionalAreaIds: [],
    courseNames: [],
    searchTerm: ''
  },
  
  // Upload progress
  uploadProgress: 0,
};

// ======================== SLICE ========================

const positionCourseRequirementSlice = createSlice({
  name: 'positionCourseRequirement',
  initialState,
  reducers: {
    // Selection actions
    setSelectedRequirements: (state, action) => {
      state.selectedRequirements = action.payload;
    },
    
    toggleRequirementSelection: (state, action) => {
      const id = action.payload;
      const index = state.selectedRequirements.indexOf(id);
      
      if (index > -1) {
        state.selectedRequirements.splice(index, 1);
      } else {
        state.selectedRequirements.push(id);
      }
    },
    
    selectAllRequirements: (state) => {
      state.selectedRequirements = state.requirements.map(req => req.id);
    },
    
    clearSelection: (state) => {
      state.selectedRequirements = [];
    },
    
    // Filter actions
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    clearFilters: (state) => {
      state.filters = {
        positionIds: [],
        functionalAreaIds: [],
        courseNames: [],
        searchTerm: ''
      };
    },
    
    // Error handling
    clearError: (state) => {
      state.error = null;
      state.uploadError = null;
    },
    
    // Reset state
    resetState: (state) => {
      return initialState;
    }
  },
  
  extraReducers: (builder) => {
    builder
      // ==================== FETCH COURSE NAMES ====================
      .addCase(fetchCourseNamesAsync.pending, (state) => {
        state.coursesLoading = true;
        state.error = null;
      })
      .addCase(fetchCourseNamesAsync.fulfilled, (state, action) => {
        state.coursesLoading = false;
        state.courseNames = action.payload;
      })
      .addCase(fetchCourseNamesAsync.rejected, (state, action) => {
        state.coursesLoading = false;
        state.error = action.payload;
        state.courseNames = [];
      })
      
      // ==================== FETCH REQUIREMENTS ====================
      .addCase(fetchRequirementsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRequirementsAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.requirements = action.payload.requirements;
        state.totalCount = action.payload.totalCount;
      })
      .addCase(fetchRequirementsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.requirements = [];
        state.totalCount = 0;
      })
      
      // ==================== FETCH SINGLE REQUIREMENT ====================
      .addCase(fetchRequirementByIdAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRequirementByIdAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRequirement = action.payload;
      })
      .addCase(fetchRequirementByIdAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.currentRequirement = null;
      })
      
      // ==================== CREATE REQUIREMENT ====================
      .addCase(createRequirementAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRequirementAsync.fulfilled, (state) => {
        state.loading = false;
        // Data will be refreshed by fetching again
      })
      .addCase(createRequirementAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // ==================== UPDATE REQUIREMENT ====================
      .addCase(updateRequirementAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRequirementAsync.fulfilled, (state, action) => {
        state.loading = false;
        
        // Update in the list if exists
        const index = state.requirements.findIndex(req => req.id === action.payload.id);
        if (index !== -1) {
          state.requirements[index] = action.payload;
        }
        
        // Update current requirement if it's the same
        if (state.currentRequirement?.id === action.payload.id) {
          state.currentRequirement = action.payload;
        }
      })
      .addCase(updateRequirementAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // ==================== DELETE REQUIREMENTS (BULK) ====================
      .addCase(deleteRequirementsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRequirementsAsync.fulfilled, (state, action) => {
        state.loading = false;
        
        // Remove deleted items from the list
        const deletedIds = action.payload;
        state.requirements = state.requirements.filter(
          req => !deletedIds.includes(req.id)
        );
        
        // Update total count
        state.totalCount = Math.max(0, state.totalCount - deletedIds.length);
        
        // Clear selection
        state.selectedRequirements = [];
        
        // Clear current requirement if it was deleted
        if (state.currentRequirement && deletedIds.includes(state.currentRequirement.id)) {
          state.currentRequirement = null;
        }
      })
      .addCase(deleteRequirementsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // ==================== UPLOAD EXCEL ====================
      .addCase(uploadExcelAsync.pending, (state) => {
        state.uploadLoading = true;
        state.uploadError = null;
        state.uploadProgress = 0;
      })
      .addCase(uploadExcelAsync.fulfilled, (state) => {
        state.uploadLoading = false;
        state.uploadProgress = 100;
        // Data will be refreshed by fetching again
      })
      .addCase(uploadExcelAsync.rejected, (state, action) => {
        state.uploadLoading = false;
        state.uploadError = action.payload;
        state.uploadProgress = 0;
      });
  }
});

// ======================== EXPORTS ========================

export const {
  setSelectedRequirements,
  toggleRequirementSelection,
  selectAllRequirements,
  clearSelection,
  setFilters,
  clearFilters,
  clearError,
  resetState
} = positionCourseRequirementSlice.actions;

export default positionCourseRequirementSlice.reducer;