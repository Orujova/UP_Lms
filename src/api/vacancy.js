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

      // Use properly cased parameters - these should match the API expectation
      // Handle any case variations by accepting either format
      if (filters.Page || filters.page)
        queryParams.append("Page", filters.Page || filters.page);
      if (filters.Offset || filters.offset)
        queryParams.append("Offset", filters.Offset || filters.offset);
      if (filters.Search || filters.search)
        queryParams.append("Search", filters.Search || filters.search);
      if (filters.MinSalary || filters.minSalary)
        queryParams.append("MinSalary", filters.MinSalary || filters.minSalary);
      if (filters.MaxSalary || filters.maxSalary)
        queryParams.append("MaxSalary", filters.MaxSalary || filters.maxSalary);
      if (filters.DepartmentId || filters.departmentId)
        queryParams.append(
          "DepartmentId",
          filters.DepartmentId || filters.departmentId
        );
      if (filters.StartDate || filters.startDate)
        queryParams.append("StartDate", filters.StartDate || filters.startDate);
      if (filters.EndDate || filters.endDate)
        queryParams.append("EndDate", filters.EndDate || filters.endDate);
      if (filters.LineManagerId || filters.lineManagerId)
        queryParams.append(
          "LineManagerId",
          filters.LineManagerId || filters.lineManagerId
        );

      console.log("API Request Query Parameters:", queryParams.toString());

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

      const data = await response.json();
      console.log("API Response Data:", data);
      return data;
    } catch (error) {
      console.error("API Error:", error);
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

  // Get applications for a vacancy
  getVacancyApplications: async (vacancyId) => {
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
        throw new Error("Failed to fetch applications");
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  // Create new vacancy with improved error handling
  createVacancy: async (vacancyData) => {
    try {
      const token = getToken();

      // Prepare data according to API specification
      const payload = {
        userId: vacancyData.userId || 0, // Include userId as required by API
        title: vacancyData.title,
        departmentId: vacancyData.departmentId,
        lineManagerId: vacancyData.lineManagerId,
        jobDescription: vacancyData.jobDescription,
        jobResponsibilities: vacancyData.jobResponsibilities,
        jobRequirements: vacancyData.jobRequirements,
        minSalary: parseFloat(vacancyData.minSalary),
        maxSalary: parseFloat(vacancyData.maxSalary),
        lastSubmissionDate: vacancyData.lastSubmissionDate,
        targetGroupIds: vacancyData.targetGroupIds,
      };

      console.log("Create Vacancy Payload:", JSON.stringify(payload));

      const response = await fetch(`${API_URL}Vacancy`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      // Get response text first to inspect it
      const responseText = await response.text();
      console.log("Raw API Response:", responseText);

      // Check if response is ok
      if (!response.ok) {
        // Try to parse the error if it's valid JSON
        let errorMessage = "Failed to create vacancy";
        try {
          if (responseText) {
            const errorData = JSON.parse(responseText);
            errorMessage =
              errorData.detail || errorData.message || errorMessage;
          }
        } catch (parseError) {
          console.error("Error parsing API error response:", parseError);
          // Use status text if we can't parse the response
          errorMessage = `${response.status}: ${
            response.statusText || errorMessage
          }`;
        }

        throw new Error(errorMessage);
      }

      // Parse the response as JSON only if there's actual content
      if (responseText && responseText.trim()) {
        return JSON.parse(responseText);
      } else {
        // Return a default success object if the server returned no content
        return { success: true };
      }
    } catch (error) {
      console.error("Error creating vacancy:", error);
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
