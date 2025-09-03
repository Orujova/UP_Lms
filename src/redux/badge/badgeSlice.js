// redux/badge/badgeSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  fetchBadges,
  fetchBadgeById,
  createBadge,
  updateBadge,
  deleteBadge,
  formatBadgeForDisplay
} from '@/api/badge';

// ======================== ASYNC THUNKS ========================

export const fetchBadgesAsync = createAsyncThunk(
  'badge/fetchBadges',
  async (params = {}, { rejectWithValue }) => {
    try {
      const badges = await fetchBadges(params);
      return badges.map(badge => formatBadgeForDisplay(badge));
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch badges');
    }
  }
);

export const fetchBadgeByIdAsync = createAsyncThunk(
  'badge/fetchBadgeById',
  async (badgeId, { rejectWithValue }) => {
    try {
      const badge = await fetchBadgeById(badgeId);
      return formatBadgeForDisplay(badge);
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch badge');
    }
  }
);

export const createBadgeAsync = createAsyncThunk(
  'badge/createBadge',
  async (badgeData, { rejectWithValue }) => {
    try {
      const badge = await createBadge(badgeData);
      return formatBadgeForDisplay(badge);
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create badge');
    }
  }
);

export const updateBadgeAsync = createAsyncThunk(
  'badge/updateBadge',
  async (badgeData, { rejectWithValue }) => {
    try {
      const badge = await updateBadge(badgeData);
      return formatBadgeForDisplay(badge);
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update badge');
    }
  }
);

// UPDATED: Delete badge async thunk with new API format
export const deleteBadgeAsync = createAsyncThunk(
  'badge/deleteBadge',
  async (deleteData, { rejectWithValue }) => {
    try {
      // Handle different input formats
      let deletePayload;
      
      if (typeof deleteData === 'number' || typeof deleteData === 'string') {
        // Legacy format - just the badge ID
        deletePayload = {
          id: parseInt(deleteData),
          language: "string" // Default language as per API spec
        };
      } else if (deleteData && typeof deleteData === 'object') {
        // New format - object with id, language, and optional badge data
        deletePayload = {
          id: deleteData.id || deleteData.badgeId,
          language: deleteData.language || "string"
        };
      } else {
        throw new Error("Invalid delete data provided");
      }

      console.log('Deleting badge with payload:', deletePayload);
      
      await deleteBadge(deletePayload);
      
      // Return the badge ID for state management
      return deletePayload.id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete badge');
    }
  }
);

// ======================== INITIAL STATE ========================

const initialState = {
  badges: [],
  currentBadge: null,
  loading: false,
  error: null,
  
  // Pagination
  currentPage: 1,
  totalBadges: 0,
  
  // Filters
  filters: {
    search: '',
    page: 1,
    take: 10,
  },
};

// ======================== SLICE ========================

const badgeSlice = createSlice({
  name: 'badge',
  initialState,
  reducers: {
    // Filters
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    
    // Current badge
    setCurrentBadge: (state, action) => {
      state.currentBadge = action.payload;
    },
    
    clearCurrentBadge: (state) => {
      state.currentBadge = null;
    },
    
    // Error management
    clearError: (state) => {
      state.error = null;
    },
  },
  
  extraReducers: (builder) => {
    builder
      // Fetch badges
      .addCase(fetchBadgesAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBadgesAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.badges = action.payload;
        state.totalBadges = action.payload.length;
      })
      .addCase(fetchBadgesAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
        state.badges = [];
      })
      
      // Fetch single badge
      .addCase(fetchBadgeByIdAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBadgeByIdAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBadge = action.payload;
      })
      .addCase(fetchBadgeByIdAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      
      // Create badge
      .addCase(createBadgeAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBadgeAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.badges.unshift(action.payload);
        state.totalBadges += 1;
      })
      .addCase(createBadgeAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      
      // Update badge
      .addCase(updateBadgeAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBadgeAsync.fulfilled, (state, action) => {
        state.loading = false;
        const badgeIndex = state.badges.findIndex(b => b.id === action.payload.id);
        if (badgeIndex !== -1) {
          state.badges[badgeIndex] = action.payload;
        }
        state.currentBadge = action.payload;
      })
      .addCase(updateBadgeAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      
      // UPDATED: Delete badge with improved state management
      .addCase(deleteBadgeAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBadgeAsync.fulfilled, (state, action) => {
        state.loading = false;
        const deletedBadgeId = action.payload;
        
        // Remove badge from badges array
        state.badges = state.badges.filter(b => b.id !== deletedBadgeId);
        state.totalBadges = Math.max(0, state.totalBadges - 1);
        
        // Clear current badge if it was the deleted one
        if (state.currentBadge?.id === deletedBadgeId) {
          state.currentBadge = null;
        }
        
        console.log(`Badge ${deletedBadgeId} successfully removed from state`);
      })
      .addCase(deleteBadgeAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

// ======================== ACTIONS EXPORT ========================

export const {
  setFilters,
  resetFilters,
  setCurrentBadge,
  clearCurrentBadge,
  clearError,
} = badgeSlice.actions;

// ======================== SELECTORS ========================

export const selectBadges = (state) => state.badge.badges;
export const selectCurrentBadge = (state) => state.badge.currentBadge;
export const selectBadgeLoading = (state) => state.badge.loading;
export const selectBadgeError = (state) => state.badge.error;
export const selectBadgeFilters = (state) => state.badge.filters;

export default badgeSlice.reducer;