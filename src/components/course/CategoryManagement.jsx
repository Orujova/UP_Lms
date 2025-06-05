import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  FolderOpen, 
  BookOpen,
  MoreVertical,
  X,
  Check,
  AlertCircle
} from "lucide-react";
import {
  fetchCourseCategoriesAsync,
  createCourseCategoryAsync,
  updateCourseCategoryAsync,
  deleteCourseCategoryAsync,
  courseCategoryActions
} from "@/redux/courseCategory/courseCategorySlice";
import { toast } from "sonner";

// Create/Edit Modal Component
const CategoryModal = ({ isOpen, onClose, category = null, onSave }) => {
  const [formData, setFormData] = useState({ name: "" });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({ name: category.name || "" });
    } else {
      setFormData({ name: "" });
    }
    setErrors({});
  }, [category, isOpen]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Category name is required";
    } else if (formData.name.length < 2) {
      newErrors.name = "Category name must be at least 2 characters";
    } else if (formData.name.length > 100) {
      newErrors.name = "Category name must be less than 100 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        ...(category && { id: category.id }),
        name: formData.name.trim(),
      });
      onClose();
      setFormData({ name: "" });
    } catch (error) {
      console.error("Error saving category:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {category ? "Edit Category" : "Create Category"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <div className="p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ name: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Enter category name"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0AAC9E] focus:border-[#0AAC9E] text-sm ${
                errors.name ? "border-red-300 bg-red-50" : "border-gray-300"
              }`}
              autoFocus
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {errors.name}
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 bg-[#0AAC9E] text-white rounded-lg hover:bg-[#0AAC9E]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{category ? "Updating..." : "Creating..."}</span>
                </div>
              ) : (
                category ? "Update Category" : "Create Category"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Delete Confirmation Modal
const DeleteModal = ({ isOpen, onClose, category, onConfirm }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error("Error deleting category:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="p-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Category</h3>
              <p className="text-sm text-gray-600">This action cannot be undone</p>
            </div>
          </div>

          <p className="text-sm text-gray-700 mb-6">
            Are you sure you want to delete the category "{category?.name}"? 
            All courses in this category will need to be reassigned.
          </p>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {isDeleting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Deleting...</span>
                </div>
              ) : (
                "Delete Category"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Course Category Management Component
const CourseCategoryManagement = () => {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const { 
    categories = [], 
    loading = false, 
    error = null,
    totalCategoryCount = 0
  } = useSelector((state) => state.courseCategory || {});

  useEffect(() => {
    dispatch(fetchCourseCategoriesAsync());
  }, [dispatch]);

  // Filter categories based on search term
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateCategory = async (categoryData) => {
    try {
      await dispatch(createCourseCategoryAsync(categoryData)).unwrap();
      toast.success("Category created successfully!");
    } catch (error) {
      toast.error("Failed to create category: " + error.message);
      throw error;
    }
  };

  const handleUpdateCategory = async (categoryData) => {
    try {
      await dispatch(updateCourseCategoryAsync(categoryData)).unwrap();
      toast.success("Category updated successfully!");
    } catch (error) {
      toast.error("Failed to update category: " + error.message);
      throw error;
    }
  };

  const handleDeleteCategory = async () => {
    try {
      await dispatch(deleteCourseCategoryAsync(selectedCategory.id)).unwrap();
      toast.success("Category deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete category: " + error.message);
      throw error;
    }
  };

  const openEditModal = (category) => {
    setSelectedCategory(category);
    setShowEditModal(true);
    setActiveDropdown(null);
  };

  const openDeleteModal = (category) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
    setActiveDropdown(null);
  };

  const toggleDropdown = (categoryId) => {
    setActiveDropdown(activeDropdown === categoryId ? null : categoryId);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Course Categories</h1>
            <p className="text-sm text-gray-600 mt-1">
              Organize your courses with categories ({totalCategoryCount} total)
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-[#0AAC9E] text-white rounded-lg hover:bg-[#0AAC9E]/90 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search categories..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0AAC9E] focus:border-[#0AAC9E] text-sm"
            />
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0AAC9E]"></div>
            <span className="ml-3 text-gray-600">Loading categories...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <FolderOpen className="w-12 h-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? "No categories found" : "No categories yet"}
            </h3>
            <p className="text-gray-500 text-center mb-6">
              {searchTerm 
                ? `No categories match "${searchTerm}"`
                : "Create your first category to organize your courses"
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-[#0AAC9E] text-white rounded-lg hover:bg-[#0AAC9E]/90 transition-colors text-sm"
              >
                Create First Category
              </button>
            )}
          </div>
        ) : (
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCategories.map((category) => (
                <div
                  key={category.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-[#0AAC9E]/30 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="w-10 h-10 bg-[#0AAC9E]/10 rounded-lg flex items-center justify-center">
                        <FolderOpen className="w-5 h-5 text-[#0AAC9E]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">
                          {category.name}
                        </h3>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="text-xs text-gray-500 flex items-center">
                            <BookOpen className="w-3 h-3 mr-1" />
                            {category.courseCount || 0} courses
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => toggleDropdown(category.id)}
                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>

                      {activeDropdown === category.id && (
                        <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                          <button
                            onClick={() => openEditModal(category)}
                            className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => openDeleteModal(category)}
                            className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Category Stats */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="text-xs text-gray-500">
                      Created: {new Date(category.createdDate || Date.now()).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <CategoryModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateCategory}
      />

      <CategoryModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedCategory(null);
        }}
        category={selectedCategory}
        onSave={handleUpdateCategory}
      />

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedCategory(null);
        }}
        category={selectedCategory}
        onConfirm={handleDeleteCategory}
      />

      {/* Click outside to close dropdown */}
      {activeDropdown && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setActiveDropdown(null)}
        />
      )}
    </div>
  );
};

export default CourseCategoryManagement;