// redux/courseTag/courseTagSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  fetchCourseTags,
  fetchCourseTagById,
  createCourseTag,
  updateCourseTag,
  deleteCourseTag,
  validateTagData,
  formatTagForDisplay,
  generateTagSlug,
  generateTagColor,
  sortTags,
  filterTags,
  findTagsByName,
  checkTagNameExists,
  getPopularTags,
  getTagSuggestions,
  generateTagCloudData,
  createTagsBatch,
  deleteTagsBatch,
  getTagUsageStats,
  cleanupUnusedTags,
  mergeDuplicateTags,
} from '@/api/courseTag';

// ======================== ASYNC THUNKS ========================

export const fetchCourseTagsAsync = createAsyncThunk(
  'courseTag/fetchCourseTags',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await fetchCourseTags(params);
      return response.map(tag => formatTagForDisplay(tag));
    } catch (error) {
      // API has mapping issues, return empty array as fallback
      console.warn('CourseTag endpoint has mapping issues, returning empty array');
      return [];
    }
  }
);

export const fetchCourseTagByIdAsync = createAsyncThunk(
  'courseTag/fetchCourseTagById',
  async (tagId, { rejectWithValue }) => {
    try {
      const response = await fetchCourseTagById(tagId);
      return formatTagForDisplay(response);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createCourseTagAsync = createAsyncThunk(
  'courseTag/createCourseTag',
  async (tagData, { rejectWithValue }) => {
    try {
      const errors = validateTagData(tagData);
      if (errors.length > 0) {
        return rejectWithValue(errors.join(', '));
      }
      
      // Check if name already exists
      const nameExists = await checkTagNameExists(tagData.name);
      if (nameExists) {
        return rejectWithValue('Tag name already exists');
      }
      
      const response = await createCourseTag(tagData);
      return formatTagForDisplay(response);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateCourseTagAsync = createAsyncThunk(
  'courseTag/updateCourseTag',
  async (tagData, { rejectWithValue }) => {
    try {
      const errors = validateTagData(tagData);
      if (errors.length > 0) {
        return rejectWithValue(errors.join(', '));
      }
      
      // Check if name already exists (excluding current tag)
      const nameExists = await checkTagNameExists(tagData.name, tagData.id);
      if (nameExists) {
        return rejectWithValue('Tag name already exists');
      }
      
      const response = await updateCourseTag(tagData);
      return formatTagForDisplay(response);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteCourseTagAsync = createAsyncThunk(
  'courseTag/deleteCourseTag',
  async (tagId, { rejectWithValue }) => {
    try {
      await deleteCourseTag(tagId);
      return tagId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const findTagsByNameAsync = createAsyncThunk(
  'courseTag/findTagsByName',
  async (searchName, { rejectWithValue }) => {
    try {
      const response = await findTagsByName(searchName);
      return response.map(tag => formatTagForDisplay(tag));
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getTagSuggestionsAsync = createAsyncThunk(
  'courseTag/getTagSuggestions',
  async ({ partialName, limit = 5 }, { rejectWithValue }) => {
    try {
      const suggestions = await getTagSuggestions(partialName, limit);
      return suggestions;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getTagUsageStatsAsync = createAsyncThunk(
  'courseTag/getTagUsageStats',
  async (_, { rejectWithValue }) => {
    try {
      const stats = await getTagUsageStats();
      return stats;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createTagsBatchAsync = createAsyncThunk(
  'courseTag/createTagsBatch',
  async (tagsData, { rejectWithValue }) => {
    try {
      const result = await createTagsBatch(tagsData);
      return result;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteTagsBatchAsync = createAsyncThunk(
  'courseTag/deleteTagsBatch',
  async (tagIds, { rejectWithValue }) => {
    try {
      const result = await deleteTagsBatch(tagIds);
      return result;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const cleanupUnusedTagsAsync = createAsyncThunk(
  'courseTag/cleanupUnusedTags',
  async (dryRun = true, { rejectWithValue }) => {
    try {
      const result = await cleanupUnusedTags(dryRun);
      return { ...result, dryRun };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const mergeDuplicateTagsAsync = createAsyncThunk(
  'courseTag/mergeDuplicateTags',
  async (dryRun = true, { rejectWithValue }) => {
    try {
      const result = await mergeDuplicateTags(dryRun);
      return { ...result, dryRun };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ======================== INITIAL STATE ========================

const courseTagInitialState = {
  // Tags data
  tags: [],
  currentTag: null,
  totalTagCount: 0,
  
  // Tag cloud data
  tagCloudData: [],
  popularTags: [],
  
  // Usage statistics
  usageStats: {
    totalTags: 0,
    usedTags: 0,
    unusedTags: 0,
    totalUsage: 0,
    avgUsagePerTag: 0,
    mostUsedTag: 'N/A',
    utilizationRate: 0,
  },
  
  // Loading states
  loading: false,
  tagLoading: false,
  statsLoading: false,
  batchLoading: false,
  cleanupLoading: false,
  
  // Error states
  error: null,
  tagError: null,
  statsError: null,
  batchError: null,
  cleanupError: null,
  
  // Form data
  formData: {
    name: '',
  },
  
  // Batch form data
  batchFormData: {
    tags: [{ name: '' }],
  },
  
  // UI state
  showCreateModal: false,
  showEditModal: false,
  showDeleteModal: false,
  showBatchCreateModal: false,
  showBatchDeleteModal: false,
  showUsageStatsModal: false,
  showTagCloudModal: false,
  showCleanupModal: false,
  showMergeModal: false,
  selectedTag: null,
  
  // Search and suggestions
  searchTerm: '',
  suggestions: [],
  showSuggestions: false,
  
  // Filters and search
  filters: {
    search: '',
    minUsage: '',
    maxUsage: '',
    page: 1,
    take: 10,
  },
  
  // Sorting and display
  sortBy: 'name',
  sortOrder: 'asc',
  viewMode: 'grid', // 'grid', 'list', 'cloud'
  
  // Bulk operations
  selectedTags: [],
  bulkOperation: null, // 'delete', 'export', 'cleanup', 'merge'
  
  // Cleanup and maintenance
  cleanupResults: {
    unusedTags: [],
    wouldDelete: 0,
    deleted: 0,
    failed: 0,
  },
  
  mergeResults: {
    duplicates: [],
    duplicatesFound: 0,
    merged: 0,
    failed: 0,
  },
  
  // Statistics
  statistics: {
    totalTags: 0,
    usedTags: 0,
    unusedTags: 0,
    averageUsage: 0,
    mostPopularTag: null,
    leastPopularTag: null,
    tagDistribution: {
      highUsage: 0, // > 10 uses
      mediumUsage: 0, // 3-10 uses
      lowUsage: 0, // 1-2 uses
      noUsage: 0, // 0 uses
    },
  },
};

// ======================== SLICE ========================

const courseTagSlice = createSlice({
  name: 'courseTag',
  initialState: courseTagInitialState,
  reducers: {
    // Form data management
    setFormData: (state, action) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    
    resetFormData: (state) => {
      state.formData = courseTagInitialState.formData;
    },
    
    // Batch form data management
    setBatchFormData: (state, action) => {
      state.batchFormData = { ...state.batchFormData, ...action.payload };
    },
    
    addBatchTag: (state) => {
      state.batchFormData.tags.push({ name: '' });
    },
    
    removeBatchTag: (state, action) => {
      const index = action.payload;
      if (state.batchFormData.tags.length > 1) {
        state.batchFormData.tags.splice(index, 1);
      }
    },
    
    updateBatchTag: (state, action) => {
      const { index, name } = action.payload;
      if (state.batchFormData.tags[index]) {
        state.batchFormData.tags[index].name = name;
      }
    },
    
    resetBatchFormData: (state) => {
      state.batchFormData = courseTagInitialState.batchFormData;
    },
    
    // Modal management
    setShowCreateModal: (state, action) => {
      state.showCreateModal = action.payload;
      if (!action.payload) {
        courseTagSlice.caseReducers.resetFormData(state);
      }
    },
    
    setShowEditModal: (state, action) => {
      state.showEditModal = action.payload;
      if (!action.payload) {
        courseTagSlice.caseReducers.resetFormData(state);
      }
    },
    
    setShowDeleteModal: (state, action) => {
      state.showDeleteModal = action.payload;
    },
    
    setShowBatchCreateModal: (state, action) => {
      state.showBatchCreateModal = action.payload;
      if (!action.payload) {
        courseTagSlice.caseReducers.resetBatchFormData(state);
      }
    },
    
    setShowBatchDeleteModal: (state, action) => {
      state.showBatchDeleteModal = action.payload;
    },
    
    setShowUsageStatsModal: (state, action) => {
      state.showUsageStatsModal = action.payload;
    },
    
    setShowTagCloudModal: (state, action) => {
      state.showTagCloudModal = action.payload;
    },
    
    setShowCleanupModal: (state, action) => {
      state.showCleanupModal = action.payload;
    },
    
    setShowMergeModal: (state, action) => {
      state.showMergeModal = action.payload;
    },
    
    // Selection management
    setSelectedTag: (state, action) => {
      state.selectedTag = action.payload;
      if (action.payload) {
        state.formData = {
          name: action.payload.name || '',
        };
      }
    },
    
    // Search and suggestions
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    
    setSuggestions: (state, action) => {
      state.suggestions = action.payload;
    },
    
    setShowSuggestions: (state, action) => {
      state.showSuggestions = action.payload;
    },
    
    // Filter management
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    resetFilters: (state) => {
      state.filters = courseTagInitialState.filters;
    },
    
    // Sorting and display
    setSortBy: (state, action) => {
      const newSortBy = action.payload;
      if (state.sortBy === newSortBy) {
        state.sortOrder = state.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        state.sortBy = newSortBy;
        state.sortOrder = 'asc';
      }
    },
    
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
      
      // Generate tag cloud data when switching to cloud view
      if (action.payload === 'cloud') {
        state.tagCloudData = generateTagCloudData(state.tags);
      }
    },
    
    // Bulk operations
    toggleTagSelection: (state, action) => {
      const tagId = action.payload;
      const index = state.selectedTags.indexOf(tagId);
      
      if (index > -1) {
        state.selectedTags.splice(index, 1);
      } else {
        state.selectedTags.push(tagId);
      }
    },
    
    selectAllTags: (state) => {
      state.selectedTags = state.tags.map(tag => tag.id);
    },
    
    deselectAllTags: (state) => {
      state.selectedTags = [];
    },
    
    setBulkOperation: (state, action) => {
      state.bulkOperation = action.payload;
    },
    
    // Tag cloud management
    generateTagCloud: (state) => {
      state.tagCloudData = generateTagCloudData(state.tags);
    },
    
    updatePopularTags: (state, action) => {
      const limit = action.payload || 10;
      state.popularTags = getPopularTags(state.tags, limit);
    },
    
    // Statistics update
    updateStatistics: (state) => {
      const tags = state.tags;
      
      const usedTags = tags.filter(tag => (tag.usageCount || 0) > 0);
      const totalUsage = tags.reduce((sum, tag) => sum + (tag.usageCount || 0), 0);
      
      const mostPopular = tags.reduce((prev, current) => 
        (prev.usageCount || 0) > (current.usageCount || 0) ? prev : current, 
        tags[0] || {}
      );
      
      const leastPopular = usedTags.reduce((prev, current) => 
        (prev.usageCount || 0) < (current.usageCount || 0) ? prev : current, 
        usedTags[0] || {}
      );
      
      const distribution = {
        highUsage: tags.filter(tag => (tag.usageCount || 0) > 10).length,
        mediumUsage: tags.filter(tag => (tag.usageCount || 0) >= 3 && (tag.usageCount || 0) <= 10).length,
        lowUsage: tags.filter(tag => (tag.usageCount || 0) >= 1 && (tag.usageCount || 0) <= 2).length,
        noUsage: tags.filter(tag => (tag.usageCount || 0) === 0).length,
      };
      
      state.statistics = {
        totalTags: tags.length,
        usedTags: usedTags.length,
        unusedTags: tags.length - usedTags.length,
        averageUsage: tags.length > 0 ? Math.round(totalUsage / tags.length * 10) / 10 : 0,
        mostPopularTag: mostPopular || null,
        leastPopularTag: leastPopular || null,
        tagDistribution: distribution,
      };
    },
    
    // Error management
    clearError: (state) => {
      state.error = null;
      state.tagError = null;
      state.statsError = null;
      state.batchError = null;
      state.cleanupError = null;
    },
    
    // Quick actions
    duplicateTag: (state, action) => {
      const tagId = action.payload;
      const tag = state.tags.find(t => t.id === tagId);
      if (tag) {
        state.formData = {
          name: `${tag.name} (Copy)`,
        };
        state.showCreateModal = true;
      }
    },
    
    // Import functionality
    importTags: (state, action) => {
      const importedTags = action.payload;
      // Process imported tags and add to batch form
      state.batchFormData.tags = importedTags.map(tag => ({ name: tag.name || tag }));
      state.showBatchCreateModal = true;
    },
    
    // Export functionality
    prepareExportData: (state) => {
      const selectedTags = state.selectedTags.length > 0 
        ? state.tags.filter(tag => state.selectedTags.includes(tag.id))
        : state.tags;
      
      return selectedTags.map(tag => ({
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
        color: tag.color,
        usageCount: tag.usageCount || 0,
      }));
    },
  },
  
  extraReducers: (builder) => {
    builder
      // Fetch tags
      .addCase(fetchCourseTagsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourseTagsAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.tags = action.payload;
        state.totalTagCount = action.payload.length;
        courseTagSlice.caseReducers.updateStatistics(state);
        courseTagSlice.caseReducers.updatePopularTags(state, { payload: 10 });
      })
      .addCase(fetchCourseTagsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch single tag
      .addCase(fetchCourseTagByIdAsync.pending, (state) => {
        state.tagLoading = true;
        state.tagError = null;
      })
      .addCase(fetchCourseTagByIdAsync.fulfilled, (state, action) => {
        state.tagLoading = false;
        state.currentTag = action.payload;
      })
      .addCase(fetchCourseTagByIdAsync.rejected, (state, action) => {
        state.tagLoading = false;
        state.tagError = action.payload;
      })
      
      // Create tag
      .addCase(createCourseTagAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCourseTagAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.tags.unshift(action.payload);
        state.totalTagCount += 1;
        state.showCreateModal = false;
        state.formData = courseTagInitialState.formData;
        courseTagSlice.caseReducers.updateStatistics(state);
        courseTagSlice.caseReducers.updatePopularTags(state, { payload: 10 });
      })
      .addCase(createCourseTagAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update tag
      .addCase(updateCourseTagAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCourseTagAsync.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.tags.findIndex(tag => tag.id === action.payload.id);
        if (index !== -1) {
          state.tags[index] = action.payload;
        }
        if (state.currentTag?.id === action.payload.id) {
          state.currentTag = action.payload;
        }
        state.showEditModal = false;
        state.formData = courseTagInitialState.formData;
        courseTagSlice.caseReducers.updateStatistics(state);
      })
      .addCase(updateCourseTagAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete tag
      .addCase(deleteCourseTagAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCourseTagAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.tags = state.tags.filter(tag => tag.id !== action.payload);
        state.totalTagCount = Math.max(0, state.totalTagCount - 1);
        state.showDeleteModal = false;
        state.selectedTag = null;
        
        // Remove from selected tags
        const selectedIndex = state.selectedTags.indexOf(action.payload);
        if (selectedIndex > -1) {
          state.selectedTags.splice(selectedIndex, 1);
        }
        
        if (state.currentTag?.id === action.payload) {
          state.currentTag = null;
        }
        
        courseTagSlice.caseReducers.updateStatistics(state);
        courseTagSlice.caseReducers.updatePopularTags(state, { payload: 10 });
      })
      .addCase(deleteCourseTagAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Find tags by name
      .addCase(findTagsByNameAsync.fulfilled, (state, action) => {
        state.suggestions = action.payload;
        state.showSuggestions = true;
      })
      
      // Get tag suggestions
      .addCase(getTagSuggestionsAsync.fulfilled, (state, action) => {
        state.suggestions = action.payload;
        state.showSuggestions = true;
      })
      
      // Get usage stats
      .addCase(getTagUsageStatsAsync.pending, (state) => {
        state.statsLoading = true;
        state.statsError = null;
      })
      .addCase(getTagUsageStatsAsync.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.usageStats = action.payload;
      })
      .addCase(getTagUsageStatsAsync.rejected, (state, action) => {
        state.statsLoading = false;
        state.statsError = action.payload;
      })
      
      // Batch create tags
      .addCase(createTagsBatchAsync.pending, (state) => {
        state.batchLoading = true;
        state.batchError = null;
      })
      .addCase(createTagsBatchAsync.fulfilled, (state, action) => {
        state.batchLoading = false;
        const { success, errors, successCount } = action.payload;
        
        // Add successful tags to the list
        success.forEach(tag => {
          const formattedTag = formatTagForDisplay(tag);
          state.tags.unshift(formattedTag);
        });
        
        state.totalTagCount += successCount;
        state.showBatchCreateModal = false;
        state.batchFormData = courseTagInitialState.batchFormData;
        
        if (errors.length > 0) {
          state.batchError = `${successCount} tags created successfully. ${errors.length} failed: ${errors.join(', ')}`;
        }
        
        courseTagSlice.caseReducers.updateStatistics(state);
      })
      .addCase(createTagsBatchAsync.rejected, (state, action) => {
        state.batchLoading = false;
        state.batchError = action.payload;
      })
      
      // Batch delete tags
      .addCase(deleteTagsBatchAsync.pending, (state) => {
        state.batchLoading = true;
        state.batchError = null;
      })
      .addCase(deleteTagsBatchAsync.fulfilled, (state, action) => {
        state.batchLoading = false;
        const { success, errors, successCount } = action.payload;
        
        // Remove successful deletions
        success.forEach(tagId => {
          state.tags = state.tags.filter(tag => tag.id !== tagId);
          
          // Remove from selected tags
          const selectedIndex = state.selectedTags.indexOf(tagId);
          if (selectedIndex > -1) {
            state.selectedTags.splice(selectedIndex, 1);
          }
        });
        
        state.totalTagCount = Math.max(0, state.totalTagCount - successCount);
        state.showBatchDeleteModal = false;
        state.selectedTags = [];
        
        if (errors.length > 0) {
          state.batchError = `${successCount} tags deleted successfully. ${errors.length} failed: ${errors.join(', ')}`;
        }
        
        courseTagSlice.caseReducers.updateStatistics(state);
      })
      .addCase(deleteTagsBatchAsync.rejected, (state, action) => {
        state.batchLoading = false;
        state.batchError = action.payload;
      })
      
      // Cleanup unused tags
      .addCase(cleanupUnusedTagsAsync.pending, (state) => {
        state.cleanupLoading = true;
        state.cleanupError = null;
      })
      .addCase(cleanupUnusedTagsAsync.fulfilled, (state, action) => {
        state.cleanupLoading = false;
        const { dryRun, wouldDelete, deleted, failed, tags } = action.payload;
        
        if (dryRun) {
          state.cleanupResults = {
            unusedTags: tags || [],
            wouldDelete: wouldDelete || 0,
            deleted: 0,
            failed: 0,
          };
        } else {
          // Remove deleted tags from state
          if (deleted > 0) {
            // Refresh tags list or remove specific tags
            state.totalTagCount = Math.max(0, state.totalTagCount - deleted);
          }
          
          state.cleanupResults = {
            unusedTags: [],
            wouldDelete: 0,
            deleted: deleted || 0,
            failed: failed || 0,
          };
          
          courseTagSlice.caseReducers.updateStatistics(state);
        }
      })
      .addCase(cleanupUnusedTagsAsync.rejected, (state, action) => {
        state.cleanupLoading = false;
        state.cleanupError = action.payload;
      })
      
      // Merge duplicate tags
      .addCase(mergeDuplicateTagsAsync.fulfilled, (state, action) => {
        const { dryRun, duplicatesFound, merged, failed, duplicates } = action.payload;
        
        if (dryRun) {
          state.mergeResults = {
            duplicates: duplicates || [],
            duplicatesFound: duplicatesFound || 0,
            merged: 0,
            failed: 0,
          };
        } else {
          // Update state after merge
          if (merged > 0) {
            state.totalTagCount = Math.max(0, state.totalTagCount - merged);
          }
          
          state.mergeResults = {
            duplicates: [],
            duplicatesFound: 0,
            merged: merged || 0,
            failed: failed || 0,
          };
          
          courseTagSlice.caseReducers.updateStatistics(state);
        }
      });
  },
});

// ======================== ACTIONS EXPORT ========================

export const courseTagActions = courseTagSlice.actions;

export const {
  setFormData,
  resetFormData,
  setBatchFormData,
  addBatchTag,
  removeBatchTag,
  updateBatchTag,
  resetBatchFormData,
  setShowCreateModal,
  setShowEditModal,
  setShowDeleteModal,
  setShowBatchCreateModal,
  setShowBatchDeleteModal,
  setShowUsageStatsModal,
  setShowTagCloudModal,
  setShowCleanupModal,
  setShowMergeModal,
  setSelectedTag,
  setSearchTerm,
  setSuggestions,
  setShowSuggestions,
  setFilters,
  resetFilters,
  setSortBy,
  setViewMode,
  toggleTagSelection,
  selectAllTags,
  deselectAllTags,
  setBulkOperation,
  generateTagCloud,
  updatePopularTags,
  updateStatistics,
  clearError,
  duplicateTag,
  importTags,
  prepareExportData,
} = courseTagSlice.actions;

// ======================== SELECTORS ========================

// Basic selectors
export const selectTags = (state) => state.courseTag.tags;
export const selectCurrentTag = (state) => state.courseTag.currentTag;
export const selectTagLoading = (state) => state.courseTag.loading;
export const selectTagError = (state) => state.courseTag.error;

// Form selectors
export const selectFormData = (state) => state.courseTag.formData;
export const selectBatchFormData = (state) => state.courseTag.batchFormData;
export const selectSelectedTag = (state) => state.courseTag.selectedTag;

// UI selectors
export const selectFilters = (state) => state.courseTag.filters;
export const selectSortBy = (state) => state.courseTag.sortBy;
export const selectSortOrder = (state) => state.courseTag.sortOrder;
export const selectViewMode = (state) => state.courseTag.viewMode;

// Data selectors
export const selectTagCloudData = (state) => state.courseTag.tagCloudData;
export const selectPopularTags = (state) => state.courseTag.popularTags;
export const selectUsageStats = (state) => state.courseTag.usageStats;
export const selectStatistics = (state) => state.courseTag.statistics;
export const selectSelectedTags = (state) => state.courseTag.selectedTags;

// Search and suggestions selectors
export const selectSearchTerm = (state) => state.courseTag.searchTerm;
export const selectSuggestions = (state) => state.courseTag.suggestions;
export const selectShowSuggestions = (state) => state.courseTag.showSuggestions;

// Cleanup selectors
export const selectCleanupResults = (state) => state.courseTag.cleanupResults;
export const selectMergeResults = (state) => state.courseTag.mergeResults;

// Computed selectors
export const selectFilteredAndSortedTags = (state) => {
  const tags = state.courseTag.tags;
  const filters = state.courseTag.filters;
  const sortBy = state.courseTag.sortBy;
  const sortOrder = state.courseTag.sortOrder;
  
  // Filter tags
  let filtered = filterTags(tags, filters.search);
  
  // Additional filters
  if (filters.minUsage) {
    filtered = filtered.filter(tag => 
      (tag.usageCount || 0) >= parseInt(filters.minUsage)
    );
  }
  
  if (filters.maxUsage) {
    filtered = filtered.filter(tag => 
      (tag.usageCount || 0) <= parseInt(filters.maxUsage)
    );
  }
  
  // Sort tags
  const sorted = sortTags(filtered, sortBy, sortOrder);
  
  return sorted;
};

export const selectTagById = (tagId) => (state) => {
  return state.courseTag.tags.find(tag => tag.id === tagId);
};

export const selectTagsByUsage = (state) => {
  const tags = state.courseTag.tags;
  
  return {
    highUsage: tags.filter(tag => (tag.usageCount || 0) > 10),
    mediumUsage: tags.filter(tag => (tag.usageCount || 0) >= 3 && (tag.usageCount || 0) <= 10),
    lowUsage: tags.filter(tag => (tag.usageCount || 0) >= 1 && (tag.usageCount || 0) <= 2),
    noUsage: tags.filter(tag => (tag.usageCount || 0) === 0),
  };
};

export const selectTagCloudConfig = (state) => {
  const viewMode = state.courseTag.viewMode;
  const tagCloudData = state.courseTag.tagCloudData;
  
  if (viewMode !== 'cloud') return null;
  
  return {
    data: tagCloudData,
    options: {
      maxTags: 50,
      minFontSize: 12,
      maxFontSize: 48,
      padding: 2,
      spiral: 'rectangular',
    },
  };
};

export const selectCanDeleteTag = (tagId) => (state) => {
  const tag = state.courseTag.tags.find(t => t.id === tagId);
  // Allow deletion if tag has no usage or very low usage
  return !tag || (tag.usageCount || 0) <= 1;
};

export const selectFormValidationErrors = (state) => {
  const formData = state.courseTag.formData;
  return validateTagData(formData);
};

export const selectBatchValidationErrors = (state) => {
  const batchFormData = state.courseTag.batchFormData;
  const errors = [];
  
  batchFormData.tags.forEach((tag, index) => {
    const tagErrors = validateTagData(tag);
    if (tagErrors.length > 0) {
      errors.push(`Tag ${index + 1}: ${tagErrors.join(', ')}`);
    }
  });
  
  return errors;
};

export const selectTagUsageDistribution = (state) => {
  const stats = state.courseTag.statistics;
  const total = stats.totalTags;
  
  if (total === 0) return [];
  
  return [
    {
      name: 'High Usage (>10)',
      value: stats.tagDistribution.highUsage,
      percentage: Math.round((stats.tagDistribution.highUsage / total) * 100),
      color: '#10B981',
    },
    {
      name: 'Medium Usage (3-10)',
      value: stats.tagDistribution.mediumUsage,
      percentage: Math.round((stats.tagDistribution.mediumUsage / total) * 100),
      color: '#F59E0B',
    },
    {
      name: 'Low Usage (1-2)',
      value: stats.tagDistribution.lowUsage,
      percentage: Math.round((stats.tagDistribution.lowUsage / total) * 100),
      color: '#EF4444',
    },
    {
      name: 'No Usage (0)',
      value: stats.tagDistribution.noUsage,
      percentage: Math.round((stats.tagDistribution.noUsage / total) * 100),
      color: '#6B7280',
    },
  ];
};

export const selectSuggestedTags = (searchTerm) => (state) => {
  if (!searchTerm?.trim()) return [];
  
  const tags = state.courseTag.tags;
  const searchLower = searchTerm.toLowerCase();
  
  return tags
    .filter(tag => tag.name.toLowerCase().includes(searchLower))
    .slice(0, 5)
    .map(tag => ({
      id: tag.id,
      name: tag.name,
      usageCount: tag.usageCount || 0,
    }));
};

export const selectTagMetrics = (state) => {
  const tags = state.courseTag.tags;
  const stats = state.courseTag.statistics;
  
  return {
    utilizationRate: stats.totalTags > 0 ? 
      Math.round((stats.usedTags / stats.totalTags) * 100) : 0,
    averageUsagePerTag: stats.averageUsage,
    totalUsage: tags.reduce((sum, tag) => sum + (tag.usageCount || 0), 0),
    efficiency: stats.usedTags > 0 ? 
      Math.round((stats.usedTags / stats.totalTags) * 100) : 0,
    maintenanceScore: (() => {
      const unusedPercentage = stats.totalTags > 0 ? 
        (stats.unusedTags / stats.totalTags) * 100 : 0;
      
      if (unusedPercentage < 10) return 'excellent';
      if (unusedPercentage < 25) return 'good';
      if (unusedPercentage < 50) return 'fair';
      return 'poor';
    })(),
  };
};

export const selectRecommendedActions = (state) => {
  const stats = state.courseTag.statistics;
  const cleanupResults = state.courseTag.cleanupResults;
  const mergeResults = state.courseTag.mergeResults;
  const actions = [];
  
  // Cleanup recommendations
  if (stats.unusedTags > 5) {
    actions.push({
      type: 'cleanup',
      priority: 'medium',
      title: 'Clean up unused tags',
      description: `${stats.unusedTags} tags are not being used and can be safely removed.`,
      action: 'cleanup',
      count: stats.unusedTags,
    });
  }
  
  // Merge recommendations
  if (mergeResults.duplicatesFound > 0) {
    actions.push({
      type: 'merge',
      priority: 'high',
      title: 'Merge duplicate tags',
      description: `${mergeResults.duplicatesFound} duplicate tags found that should be merged.`,
      action: 'merge',
      count: mergeResults.duplicatesFound,
    });
  }
  
  // Usage optimization
  if (stats.tagDistribution.lowUsage > stats.tagDistribution.highUsage) {
    actions.push({
      type: 'optimize',
      priority: 'low',
      title: 'Optimize tag usage',
      description: 'Many tags have low usage. Consider consolidating similar tags.',
      action: 'review',
      count: stats.tagDistribution.lowUsage,
    });
  }
  
  return actions.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
};

export default courseTagSlice.reducer;