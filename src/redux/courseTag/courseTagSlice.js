// redux/courseTag/courseTagSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  fetchCourseTags,
  fetchCourseTagById,
  createCourseTag,
  updateCourseTag,
  deleteCourseTag,
  validateTagData,
} from '@/api/courseTag';

export const fetchCourseTagsAsync = createAsyncThunk(
  'courseTag/fetchCourseTags',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await fetchCourseTags(params);
      return response;
    } catch (error) {
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
      return response;
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
      const response = await createCourseTag(tagData);
      return response;
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
      const response = await updateCourseTag(tagData);
      return response;
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

const courseTagInitialState = {
  tags: [],
  currentTag: null,
  totalTagCount: 0,
  loading: false,
  error: null,
  formData: {
    name: '',
  },
  showCreateModal: false,
  showEditModal: false,
  showDeleteModal: false,
  selectedTag: null,
  filters: {
    search: '',
    page: 1,
    take: 10,
  },
};

const courseTagSlice = createSlice({
  name: 'courseTag',
  initialState: courseTagInitialState,
  reducers: {
    setFormData: (state, action) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    resetFormData: (state) => {
      state.formData = courseTagInitialState.formData;
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
    setSelectedTag: (state, action) => {
      state.selectedTag = action.payload;
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
      .addCase(fetchCourseTagsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourseTagsAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.tags = action.payload;
        state.totalTagCount = action.payload.length;
      })
      .addCase(fetchCourseTagsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createCourseTagAsync.fulfilled, (state, action) => {
        state.tags.unshift(action.payload);
        state.totalTagCount += 1;
        state.showCreateModal = false;
        state.formData = courseTagInitialState.formData;
      })
      .addCase(updateCourseTagAsync.fulfilled, (state, action) => {
        const index = state.tags.findIndex(tag => tag.id === action.payload.id);
        if (index !== -1) {
          state.tags[index] = action.payload;
        }
        state.showEditModal = false;
        state.formData = courseTagInitialState.formData;
      })
      .addCase(deleteCourseTagAsync.fulfilled, (state, action) => {
        state.tags = state.tags.filter(tag => tag.id !== action.payload);
        state.totalTagCount = Math.max(0, state.totalTagCount - 1);
        state.showDeleteModal = false;
        state.selectedTag = null;
      });
  },
});

export const courseTagActions = courseTagSlice.actions;
export default courseTagSlice.reducer;