// redux/courseCategory/courseCategorySlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  fetchCourseCategories,
  fetchCourseCategoryById,
  createCourseCategory,
  updateCourseCategory,
  deleteCourseCategory,
  getCoursesByCategoryId,
  validateCategoryData,
  formatCategoryForDisplay,
  generateCategorySlug,
  sortCategories,
  filterCategories,
  getCategoriesWithCounts,
  findCategoriesByName,
  checkCategoryNameExists,
  getCategoryUsageStats,
  createCategoriesBatch,
  deleteCategoriesBatch,
} from '@/api/courseCategory';

// ======================== ASYNC THUNKS ========================

export const fetchCourseCategoriesAsync = createAsyncThunk(
  'courseCategory/fetchCourseCategories',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await fetchCourseCategories(params);
      return response.map(category => formatCategoryForDisplay(category));
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCourseCategoryByIdAsync = createAsyncThunk(
  'courseCategory/fetchCourseCategoryById',
  async (categoryId, { rejectWithValue }) => {
    try {
      const response = await fetchCourseCategoryById(categoryId);
      return formatCategoryForDisplay(response);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createCourseCategoryAsync = createAsyncThunk(
  'courseCategory/createCourseCategory',
  async (categoryData, { rejectWithValue }) => {
    try {
      const errors = validateCategoryData(categoryData);
      if (errors.length > 0) {
        return rejectWithValue(errors.join(', '));
      }
      
      // Check if name already exists
      const nameExists = await checkCategoryNameExists(categoryData.name);
      if (nameExists) {
        return rejectWithValue('Category name already exists');
      }
      
      const response = await createCourseCategory(categoryData);
      return formatCategoryForDisplay(response);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateCourseCategoryAsync = createAsyncThunk(
  'courseCategory/updateCourseCategory',
  async (categoryData, { rejectWithValue }) => {
    try {
      const errors = validateCategoryData(categoryData);
      if (errors.length > 0) {
        return rejectWithValue(errors.join(', '));
      }
      
      // Check if name already exists (excluding current category)
      const nameExists = await checkCategoryNameExists(categoryData.name, categoryData.id);
      if (nameExists) {
        return rejectWithValue('Category name already exists');
      }
      
      const response = await updateCourseCategory(categoryData);
      return formatCategoryForDisplay(response);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteCourseCategoryAsync = createAsyncThunk(
  'courseCategory/deleteCourseCategory',
  async (categoryId, { rejectWithValue }) => {
    try {
      // Check if category has courses before deleting
      const courses = await getCoursesByCategoryId(categoryId);
      if (courses.length > 0) {
        return rejectWithValue(`Cannot delete category with ${courses.length} course(s). Please move or delete the courses first.`);
      }
      
      await deleteCourseCategory(categoryId);
      return categoryId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getCoursesByCategoryIdAsync = createAsyncThunk(
  'courseCategory/getCoursesByCategoryId',
  async (categoryId, { rejectWithValue }) => {
    try {
      const response = await getCoursesByCategoryId(categoryId);
      return { categoryId, courses: response };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getCategoriesWithCountsAsync = createAsyncThunk(
  'courseCategory/getCategoriesWithCounts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await getCategoriesWithCounts(params);
      return response.map(category => formatCategoryForDisplay(category));
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const findCategoriesByNameAsync = createAsyncThunk(
  'courseCategory/findCategoriesByName',
  async (searchName, { rejectWithValue }) => {
    try {
      const response = await findCategoriesByName(searchName);
      return response.map(category => formatCategoryForDisplay(category));
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getCategoryUsageStatsAsync = createAsyncThunk(
  'courseCategory/getCategoryUsageStats',
  async (_, { rejectWithValue }) => {
    try {
      const stats = await getCategoryUsageStats();
      return stats;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createCategoriesBatchAsync = createAsyncThunk(
  'courseCategory/createCategoriesBatch',
  async (categoriesData, { rejectWithValue }) => {
    try {
      const result = await createCategoriesBatch(categoriesData);
      return result;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteCategoriesBatchAsync = createAsyncThunk(
  'courseCategory/deleteCategoriesBatch',
  async (categoryIds, { rejectWithValue }) => {
    try {
      const result = await deleteCategoriesBatch(categoryIds);
      return result;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ======================== INITIAL STATE ========================

const courseCategoryInitialState = {
  // Categories data
  categories: [],
  currentCategory: null,
  totalCategoryCount: 0,
  
  // Category statistics
  categoryStats: {}, // { categoryId: { courseCount, courses } }
  usageStats: {
    totalCategories: 0,
    totalCourses: 0,
    usedCategories: 0,
    unusedCategories: 0,
    mostUsedCategory: 'N/A',
    avgCoursesPerCategory: 0,
    utilizationRate: 0,
  },
  
  // Loading states
  loading: false,
  categoryLoading: false,
  statsLoading: false,
  batchLoading: false,
  
  // Error states
  error: null,
  categoryError: null,
  statsError: null,
  batchError: null,
  
  // Form data
  formData: {
    name: '',
  },
  
  // Batch form data
  batchFormData: {
    categories: [{ name: '' }],
  },
  
  // UI state
  showCreateModal: false,
  showEditModal: false,
  showDeleteModal: false,
  showBatchCreateModal: false,
  showBatchDeleteModal: false,
  showUsageStatsModal: false,
  selectedCategory: null,
  
  // Filters and search
  filters: {
    search: '',
    minCourses: '',
    maxCourses: '',
    page: 1,
    take: 10,
  },
  
  // Sorting and display
  sortBy: 'name',
  sortOrder: 'asc',
  viewMode: 'grid', // 'grid', 'list', 'table'
  
  // Bulk operations
  selectedCategories: [],
  bulkOperation: null, // 'delete', 'export'
  
  // Search suggestions
  suggestions: [],
  showSuggestions: false,
  
  // Statistics
  statistics: {
    totalCategories: 0,
    usedCategories: 0,
    unusedCategories: 0,
    averageCourseCount: 0,
    mostPopularCategory: null,
    leastPopularCategory: null,
  },
};

// ======================== SLICE ========================

const courseCategorySlice = createSlice({
  name: 'courseCategory',
  initialState: courseCategoryInitialState,
  reducers: {
    // Form data management
    setFormData: (state, action) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    
    resetFormData: (state) => {
      state.formData = courseCategoryInitialState.formData;
    },
    
    // Batch form data management
    setBatchFormData: (state, action) => {
      state.batchFormData = { ...state.batchFormData, ...action.payload };
    },
    
    addBatchCategory: (state) => {
      state.batchFormData.categories.push({ name: '' });
    },
    
    removeBatchCategory: (state, action) => {
      const index = action.payload;
      if (state.batchFormData.categories.length > 1) {
        state.batchFormData.categories.splice(index, 1);
      }
    },
    
    updateBatchCategory: (state, action) => {
      const { index, name } = action.payload;
      if (state.batchFormData.categories[index]) {
        state.batchFormData.categories[index].name = name;
      }
    },
    
    resetBatchFormData: (state) => {
      state.batchFormData = courseCategoryInitialState.batchFormData;
    },
    
    // Modal management
    setShowCreateModal: (state, action) => {
      state.showCreateModal = action.payload;
      if (!action.payload) {
        courseCategorySlice.caseReducers.resetFormData(state);
      }
    },
    
    setShowEditModal: (state, action) => {
      state.showEditModal = action.payload;
      if (!action.payload) {
        courseCategorySlice.caseReducers.resetFormData(state);
      }
    },
    
    setShowDeleteModal: (state, action) => {
      state.showDeleteModal = action.payload;
    },
    
    setShowBatchCreateModal: (state, action) => {
      state.showBatchCreateModal = action.payload;
      if (!action.payload) {
        courseCategorySlice.caseReducers.resetBatchFormData(state);
      }
    },
    
    setShowBatchDeleteModal: (state, action) => {
      state.showBatchDeleteModal = action.payload;
    },
    
    setShowUsageStatsModal: (state, action) => {
      state.showUsageStatsModal = action.payload;
    },
    
    // Selection management
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
      if (action.payload) {
        state.formData = {
          name: action.payload.name || '',
        };
      }
    },
    
    // Filter management
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    resetFilters: (state) => {
      state.filters = courseCategoryInitialState.filters;
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
    },
    
    // Bulk operations
    toggleCategorySelection: (state, action) => {
      const categoryId = action.payload;
      const index = state.selectedCategories.indexOf(categoryId);
      
      if (index > -1) {
        state.selectedCategories.splice(index, 1);
      } else {
        state.selectedCategories.push(categoryId);
      }
    },
    
    selectAllCategories: (state) => {
      state.selectedCategories = state.categories.map(category => category.id);
    },
    
    deselectAllCategories: (state) => {
      state.selectedCategories = [];
    },
    
    setBulkOperation: (state, action) => {
      state.bulkOperation = action.payload;
    },
    
    // Search suggestions
    setSuggestions: (state, action) => {
      state.suggestions = action.payload;
    },
    
    setShowSuggestions: (state, action) => {
      state.showSuggestions = action.payload;
    },
    
    // Statistics update
    updateStatistics: (state) => {
      const categories = state.categories;
      const stats = state.categoryStats;
      
      const categoriesWithCourses = categories.filter(cat => 
        stats[cat.id] && stats[cat.id].courseCount > 0
      );
      
      const totalCourses = Object.values(stats).reduce((sum, stat) => 
        sum + (stat.courseCount || 0), 0
      );
      
      const mostPopular = categories.reduce((prev, current) => {
        const prevCount = stats[prev?.id]?.courseCount || 0;
        const currentCount = stats[current.id]?.courseCount || 0;
        return currentCount > prevCount ? current : prev;
      }, categories[0]);
      
      const leastPopular = categoriesWithCourses.reduce((prev, current) => {
        const prevCount = stats[prev?.id]?.courseCount || 0;
        const currentCount = stats[current.id]?.courseCount || 0;
        return currentCount < prevCount ? current : prev;
      }, categoriesWithCourses[0]);
      
      state.statistics = {
        totalCategories: categories.length,
        usedCategories: categoriesWithCourses.length,
        unusedCategories: categories.length - categoriesWithCourses.length,
        averageCourseCount: categories.length > 0 ? 
          Math.round(totalCourses / categories.length * 10) / 10 : 0,
        mostPopularCategory: mostPopular || null,
        leastPopularCategory: leastPopular || null,
      };
    },
    
    // Error management
    clearError: (state) => {
      state.error = null;
      state.categoryError = null;
      state.statsError = null;
      state.batchError = null;
    },
    
    // Data management helpers
    addCategoryToStats: (state, action) => {
      const { categoryId, courseCount = 0, courses = [] } = action.payload;
      state.categoryStats[categoryId] = { courseCount, courses };
    },
    
    updateCategoryStats: (state, action) => {
      const { categoryId, updates } = action.payload;
      if (state.categoryStats[categoryId]) {
        state.categoryStats[categoryId] = { ...state.categoryStats[categoryId], ...updates };
      }
    },
    
    // Quick actions
    duplicateCategory: (state, action) => {
      const categoryId = action.payload;
      const category = state.categories.find(cat => cat.id === categoryId);
      if (category) {
        state.formData = {
          name: `${category.name} (Copy)`,
        };
        state.showCreateModal = true;
      }
    },
    
    // Export functionality
    prepareExportData: (state) => {
      const selectedCategories = state.selectedCategories.length > 0 
        ? state.categories.filter(cat => state.selectedCategories.includes(cat.id))
        : state.categories;
      
      return selectedCategories.map(category => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        courseCount: state.categoryStats[category.id]?.courseCount || 0,
        courses: state.categoryStats[category.id]?.courses || [],
      }));
    },
  },
  
  extraReducers: (builder) => {
    builder
      // Fetch categories
      .addCase(fetchCourseCategoriesAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourseCategoriesAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
        state.totalCategoryCount = action.payload.length;
        courseCategorySlice.caseReducers.updateStatistics(state);
      })
      .addCase(fetchCourseCategoriesAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch single category
      .addCase(fetchCourseCategoryByIdAsync.pending, (state) => {
        state.categoryLoading = true;
        state.categoryError = null;
      })
      .addCase(fetchCourseCategoryByIdAsync.fulfilled, (state, action) => {
        state.categoryLoading = false;
        state.currentCategory = action.payload;
      })
      .addCase(fetchCourseCategoryByIdAsync.rejected, (state, action) => {
        state.categoryLoading = false;
        state.categoryError = action.payload;
      })
      
      // Create category
      .addCase(createCourseCategoryAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCourseCategoryAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.categories.unshift(action.payload);
        state.totalCategoryCount += 1;
        state.showCreateModal = false;
        state.formData = courseCategoryInitialState.formData;
        // Add to stats with 0 courses
        state.categoryStats[action.payload.id] = { courseCount: 0, courses: [] };
        courseCategorySlice.caseReducers.updateStatistics(state);
      })
      .addCase(createCourseCategoryAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update category
      .addCase(updateCourseCategoryAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCourseCategoryAsync.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.categories.findIndex(cat => cat.id === action.payload.id);
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
        if (state.currentCategory?.id === action.payload.id) {
          state.currentCategory = action.payload;
        }
        state.showEditModal = false;
        state.formData = courseCategoryInitialState.formData;
      })
      .addCase(updateCourseCategoryAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete category
      .addCase(deleteCourseCategoryAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCourseCategoryAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = state.categories.filter(cat => cat.id !== action.payload);
        state.totalCategoryCount = Math.max(0, state.totalCategoryCount - 1);
        state.showDeleteModal = false;
        state.selectedCategory = null;
        
        // Remove from stats
        delete state.categoryStats[action.payload];
        
        // Remove from selected categories
        const selectedIndex = state.selectedCategories.indexOf(action.payload);
        if (selectedIndex > -1) {
          state.selectedCategories.splice(selectedIndex, 1);
        }
        
        if (state.currentCategory?.id === action.payload) {
          state.currentCategory = null;
        }
        
        courseCategorySlice.caseReducers.updateStatistics(state);
      })
      .addCase(deleteCourseCategoryAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get courses by category
      .addCase(getCoursesByCategoryIdAsync.fulfilled, (state, action) => {
        const { categoryId, courses } = action.payload;
        state.categoryStats[categoryId] = {
          courseCount: courses.length,
          courses: courses,
        };
        courseCategorySlice.caseReducers.updateStatistics(state);
      })
      
      // Get categories with counts
      .addCase(getCategoriesWithCountsAsync.fulfilled, (state, action) => {
        state.categories = action.payload;
        state.totalCategoryCount = action.payload.length;
        
        // Update stats
        action.payload.forEach(category => {
          state.categoryStats[category.id] = {
            courseCount: category.courseCount || 0,
            courses: category.courses || [],
          };
        });
        
        courseCategorySlice.caseReducers.updateStatistics(state);
      })
      
      // Find categories by name
      .addCase(findCategoriesByNameAsync.fulfilled, (state, action) => {
        state.suggestions = action.payload;
        state.showSuggestions = true;
      })
      
      // Get usage stats
      .addCase(getCategoryUsageStatsAsync.pending, (state) => {
        state.statsLoading = true;
        state.statsError = null;
      })
      .addCase(getCategoryUsageStatsAsync.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.usageStats = action.payload;
      })
      .addCase(getCategoryUsageStatsAsync.rejected, (state, action) => {
        state.statsLoading = false;
        state.statsError = action.payload;
      })
      
      // Batch create categories
      .addCase(createCategoriesBatchAsync.pending, (state) => {
        state.batchLoading = true;
        state.batchError = null;
      })
      .addCase(createCategoriesBatchAsync.fulfilled, (state, action) => {
        state.batchLoading = false;
        const { success, errors, successCount } = action.payload;
        
        // Add successful categories to the list
        success.forEach(category => {
          const formattedCategory = formatCategoryForDisplay(category);
          state.categories.unshift(formattedCategory);
          state.categoryStats[formattedCategory.id] = { courseCount: 0, courses: [] };
        });
        
        state.totalCategoryCount += successCount;
        state.showBatchCreateModal = false;
        state.batchFormData = courseCategoryInitialState.batchFormData;
        
        if (errors.length > 0) {
          state.batchError = `${successCount} categories created successfully. ${errors.length} failed: ${errors.join(', ')}`;
        }
        
        courseCategorySlice.caseReducers.updateStatistics(state);
      })
      .addCase(createCategoriesBatchAsync.rejected, (state, action) => {
        state.batchLoading = false;
        state.batchError = action.payload;
      })
      
      // Batch delete categories
      .addCase(deleteCategoriesBatchAsync.pending, (state) => {
        state.batchLoading = true;
        state.batchError = null;
      })
      .addCase(deleteCategoriesBatchAsync.fulfilled, (state, action) => {
        state.batchLoading = false;
        const { success, errors, successCount } = action.payload;
        
        // Remove successful deletions
        success.forEach(categoryId => {
          state.categories = state.categories.filter(cat => cat.id !== categoryId);
          delete state.categoryStats[categoryId];
          
          // Remove from selected categories
          const selectedIndex = state.selectedCategories.indexOf(categoryId);
          if (selectedIndex > -1) {
            state.selectedCategories.splice(selectedIndex, 1);
          }
        });
        
        state.totalCategoryCount = Math.max(0, state.totalCategoryCount - successCount);
        state.showBatchDeleteModal = false;
        state.selectedCategories = [];
        
        if (errors.length > 0) {
          state.batchError = `${successCount} categories deleted successfully. ${errors.length} failed: ${errors.join(', ')}`;
        }
        
        courseCategorySlice.caseReducers.updateStatistics(state);
      })
      .addCase(deleteCategoriesBatchAsync.rejected, (state, action) => {
        state.batchLoading = false;
        state.batchError = action.payload;
      });
  },
});

// ======================== ACTIONS EXPORT ========================

export const courseCategoryActions = courseCategorySlice.actions;

export const {
  setFormData,
  resetFormData,
  setBatchFormData,
  addBatchCategory,
  removeBatchCategory,
  updateBatchCategory,
  resetBatchFormData,
  setShowCreateModal,
  setShowEditModal,
  setShowDeleteModal,
  setShowBatchCreateModal,
  setShowBatchDeleteModal,
  setShowUsageStatsModal,
  setSelectedCategory,
  setFilters,
  resetFilters,
  setSortBy,
  setViewMode,
  toggleCategorySelection,
  selectAllCategories,
  deselectAllCategories,
  setBulkOperation,
  setSuggestions,
  setShowSuggestions,
  updateStatistics,
  clearError,
  addCategoryToStats,
  updateCategoryStats,
  duplicateCategory,
  prepareExportData,
} = courseCategorySlice.actions;

// ======================== SELECTORS ========================

// Basic selectors
export const selectCategories = (state) => state.courseCategory.categories;
export const selectCurrentCategory = (state) => state.courseCategory.currentCategory;
export const selectCategoryLoading = (state) => state.courseCategory.loading;
export const selectCategoryError = (state) => state.courseCategory.error;

// Form selectors
export const selectFormData = (state) => state.courseCategory.formData;
export const selectBatchFormData = (state) => state.courseCategory.batchFormData;
export const selectSelectedCategory = (state) => state.courseCategory.selectedCategory;

// UI selectors
export const selectFilters = (state) => state.courseCategory.filters;
export const selectSortBy = (state) => state.courseCategory.sortBy;
export const selectSortOrder = (state) => state.courseCategory.sortOrder;
export const selectViewMode = (state) => state.courseCategory.viewMode;

// Data selectors
export const selectCategoryStats = (state) => state.courseCategory.categoryStats;
export const selectUsageStats = (state) => state.courseCategory.usageStats;
export const selectStatistics = (state) => state.courseCategory.statistics;
export const selectSelectedCategories = (state) => state.courseCategory.selectedCategories;

// Computed selectors
export const selectFilteredAndSortedCategories = (state) => {
  const categories = state.courseCategory.categories;
  const filters = state.courseCategory.filters;
  const sortBy = state.courseCategory.sortBy;
  const sortOrder = state.courseCategory.sortOrder;
  const categoryStats = state.courseCategory.categoryStats;
  
  // Filter categories
  let filtered = filterCategories(categories, filters.search);
  
  // Additional filters
  if (filters.minCourses) {
    filtered = filtered.filter(cat => 
      (categoryStats[cat.id]?.courseCount || 0) >= parseInt(filters.minCourses)
    );
  }
  
  if (filters.maxCourses) {
    filtered = filtered.filter(cat => 
      (categoryStats[cat.id]?.courseCount || 0) <= parseInt(filters.maxCourses)
    );
  }
  
  // Add course count to categories for sorting
  const categoriesWithCounts = filtered.map(category => ({
    ...category,
    courseCount: categoryStats[category.id]?.courseCount || 0,
  }));
  
  // Sort categories
  const sorted = sortCategories(categoriesWithCounts, sortBy, sortOrder);
  
  return sorted;
};

export const selectCategoryById = (categoryId) => (state) => {
  return state.courseCategory.categories.find(category => category.id === categoryId);
};

export const selectCategoryCourses = (categoryId) => (state) => {
  return state.courseCategory.categoryStats[categoryId]?.courses || [];
};

export const selectCategoryUsageData = (state) => {
  const categories = state.courseCategory.categories;
  const stats = state.courseCategory.categoryStats;
  
  return categories.map(category => ({
    ...category,
    courseCount: stats[category.id]?.courseCount || 0,
    utilizationPercentage: Math.round((stats[category.id]?.courseCount || 0) / Math.max(1, Object.values(stats).reduce((max, stat) => Math.max(max, stat.courseCount || 0), 1)) * 100),
  }));
};

export const selectCanDeleteCategory = (categoryId) => (state) => {
  const courseCount = state.courseCategory.categoryStats[categoryId]?.courseCount || 0;
  return courseCount === 0;
};

export const selectFormValidationErrors = (state) => {
  const formData = state.courseCategory.formData;
  return validateCategoryData(formData);
};

export const selectBatchValidationErrors = (state) => {
  const batchFormData = state.courseCategory.batchFormData;
  const errors = [];
  
  batchFormData.categories.forEach((category, index) => {
    const categoryErrors = validateCategoryData(category);
    if (categoryErrors.length > 0) {
      errors.push(`Category ${index + 1}: ${categoryErrors.join(', ')}`);
    }
  });
  
  return errors;
};

export default courseCategorySlice.reducer;