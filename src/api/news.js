// import axios from 'axios';
// import { getToken } from '@/authtoken/auth.js';

// const API_URL = 'https://bravoadmin.uplms.org/api/';

// export const fetchNews = async () => {
//     try {
//         const token = getToken(); // Tokeni auth.js dosyasından alın
//         if (!token) {
//             throw new Error('Token bulunamadı. Lütfen giriş yapınız.');
//         }

//         const response = await axios.get(`${API_URL}News`, {
//             headers: {
//                 'accept': 'application/json',
//                 'Authorization': `Bearer ${token}` // Dinamik olarak alınan token kullanılır
//             }
//         });
//         return response.data;
//     } catch (error) {
//         console.error('Error fetching news:', error);
//         throw error;
//     }
// };

import { getToken } from "@/authtoken/auth.js";

export const fetchNews = async (params = {}) => {
  const token = getToken();

  // Build query string from params
  const queryParams = new URLSearchParams();

  if (params.Page) queryParams.append("Page", params.Page);
  if (params.ShowMore?.Take)
    queryParams.append("ShowMore.Take", params.ShowMore.Take);
  if (params.SearchInput) queryParams.append("SearchInput", params.SearchInput);
  if (params.NewsCategoryName)
    queryParams.append("NewsCategoryName", params.NewsCategoryName);
  if (params.StartDate) queryParams.append("StartDate", params.StartDate);
  if (params.EndDate) queryParams.append("EndDate", params.EndDate);
  if (params.OrderBy) queryParams.append("OrderBy", params.OrderBy);

  if (params.ViewRange) {
    if (params.ViewRange.Start)
      queryParams.append("ViewRange.Start", params.ViewRange.Start);
    if (params.ViewRange.End)
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
