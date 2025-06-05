// redux/courseContent/courseContentSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  addContent,
  updateContent,
  deleteContent,
  hideContent,
  getContentsBySection,
  getUploadStatus,
  getContentStream,
  getContentPaths,
  addVideoInteraction,
  getVideoInteractions,
  addUserVideoInteraction,
  getUserVideoInteractionViewed,
  addSubtitle,
  getSubtitles,
  addComment,
  getComments,
  getComment,
  editComment,
  deleteComment,
  voteComment,
  getMeetingRequests,
} from '@/api/courseContent';

export const addContentAsync = createAsyncThunk(
  'courseContent/addContent',
  async (contentData, { rejectWithValue }) => {
    try {
      const response = await addContent(contentData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateContentAsync = createAsyncThunk(
  'courseContent/updateContent',
  async (contentData, { rejectWithValue }) => {
    try {
      const response = await updateContent(contentData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteContentAsync = createAsyncThunk(
  'courseContent/deleteContent',
  async (contentId, { rejectWithValue }) => {
    try {
      await deleteContent(contentId);
      return contentId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getContentsBySectionAsync = createAsyncThunk(
  'courseContent/getContentsBySection',
  async (sectionId, { rejectWithValue }) => {
    try {
      const response = await getContentsBySection(sectionId);
      return { sectionId, contents: response };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addCommentAsync = createAsyncThunk(
  'courseContent/addComment',
  async (commentData, { rejectWithValue }) => {
    try {
      const response = await addComment(commentData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getCommentsAsync = createAsyncThunk(
  'courseContent/getComments',
  async ({ courseContentId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await getComments(courseContentId, params);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const courseContentInitialState = {
  contents: [],
  currentContent: null,
  comments: [],
  subtitles: [],
  videoInteractions: [],
  meetingRequests: [],
  loading: false,
  commentsLoading: false,
  error: null,
  commentsError: null,
  uploadStatus: {},
  formData: {
    sectionId: null,
    type: 0,
    contentString: '',
    contentFile: null,
    hideContent: false,
    isDiscussionEnabled: false,
    isMeetingAllowed: false,
  },
  commentFormData: {
    courseContentId: null,
    appUserId: null,
    content: '',
    parentCommentId: null,
    audioFile: null,
    sendNotification: false,
  },
  showContentModal: false,
  showCommentModal: false,
  selectedContent: null,
  filters: {
    search: '',
    type: null,
  },
};

const courseContentSlice = createSlice({
  name: 'courseContent',
  initialState: courseContentInitialState,
  reducers: {
    setFormData: (state, action) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    setCommentFormData: (state, action) => {
      state.commentFormData = { ...state.commentFormData, ...action.payload };
    },
    resetFormData: (state) => {
      state.formData = courseContentInitialState.formData;
      state.commentFormData = courseContentInitialState.commentFormData;
    },
    setShowContentModal: (state, action) => {
      state.showContentModal = action.payload;
    },
    setShowCommentModal: (state, action) => {
      state.showCommentModal = action.payload;
    },
    setSelectedContent: (state, action) => {
      state.selectedContent = action.payload;
    },
    setUploadStatus: (state, action) => {
      const { contentId, status } = action.payload;
      state.uploadStatus[contentId] = status;
    },
    clearError: (state) => {
      state.error = null;
      state.commentsError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addContentAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addContentAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.contents.unshift(action.payload);
        state.showContentModal = false;
        state.formData = courseContentInitialState.formData;
      })
      .addCase(addContentAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteContentAsync.fulfilled, (state, action) => {
        state.contents = state.contents.filter(content => content.id !== action.payload);
      })
      .addCase(getContentsBySectionAsync.fulfilled, (state, action) => {
        state.contents = action.payload.contents;
      })
      .addCase(addCommentAsync.fulfilled, (state, action) => {
        state.comments.unshift(action.payload);
        state.showCommentModal = false;
        state.commentFormData = courseContentInitialState.commentFormData;
      })
      .addCase(getCommentsAsync.fulfilled, (state, action) => {
        state.comments = action.payload;
      });
  },
});

export const courseContentActions = courseContentSlice.actions;
export default courseContentSlice.reducer;