// redux/courseContent/courseContentSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  // Core CRUD operations
  addContent,
  updateContent,
  deleteContent,
  getContentsBySection,
  getContentById,
  
  // Video operations
  addVideoContent,
  updateVideoContent,
  getVideoById,
  getVideoInteractions,
  addVideoInteraction,
  updateVideoInteraction,
  deleteVideoInteraction,
  
  // Subtitle operations
  addSubtitle,
  updateSubtitle,
  deleteSubtitle,
  getSubtitlesByVideoId,
  
  // Comment operations
  addComment,
  updateComment,
  deleteComment,
  getCommentsByContentId,
  addCommentReply,
  updateCommentReply,
  deleteCommentReply,
  
  // Meeting operations
  addMeetingRequest,
  updateMeetingRequest,
  deleteMeetingRequest,
  getMeetingsByContentId,
  
  // File operations
  uploadFile,
  getFileInfo,
  deleteFile,
  streamVideo,
  
  // Helper functions
  validateContentData,
  validateVideoData,
  validateSubtitleData,
  validateCommentData,
  validateMeetingData,
  formatContentForDisplay,
  formatVideoForDisplay,
  formatDuration,
  calculateContentProgress,
  getContentTypeName,
  generateContentPreview,
  sortContents,
  filterContents,
  CONTENT_TYPES,
  VIDEO_QUALITIES,
  INTERACTION_TYPES,
} from '@/api/courseContent';

// ======================== ASYNC THUNKS ========================

// Content CRUD operations
export const addContentAsync = createAsyncThunk(
  'courseContent/addContent',
  async (contentData, { rejectWithValue }) => {
    try {
      const errors = validateContentData(contentData);
      if (errors.length > 0) {
        return rejectWithValue(errors.join(', '));
      }
      
      const response = await addContent(contentData);
      return formatContentForDisplay(response);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateContentAsync = createAsyncThunk(
  'courseContent/updateContent',
  async (contentData, { rejectWithValue }) => {
    try {
      const errors = validateContentData(contentData);
      if (errors.length > 0) {
        return rejectWithValue(errors.join(', '));
      }
      
      const response = await updateContent(contentData);
      return formatContentForDisplay(response);
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
      return {
        sectionId,
        contents: response.map(content => formatContentForDisplay(content)),
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getContentByIdAsync = createAsyncThunk(
  'courseContent/getContentById',
  async (contentId, { rejectWithValue }) => {
    try {
      const response = await getContentById(contentId);
      return formatContentForDisplay(response);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Video operations
export const addVideoContentAsync = createAsyncThunk(
  'courseContent/addVideoContent',
  async (videoData, { rejectWithValue }) => {
    try {
      const errors = validateVideoData(videoData);
      if (errors.length > 0) {
        return rejectWithValue(errors.join(', '));
      }
      
      const response = await addVideoContent(videoData);
      return formatVideoForDisplay(response);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateVideoContentAsync = createAsyncThunk(
  'courseContent/updateVideoContent',
  async (videoData, { rejectWithValue }) => {
    try {
      const response = await updateVideoContent(videoData);
      return formatVideoForDisplay(response);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getVideoInteractionsAsync = createAsyncThunk(
  'courseContent/getVideoInteractions',
  async (videoId, { rejectWithValue }) => {
    try {
      const response = await getVideoInteractions(videoId);
      return { videoId, interactions: response };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addVideoInteractionAsync = createAsyncThunk(
  'courseContent/addVideoInteraction',
  async (interactionData, { rejectWithValue }) => {
    try {
      const response = await addVideoInteraction(interactionData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Subtitle operations
export const addSubtitleAsync = createAsyncThunk(
  'courseContent/addSubtitle',
  async (subtitleData, { rejectWithValue }) => {
    try {
      const errors = validateSubtitleData(subtitleData);
      if (errors.length > 0) {
        return rejectWithValue(errors.join(', '));
      }
      
      const response = await addSubtitle(subtitleData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getSubtitlesByVideoIdAsync = createAsyncThunk(
  'courseContent/getSubtitlesByVideoId',
  async (videoId, { rejectWithValue }) => {
    try {
      const response = await getSubtitlesByVideoId(videoId);
      return { videoId, subtitles: response };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Comment operations
export const getCommentsByContentIdAsync = createAsyncThunk(
  'courseContent/getCommentsByContentId',
  async (contentId, { rejectWithValue }) => {
    try {
      const response = await getCommentsByContentId(contentId);
      return { contentId, comments: response };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addCommentAsync = createAsyncThunk(
  'courseContent/addComment',
  async (commentData, { rejectWithValue }) => {
    try {
      const errors = validateCommentData(commentData);
      if (errors.length > 0) {
        return rejectWithValue(errors.join(', '));
      }
      
      const response = await addComment(commentData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addCommentReplyAsync = createAsyncThunk(
  'courseContent/addCommentReply',
  async (replyData, { rejectWithValue }) => {
    try {
      const response = await addCommentReply(replyData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Meeting operations
export const getMeetingsByContentIdAsync = createAsyncThunk(
  'courseContent/getMeetingsByContentId',
  async (contentId, { rejectWithValue }) => {
    try {
      const response = await getMeetingsByContentId(contentId);
      return { contentId, meetings: response };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addMeetingRequestAsync = createAsyncThunk(
  'courseContent/addMeetingRequest',
  async (meetingData, { rejectWithValue }) => {
    try {
      const errors = validateMeetingData(meetingData);
      if (errors.length > 0) {
        return rejectWithValue(errors.join(', '));
      }
      
      const response = await addMeetingRequest(meetingData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// File operations
export const uploadFileAsync = createAsyncThunk(
  'courseContent/uploadFile',
  async ({ file, contentId, onProgress }, { rejectWithValue }) => {
    try {
      const response = await uploadFile(file, contentId, onProgress);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getFileInfoAsync = createAsyncThunk(
  'courseContent/getFileInfo',
  async (fileId, { rejectWithValue }) => {
    try {
      const response = await getFileInfo(fileId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ======================== INITIAL STATE ========================

const courseContentInitialState = {
  // Content data by section
  contentsBySection: {}, // { sectionId: [contents] }
  
  // Current content being viewed/edited
  currentContent: null,
  
  // Video data
  videos: {}, // { videoId: videoData }
  videoInteractions: {}, // { videoId: [interactions] }
  subtitles: {}, // { videoId: [subtitles] }
  
  // Comments by content
  commentsByContent: {}, // { contentId: [comments] }
  
  // Meetings by content
  meetingsByContent: {}, // { contentId: [meetings] }
  
  // File uploads
  fileUploads: {}, // { uploadId: { progress, status, file } }
  uploadedFiles: {}, // { fileId: fileInfo }
  
  // Loading states
  loading: false,
  contentLoading: false,
  videoLoading: false,
  commentLoading: false,
  meetingLoading: false,
  fileLoading: false,
  
  // Error states
  error: null,
  contentError: null,
  videoError: null,
  commentError: null,
  meetingError: null,
  fileError: null,
  
  // Content creation/editing form
  contentForm: {
    // Basic content info
    contentTypeId: CONTENT_TYPES.TEXT,
    title: '',
    description: '',
    body: '',
    
    // Video specific
    videoFile: null,
    videoDuration: 0,
    videoQuality: VIDEO_QUALITIES.HD,
    thumbnail: null,
    
    // File specific
    files: [],
    
    // Settings
    hasQuiz: false,
    isMandatory: false,
    canSkip: false,
    orderNumber: 1,
  },
  
  // Video form for editing
  videoForm: {
    title: '',
    description: '',
    quality: VIDEO_QUALITIES.HD,
    enableInteractions: true,
    enableSubtitles: true,
    enableComments: true,
    autoplay: false,
    loop: false,
  },
  
  // Comment form
  commentForm: {
    text: '',
    parentCommentId: null,
    timestamp: null, // For video comments
  },
  
  // Meeting request form
  meetingForm: {
    title: '',
    description: '',
    requestedDateTime: '',
    duration: 60, // minutes
    meetingType: 'video', // 'video', 'audio', 'in-person'
    urgency: 'normal', // 'low', 'normal', 'high'
  },
  
  // Video player state
  videoPlayer: {
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    playbackRate: 1,
    quality: VIDEO_QUALITIES.HD,
    isFullscreen: false,
    showControls: true,
    showSubtitles: false,
    selectedSubtitleLanguage: 'en',
  },
  
  // Video interactions (overlay elements)
  currentInteractions: [],
  
  // UI state
  modals: {
    addContent: false,
    editContent: false,
    deleteContent: false,
    videoPlayer: false,
    addComment: false,
    addMeeting: false,
    fileUpload: false,
    videoInteractions: false,
    subtitleEditor: false,
  },
  
  // Content editor state
  editor: {
    mode: 'create', // 'create', 'edit', 'view'
    currentStep: 1, // Multi-step content creation
    totalSteps: 3,
    isDirty: false,
    autoSave: {
      enabled: true,
      interval: 30000, // 30 seconds
      lastSaved: null,
    },
  },
  
  // Filters and search
  filters: {
    contentType: '',
    search: '',
    sectionId: '',
    hasMandatory: null,
    hasQuiz: null,
    orderBy: 'orderNumber',
    page: 1,
    take: 10,
  },
  
  // Bulk operations
  selectedContents: [],
  bulkOperation: null, // 'delete', 'move', 'duplicate', 'export'
  
  // Content preview
  preview: {
    content: null,
    isActive: false,
    mode: 'desktop', // 'desktop', 'tablet', 'mobile'
  },
  
  // Analytics and tracking
  analytics: {
    viewCounts: {}, // { contentId: count }
    completionRates: {}, // { contentId: rate }
    averageTimeSpent: {}, // { contentId: seconds }
    interactionCounts: {}, // { contentId: count }
    commentCounts: {}, // { contentId: count }
  },
  
  // Statistics
  statistics: {
    totalContents: 0,
    totalVideos: 0,
    totalComments: 0,
    totalMeetings: 0,
    totalFileSize: 0,
    contentTypes: {
      [CONTENT_TYPES.TEXT]: 0,
      [CONTENT_TYPES.VIDEO]: 0,
      [CONTENT_TYPES.AUDIO]: 0,
      [CONTENT_TYPES.IMAGE]: 0,
      [CONTENT_TYPES.FILE]: 0,
      [CONTENT_TYPES.QUIZ]: 0,
    },
    averageDuration: 0,
    engagementRate: 0,
  },
};

// ======================== SLICE ========================

const courseContentSlice = createSlice({
  name: 'courseContent',
  initialState: courseContentInitialState,
  reducers: {
    // Content form management
    setContentForm: (state, action) => {
      state.contentForm = { ...state.contentForm, ...action.payload };
      state.editor.isDirty = true;
    },
    
    resetContentForm: (state) => {
      state.contentForm = courseContentInitialState.contentForm;
      state.editor.isDirty = false;
      state.editor.currentStep = 1;
    },
    
    // Video form management
    setVideoForm: (state, action) => {
      state.videoForm = { ...state.videoForm, ...action.payload };
    },
    
    resetVideoForm: (state) => {
      state.videoForm = courseContentInitialState.videoForm;
    },
    
    // Comment form management
    setCommentForm: (state, action) => {
      state.commentForm = { ...state.commentForm, ...action.payload };
    },
    
    resetCommentForm: (state) => {
      state.commentForm = courseContentInitialState.commentForm;
    },
    
    // Meeting form management
    setMeetingForm: (state, action) => {
      state.meetingForm = { ...state.meetingForm, ...action.payload };
    },
    
    resetMeetingForm: (state) => {
      state.meetingForm = courseContentInitialState.meetingForm;
    },
    
    // Editor state management
    setEditorMode: (state, action) => {
      state.editor.mode = action.payload;
    },
    
    setEditorStep: (state, action) => {
      state.editor.currentStep = action.payload;
    },
    
    nextEditorStep: (state) => {
      if (state.editor.currentStep < state.editor.totalSteps) {
        state.editor.currentStep += 1;
      }
    },
    
    prevEditorStep: (state) => {
      if (state.editor.currentStep > 1) {
        state.editor.currentStep -= 1;
      }
    },
    
    setAutoSave: (state, action) => {
      state.editor.autoSave = { ...state.editor.autoSave, ...action.payload };
    },
    
    markAsSaved: (state) => {
      state.editor.autoSave.lastSaved = new Date().toISOString();
      state.editor.isDirty = false;
    },
    
    // Video player controls
    setVideoPlayerState: (state, action) => {
      state.videoPlayer = { ...state.videoPlayer, ...action.payload };
    },
    
    playVideo: (state) => {
      state.videoPlayer.isPlaying = true;
    },
    
    pauseVideo: (state) => {
      state.videoPlayer.isPlaying = false;
    },
    
    setVideoTime: (state, action) => {
      state.videoPlayer.currentTime = action.payload;
    },
    
    setVideoVolume: (state, action) => {
      state.videoPlayer.volume = Math.max(0, Math.min(1, action.payload));
    },
    
    setPlaybackRate: (state, action) => {
      state.videoPlayer.playbackRate = action.payload;
    },
    
    toggleFullscreen: (state) => {
      state.videoPlayer.isFullscreen = !state.videoPlayer.isFullscreen;
    },
    
    toggleSubtitles: (state) => {
      state.videoPlayer.showSubtitles = !state.videoPlayer.showSubtitles;
    },
    
    setSubtitleLanguage: (state, action) => {
      state.videoPlayer.selectedSubtitleLanguage = action.payload;
    },
    
    // Content management within sections
    addContentToSection: (state, action) => {
      const { sectionId, content } = action.payload;
      
      if (!state.contentsBySection[sectionId]) {
        state.contentsBySection[sectionId] = [];
      }
      
      const newContent = {
        ...content,
        id: content.id || `temp_${Date.now()}`,
        orderNumber: state.contentsBySection[sectionId].length + 1,
      };
      
      state.contentsBySection[sectionId].push(newContent);
      courseContentSlice.caseReducers.updateStatistics(state);
    },
    
    updateContentInSection: (state, action) => {
      const { sectionId, contentId, updates } = action.payload;
      
      if (state.contentsBySection[sectionId]) {
        const contentIndex = state.contentsBySection[sectionId].findIndex(
          c => c.id === contentId
        );
        
        if (contentIndex !== -1) {
          state.contentsBySection[sectionId][contentIndex] = {
            ...state.contentsBySection[sectionId][contentIndex],
            ...updates,
          };
        }
      }
      
      courseContentSlice.caseReducers.updateStatistics(state);
    },
    
    removeContentFromSection: (state, action) => {
      const { sectionId, contentId } = action.payload;
      
      if (state.contentsBySection[sectionId]) {
        state.contentsBySection[sectionId] = state.contentsBySection[sectionId].filter(
          c => c.id !== contentId
        );
        
        // Update order numbers
        state.contentsBySection[sectionId].forEach((content, index) => {
          content.orderNumber = index + 1;
        });
      }
      
      courseContentSlice.caseReducers.updateStatistics(state);
    },
    
    reorderContentInSection: (state, action) => {
      const { sectionId, sourceIndex, destinationIndex } = action.payload;
      
      if (state.contentsBySection[sectionId]) {
        const contents = Array.from(state.contentsBySection[sectionId]);
        const [movedContent] = contents.splice(sourceIndex, 1);
        contents.splice(destinationIndex, 0, movedContent);
        
        // Update order numbers
        contents.forEach((content, index) => {
          content.orderNumber = index + 1;
        });
        
        state.contentsBySection[sectionId] = contents;
      }
    },
    
    // Video interactions management
    addVideoInteraction: (state, action) => {
      const { videoId, interaction } = action.payload;
      
      if (!state.videoInteractions[videoId]) {
        state.videoInteractions[videoId] = [];
      }
      
      state.videoInteractions[videoId].push({
        ...interaction,
        id: interaction.id || `interaction_${Date.now()}`,
      });
    },
    
    updateVideoInteraction: (state, action) => {
      const { videoId, interactionId, updates } = action.payload;
      
      if (state.videoInteractions[videoId]) {
        const interactionIndex = state.videoInteractions[videoId].findIndex(
          i => i.id === interactionId
        );
        
        if (interactionIndex !== -1) {
          state.videoInteractions[videoId][interactionIndex] = {
            ...state.videoInteractions[videoId][interactionIndex],
            ...updates,
          };
        }
      }
    },
    
    removeVideoInteraction: (state, action) => {
      const { videoId, interactionId } = action.payload;
      
      if (state.videoInteractions[videoId]) {
        state.videoInteractions[videoId] = state.videoInteractions[videoId].filter(
          i => i.id !== interactionId
        );
      }
    },
    
    setCurrentInteractions: (state, action) => {
      state.currentInteractions = action.payload;
    },
    
    // Comments management
    addCommentToContent: (state, action) => {
      const { contentId, comment } = action.payload;
      
      if (!state.commentsByContent[contentId]) {
        state.commentsByContent[contentId] = [];
      }
      
      state.commentsByContent[contentId].push({
        ...comment,
        id: comment.id || `comment_${Date.now()}`,
        replies: [],
      });
      
      courseContentSlice.caseReducers.updateStatistics(state);
    },
    
    addReplyToComment: (state, action) => {
      const { contentId, commentId, reply } = action.payload;
      
      if (state.commentsByContent[contentId]) {
        const comment = state.commentsByContent[contentId].find(c => c.id === commentId);
        if (comment) {
          if (!comment.replies) comment.replies = [];
          comment.replies.push({
            ...reply,
            id: reply.id || `reply_${Date.now()}`,
          });
        }
      }
    },
    
    updateCommentInContent: (state, action) => {
      const { contentId, commentId, updates } = action.payload;
      
      if (state.commentsByContent[contentId]) {
        const commentIndex = state.commentsByContent[contentId].findIndex(
          c => c.id === commentId
        );
        
        if (commentIndex !== -1) {
          state.commentsByContent[contentId][commentIndex] = {
            ...state.commentsByContent[contentId][commentIndex],
            ...updates,
          };
        }
      }
    },
    
    removeCommentFromContent: (state, action) => {
      const { contentId, commentId } = action.payload;
      
      if (state.commentsByContent[contentId]) {
        state.commentsByContent[contentId] = state.commentsByContent[contentId].filter(
          c => c.id !== commentId
        );
      }
      
      courseContentSlice.caseReducers.updateStatistics(state);
    },
    
    // Meetings management
    addMeetingToContent: (state, action) => {
      const { contentId, meeting } = action.payload;
      
      if (!state.meetingsByContent[contentId]) {
        state.meetingsByContent[contentId] = [];
      }
      
      state.meetingsByContent[contentId].push({
        ...meeting,
        id: meeting.id || `meeting_${Date.now()}`,
      });
      
      courseContentSlice.caseReducers.updateStatistics(state);
    },
    
    updateMeetingInContent: (state, action) => {
      const { contentId, meetingId, updates } = action.payload;
      
      if (state.meetingsByContent[contentId]) {
        const meetingIndex = state.meetingsByContent[contentId].findIndex(
          m => m.id === meetingId
        );
        
        if (meetingIndex !== -1) {
          state.meetingsByContent[contentId][meetingIndex] = {
            ...state.meetingsByContent[contentId][meetingIndex],
            ...updates,
          };
        }
      }
    },
    
    removeMeetingFromContent: (state, action) => {
      const { contentId, meetingId } = action.payload;
      
      if (state.meetingsByContent[contentId]) {
        state.meetingsByContent[contentId] = state.meetingsByContent[contentId].filter(
          m => m.id !== meetingId
        );
      }
      
      courseContentSlice.caseReducers.updateStatistics(state);
    },
    
    // File upload management
    startFileUpload: (state, action) => {
      const { uploadId, file } = action.payload;
      state.fileUploads[uploadId] = {
        file,
        progress: 0,
        status: 'uploading',
        startTime: Date.now(),
      };
    },
    
    updateFileUploadProgress: (state, action) => {
      const { uploadId, progress } = action.payload;
      if (state.fileUploads[uploadId]) {
        state.fileUploads[uploadId].progress = progress;
      }
    },
    
    completeFileUpload: (state, action) => {
      const { uploadId, fileInfo } = action.payload;
      if (state.fileUploads[uploadId]) {
        state.fileUploads[uploadId].status = 'completed';
        state.fileUploads[uploadId].progress = 100;
        state.uploadedFiles[fileInfo.id] = fileInfo;
      }
    },
    
    failFileUpload: (state, action) => {
      const { uploadId, error } = action.payload;
      if (state.fileUploads[uploadId]) {
        state.fileUploads[uploadId].status = 'failed';
        state.fileUploads[uploadId].error = error;
      }
    },
    
    removeFileUpload: (state, action) => {
      const uploadId = action.payload;
      delete state.fileUploads[uploadId];
    },
    
    // Modal management
    setModalOpen: (state, action) => {
      const { modal, isOpen } = action.payload;
      state.modals[modal] = isOpen;
    },
    
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(key => {
        state.modals[key] = false;
      });
    },
    
    // Current content management
    setCurrentContent: (state, action) => {
      state.currentContent = action.payload;
      
      if (action.payload) {
        // Populate forms if editing
        if (state.editor.mode === 'edit') {
          state.contentForm = {
            ...state.contentForm,
            ...action.payload,
          };
          
          if (action.payload.contentTypeId === CONTENT_TYPES.VIDEO) {
            state.videoForm = {
              ...state.videoForm,
              ...action.payload,
            };
          }
        }
      }
    },
    
    clearCurrentContent: (state) => {
      state.currentContent = null;
      courseContentSlice.caseReducers.resetContentForm(state);
      courseContentSlice.caseReducers.resetVideoForm(state);
    },
    
    // Filters and search
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    resetFilters: (state) => {
      state.filters = courseContentInitialState.filters;
    },
    
    // Bulk operations
    toggleContentSelection: (state, action) => {
      const contentId = action.payload;
      const index = state.selectedContents.indexOf(contentId);
      
      if (index > -1) {
        state.selectedContents.splice(index, 1);
      } else {
        state.selectedContents.push(contentId);
      }
    },
    
    selectAllContents: (state, action) => {
      const sectionId = action.payload;
      if (state.contentsBySection[sectionId]) {
        state.selectedContents = state.contentsBySection[sectionId].map(c => c.id);
      }
    },
    
    deselectAllContents: (state) => {
      state.selectedContents = [];
    },
    
    setBulkOperation: (state, action) => {
      state.bulkOperation = action.payload;
    },
    
    // Preview management
    setPreview: (state, action) => {
      state.preview = { ...state.preview, ...action.payload };
    },
    
    clearPreview: (state) => {
      state.preview = {
        content: null,
        isActive: false,
        mode: 'desktop',
      };
    },
    
    // Analytics updates
    updateAnalytics: (state, action) => {
      const { contentId, type, value } = action.payload;
      
      switch (type) {
        case 'view':
          state.analytics.viewCounts[contentId] = (state.analytics.viewCounts[contentId] || 0) + 1;
          break;
        case 'completion':
          state.analytics.completionRates[contentId] = value;
          break;
        case 'timeSpent':
          state.analytics.averageTimeSpent[contentId] = value;
          break;
        case 'interaction':
          state.analytics.interactionCounts[contentId] = (state.analytics.interactionCounts[contentId] || 0) + 1;
          break;
        case 'comment':
          state.analytics.commentCounts[contentId] = (state.analytics.commentCounts[contentId] || 0) + value;
          break;
      }
    },
    
    // Statistics calculation
    updateStatistics: (state) => {
      const allContents = Object.values(state.contentsBySection).flat();
      const allComments = Object.values(state.commentsByContent).flat();
      const allMeetings = Object.values(state.meetingsByContent).flat();
      
      // Content type distribution
      const contentTypes = allContents.reduce((acc, content) => {
        const type = content.contentTypeId || CONTENT_TYPES.TEXT;
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {
        [CONTENT_TYPES.TEXT]: 0,
        [CONTENT_TYPES.VIDEO]: 0,
        [CONTENT_TYPES.AUDIO]: 0,
        [CONTENT_TYPES.IMAGE]: 0,
        [CONTENT_TYPES.FILE]: 0,
        [CONTENT_TYPES.QUIZ]: 0,
      });
      
      const totalVideos = allContents.filter(c => c.contentTypeId === CONTENT_TYPES.VIDEO).length;
      const totalFileSize = Object.values(state.uploadedFiles).reduce(
        (sum, file) => sum + (file.size || 0), 0
      );
      
      const averageDuration = allContents.length > 0 
        ? allContents.reduce((sum, c) => sum + (c.videoDuration || 0), 0) / allContents.length 
        : 0;
      
      const totalViews = Object.values(state.analytics.viewCounts).reduce((sum, count) => sum + count, 0);
      const totalInteractions = Object.values(state.analytics.interactionCounts).reduce((sum, count) => sum + count, 0);
      const engagementRate = totalViews > 0 ? (totalInteractions / totalViews) * 100 : 0;
      
      state.statistics = {
        totalContents: allContents.length,
        totalVideos,
        totalComments: allComments.length,
        totalMeetings: allMeetings.length,
        totalFileSize,
        contentTypes,
        averageDuration: Math.round(averageDuration),
        engagementRate: Math.round(engagementRate * 10) / 10,
      };
    },
    
    // Error management
    clearError: (state) => {
      state.error = null;
      state.contentError = null;
      state.videoError = null;
      state.commentError = null;
      state.meetingError = null;
      state.fileError = null;
    },
    
    // Subtitle management
    addSubtitleToVideo: (state, action) => {
      const { videoId, subtitle } = action.payload;
      
      if (!state.subtitles[videoId]) {
        state.subtitles[videoId] = [];
      }
      
      state.subtitles[videoId].push({
        ...subtitle,
        id: subtitle.id || `subtitle_${Date.now()}`,
      });
    },
    
    updateSubtitleInVideo: (state, action) => {
      const { videoId, subtitleId, updates } = action.payload;
      
      if (state.subtitles[videoId]) {
        const subtitleIndex = state.subtitles[videoId].findIndex(s => s.id === subtitleId);
        if (subtitleIndex !== -1) {
          state.subtitles[videoId][subtitleIndex] = {
            ...state.subtitles[videoId][subtitleIndex],
            ...updates,
          };
        }
      }
    },
    
    removeSubtitleFromVideo: (state, action) => {
      const { videoId, subtitleId } = action.payload;
      
      if (state.subtitles[videoId]) {
        state.subtitles[videoId] = state.subtitles[videoId].filter(s => s.id !== subtitleId);
      }
    },
    
    // Content duplication
    duplicateContent: (state, action) => {
      const { sectionId, contentId } = action.payload;
      
      if (state.contentsBySection[sectionId]) {
        const originalContent = state.contentsBySection[sectionId].find(c => c.id === contentId);
        
        if (originalContent) {
          const duplicatedContent = {
            ...JSON.parse(JSON.stringify(originalContent)),
            id: `duplicate_${Date.now()}`,
            title: `${originalContent.title} (Copy)`,
            orderNumber: state.contentsBySection[sectionId].length + 1,
          };
          
          state.contentsBySection[sectionId].push(duplicatedContent);
          courseContentSlice.caseReducers.updateStatistics(state);
        }
      }
    },
    
    // Content import/export
    importContent: (state, action) => {
      const { sectionId, contents } = action.payload;
      
      if (!state.contentsBySection[sectionId]) {
        state.contentsBySection[sectionId] = [];
      }
      
      contents.forEach((content, index) => {
        const importedContent = {
          ...content,
          id: `imported_${Date.now()}_${index}`,
          orderNumber: state.contentsBySection[sectionId].length + index + 1,
        };
        
        state.contentsBySection[sectionId].push(importedContent);
      });
      
      courseContentSlice.caseReducers.updateStatistics(state);
    },
    
    exportContent: (state, action) => {
      const { sectionId, contentIds } = action.payload;
      
      if (state.contentsBySection[sectionId]) {
        const contentsToExport = contentIds 
          ? state.contentsBySection[sectionId].filter(c => contentIds.includes(c.id))
          : state.contentsBySection[sectionId];
        
        // This would typically trigger a download or API call
        // For now, we'll just store it in state
        state.exportData = {
          contents: contentsToExport,
          exportedAt: new Date().toISOString(),
          sectionId,
        };
      }
    },
  },
  
  extraReducers: (builder) => {
    builder
      // Add content
      .addCase(addContentAsync.pending, (state) => {
        state.contentLoading = true;
        state.contentError = null;
      })
      .addCase(addContentAsync.fulfilled, (state, action) => {
        state.contentLoading = false;
        
        // Add to appropriate section
        const content = action.payload;
        const sectionId = content.sectionId;
        
        if (sectionId) {
          courseContentSlice.caseReducers.addContentToSection(state, {
            payload: { sectionId, content },
          });
        }
        
        state.modals.addContent = false;
        courseContentSlice.caseReducers.resetContentForm(state);
      })
      .addCase(addContentAsync.rejected, (state, action) => {
        state.contentLoading = false;
        state.contentError = action.payload;
      })
      
      // Update content
      .addCase(updateContentAsync.pending, (state) => {
        state.contentLoading = true;
        state.contentError = null;
      })
      .addCase(updateContentAsync.fulfilled, (state, action) => {
        state.contentLoading = false;
        
        const content = action.payload;
        const sectionId = content.sectionId;
        
        if (sectionId) {
          courseContentSlice.caseReducers.updateContentInSection(state, {
            payload: { sectionId, contentId: content.id, updates: content },
          });
        }
        
        if (state.currentContent?.id === content.id) {
          state.currentContent = content;
        }
        
        state.modals.editContent = false;
        courseContentSlice.caseReducers.markAsSaved(state);
      })
      .addCase(updateContentAsync.rejected, (state, action) => {
        state.contentLoading = false;
        state.contentError = action.payload;
      })
      
      // Delete content
      .addCase(deleteContentAsync.pending, (state) => {
        state.contentLoading = true;
        state.contentError = null;
      })
      .addCase(deleteContentAsync.fulfilled, (state, action) => {
        state.contentLoading = false;
        
        const contentId = action.payload;
        
        // Remove from all sections
        Object.keys(state.contentsBySection).forEach(sectionId => {
          courseContentSlice.caseReducers.removeContentFromSection(state, {
            payload: { sectionId, contentId },
          });
        });
        
        // Clean up related data
        Object.keys(state.commentsByContent).forEach(key => {
          if (key === contentId) {
            delete state.commentsByContent[key];
          }
        });
        
        Object.keys(state.meetingsByContent).forEach(key => {
          if (key === contentId) {
            delete state.meetingsByContent[key];
          }
        });
        
        if (state.currentContent?.id === contentId) {
          state.currentContent = null;
        }
        
        state.modals.deleteContent = false;
      })
      .addCase(deleteContentAsync.rejected, (state, action) => {
        state.contentLoading = false;
        state.contentError = action.payload;
      })
      
      // Get contents by section
      .addCase(getContentsBySectionAsync.fulfilled, (state, action) => {
        const { sectionId, contents } = action.payload;
        state.contentsBySection[sectionId] = contents;
        courseContentSlice.caseReducers.updateStatistics(state);
      })
      
      // Get content by ID
      .addCase(getContentByIdAsync.pending, (state) => {
        state.contentLoading = true;
        state.contentError = null;
      })
      .addCase(getContentByIdAsync.fulfilled, (state, action) => {
        state.contentLoading = false;
        state.currentContent = action.payload;
      })
      .addCase(getContentByIdAsync.rejected, (state, action) => {
        state.contentLoading = false;
        state.contentError = action.payload;
      })
      
      // Video operations
      .addCase(addVideoContentAsync.pending, (state) => {
        state.videoLoading = true;
        state.videoError = null;
      })
      .addCase(addVideoContentAsync.fulfilled, (state, action) => {
        state.videoLoading = false;
        
        const video = action.payload;
        state.videos[video.id] = video;
        
        // Also add as content if it has section info
        if (video.sectionId) {
          courseContentSlice.caseReducers.addContentToSection(state, {
            payload: { sectionId: video.sectionId, content: video },
          });
        }
      })
      .addCase(addVideoContentAsync.rejected, (state, action) => {
        state.videoLoading = false;
        state.videoError = action.payload;
      })
      
      // Update video content
      .addCase(updateVideoContentAsync.fulfilled, (state, action) => {
        const video = action.payload;
        state.videos[video.id] = video;
        
        if (video.sectionId) {
          courseContentSlice.caseReducers.updateContentInSection(state, {
            payload: { sectionId: video.sectionId, contentId: video.id, updates: video },
          });
        }
      })
      
      // Video interactions
      .addCase(getVideoInteractionsAsync.fulfilled, (state, action) => {
        const { videoId, interactions } = action.payload;
        state.videoInteractions[videoId] = interactions;
      })
      
      .addCase(addVideoInteractionAsync.fulfilled, (state, action) => {
        const interaction = action.payload;
        const videoId = interaction.videoId;
        
        if (!state.videoInteractions[videoId]) {
          state.videoInteractions[videoId] = [];
        }
        
        state.videoInteractions[videoId].push(interaction);
      })
      
      // Subtitles
      .addCase(getSubtitlesByVideoIdAsync.fulfilled, (state, action) => {
        const { videoId, subtitles } = action.payload;
        state.subtitles[videoId] = subtitles;
      })
      
      .addCase(addSubtitleAsync.fulfilled, (state, action) => {
        const subtitle = action.payload;
        const videoId = subtitle.videoId;
        
        if (!state.subtitles[videoId]) {
          state.subtitles[videoId] = [];
        }
        
        state.subtitles[videoId].push(subtitle);
      })
      
      // Comments
      .addCase(getCommentsByContentIdAsync.pending, (state) => {
        state.commentLoading = true;
        state.commentError = null;
      })
      .addCase(getCommentsByContentIdAsync.fulfilled, (state, action) => {
        state.commentLoading = false;
        const { contentId, comments } = action.payload;
        state.commentsByContent[contentId] = comments;
        courseContentSlice.caseReducers.updateStatistics(state);
      })
      .addCase(getCommentsByContentIdAsync.rejected, (state, action) => {
        state.commentLoading = false;
        state.commentError = action.payload;
      })
      
      .addCase(addCommentAsync.fulfilled, (state, action) => {
        const comment = action.payload;
        const contentId = comment.contentId;
        
        courseContentSlice.caseReducers.addCommentToContent(state, {
          payload: { contentId, comment },
        });
        
        state.modals.addComment = false;
        courseContentSlice.caseReducers.resetCommentForm(state);
      })
      
      .addCase(addCommentReplyAsync.fulfilled, (state, action) => {
        const reply = action.payload;
        const contentId = reply.contentId;
        const parentCommentId = reply.parentCommentId;
        
        courseContentSlice.caseReducers.addReplyToComment(state, {
          payload: { contentId, commentId: parentCommentId, reply },
        });
      })
      
      // Meetings
      .addCase(getMeetingsByContentIdAsync.pending, (state) => {
        state.meetingLoading = true;
        state.meetingError = null;
      })
      .addCase(getMeetingsByContentIdAsync.fulfilled, (state, action) => {
        state.meetingLoading = false;
        const { contentId, meetings } = action.payload;
        state.meetingsByContent[contentId] = meetings;
        courseContentSlice.caseReducers.updateStatistics(state);
      })
      .addCase(getMeetingsByContentIdAsync.rejected, (state, action) => {
        state.meetingLoading = false;
        state.meetingError = action.payload;
      })
      
      .addCase(addMeetingRequestAsync.fulfilled, (state, action) => {
        const meeting = action.payload;
        const contentId = meeting.contentId;
        
        courseContentSlice.caseReducers.addMeetingToContent(state, {
          payload: { contentId, meeting },
        });
        
        state.modals.addMeeting = false;
        courseContentSlice.caseReducers.resetMeetingForm(state);
      })
      
      // File operations
      .addCase(uploadFileAsync.pending, (state, action) => {
        state.fileLoading = true;
        state.fileError = null;
        
        // Start tracking upload
        const uploadId = `upload_${Date.now()}`;
        courseContentSlice.caseReducers.startFileUpload(state, {
          payload: { uploadId, file: action.meta.arg.file },
        });
      })
      .addCase(uploadFileAsync.fulfilled, (state, action) => {
        state.fileLoading = false;
        
        const fileInfo = action.payload;
        state.uploadedFiles[fileInfo.id] = fileInfo;
        
        // Complete upload tracking
        const uploadId = Object.keys(state.fileUploads).find(
          id => state.fileUploads[id].status === 'uploading'
        );
        
        if (uploadId) {
          courseContentSlice.caseReducers.completeFileUpload(state, {
            payload: { uploadId, fileInfo },
          });
        }
      })
      .addCase(uploadFileAsync.rejected, (state, action) => {
        state.fileLoading = false;
        state.fileError = action.payload;
        
        // Mark upload as failed
        const uploadId = Object.keys(state.fileUploads).find(
          id => state.fileUploads[id].status === 'uploading'
        );
        
        if (uploadId) {
          courseContentSlice.caseReducers.failFileUpload(state, {
            payload: { uploadId, error: action.payload },
          });
        }
      })
      
      .addCase(getFileInfoAsync.fulfilled, (state, action) => {
        const fileInfo = action.payload;
        state.uploadedFiles[fileInfo.id] = fileInfo;
      });
  },
});

// ======================== ACTIONS EXPORT ========================

export const courseContentActions = courseContentSlice.actions;

export const {
  setContentForm,
  resetContentForm,
  setVideoForm,
  resetVideoForm,
  setCommentForm,
  resetCommentForm,
  setMeetingForm,
  resetMeetingForm,
  setEditorMode,
  setEditorStep,
  nextEditorStep,
  prevEditorStep,
  setAutoSave,
  markAsSaved,
  setVideoPlayerState,
  playVideo,
  pauseVideo,
  setVideoTime,
  setVideoVolume,
  setPlaybackRate,
  toggleFullscreen,
  toggleSubtitles,
  setSubtitleLanguage,
  addContentToSection,
  updateContentInSection,
  removeContentFromSection,
  reorderContentInSection,
  addVideoInteraction,
  updateVideoInteraction,
  removeVideoInteraction,
  setCurrentInteractions,
  addCommentToContent,
  addReplyToComment,
  updateCommentInContent,
  removeCommentFromContent,
  addMeetingToContent,
  updateMeetingInContent,
  removeMeetingFromContent,
  startFileUpload,
  updateFileUploadProgress,
  completeFileUpload,
  failFileUpload,
  removeFileUpload,
  setModalOpen,
  closeAllModals,
  setCurrentContent,
  clearCurrentContent,
  setFilters,
  resetFilters,
  toggleContentSelection,
  selectAllContents,
  deselectAllContents,
  setBulkOperation,
  setPreview,
  clearPreview,
  updateAnalytics,
  updateStatistics,
  clearError,
  addSubtitleToVideo,
  updateSubtitleInVideo,
  removeSubtitleFromVideo,
  duplicateContent,
  importContent,
  exportContent,
} = courseContentSlice.actions;

// ======================== SELECTORS ========================

// Basic selectors
export const selectContentsBySection = (state) => state.courseContent.contentsBySection;
export const selectCurrentContent = (state) => state.courseContent.currentContent;
export const selectContentLoading = (state) => state.courseContent.contentLoading;
export const selectContentError = (state) => state.courseContent.contentError;

// Form selectors
export const selectContentForm = (state) => state.courseContent.contentForm;
export const selectVideoForm = (state) => state.courseContent.videoForm;
export const selectCommentForm = (state) => state.courseContent.commentForm;
export const selectMeetingForm = (state) => state.courseContent.meetingForm;

// Editor selectors
export const selectEditor = (state) => state.courseContent.editor;
export const selectEditorProgress = (state) => {
  const editor = state.courseContent.editor;
  return {
    currentStep: editor.currentStep,
    totalSteps: editor.totalSteps,
    percentage: Math.round((editor.currentStep / editor.totalSteps) * 100),
  };
};

// Video selectors
export const selectVideos = (state) => state.courseContent.videos;
export const selectVideoPlayer = (state) => state.courseContent.videoPlayer;
export const selectVideoInteractions = (state) => state.courseContent.videoInteractions;
export const selectCurrentInteractions = (state) => state.courseContent.currentInteractions;
export const selectSubtitles = (state) => state.courseContent.subtitles;

// Comments and meetings
export const selectCommentsByContent = (state) => state.courseContent.commentsByContent;
export const selectMeetingsByContent = (state) => state.courseContent.meetingsByContent;

// Files
export const selectFileUploads = (state) => state.courseContent.fileUploads;
export const selectUploadedFiles = (state) => state.courseContent.uploadedFiles;

// UI selectors
export const selectModals = (state) => state.courseContent.modals;
export const selectFilters = (state) => state.courseContent.filters;
export const selectSelectedContents = (state) => state.courseContent.selectedContents;
export const selectPreview = (state) => state.courseContent.preview;

// Analytics and statistics
export const selectAnalytics = (state) => state.courseContent.analytics;
export const selectStatistics = (state) => state.courseContent.statistics;

// Computed selectors
export const selectContentsBySectionId = (sectionId) => (state) => {
  return state.courseContent.contentsBySection[sectionId] || [];
};

export const selectFilteredContents = (sectionId) => (state) => {
  const contents = state.courseContent.contentsBySection[sectionId] || [];
  const filters = state.courseContent.filters;
  
  return filterContents(contents, filters);
};

export const selectSortedContents = (sectionId) => (state) => {
  const contents = selectFilteredContents(sectionId)(state);
  const filters = state.courseContent.filters;
  
  return sortContents(contents, filters.orderBy, 'asc');
};

export const selectVideoById = (videoId) => (state) => {
  return state.courseContent.videos[videoId];
};

export const selectVideoInteractionsByVideoId = (videoId) => (state) => {
  return state.courseContent.videoInteractions[videoId] || [];
};

export const selectSubtitlesByVideoId = (videoId) => (state) => {
  return state.courseContent.subtitles[videoId] || [];
};

export const selectCommentsByContentId = (contentId) => (state) => {
  return state.courseContent.commentsByContent[contentId] || [];
};

export const selectMeetingsByContentId = (contentId) => (state) => {
  return state.courseContent.meetingsByContent[contentId] || [];
};

export const selectContentProgress = (contentId) => (state) => {
  const analytics = state.courseContent.analytics;
  return calculateContentProgress({
    viewCount: analytics.viewCounts[contentId] || 0,
    completionRate: analytics.completionRates[contentId] || 0,
    timeSpent: analytics.averageTimeSpent[contentId] || 0,
    interactions: analytics.interactionCounts[contentId] || 0,
  });
};

export const selectActiveUploads = (state) => {
  return Object.entries(state.courseContent.fileUploads)
    .filter(([_, upload]) => upload.status === 'uploading')
    .map(([id, upload]) => ({ id, ...upload }));
};

export const selectCanSaveContent = (state) => {
  const form = state.courseContent.contentForm;
  const editor = state.courseContent.editor;
  const errors = validateContentData(form);
  
  return errors.length === 0 && editor.isDirty && !state.courseContent.contentLoading;
};

export const selectContentValidationErrors = (state) => {
  const form = state.courseContent.contentForm;
  return validateContentData(form);
};

export const selectVideoPlayerTime = (state) => {
  const player = state.courseContent.videoPlayer;
  return {
    current: formatDuration(player.currentTime),
    total: formatDuration(player.duration),
    percentage: player.duration > 0 ? (player.currentTime / player.duration) * 100 : 0,
  };
};

export const selectContentTypeDistribution = (state) => {
  const stats = state.courseContent.statistics;
  const total = stats.totalContents;
  
  if (total === 0) return [];
  
  return Object.entries(stats.contentTypes).map(([type, count]) => ({
    type,
    name: getContentTypeName(parseInt(type)),
    count,
    percentage: Math.round((count / total) * 100),
  }));
};

export default courseContentSlice.reducer;