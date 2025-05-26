import axios from "axios";
import { getToken } from "@/authtoken/auth.js";

const API_URL = "https://bravoadmin.uplms.org/api/";

export const fetchAdminApplicationUser = async (params = {}) => {
  try {
    // Get token
    const token = getToken();
    if (!token) {
      throw new Error("Token bulunamadı. Lütfen giriş yapın.");
    }

    // Handle when params is just a page number (for backward compatibility)
    if (typeof params === "number") {
      const response = await axios.get(
        `${API_URL}AdminApplicationUser?Page=${params}&ShowMore.Take=10`,
        {
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    }

    // Handle when params is an object with page and filters
    const { page = 1, ...filters } = params;

    // Build query string - always include pagination
    let queryParams = `Page=${page}&ShowMore.Take=10`;

    // Map filter names to PascalCase for API
    const parameterMap = {
      functionalAreaId: "FunctionalAreaId",
      departmentId: "DepartmentId",
      projectId: "ProjectId",
      divisionId: "DivisionId",
      subDivisionId: "SubDivisionId",
      positionGroupId: "PositionGroupId",
      positionId: "PositionId",
    };

    // Add filters to query params, using the proper API parameter names
    Object.entries(filters).forEach(([key, value]) => {
      if (value && key !== "page") {
        const apiParamName = parameterMap[key] || key;
        queryParams += `&${apiParamName}=${value}`;
      }
    });

    // Make the API call with the constructed query string
    const response = await axios.get(
      `${API_URL}AdminApplicationUser?${queryParams}`,
      {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching AdminApplicationUser:", error);
    throw error;
  }
};
