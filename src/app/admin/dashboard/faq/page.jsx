// components/faq/FAQAdminPage.jsx
"use client";

import { useState, useEffect } from "react";

import CategoryTab from "./categoryTab";
import QuestionTab from "./questionTab";
import CategoryModal from "./categoryModal";
import QuestionModal from "./questionModal";
import LoadingSpinner from "@/components/loadingSpinner";
import TabNavigation from "@/components/tabNavigation";
import faqService from "@/api/faq";
import DeleteConfirmationModal from "@/components/deleteModal";
import { toast } from "sonner";

export default function FAQAdminPage() {
  // States for FAQ categories and questions
  const [categories, setCategories] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMainTab, setActiveMainTab] = useState("categories"); // categories or questions

  // Pagination states
  const [categoryPagination, setCategoryPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
  });

  const [questionPagination, setQuestionPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
  });

  // Category states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState({
    id: 0,
    name: "",
    order: 0,
    isActive: true,
  });
  const [isEditingCategory, setIsEditingCategory] = useState(false);

  // Question states
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [questionFormData, setQuestionFormData] = useState({
    id: 0,
    questionText: "",
    answerText: "",
    order: 0,
    isActive: true,
    faqCategoryId: 0,
  });
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);

  // Delete confirmation modal states
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    itemType: "",
    itemId: null,
  });

  // Fetch data on component mount and when pagination changes
  useEffect(() => {
    fetchCategories();
  }, [categoryPagination.currentPage, categoryPagination.pageSize]);

  useEffect(() => {
    fetchQuestions();
  }, [questionPagination.currentPage, questionPagination.pageSize]);

  // Fetch all categories with pagination
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { categories: categoryData, totalCount } =
        await faqService.fetchCategories(
          categoryPagination.currentPage,
          categoryPagination.pageSize
        );

      setCategories(categoryData);
      setCategoryPagination((prev) => ({
        ...prev,
        totalItems: totalCount,
      }));
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  // Fetch all questions with pagination
  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const { questions: questionData, totalCount } =
        await faqService.fetchQuestions(
          questionPagination.currentPage,
          questionPagination.pageSize
        );

      setQuestions(questionData);
      setQuestionPagination((prev) => ({
        ...prev,
        totalItems: totalCount,
      }));
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast.error("Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  // Handle category page change
  const handleCategoryPageChange = (page) => {
    setCategoryPagination((prev) => ({
      ...prev,
      currentPage: page,
    }));
  };

  // Handle question page change
  const handleQuestionPageChange = (page) => {
    setQuestionPagination((prev) => ({
      ...prev,
      currentPage: page,
    }));
  };

  // CATEGORY OPERATIONS
  // Create new category
  const createCategory = async () => {
    try {
      await faqService.createCategory(categoryFormData);
      setShowCategoryModal(false);
      resetCategoryForm();

      // Reset to first page and refetch
      setCategoryPagination((prev) => ({
        ...prev,
        currentPage: 1,
      }));
      fetchCategories();
      toast.success("Category created successfully");
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error("Failed to create category");
    }
  };

  // Update category
  const updateCategory = async () => {
    try {
      await faqService.updateCategory(categoryFormData);
      setShowCategoryModal(false);
      resetCategoryForm();
      fetchCategories();
      toast.success("Category updated successfully");
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Failed to update category");
    }
  };

  // Show delete confirmation modal for category
  const handleDeleteCategoryConfirm = (id) => {
    setDeleteModal({
      isOpen: true,
      itemType: "category",
      itemId: id,
    });
  };

  // Delete category after confirmation
  const deleteCategory = async () => {
    try {
      await faqService.deleteCategory(deleteModal.itemId);

      // If after deleting, the current page would be empty, go back one page
      // (unless we're already on the first page)
      if (categories.length === 1 && categoryPagination.currentPage > 1) {
        setCategoryPagination((prev) => ({
          ...prev,
          currentPage: prev.currentPage - 1,
        }));
      }

      // Close the modal
      setDeleteModal({
        isOpen: false,
        itemType: "",
        itemId: null,
      });

      fetchCategories();
      fetchQuestions(); // Refresh questions as well since they might be affected

      toast.success("Category deleted successfully");
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
    }
  };

  // Edit category handler
  const handleEditCategory = (category) => {
    setCategoryFormData({
      id: category.id,
      name: category.name,
      order: category.order,
      isActive: category.isActive,
    });
    setIsEditingCategory(true);
    setShowCategoryModal(true);
  };

  // Reset category form
  const resetCategoryForm = () => {
    setCategoryFormData({
      id: 0,
      name: "",
      order: 0,
      isActive: true,
    });
    setIsEditingCategory(false);
  };

  // QUESTION OPERATIONS
  // Create new question
  const createQuestion = async () => {
    try {
      await faqService.createQuestion(questionFormData);
      setShowQuestionModal(false);
      resetQuestionForm();

      // Reset to first page and refetch
      setQuestionPagination((prev) => ({
        ...prev,
        currentPage: 1,
      }));
      fetchQuestions();
      toast.success("Question created successfully");
    } catch (error) {
      console.error("Error creating question:", error);
      toast.error("Failed to create question");
    }
  };

  // Update question
  const updateQuestion = async () => {
    try {
      await faqService.updateQuestion(questionFormData);
      setShowQuestionModal(false);
      resetQuestionForm();
      fetchQuestions();
      toast.success("Question updated successfully");
    } catch (error) {
      console.error("Error updating question:", error);
      toast.error("Failed to update question");
    }
  };

  // Show delete confirmation modal for question
  const handleDeleteQuestionConfirm = (id) => {
    setDeleteModal({
      isOpen: true,
      itemType: "question",
      itemId: id,
    });
  };

  // Delete question after confirmation
  const deleteQuestion = async () => {
    try {
      await faqService.deleteQuestion(deleteModal.itemId);

      // If after deleting, the current page would be empty, go back one page
      // (unless we're already on the first page)
      if (questions.length === 1 && questionPagination.currentPage > 1) {
        setQuestionPagination((prev) => ({
          ...prev,
          currentPage: prev.currentPage - 1,
        }));
      }

      // Close the modal
      setDeleteModal({
        isOpen: false,
        itemType: "",
        itemId: null,
      });

      fetchQuestions();

      toast.success("Question deleted successfully");
    } catch (error) {
      console.error("Error deleting question:", error);
      toast.error("Failed to delete question");
    }
  };

  // Handle closing delete modal
  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      itemType: "",
      itemId: null,
    });
  };

  // Handle delete confirmation based on item type
  const handleDeleteConfirm = () => {
    if (deleteModal.itemType === "category") {
      deleteCategory();
    } else if (deleteModal.itemType === "question") {
      deleteQuestion();
    }
  };

  // Edit question handler
  const handleEditQuestion = (question) => {
    setQuestionFormData({
      id: question.id,
      questionText: question.questionText,
      answerText: question.answerText,
      order: question.order,
      isActive: question.isActive,
      faqCategoryId: question.faqCategoryId,
    });
    setIsEditingQuestion(true);
    setShowQuestionModal(true);
  };

  // Reset question form
  const resetQuestionForm = () => {
    setQuestionFormData({
      id: 0,
      questionText: "",
      answerText: "",
      order: 0,
      isActive: true,
      faqCategoryId: categories.length > 0 ? categories[0].id : 0,
    });
    setIsEditingQuestion(false);
  };

  // Listen for tab changes to ensure data is refreshed
  useEffect(() => {
    if (activeMainTab === "categories") {
      fetchCategories();
    } else {
      fetchQuestions();
    }
  }, [activeMainTab]);

  if (loading && categories.length === 0 && questions.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pt-14">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          FAQ Management
        </h1>
        <p className="text-gray-600">
          Manage frequently asked questions and categories
        </p>
      </div>

      {/* Tabs */}
      <TabNavigation
        activeMainTab={activeMainTab}
        setActiveMainTab={setActiveMainTab}
        text1={"categories"}
        text2={"questions"}
        name1={"Categories"}
        name2={"Questions"}
      />

      {/* Categories Tab */}
      {activeMainTab === "categories" && (
        <CategoryTab
          categories={categories}
          handleEditCategory={handleEditCategory}
          deleteCategory={handleDeleteCategoryConfirm}
          resetCategoryForm={resetCategoryForm}
          setShowCategoryModal={setShowCategoryModal}
          pagination={categoryPagination}
          onPageChange={handleCategoryPageChange}
        />
      )}

      {/* Questions Tab */}
      {activeMainTab === "questions" && (
        <QuestionTab
          questions={questions}
          categories={categories}
          handleEditQuestion={handleEditQuestion}
          deleteQuestion={handleDeleteQuestionConfirm}
          resetQuestionForm={resetQuestionForm}
          setShowQuestionModal={setShowQuestionModal}
          pagination={questionPagination}
          onPageChange={handleQuestionPageChange}
        />
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <CategoryModal
          categoryFormData={categoryFormData}
          setCategoryFormData={setCategoryFormData}
          isEditingCategory={isEditingCategory}
          createCategory={createCategory}
          updateCategory={updateCategory}
          setShowCategoryModal={setShowCategoryModal}
        />
      )}

      {/* Question Modal */}
      {showQuestionModal && (
        <QuestionModal
          questionFormData={questionFormData}
          setQuestionFormData={setQuestionFormData}
          isEditingQuestion={isEditingQuestion}
          createQuestion={createQuestion}
          updateQuestion={updateQuestion}
          setShowQuestionModal={setShowQuestionModal}
          categories={categories}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        item={deleteModal.itemType}
      />
    </div>
  );
}
