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

// Add content to section
export const addContent = async (contentData) => {
  try {
    const formData = new FormData();
    formData.append("CourseSectionId", contentData.sectionId.toString());
    formData.append("HideContent", contentData.hideContent?.toString() || "false");
    formData.append("Type", contentData.type.toString());
    formData.append("IsDiscussionEnabled", contentData.isDiscussionEnabled?.toString() || "false");
    formData.append("IsMeetingAllowed", contentData.isMeetingAllowed?.toString() || "false");

    if (contentData.contentString) {
      formData.append("ContentString", contentData.contentString);
    }

    if (contentData.contentFile) {
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
    throw error;
  }
};

// Update content
export const updateContent = async (contentData) => {
  try {
    const formData = new FormData();
    formData.append("ContentId", contentData.contentId.toString());
    formData.append("CourseSectionId", contentData.sectionId.toString());
    formData.append("HideContent", contentData.hideContent?.toString() || "false");
    formData.append("IsDiscussionEnabled", contentData.isDiscussionEnabled?.toString() || "false");
    formData.append("IsMeetingAllowed", contentData.isMeetingAllowed?.toString() || "false");
    formData.append("Type", contentData.type.toString());

    if (contentData.contentString) {
      formData.append("ContentString", contentData.contentString);
    }

    if (contentData.contentFile) {
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
    throw error;
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
    throw error;
  }
};

// Hide content
export const hideContent = async (contentId) => {
  try {
    const response = await axios.post(
      `${API_URL}CourseContent/hide-content`,
      { contentId },
      { headers: getHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error("Error hiding content:", error);
    throw error;
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
    throw error;
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
    throw error;
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
    throw error;
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
    throw error;
  }
};

// Add video interaction
export const addVideoInteraction = async (interactionData) => {
  try {
    const response = await axios.post(
      `${API_URL}CourseContent/AddVideoInteraction`,
      interactionData,
      { headers: getHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding video interaction:", error);
    throw error;
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
    throw error;
  }
};

// Add user video interaction
export const addUserVideoInteraction = async (interactionData) => {
  try {
    const response = await axios.post(
      `${API_URL}CourseContent/user-video-interaction`,
      interactionData,
      { headers: getHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding user video interaction:", error);
    throw error;
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
    throw error;
  }
};

// Add subtitle to content
export const addSubtitle = async (subtitleData) => {
  try {
    const formData = new FormData();
    formData.append("CourseContentId", subtitleData.courseContentId.toString());
    formData.append("Language", subtitleData.language.toString());
    formData.append("Name", subtitleData.name);
    formData.append("SubtitleFile", subtitleData.subtitleFile);
    formData.append("UserId", subtitleData.userId.toString());

    const response = await axios.post(`${API_URL}CourseContent/content/subtitle`, formData, {
      headers: {
        ...getHeaders(),
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error adding subtitle:", error);
    throw error;
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
    throw error;
  }
};

// Add comment to content
export const addComment = async (commentData) => {
  try {
    const formData = new FormData();
    formData.append("CourseContentId", commentData.courseContentId.toString());
    formData.append("AppUserId", commentData.appUserId.toString());
    formData.append("Content", commentData.content);
    formData.append("SendNotification", commentData.sendNotification?.toString() || "false");

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
    throw error;
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
    throw error;
  }
};

// Get single comment
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
    throw error;
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
    throw error;
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
    throw error;
  }
};

// Vote on comment
export const voteComment = async (voteData) => {
  try {
    const response = await axios.post(`${API_URL}CourseContent/comment/vote`, voteData, {
      headers: getHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error voting comment:", error);
    throw error;
  }
};

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
    throw error;
  }
};