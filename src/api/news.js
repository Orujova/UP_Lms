// src/api/news.js - Expanded with additional API functions

import { getToken } from "@/authtoken/auth.js";

export const fetchNews = async (params = {}) => {
  const token = getToken();

  // Build query string from params
  const queryParams = new URLSearchParams();

  if (params.Page) queryParams.append("Page", params.Page);
  if (params.ShowMore?.Take)
    queryParams.append("ShowMore.Take", params.ShowMore.Take);
  if (params.SearchInput) queryParams.append("SearchInput", params.SearchInput);

  // Handle array of category IDs
  if (params.NewsCategoryIds && params.NewsCategoryIds.length > 0) {
    // Add each category ID as a separate query parameter with the name "NewsCategory"
    params.NewsCategoryIds.forEach((categoryId) => {
      queryParams.append("NewsCategory", categoryId);
    });
  }

  if (params.StartDate) queryParams.append("StartDate", params.StartDate);
  if (params.EndDate) queryParams.append("EndDate", params.EndDate);

  // OrderBy parameter handling
  if (params.OrderBy) {
    // The backend expects these exact values
    const validOrderValues = [
      "titleasc",
      "titledesc",
      "totalviewasc",
      "totalviewdesc",
      "viewasc",
      "viewdesc",
      "dateasc",
      "datedesc",
    ];
    if (validOrderValues.includes(params.OrderBy.toLowerCase())) {
      queryParams.append("OrderBy", params.OrderBy.toLowerCase());
    }
  }

  if (params.ViewRange) {
    if (params.ViewRange.Start !== null && params.ViewRange.Start !== undefined)
      queryParams.append("ViewRange.Start", params.ViewRange.Start);
    if (params.ViewRange.End !== null && params.ViewRange.End !== undefined)
      queryParams.append("ViewRange.End", params.ViewRange.End);
  }

  const url = `https://bravoadmin.uplms.org/api/News?${queryParams.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch news");
  }

  return response.json();
};

// Add a new news item
export const addNews = async (newsData) => {
  const token = getToken();

  const response = await fetch("https://bravoadmin.uplms.org/api/News", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: newsData, // FormData object with news details
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Failed to add news item");
  }

  return response.json();
};

// Get a single news item by ID
export const getNewsById = async (id) => {
  const token = getToken();

  const response = await fetch(`https://bravoadmin.uplms.org/api/News/${id}`, {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch news item");
  }

  return response.json();
};

// Update an existing news item
export const updateNews = async (newsData) => {
  const token = getToken();

  const response = await fetch("https://bravoadmin.uplms.org/api/News", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: newsData, // FormData object with news details including ID
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Failed to update news item");
  }

  return response.json();
};

// Delete a news item
export const deleteNews = async (id) => {
  const token = getToken();

  const formData = new FormData();
  formData.append("Id", id);

  const response = await fetch("https://bravoadmin.uplms.org/api/News", {
    method: "DELETE",
    headers: {
      accept: "*/*",
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to delete news item");
  }

  return id; // Return the ID for Redux state updates
};

// Export a CSV/Excel of news items
export const exportNews = async (params = {}) => {
  const token = getToken();

  // Build query string from params (similar to fetchNews)
  const queryParams = new URLSearchParams();

  if (params.SearchInput) queryParams.append("SearchInput", params.SearchInput);
  if (params.NewsCategoryIds && params.NewsCategoryIds.length > 0) {
    params.NewsCategoryIds.forEach((categoryId) => {
      queryParams.append("NewsCategory", categoryId);
    });
  }
  if (params.StartDate) queryParams.append("StartDate", params.StartDate);
  if (params.EndDate) queryParams.append("EndDate", params.EndDate);
  if (params.OrderBy)
    queryParams.append("OrderBy", params.OrderBy.toLowerCase());

  const url = `https://bravoadmin.uplms.org/api/News/export?${queryParams.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to export news data");
  }

  return response.blob();
};

// Fetch news categories
export const fetchNewsCategories = async () => {
  const token = getToken();

  const response = await fetch(
    "https://bravoadmin.uplms.org/api/NewsCategory",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch news categories");
  }

  return response.json();
};
