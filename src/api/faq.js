// services/faqService.js
import { getToken } from "@/authtoken/auth.js";
import { toast } from "sonner";

const API_BASE_URL = "https://bravoadmin.uplms.org/api";

export const faqService = {
  // Categories with pagination
  fetchCategories: async (page = 1, pageSize = 10) => {
    try {
      const token = getToken();
      const response = await fetch(
        `${API_BASE_URL}/FAQCategory?Page=${page}&ShowMore.Take=${pageSize}`,
        {
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch FAQ categories");
      }

      const data = await response.json();
      return {
        categories: data[0]?.faqCategories || [],
        totalCount: data[0]?.totalFAQCategoryCount || 0,
      };
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
      throw error;
    }
  },

  // Other category operations remain the same
  createCategory: async (categoryData) => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/FAQCategory`, {
        method: "POST",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: categoryData.name,
          order: parseInt(categoryData.order),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create category");
      }

      toast.success("Category created successfully");
      return await response.json();
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error("Failed to create category");
      throw error;
    }
  },

  updateCategory: async (categoryData) => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/FAQCategory`, {
        method: "PUT",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: categoryData.id,
          name: categoryData.name,
          order: parseInt(categoryData.order),
          isActive: categoryData.isActive,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update category");
      }

      toast.success("Category updated successfully");
      return await response.json();
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Failed to update category");
      throw error;
    }
  },

  deleteCategory: async (id) => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/FAQCategory`, {
        method: "DELETE",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete category");
      }

      toast.success("Category deleted successfully");
      return true;
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
      throw error;
    }
  },

  // Questions with pagination
  fetchQuestions: async (page = 1, pageSize = 10) => {
    try {
      const token = getToken();
      const response = await fetch(
        `${API_BASE_URL}/FAQQuestion?Page=${page}&ShowMore.Take=${pageSize}`,
        {
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch FAQ questions");
      }

      const data = await response.json();
      return {
        questions: data[0]?.faqQuestions || [],
        totalCount: data[0]?.totalFAQQuestionCount || 0,
      };
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast.error("Failed to load questions");
      throw error;
    }
  },

  // Other question operations remain the same
  createQuestion: async (questionData) => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/FAQQuestion`, {
        method: "POST",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          questionText: questionData.questionText,
          answerText: questionData.answerText,
          order: parseInt(questionData.order),
          faqCategoryId: parseInt(questionData.faqCategoryId),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create question");
      }

      toast.success("Question created successfully");
      return await response.json();
    } catch (error) {
      console.error("Error creating question:", error);
      toast.error("Failed to create question");
      throw error;
    }
  },

  updateQuestion: async (questionData) => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/FAQQuestion`, {
        method: "PUT",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: questionData.id,
          questionText: questionData.questionText,
          answerText: questionData.answerText,
          order: parseInt(questionData.order),
          isActive: questionData.isActive,
          faqCategoryId: parseInt(questionData.faqCategoryId),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update question");
      }

      toast.success("Question updated successfully");
      return await response.json();
    } catch (error) {
      console.error("Error updating question:", error);
      toast.error("Failed to update question");
      throw error;
    }
  },

  deleteQuestion: async (id) => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/FAQQuestion`, {
        method: "DELETE",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete question");
      }

      toast.success("Question deleted successfully");
      return true;
    } catch (error) {
      console.error("Error deleting question:", error);
      toast.error("Failed to delete question");
      throw error;
    }
  },
};

export default faqService;
