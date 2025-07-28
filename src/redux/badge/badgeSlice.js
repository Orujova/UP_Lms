// redux/badge/badgeSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  fetchBadges,
  fetchBadgeById,
  createBadge,
  updateBadge,
  deleteBadge,
  formatBadgeForDisplay,
  testBadgeAPI
} from '@/api/badge';

// ======================== ASYNC THUNKS ========================

export const fetchBadgesAsync = createAsyncThunk(
  'badge/fetchBadges',
  async (params = {}, { rejectWithValue }) => {
    try {
      console.log('Redux: Fetching badges with params:', params);
      
      // Default parametrlər
      const requestParams = {
        page: params.page || 1,
        take: params.take || 100, // Daha çox badge gətirmək üçün
        ...params
      };
      
      const badges = await fetchBadges(requestParams);
      
      console.log('Redux: Fetched badges:', badges);
      
      // Badges array'inin boş olub olmadığını yoxlayırıq
      if (!Array.isArray(badges)) {
        console.warn('Redux: fetchBadges did not return an array:', badges);
        return [];
      }
      
      return badges;
    } catch (error) {
      console.error('Redux: Error in fetchBadgesAsync:', error);
      return rejectWithValue(error.message || 'Failed to fetch badges');
    }
  }
);

export const fetchBadgeByIdAsync = createAsyncThunk(
  'badge/fetchBadgeById',
  async (badgeId, { rejectWithValue }) => {
    try {
      console.log('Redux: Fetching badge by ID:', badgeId);
      
      if (!badgeId) {
        return rejectWithValue('Badge ID is required');
      }
      
      const badge = await fetchBadgeById(badgeId);
      const formattedBadge = formatBadgeForDisplay(badge);
      
      console.log('Redux: Fetched single badge:', formattedBadge);
      return formattedBadge;
    } catch (error) {
      console.error('Redux: Error in fetchBadgeByIdAsync:', error);
      return rejectWithValue(error.message || 'Failed to fetch badge');
    }
  }
);

export const createBadgeAsync = createAsyncThunk(
  'badge/createBadge',
  async (badgeData, { rejectWithValue }) => {
    try {
      console.log('Redux: Creating badge:', badgeData);
      
      if (!badgeData.badgeName || !badgeData.badgeName.trim()) {
        return rejectWithValue('Badge name is required');
      }
      
      const badge = await createBadge(badgeData);
      const formattedBadge = formatBadgeForDisplay(badge);
      
      console.log('Redux: Created badge:', formattedBadge);
      return formattedBadge;
    } catch (error) {
      console.error('Redux: Error in createBadgeAsync:', error);
      return rejectWithValue(error.message || 'Failed to create badge');
    }
  }
);

export const updateBadgeAsync = createAsyncThunk(
  'badge/updateBadge',
  async (badgeData, { rejectWithValue }) => {
    try {
      console.log('Redux: Updating badge:', badgeData);
      
      if (!badgeData.id) {
        return rejectWithValue('Badge ID is required');
      }
      
      const badge = await updateBadge(badgeData);
      const formattedBadge = formatBadgeForDisplay(badge);
      
      console.log('Redux: Updated badge:', formattedBadge);
      return formattedBadge;
    } catch (error) {
      console.error('Redux: Error in updateBadgeAsync:', error);
      return rejectWithValue(error.message || 'Failed to update badge');
    }
  }
);

export const deleteBadgeAsync = createAsyncThunk(
  'badge/deleteBadge',
  async (badgeId, { rejectWithValue }) => {
    try {
      console.log('Redux: Deleting badge:', badgeId);
      
      if (!badgeId) {
        return rejectWithValue('Badge ID is required');
      }
      
      await deleteBadge(badgeId);
      
      console.log('Redux: Deleted badge with ID:', badgeId);
      return badgeId;
    } catch (error) {
      console.error('Redux: Error in deleteBadgeAsync:', error);
      return rejectWithValue(error.message || 'Failed to delete badge');
    }
  }
);

// Badge API test thunk
export const testBadgeConnectionAsync = createAsyncThunk(
  'badge/testConnection',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Redux: Testing badge API connection...');
      const isConnected = await testBadgeAPI();
      return isConnected;
    } catch (error) {
      console.error('Redux: Badge API connection test failed:', error);
      return rejectWithValue(error.message || 'Connection test failed');
    }
  }
);

// ======================== INITIAL STATE ========================

const initialState = {
  badges: [],
  currentBadge: null,
  loading: false,
  error: null,
  
  // API connection status
  connectionTested: false,
  isConnected: false,
  
  // Pagination
  currentPage: 1,
  totalBadges: 0,
  hasMore: false,
  
  // Filters
  filters: {
    search: '',
    page: 1,
    take: 100,
  },
  
  // Request tracking
  lastFetchTime: null,
  lastFetchParams: null,
};

// ======================== SLICE ========================

const badgeSlice = createSlice({
  name: 'badge',
  initialState,
  reducers: {
    // Filters
    setFilters: (state, action) => {
      console.log('Redux: Setting badge filters:', action.payload);
      state.filters = { ...state.filters, ...action.payload };
    },
    
    resetFilters: (state) => {
      console.log('Redux: Resetting badge filters');
      state.filters = initialState.filters;
    },
    
    // Current badge
    setCurrentBadge: (state, action) => {
      console.log('Redux: Setting current badge:', action.payload);
      state.currentBadge = action.payload;
    },
    
    clearCurrentBadge: (state) => {
      console.log('Redux: Clearing current badge');
      state.currentBadge = null;
    },
    
    // Error management
    clearError: (state) => {
      console.log('Redux: Clearing badge error');
      state.error = null;
    },
    
    // Reset state
    resetBadgeState: (state) => {
      console.log('Redux: Resetting badge state');
      return { ...initialState };
    },
    
    // Manual badge addition (for real-time updates)
    addBadgeToList: (state, action) => {
      const newBadge = action.payload;
      if (newBadge && newBadge.id && !state.badges.find(b => b.id === newBadge.id)) {
        state.badges.unshift(newBadge);
        state.totalBadges += 1;
        console.log('Redux: Added badge to list:', newBadge);
      }
    },
  },
  
  extraReducers: (builder) => {
    builder
      // Test connection
      .addCase(testBadgeConnectionAsync.pending, (state) => {
        state.connectionTested = false;
      })
      .addCase(testBadgeConnectionAsync.fulfilled, (state, action) => {
        state.connectionTested = true;
        state.isConnected = action.payload;
        console.log('Redux: Badge API connection status:', action.payload);
      })
      .addCase(testBadgeConnectionAsync.rejected, (state, action) => {
        state.connectionTested = true;
        state.isConnected = false;
        state.error = action.payload;
        console.error('Redux: Badge API connection failed:', action.payload);
      })
      
      // Fetch badges
      .addCase(fetchBadgesAsync.pending, (state, action) => {
        console.log('Redux: fetchBadgesAsync pending');
        state.loading = true;
        state.error = null;
        state.lastFetchParams = action.meta.arg;
      })
      .addCase(fetchBadgesAsync.fulfilled, (state, action) => {
        console.log('Redux: fetchBadgesAsync fulfilled with:', action.payload);
        state.loading = false;
        state.error = null;
        
        // Data validasiyası
        if (Array.isArray(action.payload)) {
          state.badges = action.payload;
          state.totalBadges = action.payload.length;
          state.hasMore = action.payload.length >= (state.filters.take || 100);
        } else {
          console.warn('Redux: fetchBadgesAsync payload is not an array:', action.payload);
          state.badges = [];
          state.totalBadges = 0;
          state.hasMore = false;
        }
        
        state.lastFetchTime = new Date().toISOString();
        console.log(`Redux: Loaded ${state.badges.length} badges`);
      })
      .addCase(fetchBadgesAsync.rejected, (state, action) => {
        console.error('Redux: fetchBadgesAsync rejected:', action.payload);
        state.loading = false;
        state.error = action.payload || action.error.message;
        state.badges = [];
        state.totalBadges = 0;
        state.hasMore = false;
      })
      
      // Fetch single badge
      .addCase(fetchBadgeByIdAsync.pending, (state) => {
        console.log('Redux: fetchBadgeByIdAsync pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBadgeByIdAsync.fulfilled, (state, action) => {
        console.log('Redux: fetchBadgeByIdAsync fulfilled:', action.payload);
        state.loading = false;
        state.error = null;
        state.currentBadge = action.payload;
      })
      .addCase(fetchBadgeByIdAsync.rejected, (state, action) => {
        console.error('Redux: fetchBadgeByIdAsync rejected:', action.payload);
        state.loading = false;
        state.error = action.payload || action.error.message;
        state.currentBadge = null;
      })
      
      // Create badge
      .addCase(createBadgeAsync.pending, (state) => {
        console.log('Redux: createBadgeAsync pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(createBadgeAsync.fulfilled, (state, action) => {
        console.log('Redux: createBadgeAsync fulfilled:', action.payload);
        state.loading = false;
        state.error = null;
        
        if (action.payload && action.payload.id) {
          // Yeni badge'i listin əvvəlinə əlavə edirik
          state.badges.unshift(action.payload);
          state.totalBadges += 1;
          state.currentBadge = action.payload;
        }
      })
      .addCase(createBadgeAsync.rejected, (state, action) => {
        console.error('Redux: createBadgeAsync rejected:', action.payload);
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      
      // Update badge
      .addCase(updateBadgeAsync.pending, (state) => {
        console.log('Redux: updateBadgeAsync pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBadgeAsync.fulfilled, (state, action) => {
        console.log('Redux: updateBadgeAsync fulfilled:', action.payload);
        state.loading = false;
        state.error = null;
        
        if (action.payload && action.payload.id) {
          // Mövcud badge'i yeniləyirik
          const badgeIndex = state.badges.findIndex(b => b.id === action.payload.id);
          if (badgeIndex !== -1) {
            state.badges[badgeIndex] = action.payload;
          }
          state.currentBadge = action.payload;
        }
      })
      .addCase(updateBadgeAsync.rejected, (state, action) => {
        console.error('Redux: updateBadgeAsync rejected:', action.payload);
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      
      // Delete badge
      .addCase(deleteBadgeAsync.pending, (state) => {
        console.log('Redux: deleteBadgeAsync pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBadgeAsync.fulfilled, (state, action) => {
        console.log('Redux: deleteBadgeAsync fulfilled, deleted ID:', action.payload);
        state.loading = false;
        state.error = null;
        
        // Badge'i listdən silirik
        state.badges = state.badges.filter(b => b.id !== action.payload);
        state.totalBadges = Math.max(0, state.totalBadges - 1);
        
        // Əgər silinen badge current badge idisə, onu təmizləyirik
        if (state.currentBadge?.id === action.payload) {
          state.currentBadge = null;
        }
      })
      .addCase(deleteBadgeAsync.rejected, (state, action) => {
        console.error('Redux: deleteBadgeAsync rejected:', action.payload);
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
  resetBadgeState,
  addBadgeToList,
} = badgeSlice.actions;

// ======================== SELECTORS ========================

export const selectBadges = (state) => {
  const badges = state.badge?.badges || [];
  console.log('Selector: selectBadges returning:', badges.length, 'badges');
  return badges;
};

export const selectCurrentBadge = (state) => state.badge?.currentBadge || null;
export const selectBadgeLoading = (state) => state.badge?.loading || false;
export const selectBadgeError = (state) => state.badge?.error || null;
export const selectBadgeFilters = (state) => state.badge?.filters || initialState.filters;
export const selectBadgeConnectionStatus = (state) => ({
  tested: state.badge?.connectionTested || false,
  connected: state.badge?.isConnected || false
});

// Meta selectors
export const selectBadgeCount = (state) => state.badge?.totalBadges || 0;
export const selectHasMoreBadges = (state) => state.badge?.hasMore || false;
export const selectLastFetchTime = (state) => state.badge?.lastFetchTime || null;

// Utility selectors
export const selectBadgeById = (state, badgeId) => {
  const badges = selectBadges(state);
  return badges.find(badge => badge.id === badgeId) || null;
};

export const selectBadgesByName = (state, searchTerm) => {
  const badges = selectBadges(state);
  if (!searchTerm) return badges;
  
  return badges.filter(badge => 
    (badge.name || badge.badgeName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );
};

export default badgeSlice.reducer;