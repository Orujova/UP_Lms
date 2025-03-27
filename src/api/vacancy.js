// @/services/vacancyService.js
import { getToken } from "@/authtoken/auth.js";

const API_URL = "https://bravoadmin.uplms.org/api/";

export const vacancyService = {
  // Get all vacancies with optional filters
  getAllVacancies: async (filters = {}) => {
    try {
      const token = getToken();

      // Build query parameters
      const queryParams = new URLSearchParams();

      if (filters.page) queryParams.append("Page", filters.page);
      if (filters.offset) queryParams.append("Offset", filters.offset);
      if (filters.search) queryParams.append("Search", filters.search);
      if (filters.minSalary) queryParams.append("MinSalary", filters.minSalary);
      if (filters.maxSalary) queryParams.append("MaxSalary", filters.maxSalary);
      if (filters.departmentId)
        queryParams.append("DepartmentId", filters.departmentId);
      if (filters.startDate) queryParams.append("StartDate", filters.startDate);
      if (filters.endDate) queryParams.append("EndDate", filters.endDate);
      if (filters.lineManagerId)
        queryParams.append("LineManagerId", filters.lineManagerId);

      const response = await fetch(`${API_URL}Vacancy?${queryParams}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch vacancies");
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  // Get vacancy by ID
  getVacancyById: async (vacancyId) => {
    try {
      const token = getToken();

      const response = await fetch(
        `${API_URL}Vacancy/id?VacancyId=${vacancyId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch vacancy details");
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  // Create new vacancy
  createVacancy: async (vacancyData) => {
    try {
      const token = getToken();

      const response = await fetch(`${API_URL}Vacancy`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(vacancyData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create vacancy");
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  // Update vacancy
  updateVacancy: async (vacancyData) => {
    try {
      const token = getToken();

      const response = await fetch(`${API_URL}Vacancy`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(vacancyData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update vacancy");
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  // Get all departments
  getAllDepartments: async () => {
    try {
      const token = getToken();

      const response = await fetch(`${API_URL}Department`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch departments");
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  // Get all line managers (admin users)
  getAllLineManagers: async () => {
    try {
      const token = getToken();

      const response = await fetch(`${API_URL}AdminApplicationUser`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch line managers");
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  // Get all target groups
  getAllTargetGroups: async () => {
    try {
      const token = getToken();

      const response = await fetch(`${API_URL}TargetGroup/GetAllTargetGroups`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch target groups");
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },
};
