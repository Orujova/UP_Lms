'use client'
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { 
  X, 
  BookOpen, 
  Clock, 
  Settings, 
  AlertCircle, 
  CheckCircle,
  Eye,
  EyeOff,
  Loader2,
  Save
} from "lucide-react";
import {
  addSectionAsync,
  updateSectionAsync,
  setModalOpen,
  updateSection
} from "@/redux/course/courseSlice";

const SectionModal = () => {
  const dispatch = useDispatch();
  
  // Redux state
  const { 
    modals, 
    activeSection,
    sections,
    currentCourse,
    loading 
  } = useSelector((state) => state.course || {});
  
  const isOpen = modals?.addSection || modals?.editSection || false;
  const isEditing = modals?.editSection || false;
  
  // Local state - matching exact API field names
  const [formData, setFormData] = useState({
    courseId: null,
    description: "",
    duration: 60,
    hideSection: false,
    mandatory: false
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get current section data for editing
  const currentSection = isEditing 
    ? sections?.find(s => s.id === activeSection)
    : null;

  // Initialize form data
  useEffect(() => {
    if (isOpen) {
      if (isEditing && currentSection) {
        setFormData({
          courseId: currentSection.courseId || currentCourse?.id,
          description: currentSection.description || "",
          duration: currentSection.duration || 60,
          hideSection: currentSection.hideSection || false,
          mandatory: currentSection.mandatory || false
        });
      } else {
        // Reset for new section
        setFormData({
          courseId: currentCourse?.id || null,
          description: "",
          duration: 60,
          hideSection: false,
          mandatory: false
        });
      }
      setErrors({});
    }
  }, [isOpen, isEditing, currentSection, currentCourse]);

  // Validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.description?.trim()) {
      newErrors.description = "Section description is required";
    } else if (formData.description.length < 3) {
      newErrors.description = "Description must be at least 3 characters";
    } else if (formData.description.length > 200) {
      newErrors.description = "Description must be less than 200 characters";
    }
    
    if (!formData.duration || formData.duration < 1) {
      newErrors.duration = "Duration must be at least 1 minute";
    } else if (formData.duration > 1440) {
      newErrors.duration = "Duration cannot exceed 24 hours (1440 minutes)";
    }

    if (!formData.courseId) {
      newErrors.courseId = "Course ID is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Check if we have a course ID
    if (!currentCourse?.id) {
      setErrors({ submit: "Course must be created first. Please complete step 1." });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare section data exactly as API expects (multipart/form-data fields)
      const sectionData = {
        courseId: currentCourse.id, // Required: integer($int32)
        description: formData.description, // Required: string
        duration: formData.duration, // Required: integer($int32)
        hideSection: formData.hideSection, // Required: boolean
        mandatory: formData.mandatory // Required: boolean
      };

      if (isEditing && currentSection) {
        // Update existing section
        await dispatch(updateSectionAsync({
          sectionId: currentSection.id,
          sectionData
        })).unwrap();
      } else {
        // Create new section
        await dispatch(addSectionAsync(sectionData)).unwrap();
      }
      
      handleClose();
    } catch (error) {
      console.error("Error saving section:", error);
      setErrors({ submit: error.message || "Failed to save section" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    dispatch(setModalOpen({ modal: 'addSection', isOpen: false }));
    dispatch(setModalOpen({ modal: 'editSection', isOpen: false }));
    setFormData({
      courseId: null,
      description: "",
      duration: 60,
      hideSection: false,
      mandatory: false
    });
    setErrors({});
    setIsSubmitting(false);
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-[#0AAC9E]/5 to-[#0AAC9E]/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#0AAC9E]/10 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-[#0AAC9E]" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {isEditing ? 'Edit Section' : 'Add New Section'}
                </h2>
                <p className="text-sm text-gray-600">
                  {isEditing 
                    ? 'Update section details and settings' 
                    : 'Create a new learning section for your course'
                  }
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Course Info Display */}
          {currentCourse && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-[#0AAC9E]" />
                <span className="text-sm font-medium text-gray-700">Course:</span>
                <span className="text-sm text-gray-900">{currentCourse.name}</span>
              </div>
            </div>
          )}

          {/* Section Description - Required API field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Section Title <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter section title..."
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  errors.description
                    ? 'border-red-300 focus:ring-red-500'
                    : formData.description && !errors.description
                    ? 'border-green-300 focus:ring-green-500'
                    : 'border-gray-300 focus:ring-[#0AAC9E]'
                }`}
              />
              {formData.description && !errors.description && (
                <CheckCircle className="absolute right-3 top-3.5 w-5 h-5 text-green-500" />
              )}
            </div>
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.description}
              </p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              {formData.description?.length || 0}/200 characters
            </p>
          </div>

          {/* Duration - Required API field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estimated Duration (minutes) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="flex">
                <input
                  type="number"
                  min="1"
                  max="1440"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || '')}
                  placeholder="60"
                  className={`flex-1 px-4 py-3 border rounded-l-lg focus:outline-none focus:ring-2 transition-colors ${
                    errors.duration
                      ? 'border-red-300 focus:ring-red-500'
                      : formData.duration && !errors.duration
                      ? 'border-green-300 focus:ring-green-500'
                      : 'border-gray-300 focus:ring-[#0AAC9E]'
                  }`}
                />
                <div className="px-4 py-3 bg-gray-50 border border-l-0 border-gray-300 rounded-r-lg text-sm text-gray-600 flex items-center min-w-[80px]">
                  <Clock className="w-4 h-4 mr-2" />
                  {formatDuration(formData.duration)}
                </div>
              </div>
              {formData.duration && !errors.duration && (
                <CheckCircle className="absolute right-20 top-3.5 w-5 h-5 text-green-500" />
              )}
            </div>
            {errors.duration && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.duration}
              </p>
            )}
          </div>

          {/* Section Settings - Exact API boolean fields */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700 flex items-center">
              <Settings className="w-4 h-4 mr-2" />
              Section Settings
            </h3>

            {/* Mandatory Toggle - API field: mandatory (boolean) */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <label htmlFor="mandatory" className="text-sm font-medium text-gray-900">
                    Required Section
                  </label>
                  <p className="text-xs text-gray-500">
                    Learners must complete this section to progress
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="mandatory"
                  checked={formData.mandatory}
                  onChange={(e) => handleInputChange('mandatory', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#0AAC9E]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0AAC9E]"></div>
              </label>
            </div>

            {/* Hide Section Toggle - API field: hideSection (boolean) */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  {formData.hideSection ? (
                    <EyeOff className="w-4 h-4 text-gray-600" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-600" />
                  )}
                </div>
                <div>
                  <label htmlFor="hideSection" className="text-sm font-medium text-gray-900">
                    Hide Section
                  </label>
                  <p className="text-xs text-gray-500">
                    Section will not be visible to learners
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="hideSection"
                  checked={formData.hideSection}
                  onChange={(e) => handleInputChange('hideSection', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#0AAC9E]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0AAC9E]"></div>
              </label>
            </div>
          </div>

          {/* Course ID Error */}
          {errors.courseId && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                {errors.courseId}
              </p>
            </div>
          )}

          {/* Submit Error */}
          {errors.submit && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                {errors.submit}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || Object.keys(errors).filter(k => k !== 'submit').length > 0}
              className="flex-1 px-4 py-3 text-sm font-medium text-white bg-[#0AAC9E] rounded-lg hover:bg-[#0AAC9E]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEditing ? 'Update Section' : 'Create Section'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SectionModal;