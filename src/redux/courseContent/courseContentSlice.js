// redux/courseContent/courseContentSlice.js - Enhanced for Video Streaming
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  // Core CRUD operations
  addContent,
 
  deleteContent,
  getContentsBySection,
  getContentById,
  
  // Video operations
  addVideoContent,
  updateVideoContent,
  getVideoById,
  getVideoInteractions,
  updateVideoInteraction as updateVideoInteractionAPI,
  deleteVideoInteraction,
  
  // FIXED: Enhanced video streaming operations
  getContentPaths,
  getContentStream,
  getVideoStreamingUrl,
  
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
 updateContent,
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
  getLanguageName,
  generateContentPreview,
  sortContents,
  filterContents,
  isVideoReadyForStreaming,
  getVideoDisplayUrl,
  getUploadStatusMessage,
  getUploadStatusInfo,
  CONTENT_TYPES,
  VIDEO_QUALITIES,
  INTERACTION_TYPES,
  SUBTITLE_LANGUAGES,
  COMMENT_ORDER_OPTIONS,
  MEETING_ORDER_OPTIONS,
  UPLOAD_STATUS,
} from '@/api/courseContent';

// ======================== ASYNC THUNKS ========================

// Content CRUD operations (FIXED: Proper enum handling)
export const addContentAsync = createAsyncThunk(
  'courseContent/addContent',
  async (contentData, { rejectWithValue }) => {
    try {
      const errors = validateContentData(contentData);
      if (errors.length > 0) {
        return rejectWithValue(errors.join(', '));
      }
      
      // FIXED: Ensure proper content type enum values
      const apiData = {
        ...contentData,
        type: contentData.type || CONTENT_TYPES.TEXT_BOX,
        sectionId: contentData.sectionId
      };
      
      const response = await addContent(apiData);
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

// FIXED: Enhanced video operations with streaming support
export const addVideoContentAsync = createAsyncThunk(
  'courseContent/addVideoContent',
  async (videoData, { rejectWithValue }) => {
    try {
      const errors = validateVideoData(videoData);
      if (errors.length > 0) {
        return rejectWithValue(errors.join(', '));
      }
      
      // FIXED: Use correct video content type (CONTENT_TYPES.VIDEO = 4)
      const apiData = {
        ...videoData,
        type: CONTENT_TYPES.VIDEO
      };
      
      const response = await addVideoContent(apiData);
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
      // FIXED: Use correct video content type
      const apiData = {
        ...videoData,
        type: CONTENT_TYPES.VIDEO
      };
      
      const response = await updateVideoContent(apiData);
      return formatVideoForDisplay(response);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// FIXED: Enhanced video streaming operations
export const getVideoPathsAsync = createAsyncThunk(
  'courseContent/getVideoPaths',
  async (contentId, { rejectWithValue }) => {
    try {
      console.log('🎬 Redux: Getting video paths for content:', contentId);
      const response = await getContentPaths(contentId);
      return { contentId, pathsData: response };
    } catch (error) {
      console.error('❌ Redux: Failed to get video paths:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const getVideoStreamingUrlAsync = createAsyncThunk(
  'courseContent/getVideoStreamingUrl',
  async (contentId, { rejectWithValue }) => {
    try {
      console.log('🎥 Redux: Getting video streaming URL for content:', contentId);
      const response = await getVideoStreamingUrl(contentId);
      return { contentId, streamingData: response };
    } catch (error) {
      console.error('❌ Redux: Failed to get video streaming URL:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const getContentStreamAsync = createAsyncThunk(
  'courseContent/getContentStream',
  async ({ contentId, file }, { rejectWithValue }) => {
    try {
      console.log('📡 Redux: Getting content stream for:', contentId, file);
      const response = await getContentStream(contentId, file);
      return { contentId, file, streamData: response };
    } catch (error) {
      console.error('❌ Redux: Failed to get content stream:', error);
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

export const updateVideoInteractionAsync = createAsyncThunk(
  'courseContent/updateVideoInteraction',
  async (interactionData, { rejectWithValue }) => {
    try {
      const response = await updateVideoInteractionAPI(interactionData);
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
      const errors = validateContentData(contentData);
      if (errors.length > 0) {
        return rejectWithValue(errors.join(', '));
      }
      
      const response = await updateContent(contentData);
      return { 
        contentId: contentData.contentId,
        sectionId: contentData.courseSectionId,
        updatedContent: response.data || response,
        contentData
      };
    } catch (error) {
      console.error('Error updating content:', error);
      return rejectWithValue(error.message);
    }
  }
);
export const addSubtitleAsync = createAsyncThunk(
  'courseContent/addSubtitle',
  async (subtitleData, { rejectWithValue }) => {
    try {
      const errors = validateSubtitleData(subtitleData);
      if (errors.length > 0) {
        return rejectWithValue(errors.join(', '));
      }
      
      // FIXED: Ensure proper language enum values
      const apiData = {
        ...subtitleData,
        language: subtitleData.language || SUBTITLE_LANGUAGES.ENGLISH
      };
      
      const response = await addSubtitle(apiData);
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

// Comment operations (FIXED: Order by handling)
export const getCommentsByContentIdAsync = createAsyncThunk(
  'courseContent/getCommentsByContentId',
  async ({ contentId, params = {} }, { rejectWithValue }) => {
    try {
      // FIXED: Ensure proper orderBy parameter
      const apiParams = {
        ...params,
        orderBy: params.orderBy ? 
          COMMENT_ORDER_OPTIONS[params.orderBy.toUpperCase()] || COMMENT_ORDER_OPTIONS.VOTE_DESC 
          : COMMENT_ORDER_OPTIONS.VOTE_DESC
      };
      
      const response = await getCommentsByContentId(contentId, apiParams);
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

// Meeting operations (FIXED: Order by handling)
export const getMeetingsByContentIdAsync = createAsyncThunk(
  'courseContent/getMeetingsByContentId',
  async ({ contentId, userId, params = {} }, { rejectWithValue }) => {
    try {
      // FIXED: Ensure proper orderBy parameter
      const apiParams = {
        ...params,
        orderBy: params.orderBy ? 
          MEETING_ORDER_OPTIONS[params.orderBy.toUpperCase()] || MEETING_ORDER_OPTIONS.DATE_DESC 
          : MEETING_ORDER_OPTIONS.DATE_DESC
      };
      
      const response = await getMeetingsByContentId(contentId, userId, apiParams);
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
  
  // FIXED: Enhanced video data with streaming support
  videos: {}, // { videoId: videoData }
  videoInteractions: {}, // { videoId: [interactions] }
  videoStreamingData: {}, // { videoId: { streamingUrl, pathsData, ready } }
  videoPaths: {}, // { videoId: pathsData }
  videoStreams: {}, // { videoId: { [fileName]: streamData } }
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
  streamingLoading: false, // FIXED: Added streaming loading state
  commentLoading: false,
  meetingLoading: false,
  fileLoading: false,
  
  // Error states
  error: null,
  contentError: null,
  videoError: null,
  streamingError: null, // FIXED: Added streaming error state
  commentError: null,
  meetingError: null,
  fileError: null,
  
  // Content creation/editing form (FIXED: Use proper enum values)
  contentForm: {
    // Basic content info
    contentTypeId: CONTENT_TYPES.TEXT_BOX, // FIXED: Use proper enum
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
     isSeekingEnabled: true,
  },
  
  // FIXED: Enhanced video form for editing with streaming support
  videoForm: {
    title: '',
    description: '',
    quality: VIDEO_QUALITIES.HD,
    enableInteractions: true,
    enableSubtitles: true,
    enableComments: true,
    autoplay: false,
    loop: false,
    // Streaming settings
    useHLS: true,
    enableAdaptiveBitrate: true,
    preloadLevel: 'metadata', // 'none', 'metadata', 'auto'
     isSeekingEnabled: true,
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
  
  // FIXED: Enhanced video player state with streaming support
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
    selectedSubtitleLanguage: SUBTITLE_LANGUAGES.ENGLISH, // FIXED: Use enum
    // Streaming specific
    isBuffering: false,
    streamingReady: false,
    hlsSupported: false,
    currentLevel: -1, // Auto quality
    levels: [], // Available quality levels
    networkError: false,
    streamUrl: null,

    isSeekingEnabled: true, // Controls whether seeking/scrubbing is allowed
    seekingBlocked: false, // For te
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
    videoSettings: false, // FIXED: Added video settings modal
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
  
  // Filters and search (FIXED: Use proper enum values)
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
  
  // FIXED: Enhanced analytics and tracking with video streaming metrics
  analytics: {
    viewCounts: {}, // { contentId: count }
    completionRates: {}, // { contentId: rate }
    averageTimeSpent: {}, // { contentId: seconds }
    interactionCounts: {}, // { contentId: count }
    commentCounts: {}, // { contentId: count }
    // Video streaming analytics
    streamingMetrics: {}, // { contentId: { bufferEvents, qualityChanges, errors } }
    playbackMetrics: {}, // { contentId: { startTime, endTime, pauseCount } }
    qualityMetrics: {}, // { contentId: { averageQuality, qualityChanges } }
  },
  
  // FIXED: Statistics with video streaming support
  statistics: {
    totalContents: 0,
    totalVideos: 0,
    totalComments: 0,
    totalMeetings: 0,
    totalFileSize: 0,
    // Video streaming statistics
    totalStreamingVideos: 0,
    totalHLSStreams: 0,
    averageBufferTime: 0,
    streamingSuccessRate: 0,
    contentTypes: {
      [CONTENT_TYPES.PAGE]: 0,
      [CONTENT_TYPES.TEXT_BOX]: 0,
      [CONTENT_TYPES.QUIZ]: 0,
      [CONTENT_TYPES.WEB_URL]: 0,
      [CONTENT_TYPES.VIDEO]: 0,
      [CONTENT_TYPES.OTHER_FILE]: 0,
      [CONTENT_TYPES.PPTX]: 0,
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
    // Content form management (FIXED: Use proper enums)
    setContentForm: (state, action) => {
      state.contentForm = { ...state.contentForm, ...action.payload };
      state.editor.isDirty = true;
      
      // FIXED: Validate content type enum
      if (action.payload.contentTypeId !== undefined) {
        const validTypes = Object.values(CONTENT_TYPES);
        if (!validTypes.includes(action.payload.contentTypeId)) {
          state.contentForm.contentTypeId = CONTENT_TYPES.TEXT_BOX;
        }
      }

       if (action.payload.isSeekingEnabled !== undefined) {
        if (typeof action.payload.isSeekingEnabled !== 'boolean') {
          state.contentForm.isSeekingEnabled = true; // Default to true
        }
      }
    },
    
    resetContentForm: (state) => {
      state.contentForm = courseContentInitialState.contentForm;
      state.editor.isDirty = false;
      state.editor.currentStep = 1;
    },
    
    // FIXED: Enhanced video form management with streaming support
    setVideoForm: (state, action) => {
      state.videoForm = { ...state.videoForm, ...action.payload };

 // Validate IsSeekingEnabled
      if (action.payload.isSeekingEnabled !== undefined) {
        if (typeof action.payload.isSeekingEnabled !== 'boolean') {
          state.videoForm.isSeekingEnabled = true; // Default to true
        }
      }

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
    
    // FIXED: Enhanced video player controls with streaming support
    setVideoPlayerState: (state, action) => {
      state.videoPlayer = { ...state.videoPlayer, ...action.payload };
      
      // FIXED: Validate subtitle language enum
      if (action.payload.selectedSubtitleLanguage !== undefined) {
        const validLanguages = Object.values(SUBTITLE_LANGUAGES);
        if (!validLanguages.includes(action.payload.selectedSubtitleLanguage)) {
          state.videoPlayer.selectedSubtitleLanguage = SUBTITLE_LANGUAGES.ENGLISH;
        }
      }

       // UPDATED: Validate IsSeekingEnabled
      if (action.payload.isSeekingEnabled !== undefined) {
        if (typeof action.payload.isSeekingEnabled !== 'boolean') {
          state.videoPlayer.isSeekingEnabled = true; // Default to true
        }
      }
    },

     toggleVideoSeeking: (state) => {
      state.videoPlayer.isSeekingEnabled = !state.videoPlayer.isSeekingEnabled;
    },
    
    // UPDATED: New action to set seeking state
    setVideoSeeking: (state, action) => {
      if (typeof action.payload === 'boolean') {
        state.videoPlayer.isSeekingEnabled = action.payload;
      }
    },
    
    // UPDATED: New action for temporary seeking blocks
    setSeekingBlocked: (state, action) => {
      if (typeof action.payload === 'boolean') {
        state.videoPlayer.seekingBlocked = action.payload;
      }
    },
    
    // UPDATED: Enhanced setVideoTime with seeking validation
    setVideoTime: (state, action) => {
      // Only allow time changes if seeking is enabled and not blocked
      if (state.videoPlayer.isSeekingEnabled && !state.videoPlayer.seekingBlocked) {
        state.videoPlayer.currentTime = action.payload;
      }
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
      // FIXED: Validate subtitle language enum
      const validLanguages = Object.values(SUBTITLE_LANGUAGES);
      if (validLanguages.includes(action.payload)) {
        state.videoPlayer.selectedSubtitleLanguage = action.payload;
      }
    },
    
    // FIXED: Enhanced streaming state management
    setStreamingState: (state, action) => {
      const { videoId, streamingData } = action.payload;
      state.videoStreamingData[videoId] = {
        ...state.videoStreamingData[videoId],
        ...streamingData
      };
    },
    
    setStreamingReady: (state, action) => {
      const { videoId, ready, streamUrl } = action.payload;
      if (!state.videoStreamingData[videoId]) {
        state.videoStreamingData[videoId] = {};
      }
      state.videoStreamingData[videoId].ready = ready;
      if (streamUrl) {
        state.videoStreamingData[videoId].streamingUrl = streamUrl;
        state.videoPlayer.streamUrl = streamUrl;
      }
    },
    
    setStreamingError: (state, action) => {
      const { videoId, error } = action.payload;
      if (!state.videoStreamingData[videoId]) {
        state.videoStreamingData[videoId] = {};
      }
      state.videoStreamingData[videoId].error = error;
      state.streamingError = error;
    },
    
    clearStreamingError: (state) => {
      state.streamingError = null;
    },
    
    updateStreamingMetrics: (state, action) => {
      const { videoId, metrics } = action.payload;
      if (!state.analytics.streamingMetrics[videoId]) {
        state.analytics.streamingMetrics[videoId] = {
          bufferEvents: 0,
          qualityChanges: 0,
          errors: 0,
          totalPlayTime: 0,
          averageQuality: 0
        };
      }
      Object.assign(state.analytics.streamingMetrics[videoId], metrics);
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
        // FIXED: Ensure content type is valid
        type: content.type || CONTENT_TYPES.TEXT_BOX,

          isSeekingEnabled: content.type === CONTENT_TYPES.VIDEO 
          ? (content.isSeekingEnabled !== undefined ? content.isSeekingEnabled : true)
          : content.isSeekingEnabled,
      };
 
      state.contentsBySection[sectionId].push(newContent);
      courseContentSlice.caseReducers.updateStatistics(state);
    },
    
    // Update content in section
    updateContentInSection: (state, action) => {
      const { sectionId, contentId, updatedContent } = action.payload;
      
      if (state.contentsBySection[sectionId]) {
        const contentIndex = state.contentsBySection[sectionId].findIndex(
          c => (c.id || c.contentId) === contentId
        );
        
        if (contentIndex >= 0) {
          state.contentsBySection[sectionId][contentIndex] = {
            ...state.contentsBySection[sectionId][contentIndex],
            ...updatedContent
          };
        }
      }
      
      courseContentSlice.caseReducers.updateStatistics(state);
    },
    
    reorderContentInSection: (state, action) => {
      const { sectionId, sourceIndex, destinationIndex } = action.payload;
      
      if (state.contentsBySection[sectionId] && 
          sourceIndex !== destinationIndex &&
          sourceIndex >= 0 && 
          destinationIndex >= 0 &&
          sourceIndex < state.contentsBySection[sectionId].length &&
          destinationIndex < state.contentsBySection[sectionId].length) {
        
        const contents = Array.from(state.contentsBySection[sectionId]);
        const [movedContent] = contents.splice(sourceIndex, 1);
        contents.splice(destinationIndex, 0, movedContent);
        
        // Update order numbers to reflect new positions
        contents.forEach((content, index) => {
          content.order = index + 1;
          content.orderNumber = index + 1;
        });
        
        state.contentsBySection[sectionId] = contents;
        
        // Mark as requiring sync with server
        state.pendingReorders = state.pendingReorders || [];
        state.pendingReorders.push({
          sectionId,
          contents: contents.map(c => ({ id: c.id, order: c.order }))
        });
      }
    },

    // Clear pending reorders after successful sync
    clearPendingReorders: (state) => {
      state.pendingReorders = [];
    },

    // ENHANCED: Better content removal with cleanup
    removeContentFromSection: (state, action) => {
      const { sectionId, contentId } = action.payload;
      
      if (state.contentsBySection[sectionId]) {
        const originalLength = state.contentsBySection[sectionId].length;
        
        state.contentsBySection[sectionId] = state.contentsBySection[sectionId].filter(
          c => (c.id || c.contentId) !== contentId
        );
        
        // Only reorder if content was actually removed
        if (state.contentsBySection[sectionId].length < originalLength) {
          // Update order numbers for remaining content
          state.contentsBySection[sectionId].forEach((content, index) => {
            content.order = index + 1;
            content.orderNumber = index + 1;
          });
        }
      }
      
      // Enhanced cleanup
      const cleanupKeys = [
        'videoStreamingData', 'videoPaths', 'videoStreams', 'commentsByContent', 
        'meetingsByContent', 'videoInteractions'
      ];
      
      cleanupKeys.forEach(key => {
        if (state[key] && state[key][contentId]) {
          delete state[key][contentId];
        }
      });
      
      // Reset current content if it's the deleted one
      if (state.currentContent?.id === contentId || 
          state.currentContent?.contentId === contentId) {
        state.currentContent = null;
      }
      
      courseContentSlice.caseReducers.updateStatistics(state);
    },

    // NEW: Optimistic content addition
    addContentOptimistic: (state, action) => {
      const { sectionId, content } = action.payload;
      
      if (!state.contentsBySection[sectionId]) {
        state.contentsBySection[sectionId] = [];
      }
      
      const newOrder = state.contentsBySection[sectionId].length + 1;
      const optimisticContent = {
        ...content,
        id: content.id || `temp_${Date.now()}_${Math.random()}`,
        order: newOrder,
        orderNumber: newOrder,
        _isOptimistic: true
      };
      
      state.contentsBySection[sectionId].push(optimisticContent);
      courseContentSlice.caseReducers.updateStatistics(state);
    },

    // NEW: Replace optimistic content with real data
    replaceOptimisticContent: (state, action) => {
      const { sectionId, tempId, realContent } = action.payload;
      
      if (state.contentsBySection[sectionId]) {
        const contentIndex = state.contentsBySection[sectionId].findIndex(
          c => c.id === tempId || c._isOptimistic
        );
        
        if (contentIndex >= 0) {
          state.contentsBySection[sectionId][contentIndex] = {
            ...realContent,
            _isOptimistic: false
          };
        }
      }
    },

    // ENHANCED: Better loading states
    setContentLoading: (state, action) => {
      const { sectionId, isLoading } = action.payload;
      
      if (sectionId) {
        state.sectionLoadingStates = state.sectionLoadingStates || {};
        state.sectionLoadingStates[sectionId] = isLoading;
      } else {
        state.contentLoading = isLoading;
      }
    },

    // NEW: Track content operation status
    setContentOperationStatus: (state, action) => {
      const { operation, status, sectionId, contentId } = action.payload;
      
      state.operationStatus = state.operationStatus || {};
      const key = `${operation}_${sectionId}_${contentId || 'all'}`;
      
      if (status === 'completed' || status === 'failed') {
        delete state.operationStatus[key];
      } else {
        state.operationStatus[key] = {
          operation,
          status,
          timestamp: Date.now()
        };
      }
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
      
      // FIXED: Clean up video streaming data
      if (state.videoStreamingData[contentId]) {
        delete state.videoStreamingData[contentId];
      }
      if (state.videoPaths[contentId]) {
        delete state.videoPaths[contentId];
      }
      if (state.videoStreams[contentId]) {
        delete state.videoStreams[contentId];
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
      
      // FIXED: Validate interaction type
      const validTypes = Object.values(INTERACTION_TYPES);
      const interactionType = validTypes.includes(interaction.interactionType) 
        ? interaction.interactionType 
        : INTERACTION_TYPES.QUESTION;
      
      state.videoInteractions[videoId].push({
        ...interaction,
        id: interaction.id || `interaction_${Date.now()}`,
        interactionType,
      });
    },
    
    updateVideoInteraction: (state, action) => {
      const { videoId, interactionId, updates } = action.payload;
      
      if (state.videoInteractions[videoId]) {
        const interactionIndex = state.videoInteractions[videoId].findIndex(
          i => i.id === interactionId
        );
        
        if (interactionIndex !== -1) {
          // FIXED: Validate interaction type on update
          const updatedInteraction = {
            ...state.videoInteractions[videoId][interactionIndex],
            ...updates,
          };
          
          if (updates.interactionType !== undefined) {
            const validTypes = Object.values(INTERACTION_TYPES);
            if (!validTypes.includes(updates.interactionType)) {
              updatedInteraction.interactionType = INTERACTION_TYPES.QUESTION;
            }
          }
          
          state.videoInteractions[videoId][interactionIndex] = updatedInteraction;
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
        case 'buffer':
          courseContentSlice.caseReducers.updateStreamingMetrics(state, {
            payload: { videoId: contentId, metrics: { bufferEvents: (state.analytics.streamingMetrics[contentId]?.bufferEvents || 0) + 1 } }
          });
          break;
        case 'qualityChange':
          courseContentSlice.caseReducers.updateStreamingMetrics(state, {
            payload: { videoId: contentId, metrics: { qualityChanges: (state.analytics.streamingMetrics[contentId]?.qualityChanges || 0) + 1 } }
          });
          break;
      }
    },
    
    // FIXED: Enhanced statistics calculation with streaming support
    updateStatistics: (state) => {
      const allContents = Object.values(state.contentsBySection).flat();
      const allComments = Object.values(state.commentsByContent).flat();
      const allMeetings = Object.values(state.meetingsByContent).flat();
      
      // FIXED: Content type distribution using proper enums
      const contentTypes = allContents.reduce((acc, content) => {
        const type = content.type || CONTENT_TYPES.TEXT_BOX;
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {
        [CONTENT_TYPES.PAGE]: 0,
        [CONTENT_TYPES.TEXT_BOX]: 0,
        [CONTENT_TYPES.QUIZ]: 0,
        [CONTENT_TYPES.WEB_URL]: 0,
        [CONTENT_TYPES.VIDEO]: 0,
        [CONTENT_TYPES.OTHER_FILE]: 0,
        [CONTENT_TYPES.PPTX]: 0,
      });
      
      const totalVideos = allContents.filter(c => c.type === CONTENT_TYPES.VIDEO).length;
      const totalStreamingVideos = Object.keys(state.videoStreamingData).filter(
        id => state.videoStreamingData[id]?.ready
      ).length;
      const totalHLSStreams = Object.keys(state.videoPaths).filter(
        id => state.videoPaths[id]?.playlistPath
      ).length;
      
      const totalFileSize = Object.values(state.uploadedFiles).reduce(
        (sum, file) => sum + (file.size || 0), 0
      );
      
      const averageDuration = allContents.length > 0 
        ? allContents.reduce((sum, c) => sum + (c.videoDuration || 0), 0) / allContents.length 
        : 0;
      
      const totalViews = Object.values(state.analytics.viewCounts).reduce((sum, count) => sum + count, 0);
      const totalInteractions = Object.values(state.analytics.interactionCounts).reduce((sum, count) => sum + count, 0);
      const engagementRate = totalViews > 0 ? (totalInteractions / totalViews) * 100 : 0;
      
      // Calculate streaming success rate
      const totalStreamingAttempts = Object.keys(state.videoStreamingData).length;
      const successfulStreams = Object.values(state.videoStreamingData).filter(
        data => data.ready && !data.error
      ).length;
      const streamingSuccessRate = totalStreamingAttempts > 0 
        ? (successfulStreams / totalStreamingAttempts) * 100 
        : 0;
      
      state.statistics = {
        totalContents: allContents.length,
        totalVideos,
        totalComments: allComments.length,
        totalMeetings: allMeetings.length,
        totalFileSize,
        totalStreamingVideos,
        totalHLSStreams,
        averageBufferTime: 0, // Would be calculated from streaming metrics
        streamingSuccessRate,
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
      state.streamingError = null;
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
      
      // FIXED: Validate language enum
      const validLanguages = Object.values(SUBTITLE_LANGUAGES);
      const language = validLanguages.includes(subtitle.language) 
        ? subtitle.language 
        : SUBTITLE_LANGUAGES.ENGLISH;
      
      state.subtitles[videoId].push({
        ...subtitle,
        id: subtitle.id || `subtitle_${Date.now()}`,
        language,
      });
    },
    
    updateSubtitleInVideo: (state, action) => {
      const { videoId, subtitleId, updates } = action.payload;
      
      if (state.subtitles[videoId]) {
        const subtitleIndex = state.subtitles[videoId].findIndex(s => s.id === subtitleId);
        if (subtitleIndex !== -1) {
          const updatedSubtitle = {
            ...state.subtitles[videoId][subtitleIndex],
            ...updates,
          };
          
          // FIXED: Validate language enum on update
          if (updates.language !== undefined) {
            const validLanguages = Object.values(SUBTITLE_LANGUAGES);
            if (!validLanguages.includes(updates.language)) {
              updatedSubtitle.language = SUBTITLE_LANGUAGES.ENGLISH;
            }
          }
          
          state.subtitles[videoId][subtitleIndex] = updatedSubtitle;
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
        // FIXED: Validate content type on import
        const validTypes = Object.values(CONTENT_TYPES);
        const contentType = validTypes.includes(content.type) ? content.type : CONTENT_TYPES.TEXT_BOX;
        
        const importedContent = {
          ...content,
          id: `imported_${Date.now()}_${index}`,
          orderNumber: state.contentsBySection[sectionId].length + index + 1,
          type: contentType,
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
      .addCase(addContentAsync.pending, (state, action) => {
        const { sectionId } = action.meta.arg;
        
        courseContentSlice.caseReducers.setContentLoading(state, {
          payload: { sectionId, isLoading: true }
        });
        
        courseContentSlice.caseReducers.setContentOperationStatus(state, {
          payload: { operation: 'add', status: 'pending', sectionId }
        });
        
        state.contentError = null;
      })
      .addCase(addContentAsync.fulfilled, (state, action) => {
        const content = action.payload;
        const sectionId = content.sectionId;
        
        courseContentSlice.caseReducers.setContentLoading(state, {
          payload: { sectionId, isLoading: false }
        });
        
        courseContentSlice.caseReducers.setContentOperationStatus(state, {
          payload: { operation: 'add', status: 'completed', sectionId }
        });

        // Add to appropriate section
          if (sectionId) {
          const enhancedContent = {
            ...content,
            // Ensure IsSeekingEnabled is set for video content
            isSeekingEnabled: content.type === CONTENT_TYPES.VIDEO 
              ? (content.isSeekingEnabled !== undefined ? content.isSeekingEnabled : true)
              : content.isSeekingEnabled,
          };
          
          courseContentSlice.caseReducers.addContentToSection(state, {
            payload: { sectionId, content: enhancedContent },
          });
        }
        
        state.modals.addContent = false;
        courseContentSlice.caseReducers.resetContentForm(state);
      })
      .addCase(addContentAsync.rejected, (state, action) => {
        const { sectionId } = action.meta.arg;
        
        courseContentSlice.caseReducers.setContentLoading(state, {
          payload: { sectionId, isLoading: false }
        });
        
        courseContentSlice.caseReducers.setContentOperationStatus(state, {
          payload: { operation: 'add', status: 'failed', sectionId }
        });
        
        state.contentError = action.payload;
      })

      // ENHANCED: Update content with better error handling
       .addCase(updateContentAsync.pending, (state, action) => {
        const { contentId, courseSectionId } = action.meta.arg;
        courseContentSlice.caseReducers.setContentOperationStatus(state, {
          payload: { operation: 'update', status: 'pending', sectionId: courseSectionId, contentId }
        });
        state.contentError = null;
      })
      .addCase(updateContentAsync.fulfilled, (state, action) => {
        const { contentId, sectionId, updatedContent, contentData } = action.payload;
        
        courseContentSlice.caseReducers.setContentOperationStatus(state, {
          payload: { operation: 'update', status: 'completed', sectionId, contentId }
        });
        
        // Update content in state
        if (state.contentsBySection[sectionId]) {
          const contentIndex = state.contentsBySection[sectionId].findIndex(
            c => (c.id || c.contentId) === contentId
          );
          
          if (contentIndex >= 0) {
            // Merge the updated data
            state.contentsBySection[sectionId][contentIndex] = {
              ...state.contentsBySection[sectionId][contentIndex],
              ...contentData, // Include the data that was sent to API
              ...updatedContent // Include the response data
            };
            
            // Re-sort contents by order if order was updated
            if (contentData.order !== undefined) {
              state.contentsBySection[sectionId].sort((a, b) => (a.order || 0) - (b.order || 0));
            }
          }
        }
        
        courseContentSlice.caseReducers.updateStatistics(state);
      })
      .addCase(updateContentAsync.rejected, (state, action) => {
        const { contentId, courseSectionId } = action.meta.arg;
        courseContentSlice.caseReducers.setContentOperationStatus(state, {
          payload: { operation: 'update', status: 'failed', sectionId: courseSectionId, contentId }
        });
        state.contentError = action.payload;
      })
      
      // Delete content
      .addCase(deleteContentAsync.pending, (state, action) => {
        const contentId = action.meta.arg;
        
        courseContentSlice.caseReducers.setContentOperationStatus(state, {
          payload: { operation: 'delete', status: 'pending', contentId }
        });
        
        state.contentError = null;
      })
      .addCase(deleteContentAsync.fulfilled, (state, action) => {
        const contentId = action.payload;
        
        courseContentSlice.caseReducers.setContentOperationStatus(state, {
          payload: { operation: 'delete', status: 'completed', contentId }
        });
        
        // Remove from all sections
        Object.keys(state.contentsBySection).forEach(sectionId => {
          courseContentSlice.caseReducers.removeContentFromSection(state, {
            payload: { sectionId, contentId },
          });
        });
        
        // Enhanced cleanup
        const cleanupKeys = [
          'commentsByContent', 'meetingsByContent', 'videoStreamingData', 
          'videoPaths', 'videoStreams', 'videoInteractions'
        ];
        
        cleanupKeys.forEach(key => {
          if (state[key] && state[key][contentId]) {
            delete state[key][contentId];
          }
        });
        
        if (state.currentContent?.id === contentId || 
            state.currentContent?.contentId === contentId) {
          state.currentContent = null;
        }
        
        state.modals.deleteContent = false;
        
        // Clear any pending operations for this content
        if (state.operationStatus) {
          Object.keys(state.operationStatus).forEach(key => {
            if (key.includes(`_${contentId}`)) {
              delete state.operationStatus[key];
            }
          });
        }
      })
      .addCase(deleteContentAsync.rejected, (state, action) => {
        const contentId = action.meta.arg;
        
        courseContentSlice.caseReducers.setContentOperationStatus(state, {
          payload: { operation: 'delete', status: 'failed', contentId }
        });
        
        state.contentError = action.payload;
      })
      
      // Get contents by section
      .addCase(getContentsBySectionAsync.pending, (state, action) => {
        const sectionId = action.meta.arg;
        
        courseContentSlice.caseReducers.setContentLoading(state, {
          payload: { sectionId, isLoading: true }
        });
      })
      .addCase(getContentsBySectionAsync.fulfilled, (state, action) => {
        const { sectionId, contents } = action.payload;
        
        courseContentSlice.caseReducers.setContentLoading(state, {
          payload: { sectionId, isLoading: false }
        });
        
        // Ensure contents are properly ordered
        const sortedContents = (contents || []).sort((a, b) => (a.order || 0) - (b.order || 0));
        
        state.contentsBySection[sectionId] = sortedContents;
        courseContentSlice.caseReducers.updateStatistics(state);
        
        // Cache timestamp for this section
        state.sectionLoadTimestamps = state.sectionLoadTimestamps || {};
        state.sectionLoadTimestamps[sectionId] = Date.now();
      })
      .addCase(getContentsBySectionAsync.rejected, (state, action) => {
        const sectionId = action.meta.arg;
        
        courseContentSlice.caseReducers.setContentLoading(state, {
          payload: { sectionId, isLoading: false }
        });
        
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
      
      // FIXED: Enhanced video streaming operations
      .addCase(getVideoPathsAsync.pending, (state) => {
        state.streamingLoading = true;
        state.streamingError = null;
      })
      .addCase(getVideoPathsAsync.fulfilled, (state, action) => {
        state.streamingLoading = false;
        const { contentId, pathsData } = action.payload;
        state.videoPaths[contentId] = pathsData;
        
        console.log('📁 Redux: Video paths loaded for content:', contentId, pathsData);
      })
      .addCase(getVideoPathsAsync.rejected, (state, action) => {
        state.streamingLoading = false;
        state.streamingError = action.payload;
        console.error('❌ Redux: Failed to load video paths:', action.payload);
      })
      
      .addCase(getVideoStreamingUrlAsync.pending, (state) => {
        state.streamingLoading = true;
        state.streamingError = null;
      })
      .addCase(getVideoStreamingUrlAsync.fulfilled, (state, action) => {
        state.streamingLoading = false;
        const { contentId, streamingData } = action.payload;
        
        state.videoStreamingData[contentId] = {
          ...state.videoStreamingData[contentId],
          ...streamingData,
          ready: streamingData.success,
          loadedAt: new Date().toISOString()
        };
        
        console.log('🎥 Redux: Video streaming URL loaded for content:', contentId, streamingData);
        
        // Update video player state if this is the current video
        if (state.currentContent?.id === contentId && streamingData.success) {
          state.videoPlayer.streamingReady = true;
          state.videoPlayer.streamUrl = streamingData.streamingUrl;
        }
      })
      .addCase(getVideoStreamingUrlAsync.rejected, (state, action) => {
        state.streamingLoading = false;
        state.streamingError = action.payload;
        console.error('❌ Redux: Failed to get video streaming URL:', action.payload);
      })
      
      .addCase(getContentStreamAsync.pending, (state) => {
        state.streamingLoading = true;
      })
      .addCase(getContentStreamAsync.fulfilled, (state, action) => {
        state.streamingLoading = false;
        const { contentId, file, streamData } = action.payload;
        
        if (!state.videoStreams[contentId]) {
          state.videoStreams[contentId] = {};
        }
        state.videoStreams[contentId][file] = streamData;
        
        console.log('📡 Redux: Content stream loaded:', contentId, file);
      })
      .addCase(getContentStreamAsync.rejected, (state, action) => {
        state.streamingLoading = false;
        state.streamingError = action.payload;
        console.error('❌ Redux: Failed to get content stream:', action.payload);
      })
      
      // Video interactions
      .addCase(getVideoInteractionsAsync.fulfilled, (state, action) => {
        const { videoId, interactions } = action.payload;
        state.videoInteractions[videoId] = interactions;
      })
      
      .addCase(updateVideoInteractionAsync.fulfilled, (state, action) => {
        const interaction = action.payload;
        const videoId = interaction.videoId;
        
        if (!state.videoInteractions[videoId]) {
          state.videoInteractions[videoId] = [];
        }
        
        // Find and update existing interaction or add new one
        const existingIndex = state.videoInteractions[videoId].findIndex(i => i.id === interaction.id);
        if (existingIndex !== -1) {
          state.videoInteractions[videoId][existingIndex] = interaction;
        } else {
          state.videoInteractions[videoId].push(interaction);
        }
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
  setStreamingState,
    toggleVideoSeeking,
  setVideoSeeking,
  setSeekingBlocked,
  setStreamingReady,
  setStreamingError,
  clearStreamingError,
  updateStreamingMetrics,
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

// FIXED: Enhanced video selectors with streaming support
export const selectVideos = (state) => state.courseContent.videos;
export const selectVideoPlayer = (state) => state.courseContent.videoPlayer;
export const selectVideoInteractions = (state) => state.courseContent.videoInteractions;
export const selectCurrentInteractions = (state) => state.courseContent.currentInteractions;
export const selectSubtitles = (state) => state.courseContent.subtitles;
export const selectVideoStreamingData = (state) => state.courseContent.videoStreamingData;
export const selectVideoPaths = (state) => state.courseContent.videoPaths;
export const selectVideoStreams = (state) => state.courseContent.videoStreams;
export const selectStreamingLoading = (state) => state.courseContent.streamingLoading;
export const selectStreamingError = (state) => state.courseContent.streamingError;

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

// FIXED: Enhanced video streaming selectors
export const selectVideoStreamingDataById = (videoId) => (state) => {
  return state.courseContent.videoStreamingData[videoId] || {};
};

export const selectVideoPathsById = (videoId) => (state) => {
  return state.courseContent.videoPaths[videoId] || {};
};

export const selectVideoStreamsById = (videoId) => (state) => {
  return state.courseContent.videoStreams[videoId] || {};
};

export const selectIsVideoStreamingReady = (videoId) => (state) => {
  const streamingData = state.courseContent.videoStreamingData[videoId];
  return streamingData?.ready && streamingData?.streamingUrl && !streamingData?.error;
};

export const selectVideoStreamingUrl = (videoId) => (state) => {
  const streamingData = state.courseContent.videoStreamingData[videoId];
  return streamingData?.streamingUrl || null;
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

// FIXED: Content type distribution with proper enum names
export const selectContentTypeDistribution = (state) => {
  const stats = state.courseContent.statistics;
  const total = stats.totalContents;
  
  if (total === 0) return [];
  
  return Object.entries(stats.contentTypes).map(([type, count]) => ({
    type: parseInt(type),
    name: getContentTypeName(parseInt(type)),
    count,
    percentage: Math.round((count / total) * 100),
  }));
};

// FIXED: Subtitle language options
export const selectSubtitleLanguageOptions = () => {
  return Object.entries(SUBTITLE_LANGUAGES).map(([key, value]) => ({
    value: value,
    label: getLanguageName(value),
    key: key.toLowerCase()
  }));
};

// FIXED: Content type options  
export const selectContentTypeOptions = () => {
  return Object.entries(CONTENT_TYPES).map(([key, value]) => ({
    value: value,
    label: getContentTypeName(value),
    key: key.toLowerCase()
  }));
};

// FIXED: Enhanced streaming analytics selectors
export const selectStreamingAnalytics = (state) => {
  const analytics = state.courseContent.analytics;
  const statistics = state.courseContent.statistics;
  
  return {
    totalStreamingVideos: statistics.totalStreamingVideos,
    totalHLSStreams: statistics.totalHLSStreams,
    streamingSuccessRate: statistics.streamingSuccessRate,
    averageBufferTime: statistics.averageBufferTime,
    streamingMetrics: analytics.streamingMetrics,
    playbackMetrics: analytics.playbackMetrics,
    qualityMetrics: analytics.qualityMetrics,
  };
};

export const selectStreamingMetricsById = (videoId) => (state) => {
  return state.courseContent.analytics.streamingMetrics[videoId] || {
    bufferEvents: 0,
    qualityChanges: 0,
    errors: 0,
    totalPlayTime: 0,
    averageQuality: 0
  };
};

export const selectVideoPlayerWithSeeking = (state) => {
  const player = state.courseContent.videoPlayer;
  return {
    ...player,
    canSeek: player.isSeekingEnabled && !player.seekingBlocked,
    seekingDisabled: !player.isSeekingEnabled || player.seekingBlocked,
  };
};

// UPDATED: New selector for seeking status
export const selectVideoSeekingStatus = (state) => {
  const player = state.courseContent.videoPlayer;
  return {
    isSeekingEnabled: player.isSeekingEnabled,
    seekingBlocked: player.seekingBlocked,
    canSeek: player.isSeekingEnabled && !player.seekingBlocked,
  };
};

// UPDATED: Enhanced content selector with seeking info for videos
export const selectContentWithSeekingInfo = (contentId) => (state) => {
  // Find content in all sections
  let content = null;
  Object.values(state.courseContent.contentsBySection).forEach(section => {
    const found = section.find(c => (c.id || c.contentId) === contentId);
    if (found) content = found;
  });
  
  if (!content) return null;
  
  return {
    ...content,
    // Add seeking info for video content
    seekingInfo: content.type === CONTENT_TYPES.VIDEO ? {
      isSeekingEnabled: content.isSeekingEnabled !== undefined ? content.isSeekingEnabled : true,
      seekingAllowed: content.isSeekingEnabled !== false, // Default to true if undefined
    } : null,
  };
};

export default courseContentSlice.reducer;