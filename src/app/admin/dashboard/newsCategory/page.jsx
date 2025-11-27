"use client";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { Filter, Edit2, Trash2, Plus, Search, FileText } from "lucide-react";
import {
  newsCategoryAsync,
  addNewsCategoryAsync,
  updateNewsCategoryAsync,
  deleteNewsCategoryAsync,
  setLoading,
  clearError,
} from "@/redux/newsCategory/newsCategory";
import { toast } from "sonner";

import LoadingSpinner from "@/components/loadingSpinner";
import DeleteConfirmationModal from "@/components/deleteModal";

const NewsCategoryAdmin = () => {
  const dispatch = useDispatch();
  const {
    data: categories,
    loading,
    error,
  } = useSelector((state) => state.newsCategory);

  // Sorted categories with newest first
  // Sort by ID in descending order (assuming higher IDs are newer)
  const sortedCategories = categories
    ? [...categories].sort((a, b) => b.id - a.id)
    : [];

  // Form state
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [categoryName, setCategoryName] = useState("");

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });

  // Fetch categories on component mount
  useEffect(() => {
    dispatch(newsCategoryAsync());
  }, [dispatch]);

  // Handle toast notifications for errors
  useEffect(() => {
    if (error) {
      toast.error(error || "An error occurred");
    }
  }, [error]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!categoryName.trim()) {
      return;
    }

    try {
      dispatch(setLoading(true));

      if (isEditing) {
        await dispatch(
          updateNewsCategoryAsync({ id: editId, categoryName })
        ).unwrap();
        toast.success("Category updated successfully!");
        resetForm();
      } else {
        await dispatch(addNewsCategoryAsync(categoryName)).unwrap();
        toast.success("Category added successfully!");
        resetForm();
      }
    } catch (err) {
      toast.error(err.message || "An error occurred");
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Handle edit button click
  const handleEditClick = (category) => {
    setIsEditing(true);
    setEditId(category.id);
    setCategoryName(category.categoryName);
  };

  // Open delete modal
  const openDeleteModal = (id) => {
    setDeleteModal({ isOpen: true, id });
  };

  // Close delete modal
  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, id: null });
  };

  // Confirm delete
  const confirmDelete = async () => {
    try {
      dispatch(setLoading(true));
      // FIX: Pass an object with id property instead of just the id
      await dispatch(deleteNewsCategoryAsync({ id: deleteModal.id })).unwrap();
      toast.success("Category deleted successfully!");
      closeDeleteModal();
    } catch (err) {
      toast.error(err.message || "Error deleting category");
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Reset form
  const resetForm = () => {
    setCategoryName("");
    setIsEditing(false);
    setEditId(null);
  };

  if (loading && !categories) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pt-14">
      <div className="mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="space-y-1">
            <h1 className="text-lg font-bold text-gray-900">
              News Categories Management
            </h1>
            <p className="text-[0.65rem] text-gray-400 font-normal">
              {categories && categories.length > 0
                ? `Managing ${categories.length} categories`
                : "No categories yet"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/admin/dashboard/news">
              <button className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                <FileText className="w-4 h-4" />
                News Management
              </button>
            </Link>
          </div>
        </div>

        {/* Add/Edit Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-base font-semibold mb-4 text-gray-900">
            {isEditing ? "Edit Category" : "Add New Category"}
          </h2>
          <form onSubmit={handleSubmit} className="flex gap-3 items-end">
            <div className="flex-grow">
              <label
                htmlFor="categoryName"
                className="block text-xs font-medium text-gray-700 mb-1"
              >
                Category Name
              </label>
              <input
                type="text"
                id="categoryName"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full px-3 py-1 text-sm border border-gray-200 rounded-lg focus:ring-0  focus:border-[#01DBC8]"
                required
                disabled={loading}
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-[#0AAC9E] rounded-lg hover:bg-[#127D74] disabled:opacity-50 disabled:hover:bg-[#0AAC9E]"
                disabled={loading || !categoryName.trim()}
              >
                {loading ? (
                  "Processing..."
                ) : isEditing ? (
                  <>
                    <Plus className="w-4 h-4" />
                    Update Category
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Add Category
                  </>
                )}
              </button>

              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                  disabled={loading}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Categories List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <div className="text-sm font-medium text-gray-900">
              Category Name
            </div>
            <div className="text-sm font-medium text-gray-900 text-right w-32">
              Actions
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {sortedCategories && sortedCategories.length > 0 ? (
              sortedCategories.map((category) => (
                <div
                  key={category.id}
                  className="px-6 py-4 flex justify-between items-center"
                >
                  <div className="text-sm text-gray-900">
                    {category.categoryName}
                  </div>
                  <div className="flex items-center justify-end gap-2 w-32">
                    <button
                      onClick={() => handleEditClick(category)}
                      className="p-2 text-gray-400 hover:text-[#0AAC9E] hover:bg-[#f2fdfc] rounded-lg transition-all"
                      disabled={loading}
                    >
                      <Edit2 className="w-4 h-3" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(category.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      disabled={loading}
                    >
                      <Trash2 className="w-4 h-3" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-[#0AAC9E]" />
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">
                  No categories found
                </h3>
                <p className="text-sm text-gray-500 max-w-sm text-center">
                  Start by adding your first news category.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        item="category"
      />
    </div>
  );
};

export default NewsCategoryAdmin;