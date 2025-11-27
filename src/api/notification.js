// api.js
import { getToken } from "@/authtoken/auth.js";

const API_BASE_URL = "https://demoadmin.databyte.app/api";

const fetchApi = async (endpoint, options = {}) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
};

export const fetchUserData = async (userId) => {
  return fetchApi(`AdminApplicationUser/${userId}`);
};

export const fetchNotifications = async (userId) => {
  return fetchApi(`Notification/?UserId=${userId}`);
};

export const updateNotificationReadStatus = async (notificationId, isRead) => {
  return fetchApi("Notification/updateReadStatus", {
    method: "PUT",
    body: JSON.stringify({ notificationId, isRead }),
  });
};
