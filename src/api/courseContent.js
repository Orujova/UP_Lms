import axios from "axios";
import { getToken } from "@/authtoken/auth.js";

const API_URL = "https://bravoadmin.uplms.org/api/";

const getHeaders = () => {
  const token = getToken();
  return {
    accept: "*/*",
    Authorization: `Bearer ${token}`,
  };
};

// ======================== CONTENT MANAGEMENT ========================

// Add content to section
export const addContent = async (contentData) => {
  try {
    const formData = new FormData();
    formData.append("CourseSectionId", contentData.sectionId.toString());
    formData.append("HideContent", (contentData.hideContent || false).toString());
    formData.append("Type", contentData.type.toString());
    formData.append("IsDiscussionEnabled", (contentData.isDiscussionEnabled || false).toString());
    formData.append("IsMeetingAllowed", (contentData.isMeetingAllowed || false).toString());

    if (contentData.description) {
      formData.append("Description", contentData.description);
    }

    if (contentData.contentString) {
      formData.append("ContentString", contentData.contentString);
    }

    if (contentData.contentFile && contentData.contentFile instanceof File) {
      formData.append("ContentFile", contentData.contentFile);
    }

    const response = await axios.post(`${API_URL}CourseContent/AddContent`, formData, {
      headers: {
        ...getHeaders(),
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error adding content:", error);
    throw new Error("Failed to add content: " + (error.response?.data?.detail || error.message));
  }
};

// Update content
export const updateContent = async (contentData) => {
  try {
    const formData = new FormData();
    formData.append("ContentId", contentData.contentId.toString());
    formData.append("CourseSectionId", contentData.sectionId.toString());
    formData.append("HideContent", (contentData.hideContent || false).toString());
    formData.append("IsDiscussionEnabled", (contentData.isDiscussionEnabled || false).toString());
    formData.append("IsMeetingAllowed", (contentData.isMeetingAllowed || false).toString());
    formData.append("Type", contentData.type.toString());

    if (contentData.description) {
      formData.append("Description", contentData.description);
    }

    if (contentData.contentString) {
      formData.append("ContentString", contentData.contentString);
    }

    if (contentData.contentFile && contentData.contentFile instanceof File) {
      formData.append("ContentFile", contentData.contentFile);
    }

    const response = await axios.put(`${API_URL}CourseContent/update-content`, formData, {
      headers: {
        ...getHeaders(),
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating content:", error);
    throw new Error("Failed to update content: " + (error.response?.data?.detail || error.message));
  }
};

// Delete content
export const deleteContent = async (contentId) => {
  try {
    const response = await axios.delete(`${API_URL}CourseContent/delete-content`, {
      params: { id: contentId },
      headers: getHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting content:", error);
    throw new Error("Failed to delete content: " + (error.response?.data?.detail || error.message));
  }
};

// Hide content
export const hideContent = async (contentId) => {
  try {
    const response = await axios.post(
      `${API_URL}CourseContent/hide-content`,
      { contentId },
      { 
        headers: {
          ...getHeaders(),
          "Content-Type": "application/json",
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error hiding content:", error);
    throw new Error("Failed to hide content: " + (error.response?.data?.detail || error.message));
  }
};

// Get contents by section
export const getContentsBySection = async (sectionId) => {
  try {
    const response = await axios.get(`${API_URL}CourseContent/contents`, {
      params: { sectionId },
      headers: getHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching contents:", error);
    throw new Error("Failed to fetch contents: " + (error.response?.data?.detail || error.message));
  }
};

// Get upload status
export const getUploadStatus = async (contentId) => {
  try {
    const response = await axios.get(`${API_URL}CourseContent/upload-status`, {
      params: { contentId },
      headers: getHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error getting upload status:", error);
    throw new Error("Failed to get upload status: " + (error.response?.data?.detail || error.message));
  }
};

// Get content stream
export const getContentStream = async (contentId, file) => {
  try {
    const response = await axios.get(`${API_URL}CourseContent/stream`, {
      params: { contentId, file },
      headers: getHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error getting content stream:", error);
    throw new Error("Failed to get content stream: " + (error.response?.data?.detail || error.message));
  }
};

// Get content paths
export const getContentPaths = async (contentId) => {
  try {
    const response = await axios.get(`${API_URL}CourseContent/paths`, {
      params: { contentId },
      headers: getHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error getting content paths:", error);
    throw new Error("Failed to get content paths: " + (error.response?.data?.detail || error.message));
  }
};

// ======================== VIDEO INTERACTIONS ========================

// Add video interaction
export const addVideoInteraction = async (interactionData) => {
  try {
    const payload = {
      courseContentId: interactionData.courseContentId,
      interactionType: interactionData.interactionType || 1, // 1=Question, 2=Evaluation, 3=Information
      startTimeInVideo: {
        ticks: parseDurationToTicks(interactionData.startTimeInVideo || 0)
      },
      title: interactionData.title || "",
      questionDetails: interactionData.questionDetails || null,
      evaluationDetails: interactionData.evaluationDetails || null,
      informationDetails: interactionData.informationDetails || null,
    };

    const response = await axios.post(
      `${API_URL}CourseContent/AddVideoInteraction`,
      payload,
      { 
        headers: {
          ...getHeaders(),
          "Content-Type": "application/json",
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding video interaction:", error);
    throw new Error("Failed to add video interaction: " + (error.response?.data?.detail || error.message));
  }
};

// Get video interactions
export const getVideoInteractions = async (courseContentId) => {
  try {
    const response = await axios.get(`${API_URL}CourseContent/content/interactions`, {
      params: { courseContentId },
      headers: getHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching video interactions:", error);
    throw new Error("Failed to fetch video interactions: " + (error.response?.data?.detail || error.message));
  }
};

// Add user video interaction
export const addUserVideoInteraction = async (interactionData) => {
  try {
    const payload = {
      appUserId: interactionData.appUserId,
      videoInteractionId: interactionData.videoInteractionId,
      interactionType: interactionData.interactionType,
      questionResponse: interactionData.questionResponse || "",
      evaluationResponse: interactionData.evaluationResponse || "",
    };

    const response = await axios.post(
      `${API_URL}CourseContent/user-video-interaction`,
      payload,
      { 
        headers: {
          ...getHeaders(),
          "Content-Type": "application/json",
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding user video interaction:", error);
    throw new Error("Failed to add user video interaction: " + (error.response?.data?.detail || error.message));
  }
};

// Get user video interaction viewed
export const getUserVideoInteractionViewed = async (appUserId, videoInteractionId) => {
  try {
    const response = await axios.get(`${API_URL}CourseContent/user-video-interaction/viewed`, {
      params: { AppUserId: appUserId, VideoInteractionId: videoInteractionId },
      headers: getHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error getting user video interaction viewed:", error);
    throw new Error("Failed to get user video interaction viewed: " + (error.response?.data?.detail || error.message));
  }
};

// ======================== SUBTITLES ========================

// Add subtitle to content
export const addSubtitle = async (subtitleData) => {
  try {
    const formData = new FormData();
    formData.append("CourseContentId", subtitleData.courseContentId.toString());
    formData.append("Language", subtitleData.language.toString()); // 1=English, 2=Turkish, 3=Russian, 4=Azerbaijani
    formData.append("Name", subtitleData.name);
    formData.append("UserId", subtitleData.userId.toString());

    if (subtitleData.subtitleFile && subtitleData.subtitleFile instanceof File) {
      formData.append("SubtitleFile", subtitleData.subtitleFile);
    }

    const response = await axios.post(`${API_URL}CourseContent/content/subtitle`, formData, {
      headers: {
        ...getHeaders(),
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error adding subtitle:", error);
    throw new Error("Failed to add subtitle: " + (error.response?.data?.detail || error.message));
  }
};

// Get subtitles
export const getSubtitles = async (courseContentId) => {
  try {
    const response = await axios.get(`${API_URL}CourseContent/content/subtitles`, {
      params: { courseContentId },
      headers: getHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching subtitles:", error);
    throw new Error("Failed to fetch subtitles: " + (error.response?.data?.detail || error.message));
  }
};

// ======================== COMMENTS & DISCUSSIONS ========================

// Add comment to content
export const addComment = async (commentData) => {
  try {
    const formData = new FormData();
    formData.append("CourseContentId", commentData.courseContentId.toString());
    formData.append("AppUserId", commentData.appUserId.toString());
    formData.append("Content", commentData.content);
    formData.append("SendNotification", (commentData.sendNotification || false).toString());

    if (commentData.parentCommentId) {
      formData.append("ParentCommentId", commentData.parentCommentId.toString());
    }

    if (commentData.audioFile) {
      formData.append("AudioFile", commentData.audioFile);
    }

    const response = await axios.post(`${API_URL}CourseContent/content/comment`, formData, {
      headers: {
        ...getHeaders(),
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error adding comment:", error);
    throw new Error("Failed to add comment: " + (error.response?.data?.detail || error.message));
  }
};

// Get comments
export const getComments = async (courseContentId, params = {}) => {
  try {
    const queryParams = {
      courseContentId,
      page: params.page || 1,
      ...(params.take && { take: params.take }),
      ...(params.search && { search: params.search }),
      ...(params.orderBy && { orderBy: params.orderBy }),
    };

    const response = await axios.get(`${API_URL}CourseContent/content/comments`, {
      params: queryParams,
      headers: getHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching comments:", error);
    throw new Error("Failed to fetch comments: " + (error.response?.data?.detail || error.message));
  }
};

// Get single comment with replies
export const getComment = async (commentId, params = {}) => {
  try {
    const queryParams = {
      commentId,
      page: params.page || 1,
      ...(params.take && { take: params.take }),
      ...(params.orderBy && { orderBy: params.orderBy }),
    };

    const response = await axios.get(`${API_URL}CourseContent/comment`, {
      params: queryParams,
      headers: getHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching comment:", error);
    throw new Error("Failed to fetch comment: " + (error.response?.data?.detail || error.message));
  }
};

// Edit comment
export const editComment = async (commentData) => {
  try {
    const formData = new FormData();
    formData.append("DiscussionCommentId", commentData.discussionCommentId.toString());
    formData.append("AppUserId", commentData.appUserId.toString());
    formData.append("Content", commentData.content);

    if (commentData.audioFile) {
      formData.append("AudioFile", commentData.audioFile);
    }

    const response = await axios.put(`${API_URL}CourseContent/editcomment`, formData, {
      headers: {
        ...getHeaders(),
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error editing comment:", error);
    throw new Error("Failed to edit comment: " + (error.response?.data?.detail || error.message));
  }
};

// Delete comment
export const deleteComment = async (commentId, userId) => {
  try {
    const response = await axios.delete(`${API_URL}CourseContent/deletecomment`, {
      params: {
        DiscussionCommentId: commentId,
        AppUserId: userId,
      },
      headers: getHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting comment:", error);
    throw new Error("Failed to delete comment: " + (error.response?.data?.detail || error.message));
  }
};

// Vote on comment
export const voteComment = async (voteData) => {
  try {
    const payload = {
      discussionCommentId: voteData.discussionCommentId,
      appUserId: voteData.appUserId,
      isUpvote: voteData.isUpvote,
    };

    const response = await axios.post(`${API_URL}CourseContent/comment/vote`, payload, {
      headers: {
        ...getHeaders(),
        "Content-Type": "application/json",
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error voting comment:", error);
    throw new Error("Failed to vote on comment: " + (error.response?.data?.detail || error.message));
  }
};

// ======================== MEETING REQUESTS ========================

// Get meeting requests
export const getMeetingRequests = async (courseContentId, userId, params = {}) => {
  try {
    const queryParams = {
      courseContentId,
      userId,
      page: params.page || 1,
      ...(params.take && { take: params.take }),
      ...(params.orderBy && { orderBy: params.orderBy }),
    };

    const response = await axios.get(`${API_URL}CourseContent/content/meeting-requests`, {
      params: queryParams,
      headers: getHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching meeting requests:", error);
    throw new Error("Failed to fetch meeting requests: " + (error.response?.data?.detail || error.message));
  }
};

// ======================== HELPER FUNCTIONS ========================

// Parse duration string to ticks for video interactions
const parseDurationToTicks = (durationInput) => {
  const TICKS_PER_SECOND = 10000000;
  
  if (typeof durationInput === "number") {
    return durationInput * TICKS_PER_SECOND;
  }
  
  if (typeof durationInput === "string") {
    const parts = durationInput.split(":");
    if (parts.length === 3) {
      const hours = parseInt(parts[0]) || 0;
      const minutes = parseInt(parts[1]) || 0;
      const seconds = parseInt(parts[2]) || 0;
      const totalSeconds = hours * 3600 + minutes * 60 + seconds;
      return totalSeconds * TICKS_PER_SECOND;
    }
    
    const seconds = parseInt(durationInput) || 0;
    return seconds * TICKS_PER_SECOND;
  }

  return 0;
};

// Convert ticks to seconds
export const ticksToSeconds = (ticks) => {
  const TICKS_PER_SECOND = 10000000;
  return Math.floor(ticks / TICKS_PER_SECOND);
};

// Get content type name
export const getContentTypeName = (type) => {
  const typeMap = {
    0: "Page",
    1: "TextBox", 
    2: "Video",
    3: "WebURL",
    4: "Quiz",
    5: "OtherFile",
    6: "Audio"
  };
  return typeMap[type] || "Unknown";
};

// Get supported file types for content
export const getSupportedFileTypes = () => {
  return {
    video: ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm'],
    audio: ['.mp3', '.wav', '.ogg', '.m4a'],
    document: ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx'],
    image: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg'],
    subtitle: ['.srt', '.vtt', '.ass', '.ssa']
  };
};

// Validate content data
export const validateContentData = (contentData) => {
  const errors = [];

  if (!contentData.sectionId) {
    errors.push("Section ID is required");
  }

  if (contentData.type === undefined || contentData.type === null) {
    errors.push("Content type is required");
  }

  if (contentData.type === 1 && !contentData.contentString) { // TextBox
    errors.push("Text content is required for TextBox type");
  }

  if (contentData.type === 3 && !contentData.contentString) { // WebURL
    errors.push("URL is required for WebURL type");
  }

  if ([2, 5, 6].includes(contentData.type) && !contentData.contentFile) { // Video, File, Audio
    errors.push("File is required for this content type");
  }

  return errors;
};

// Validate video interaction data
export const validateVideoInteractionData = (interactionData) => {
  const errors = [];

  if (!interactionData.courseContentId) {
    errors.push("Course content ID is required");
  }

  if (!interactionData.interactionType) {
    errors.push("Interaction type is required");
  }

  if (!interactionData.title?.trim()) {
    errors.push("Interaction title is required");
  }

  if (interactionData.interactionType === 1 && !interactionData.questionDetails) {
    errors.push("Question details are required for question interactions");
  }

  if (interactionData.interactionType === 2 && !interactionData.evaluationDetails) {
    errors.push("Evaluation details are required for evaluation interactions");
  }

  if (interactionData.interactionType === 3 && !interactionData.informationDetails) {
    errors.push("Information details are required for information interactions");
  }

  return errors;
};

// Validate comment data
export const validateCommentData = (commentData) => {
  const errors = [];

  if (!commentData.courseContentId) {
    errors.push("Course content ID is required");
  }

  if (!commentData.appUserId) {
    errors.push("User ID is required");
  }

  if (!commentData.content?.trim()) {
    errors.push("Comment content is required");
  }

  if (commentData.content && commentData.content.length > 1000) {
    errors.push("Comment content must be less than 1000 characters");
  }

  return errors;
};

// Format content for display
export const formatContentForDisplay = (content) => {
  if (!content) return null;

  return {
    ...content,
    typeName: getContentTypeName(content.type),
    isFile: [2, 5, 6].includes(content.type),
    isText: content.type === 1,
    isUrl: content.type === 3,
    isPage: content.type === 0,
    isQuiz: content.type === 4,
    canHaveInteractions: content.type === 2, // Only videos can have interactions
    canHaveDiscussion: content.isDiscussionEnabled || false,
    canHaveMeeting: content.isMeetingAllowed || false,
  };
};

// Content type constants
export const CONTENT_TYPES = {
  PAGE: 0,
  TEXT_BOX: 1,
  VIDEO: 2,
  WEB_URL: 3,
  QUIZ: 4,
  OTHER_FILE: 5,
  AUDIO: 6
};

// Video interaction types
export const VIDEO_INTERACTION_TYPES = {
  QUESTION: 1,
  EVALUATION: 2,
  INFORMATION: 3
};

// Subtitle language constants
export const SUBTITLE_LANGUAGES = {
  ENGLISH: 1,
  TURKISH: 2,
  RUSSIAN: 3,
  AZERBAIJANI: 4
};

export default {
  // Content management
  addContent,
  updateContent,
  deleteContent,
  hideContent,
  getContentsBySection,
  getUploadStatus,
  getContentStream,
  getContentPaths,
  
  // Video interactions
  addVideoInteraction,
  getVideoInteractions,
  addUserVideoInteraction,
  getUserVideoInteractionViewed,
  
  // Subtitles
  addSubtitle,
  getSubtitles,
  
  // Comments & discussions
  addComment,
  getComments,
  getComment,
  editComment,
  deleteComment,
  voteComment,
  
  // Meeting requests
  getMeetingRequests,
  
  // Helper functions
  ticksToSeconds,
  getContentTypeName,
  getSupportedFileTypes,
  validateContentData,
  validateVideoInteractionData,
  validateCommentData,
  formatContentForDisplay,
  
  // Constants
  CONTENT_TYPES,
  VIDEO_INTERACTION_TYPES,
  SUBTITLE_LANGUAGES,
};