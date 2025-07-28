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

// Add content to section (FIXED ENUM VALUES)
export const addContent = async (contentData) => {
  try {
    const formData = new FormData();
    formData.append("CourseSectionId", contentData.sectionId.toString());
    formData.append("HideContent", (contentData.hideContent || false).toString());
    formData.append("Type", contentData.type.toString()); // Use CONTENT_TYPES enum
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

// Update content (FIXED ENUM VALUES)
export const updateContent = async (contentData) => {
  try {
    const formData = new FormData();
    formData.append("ContentId", contentData.contentId.toString());
    formData.append("CourseSectionId", contentData.sectionId.toString());
    formData.append("HideContent", (contentData.hideContent || false).toString());
    formData.append("IsDiscussionEnabled", (contentData.isDiscussionEnabled || false).toString());
    formData.append("IsMeetingAllowed", (contentData.isMeetingAllowed || false).toString());
    formData.append("Type", contentData.type.toString()); // Use CONTENT_TYPES enum

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

// Get content by ID  
export const getContentById = async (contentId) => {
  try {
    const response = await axios.get(`${API_URL}CourseContent/content/${contentId}`, {
      headers: getHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching content:", error);
    throw new Error("Failed to fetch content: " + (error.response?.data?.detail || error.message));
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

// ======================== VIDEO OPERATIONS ========================

// Add video content (FIXED - Video type is 4 not 2)
export const addVideoContent = async (videoData) => {
  try {
    const formData = new FormData();
    formData.append("CourseSectionId", videoData.sectionId.toString());
    formData.append("Type", CONTENT_TYPES.VIDEO.toString()); // Video type = 4
    formData.append("HideContent", (videoData.hideContent || false).toString());
    formData.append("IsDiscussionEnabled", (videoData.isDiscussionEnabled || false).toString());
    formData.append("IsMeetingAllowed", (videoData.isMeetingAllowed || false).toString());

    if (videoData.description) {
      formData.append("Description", videoData.description);
    }

    if (videoData.contentFile && videoData.contentFile instanceof File) {
      formData.append("ContentFile", videoData.contentFile);
    }

    const response = await axios.post(`${API_URL}CourseContent/AddContent`, formData, {
      headers: {
        ...getHeaders(),
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error adding video content:", error);
    throw new Error("Failed to add video content: " + (error.response?.data?.detail || error.message));
  }
};

// Update video content (FIXED - Video type is 4 not 2)
export const updateVideoContent = async (videoData) => {
  try {
    const formData = new FormData();
    formData.append("ContentId", videoData.contentId.toString());
    formData.append("CourseSectionId", videoData.sectionId.toString());
    formData.append("Type", CONTENT_TYPES.VIDEO.toString()); // Video type = 4
    formData.append("HideContent", (videoData.hideContent || false).toString());
    formData.append("IsDiscussionEnabled", (videoData.isDiscussionEnabled || false).toString());
    formData.append("IsMeetingAllowed", (videoData.isMeetingAllowed || false).toString());

    if (videoData.description) {
      formData.append("Description", videoData.description);
    }

    if (videoData.contentFile && videoData.contentFile instanceof File) {
      formData.append("ContentFile", videoData.contentFile);
    }

    const response = await axios.put(`${API_URL}CourseContent/update-content`, formData, {
      headers: {
        ...getHeaders(),
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating video content:", error);
    throw new Error("Failed to update video content: " + (error.response?.data?.detail || error.message));
  }
};

// Get video by ID
export const getVideoById = async (videoId) => {
  try {
    const response = await axios.get(`${API_URL}CourseContent/content/${videoId}`, {
      headers: getHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching video:", error);
    throw new Error("Failed to fetch video: " + (error.response?.data?.detail || error.message));
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

// Update video interaction
export const updateVideoInteraction = async (interactionData) => {
  try {
    const payload = {
      videoInteractionId: interactionData.videoInteractionId,
      courseContentId: interactionData.courseContentId,
      interactionType: interactionData.interactionType,
      startTimeInVideo: {
        ticks: parseDurationToTicks(interactionData.startTimeInVideo || 0)
      },
      title: interactionData.title,
      questionDetails: interactionData.questionDetails || null,
      evaluationDetails: interactionData.evaluationDetails || null,
      informationDetails: interactionData.informationDetails || null,
    };

    const response = await axios.put(
      `${API_URL}CourseContent/UpdateVideoInteraction`,
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
    console.error("Error updating video interaction:", error);
    throw new Error("Failed to update video interaction: " + (error.response?.data?.detail || error.message));
  }
};

// Delete video interaction
export const deleteVideoInteraction = async (videoInteractionId) => {
  try {
    const response = await axios.delete(`${API_URL}CourseContent/DeleteVideoInteraction`, {
      params: { videoInteractionId },
      headers: getHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting video interaction:", error);
    throw new Error("Failed to delete video interaction: " + (error.response?.data?.detail || error.message));
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

// Add subtitle to content (FIXED LANGUAGE ENUM)
export const addSubtitle = async (subtitleData) => {
  try {
    const formData = new FormData();
    formData.append("CourseContentId", subtitleData.courseContentId.toString());
    formData.append("Language", subtitleData.language.toString()); // Use SUBTITLE_LANGUAGES enum
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

// Update subtitle (FIXED LANGUAGE ENUM)
export const updateSubtitle = async (subtitleData) => {
  try {
    const formData = new FormData();
    formData.append("SubtitleId", subtitleData.subtitleId.toString());
    formData.append("CourseContentId", subtitleData.courseContentId.toString());
    formData.append("Language", subtitleData.language.toString()); // Use SUBTITLE_LANGUAGES enum
    formData.append("Name", subtitleData.name);
    formData.append("UserId", subtitleData.userId.toString());

    if (subtitleData.subtitleFile && subtitleData.subtitleFile instanceof File) {
      formData.append("SubtitleFile", subtitleData.subtitleFile);
    }

    const response = await axios.put(`${API_URL}CourseContent/content/subtitle`, formData, {
      headers: {
        ...getHeaders(),
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating subtitle:", error);
    throw new Error("Failed to update subtitle: " + (error.response?.data?.detail || error.message));
  }
};

// Delete subtitle
export const deleteSubtitle = async (subtitleId) => {
  try {
    const response = await axios.delete(`${API_URL}CourseContent/content/subtitle`, {
      params: { subtitleId },
      headers: getHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting subtitle:", error);
    throw new Error("Failed to delete subtitle: " + (error.response?.data?.detail || error.message));
  }
};

// Get subtitles by video ID
export const getSubtitlesByVideoId = async (courseContentId) => {
  try {
    const response = await axios.get(`${API_URL}CourseContent/content/subtitles`, {
      params: { courseContentId },
      headers: getHeaders(),
    });
    return response.data.subtitles || [];
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

// Update comment
export const updateComment = async (commentData) => {
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
    console.error("Error updating comment:", error);
    throw new Error("Failed to update comment: " + (error.response?.data?.detail || error.message));
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

// Get comments by content ID (FIXED ORDER BY)
export const getCommentsByContentId = async (courseContentId, params = {}) => {
  try {
    const queryParams = {
      courseContentId,
      page: params.page || 1,
      ...(params.take && { take: params.take }),
      ...(params.search && { search: params.search }),
    };

    // FIXED: Add proper orderBy parameter based on API documentation
    if (params.orderBy) {
      const orderByMap = {
        'dateasc': 'dateasc',
        'datedesc': 'datedesc', 
        'voteasc': 'voteasc',
        'votedesc': 'votedesc'
      };
      queryParams.orderBy = orderByMap[params.orderBy.toLowerCase()] || 'votedesc';
    }

    const response = await axios.get(`${API_URL}CourseContent/content/comments`, {
      params: queryParams,
      headers: getHeaders(),
    });
    return response.data[0]?.comments || [];
  } catch (error) {
    console.error("Error fetching comments:", error);
    throw new Error("Failed to fetch comments: " + (error.response?.data?.detail || error.message));
  }
};

// Add comment reply
export const addCommentReply = async (replyData) => {
  try {
    const formData = new FormData();
    formData.append("CourseContentId", replyData.courseContentId.toString());
    formData.append("AppUserId", replyData.appUserId.toString());
    formData.append("Content", replyData.content);
    formData.append("ParentCommentId", replyData.parentCommentId.toString());
    formData.append("SendNotification", (replyData.sendNotification || false).toString());

    if (replyData.audioFile) {
      formData.append("AudioFile", replyData.audioFile);
    }

    const response = await axios.post(`${API_URL}CourseContent/content/comment`, formData, {
      headers: {
        ...getHeaders(),
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error adding comment reply:", error);
    throw new Error("Failed to add comment reply: " + (error.response?.data?.detail || error.message));
  }
};

// Update comment reply
export const updateCommentReply = async (replyData) => {
  return await updateComment(replyData);
};

// Delete comment reply
export const deleteCommentReply = async (replyId, userId) => {
  return await deleteComment(replyId, userId);
};

// Get single comment with replies (FIXED ORDER BY)
export const getComment = async (commentId, params = {}) => {
  try {
    const queryParams = {
      commentId,
      page: params.page || 1,
      ...(params.take && { take: params.take }),
    };

    // FIXED: Add proper orderBy parameter
    if (params.orderBy) {
      const orderByMap = {
        'dateasc': 'dateasc',
        'datedesc': 'datedesc',
        'voteasc': 'voteasc', 
        'votedesc': 'votedesc'
      };
      queryParams.orderBy = orderByMap[params.orderBy.toLowerCase()] || 'datedesc';
    }

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

// Add meeting request
export const addMeetingRequest = async (meetingData) => {
  try {
    const payload = {
      courseContentId: meetingData.courseContentId,
      userId: meetingData.userId,
      title: meetingData.title,
      description: meetingData.description,
      requestedDateTime: meetingData.requestedDateTime,
      duration: meetingData.duration || 60,
      meetingType: meetingData.meetingType || 'video',
      urgency: meetingData.urgency || 'normal',
    };

    const response = await axios.post(`${API_URL}CourseContent/content/meeting-request`, payload, {
      headers: {
        ...getHeaders(),
        "Content-Type": "application/json",
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error adding meeting request:", error);
    throw new Error("Failed to add meeting request: " + (error.response?.data?.detail || error.message));
  }
};

// Update meeting request
export const updateMeetingRequest = async (meetingData) => {
  try {
    const payload = {
      meetingRequestId: meetingData.meetingRequestId,
      courseContentId: meetingData.courseContentId,
      userId: meetingData.userId,
      title: meetingData.title,
      description: meetingData.description,
      requestedDateTime: meetingData.requestedDateTime,
      duration: meetingData.duration,
      meetingType: meetingData.meetingType,
      urgency: meetingData.urgency,
    };

    const response = await axios.put(`${API_URL}CourseContent/content/meeting-request`, payload, {
      headers: {
        ...getHeaders(),
        "Content-Type": "application/json",
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error updating meeting request:", error);
    throw new Error("Failed to update meeting request: " + (error.response?.data?.detail || error.message));
  }
};

// Delete meeting request
export const deleteMeetingRequest = async (meetingRequestId) => {
  try {
    const response = await axios.delete(`${API_URL}CourseContent/content/meeting-request`, {
      params: { meetingRequestId },
      headers: getHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting meeting request:", error);
    throw new Error("Failed to delete meeting request: " + (error.response?.data?.detail || error.message));
  }
};

// Get meeting requests by content ID (FIXED ORDER BY)
export const getMeetingsByContentId = async (courseContentId, userId, params = {}) => {
  try {
    const queryParams = {
      courseContentId,
      userId,
      page: params.page || 1,
      ...(params.take && { take: params.take }),
    };

    // FIXED: Add proper orderBy parameter based on API documentation
    if (params.orderBy) {
      const orderByMap = {
        'dateasc': 'dateasc',
        'datedesc': 'datedesc',
        'statusasc': 'statusasc',
        'statusdesc': 'statusdesc'
      };
      queryParams.orderBy = orderByMap[params.orderBy.toLowerCase()] || 'datedesc';
    }

    const response = await axios.get(`${API_URL}CourseContent/content/meeting-requests`, {
      params: queryParams,
      headers: getHeaders(),
    });
    return response.data[0]?.meetingRequests || [];
  } catch (error) {
    console.error("Error fetching meeting requests:", error);
    throw new Error("Failed to fetch meeting requests: " + (error.response?.data?.detail || error.message));
  }
};

// ======================== FILE OPERATIONS ========================

// Upload file
export const uploadFile = async (file, contentId, onProgress) => {
  try {
    const formData = new FormData();
    formData.append("ContentFile", file);
    if (contentId) {
      formData.append("ContentId", contentId.toString());
    }

    const response = await axios.post(`${API_URL}CourseContent/upload-file`, formData, {
      headers: {
        ...getHeaders(),
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw new Error("Failed to upload file: " + (error.response?.data?.detail || error.message));
  }
};

// Get file info
export const getFileInfo = async (fileId) => {
  try {
    const response = await axios.get(`${API_URL}CourseContent/file-info`, {
      params: { fileId },
      headers: getHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error getting file info:", error);
    throw new Error("Failed to get file info: " + (error.response?.data?.detail || error.message));
  }
};

// Delete file
export const deleteFile = async (fileId) => {
  try {
    const response = await axios.delete(`${API_URL}CourseContent/delete-file`, {
      params: { fileId },
      headers: getHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting file:", error);
    throw new Error("Failed to delete file: " + (error.response?.data?.detail || error.message));
  }
};

// Stream video
export const streamVideo = async (contentId, file) => {
  try {
    const response = await axios.get(`${API_URL}CourseContent/stream`, {
      params: { contentId, file },
      headers: getHeaders(),
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    console.error("Error streaming video:", error);
    throw new Error("Failed to stream video: " + (error.response?.data?.detail || error.message));
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

// Format duration for display
export const formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds)) return "00:00";
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Calculate content progress
export const calculateContentProgress = (analytics) => {
  const { viewCount = 0, completionRate = 0, timeSpent = 0, interactions = 0 } = analytics;
  
  // Simple progress calculation based on multiple factors
  let progress = 0;
  
  if (viewCount > 0) progress += 25;
  if (completionRate > 50) progress += 25;
  if (timeSpent > 60) progress += 25; // More than 1 minute
  if (interactions > 0) progress += 25;
  
  return Math.min(progress, 100);
};

// Get content type name (FIXED ENUM VALUES)
export const getContentTypeName = (type) => {
  const typeMap = {
    [CONTENT_TYPES.PAGE]: "Page",
    [CONTENT_TYPES.TEXT_BOX]: "TextBox", 
    [CONTENT_TYPES.QUIZ]: "Quiz",
    [CONTENT_TYPES.WEB_URL]: "WebURL",
    [CONTENT_TYPES.VIDEO]: "Video",
    [CONTENT_TYPES.OTHER_FILE]: "OtherFile",
    [CONTENT_TYPES.PPTX]: "PPTX"
  };
  return typeMap[type] || "Unknown";
};

// Generate content preview
export const generateContentPreview = (content) => {
  if (!content) return "";
  
  switch (content.type) {
    case CONTENT_TYPES.TEXT_BOX:
      return content.contentString?.substring(0, 100) + (content.contentString?.length > 100 ? "..." : "");
    case CONTENT_TYPES.PAGE:
      try {
        const pageData = JSON.parse(content.data);
        return pageData.description || pageData.title || "Page content";
      } catch {
        return "Page content";
      }
    case CONTENT_TYPES.VIDEO:
      return "Video content";
    case CONTENT_TYPES.WEB_URL:
      return content.contentString || "Web link";
    case CONTENT_TYPES.OTHER_FILE:
      return "File attachment";
    case CONTENT_TYPES.PPTX:
      return "PowerPoint presentation";
    case CONTENT_TYPES.QUIZ:
      return "Quiz content";
    default:
      return "Content";
  }
};

// Sort contents
export const sortContents = (contents, orderBy = 'orderNumber', direction = 'asc') => {
  if (!Array.isArray(contents)) return [];
  
  return [...contents].sort((a, b) => {
    let aValue = a[orderBy];
    let bValue = b[orderBy];
    
    // Handle different data types
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue?.toLowerCase() || '';
    }
    
    if (direction === 'desc') {
      return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
    }
    
    return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
  });
};

// Filter contents
export const filterContents = (contents, filters) => {
  if (!Array.isArray(contents)) return [];
  
  return contents.filter(content => {
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const searchableText = [
        content.title,
        content.description,
        getContentTypeName(content.type),
        generateContentPreview(content)
      ].join(' ').toLowerCase();
      
      if (!searchableText.includes(searchTerm)) {
        return false;
      }
    }
    
    // Content type filter
    if (filters.contentType && content.type !== parseInt(filters.contentType)) {
      return false;
    }
    
    // Section filter
    if (filters.sectionId && content.sectionId !== parseInt(filters.sectionId)) {
      return false;
    }
    
    // Mandatory filter
    if (filters.hasMandatory !== null && content.isMandatory !== filters.hasMandatory) {
      return false;
    }
    
    // Quiz filter
    if (filters.hasQuiz !== null) {
      const hasQuiz = content.type === CONTENT_TYPES.QUIZ;
      if (hasQuiz !== filters.hasQuiz) {
        return false;
      }
    }
    
    return true;
  });
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

  if (contentData.type === CONTENT_TYPES.TEXT_BOX && !contentData.contentString) {
    errors.push("Text content is required for TextBox type");
  }

  if (contentData.type === CONTENT_TYPES.WEB_URL && !contentData.contentString) {
    errors.push("URL is required for WebURL type");
  }

  if ([CONTENT_TYPES.VIDEO, CONTENT_TYPES.OTHER_FILE, CONTENT_TYPES.PPTX].includes(contentData.type) && !contentData.contentFile) {
    errors.push("File is required for this content type");
  }

  return errors;
};

// Validate video data
export const validateVideoData = (videoData) => {
  const errors = [];

  if (!videoData.sectionId) {
    errors.push("Section ID is required");
  }

  if (!videoData.contentFile && !videoData.contentId) {
    errors.push("Video file is required");
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

// Validate subtitle data
export const validateSubtitleData = (subtitleData) => {
  const errors = [];

  if (!subtitleData.courseContentId) {
    errors.push("Course content ID is required");
  }

  if (!subtitleData.language) {
    errors.push("Subtitle language is required");
  }

  if (!subtitleData.name?.trim()) {
    errors.push("Subtitle name is required");
  }

  if (!subtitleData.subtitleFile && !subtitleData.subtitleId) {
    errors.push("Subtitle file is required");
  }

  if (!subtitleData.userId) {
    errors.push("User ID is required");
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

// Validate meeting data
export const validateMeetingData = (meetingData) => {
  const errors = [];

  if (!meetingData.courseContentId) {
    errors.push("Course content ID is required");
  }

  if (!meetingData.userId) {
    errors.push("User ID is required");
  }

  if (!meetingData.title?.trim()) {
    errors.push("Meeting title is required");
  }

  if (!meetingData.requestedDateTime) {
    errors.push("Meeting date and time is required");
  }

  if (meetingData.duration && (meetingData.duration < 15 || meetingData.duration > 480)) {
    errors.push("Meeting duration must be between 15 and 480 minutes");
  }

  return errors;
};

// Format content for display
export const formatContentForDisplay = (content) => {
  if (!content) return null;

  return {
    ...content,
    typeName: getContentTypeName(content.type),
    isFile: [CONTENT_TYPES.VIDEO, CONTENT_TYPES.OTHER_FILE, CONTENT_TYPES.PPTX].includes(content.type),
    isText: content.type === CONTENT_TYPES.TEXT_BOX,
    isUrl: content.type === CONTENT_TYPES.WEB_URL,
    isPage: content.type === CONTENT_TYPES.PAGE,
    isQuiz: content.type === CONTENT_TYPES.QUIZ,
    canHaveInteractions: content.type === CONTENT_TYPES.VIDEO, // Only videos can have interactions
    canHaveDiscussion: content.isDiscussionEnabled || false,
    canHaveMeeting: content.isMeetingAllowed || false,
    preview: generateContentPreview(content),
  };
};

// Format video for display
export const formatVideoForDisplay = (video) => {
  if (!video) return null;

  return {
    ...formatContentForDisplay(video),
    duration: formatDuration(video.videoDuration || 0),
    quality: VIDEO_QUALITIES[video.videoQuality] || VIDEO_QUALITIES.HD,
    hasSubtitles: video.enableSubtitles || false,
    hasInteractions: video.enableInteractions || false,
  };
};

// Get language name from enum
export const getLanguageName = (languageCode) => {
  const languageMap = {
    [SUBTITLE_LANGUAGES.ENGLISH]: "English",
    [SUBTITLE_LANGUAGES.AZERBAIJANI]: "Azerbaijani", 
    [SUBTITLE_LANGUAGES.TURKISH]: "Turkish",
    [SUBTITLE_LANGUAGES.RUSSIAN]: "Russian"
  };
  return languageMap[languageCode] || "Unknown";
};

// ======================== CONSTANTS (FIXED ENUM VALUES) ========================

// Content type constants - FIXED based on API documentation
export const CONTENT_TYPES = {
  PAGE: 0,
  TEXT_BOX: 1,
  QUIZ: 2,
  WEB_URL: 3,
  VIDEO: 4,
  OTHER_FILE: 5,
  PPTX: 6
};

// Video quality constants
export const VIDEO_QUALITIES = {
  LOW: 'low',
  SD: 'sd',
  HD: 'hd',
  FULL_HD: 'fullhd',
  ULTRA_HD: '4k'
};

// Video interaction types
export const INTERACTION_TYPES = {
  QUESTION: 1,
  EVALUATION: 2,
  INFORMATION: 3
};

// Subtitle language constants - FIXED based on API documentation
export const SUBTITLE_LANGUAGES = {
  ENGLISH: 1,
  AZERBAIJANI: 2,
  TURKISH: 3,
  RUSSIAN: 4
};

// Order by options for comments
export const COMMENT_ORDER_OPTIONS = {
  DATE_ASC: 'dateasc',
  DATE_DESC: 'datedesc',
  VOTE_ASC: 'voteasc',
  VOTE_DESC: 'votedesc'
};

// Order by options for meeting requests  
export const MEETING_ORDER_OPTIONS = {
  DATE_ASC: 'dateasc',
  DATE_DESC: 'datedesc',
  STATUS_ASC: 'statusasc',
  STATUS_DESC: 'statusdesc'
};

export default {
  // Content management
  addContent,
  updateContent,
  deleteContent,
  hideContent,
  getContentsBySection,
  getContentById,
  getUploadStatus,
  getContentStream,
  getContentPaths,
  
  // Video operations
  addVideoContent,
  updateVideoContent,
  getVideoById,
  
  // Video interactions
  addVideoInteraction,
  updateVideoInteraction,
  deleteVideoInteraction,
  getVideoInteractions,
  addUserVideoInteraction,
  getUserVideoInteractionViewed,
  
  // Subtitles
  addSubtitle,
  updateSubtitle,
  deleteSubtitle,
  getSubtitlesByVideoId,
  
  // Comments & discussions
  addComment,
  updateComment,
  deleteComment,
  getCommentsByContentId,
  addCommentReply,
  updateCommentReply,
  deleteCommentReply,
  getComment,
  voteComment,
  
  // Meeting requests
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
  ticksToSeconds,
  formatDuration,
  calculateContentProgress,
  getContentTypeName,
  getLanguageName,
  generateContentPreview,
  sortContents,
  filterContents,
  getSupportedFileTypes,
  validateContentData,
  validateVideoData,
  validateVideoInteractionData,
  validateSubtitleData,
  validateCommentData,
  validateMeetingData,
  formatContentForDisplay,
  formatVideoForDisplay,
  
  // Constants
  CONTENT_TYPES,
  VIDEO_QUALITIES,
  INTERACTION_TYPES,
  SUBTITLE_LANGUAGES,
  COMMENT_ORDER_OPTIONS,
  MEETING_ORDER_OPTIONS,
};