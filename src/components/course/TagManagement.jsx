import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Tag, 
  Hash,
  MoreVertical,
  X,
  AlertCircle,
  Filter,
  Grid,
  List
} from "lucide-react";
import {
  fetchCourseTagsAsync,
  createCourseTagAsync,
  updateCourseTagAsync,
  deleteCourseTagAsync,
  courseTagActions
} from "@/redux/courseTag/courseTagSlice";
import { toast } from "sonner";

// Create/Edit Modal Component
const TagModal = ({ isOpen, onClose, tag = null, onSave }) => {
  const [formData, setFormData] = useState({ name: "" });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (tag) {
      setFormData({ name: tag.name || "" });
    } else {
      setFormData({ name: "" });
    }
    setErrors({});
  }, [tag, isOpen]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Tag name is required";
    } else if (formData.name.length < 2) {
      newErrors.name = "Tag name must be at least 2 characters";
    } else if (formData.name.length > 50) {
      newErrors.name = "Tag name must be less than 50 characters";
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
        ...(tag && { id: tag.id }),
        name: formData.name.trim(),
      });
      onClose();
      setFormData({ name: "" });
    } catch (error) {
      console.error("Error saving tag:", error);
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
            {tag ? "Edit Tag" : "Create Tag"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tag Name *
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ name: e.target.value })}
                placeholder="Enter tag name"
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0AAC9E] focus:border-[#0AAC9E] text-sm ${
                  errors.name ? "border-red-300 bg-red-50" : "border-gray-300"
                }`}
                autoFocus
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-xs text-red-600 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {errors.name}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Tags help organize and filter courses
            </p>
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
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-[#0AAC9E] text-white rounded-lg hover:bg-[#0AAC9E]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{tag ? "Updating..." : "Creating..."}</span>
                </div>
              ) : (
                tag ? "Update Tag" : "Create Tag"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Delete Confirmation Modal
const DeleteModal = ({ isOpen, onClose, tag, onConfirm }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error("Error deleting tag:", error);
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
              <h3 className="text-lg font-semibold text-gray-900">Delete Tag</h3>
              <p className="text-sm text-gray-600">This action cannot be undone</p>
            </div>
          </div>

          <p className="text-sm text-gray-700 mb-6">
            Are you sure you want to delete the tag "#{tag?.name}"? 
            This tag will be removed from all related courses.
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
                "Delete Tag"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Tag Color Generator
const getTagColor = (index) => {
  const colors = [
    "bg-blue-100 text-blue-700 border-blue-200",
    "bg-green-100 text-green-700 border-green-200",
    "bg-purple-100 text-purple-700 border-purple-200",
    "bg-orange-100 text-orange-700 border-orange-200",
    "bg-pink-100 text-pink-700 border-pink-200",
    "bg-indigo-100 text-indigo-700 border-indigo-200",
    "bg-yellow-100 text-yellow-700 border-yellow-200",
    "bg-red-100 text-red-700 border-red-200",
  ];
  return colors[index % colors.length];
};

// Main Course Tag Management Component
const CourseTagManagement = () => {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTag, setSelectedTag] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const { 
    tags = [], 
    loading = false, 
    error = null,
    totalTagCount = 0
  } = useSelector((state) => state.courseTag || {});

  useEffect(() => {
    dispatch(fetchCourseTagsAsync());
  }, [dispatch]);

  // Filter tags based on search term
  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateTag = async (tagData) => {
    try {
      await dispatch(createCourseTagAsync(tagData)).unwrap();
      toast.success("Tag created successfully!");
    } catch (error) {
      toast.error("Failed to create tag: " + error.message);
      throw error;
    }
  };

  const handleUpdateTag = async (tagData) => {
    try {
      await dispatch(updateCourseTagAsync(tagData)).unwrap();
      toast.success("Tag updated successfully!");
    } catch (error) {
      toast.error("Failed to update tag: " + error.message);
      throw error;
    }
  };

  const handleDeleteTag = async () => {
    try {
      await dispatch(deleteCourseTagAsync(selectedTag.id)).unwrap();
      toast.success("Tag deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete tag: " + error.message);
      throw error;
    }
  };

  const openEditModal = (tag) => {
    setSelectedTag(tag);
    setShowEditModal(true);
    setActiveDropdown(null);
  };

  const openDeleteModal = (tag) => {
    setSelectedTag(tag);
    setShowDeleteModal(true);
    setActiveDropdown(null);
  };

  const toggleDropdown = (tagId) => {
    setActiveDropdown(activeDropdown === tagId ? null : tagId);
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Course Tags</h1>
            <p className="text-sm text-gray-600 mt-1">
              Create and manage tags to organize and filter courses ({totalTagCount} total)
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-[#0AAC9E] text-white rounded-lg hover:bg-[#0AAC9E]/90 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Tag</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search tags..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0AAC9E] focus:border-[#0AAC9E] text-sm"
              />
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Filter className="w-4 h-4" />
              <span>{filteredTags.length} tags</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "grid" 
                    ? "bg-white text-[#0AAC9E] shadow-sm" 
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "list" 
                    ? "bg-white text-[#0AAC9E] shadow-sm" 
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tags Display */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0AAC9E]"></div>
            <span className="ml-3 text-gray-600">Loading tags...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-red-600 text-sm">{error}</p>
              <button
                onClick={() => dispatch(fetchCourseTagsAsync())}
                className="mt-2 px-3 py-1 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
              >
                Try again
              </button>
            </div>
          </div>
        ) : filteredTags.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Hash className="w-12 h-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? "No tags found" : "No tags yet"}
            </h3>
            <p className="text-gray-500 text-center mb-6">
              {searchTerm 
                ? `No tags match "${searchTerm}"`
                : "Create your first tag to organize and filter courses"
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-[#0AAC9E] text-white rounded-lg hover:bg-[#0AAC9E]/90 transition-colors text-sm"
              >
                Create First Tag
              </button>
            )}
          </div>
        ) : (
          <div className="p-4">
            {/* Tags Grid */}
            <div className={viewMode === "grid" 
              ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3"
              : "space-y-3"
            }>
              {filteredTags.map((tag, index) => (
                <div
                  key={tag.id}
                  className={`group relative ${viewMode === "list" ? "flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-[#0AAC9E]/30" : ""}`}
                >
                  <div className={`flex items-center justify-between p-3 rounded-lg border transition-all hover:shadow-sm ${getTagColor(index)} ${viewMode === "list" ? "flex-1 border-0" : ""}`}>
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <Hash className="w-3 h-3 flex-shrink-0" />
                      <span className="text-sm font-medium truncate">
                        {tag.name}
                      </span>
                    </div>

                    {/* Actions Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => toggleDropdown(tag.id)}
                        className="p-1 hover:bg-black/10 rounded transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <MoreVertical className="w-3 h-3" />
                      </button>

                      {activeDropdown === tag.id && (
                        <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                          <button
                            onClick={() => openEditModal(tag)}
                            className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 rounded-t-lg"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => openDeleteModal(tag)}
                            className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-b-lg"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tag Usage Count */}
                  <div className="mt-1 text-xs text-gray-500 text-center">
                    {tag.courseCount || 0} courses
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Total: {filteredTags.length} tags</span>
                <span>
                  Most used: {filteredTags.length > 0 
                    ? filteredTags.reduce((prev, current) => 
                        (prev.courseCount || 0) > (current.courseCount || 0) ? prev : current
                      ).name
                    : "None"
                  }
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <TagModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateTag}
      />

      <TagModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedTag(null);
        }}
        tag={selectedTag}
        onSave={handleUpdateTag}
      />

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedTag(null);
        }}
        tag={selectedTag}
        onConfirm={handleDeleteTag}
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

export default CourseTagManagement;