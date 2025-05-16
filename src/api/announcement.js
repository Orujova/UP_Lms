// src/api/announcement.js
import { getToken, getUserId } from "@/authtoken/auth.js";

// Create a new announcement
export const createAnnouncement = async (announcementData) => {
  const token = getToken();
  const userId = getUserId();

  // Ensure UserId is set properly in FormData
  if (userId && !announcementData.get("UserId")) {
    announcementData.append("UserId", userId);
  }

  // Debug log for troubleshooting
  console.log("Form data entries being sent to API:");
  for (let pair of announcementData.entries()) {
    console.log(pair[0] + ": " + pair[1]);
  }

  const response = await fetch(
    "https://bravoadmin.uplms.org/api/Announcement",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: announcementData, // FormData object with announcement details
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Failed to create announcement");
  }

  return response.json();
};

// Get all announcements with pagination and filters
export const fetchAnnouncements = async (params = {}) => {
  const token = getToken();

  // Build query string from params
  const queryParams = new URLSearchParams();

  if (params.Page) queryParams.append("Page", params.Page);
  if (params.ShowMore?.Take)
    queryParams.append("ShowMore.Take", params.ShowMore.Take);
  if (params.SearchInput) queryParams.append("SearchInput", params.SearchInput);

  // Add other filter params as needed
  if (params.StartDate) queryParams.append("StartDate", params.StartDate);
  if (params.EndDate) queryParams.append("EndDate", params.EndDate);
  if (params.OrderBy) queryParams.append("OrderBy", params.OrderBy);

  const url = `https://bravoadmin.uplms.org/api/Announcement?${queryParams.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch announcements");
  }

  return response.json();
};

// Get a single announcement by ID
export const getAnnouncementById = async (id) => {
  const token = getToken();
  const userId = getUserId() || 0; // Default to 0 if userId is not available

  // Add the userId query parameter as required by the API
  const url = `https://bravoadmin.uplms.org/api/Announcement/${id}?userid=${userId}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`API Error (${response.status}):`, errorText);
    throw new Error(`Failed to fetch announcement: ${response.statusText}`);
  }

  return response.json();
};

// Update an existing announcement
export const updateAnnouncement = async (announcementData) => {
  const token = getToken();
  const userId = getUserId();

  // Ensure UserId is set properly in FormData
  if (userId && !announcementData.get("UserId")) {
    announcementData.append("UserId", userId);
  }

  const response = await fetch(
    "https://bravoadmin.uplms.org/api/Announcement",
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: announcementData, // FormData object with announcement details including ID
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Failed to update announcement");
  }

  return response.json();
};

// Delete an announcement
export const deleteAnnouncement = async (id) => {
  const token = getToken();
  const userId = getUserId();

  const formData = new FormData();
  formData.append("Id", id);
  // Add UserId if needed for delete operation
  if (userId) {
    formData.append("UserId", userId);
  }

  const response = await fetch(
    "https://bravoadmin.uplms.org/api/Announcement",
    {
      method: "DELETE",
      headers: {
        accept: "*/*",
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete announcement");
  }

  return id;
};
