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
} from '@/api/courseCategory';

export const fetchCourseCategoriesAsync = createAsyncThunk(
  'courseCategory/fetchCourseCategories',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await fetchCourseCategories(params);
      return response;
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
      return response;
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
      const response = await createCourseCategory(categoryData);
      return response;
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
      const response = await updateCourseCategory(categoryData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteCourseCategoryAsync = createAsyncThunk(
  'courseCategory/deleteCourseCategory',
  async (categoryId, { rejectWithValue }) => {
    try {
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

const courseCategoryInitialState = {
  categories: [],
  currentCategory: null,
  categoryStats: {},
  totalCategoryCount: 0,
  loading: false,
  error: null,
  formData: {
    name: '',
  },
  showCreateModal: false,
  showEditModal: false,
  showDeleteModal: false,
  selectedCategory: null,
  filters: {
    search: '',
    page: 1,
    take: 10,
  },
};

const courseCategorySlice = createSlice({
  name: 'courseCategory',
  initialState: courseCategoryInitialState,
  reducers: {
    setFormData: (state, action) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    resetFormData: (state) => {
      state.formData = courseCategoryInitialState.formData;
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
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourseCategoriesAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourseCategoriesAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
        state.totalCategoryCount = action.payload.length;
      })
      .addCase(fetchCourseCategoriesAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createCourseCategoryAsync.fulfilled, (state, action) => {
        state.categories.unshift(action.payload);
        state.totalCategoryCount += 1;
        state.showCreateModal = false;
        state.formData = courseCategoryInitialState.formData;
      })
      .addCase(updateCourseCategoryAsync.fulfilled, (state, action) => {
        const index = state.categories.findIndex(cat => cat.id === action.payload.id);
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
        state.showEditModal = false;
        state.formData = courseCategoryInitialState.formData;
      })
      .addCase(deleteCourseCategoryAsync.fulfilled, (state, action) => {
        state.categories = state.categories.filter(cat => cat.id !== action.payload);
        state.totalCategoryCount = Math.max(0, state.totalCategoryCount - 1);
        state.showDeleteModal = false;
        state.selectedCategory = null;
      })
      .addCase(getCoursesByCategoryIdAsync.fulfilled, (state, action) => {
        const { categoryId, courses } = action.payload;
        state.categoryStats[categoryId] = {
          courseCount: courses.length,
          courses: courses,
        };
      });
  },
});

export const courseCategoryActions = courseCategorySlice.actions;
export default courseCategorySlice.reducer;
