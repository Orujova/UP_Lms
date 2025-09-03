'use client'
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { 
  X, 
  BookOpen, 
  Clock, 
  AlertCircle, 
  CheckCircle,
  Eye,
  EyeOff,
  Loader2,
  Save,
  RefreshCw,
  Hash
} from "lucide-react";
import {
  addSectionAsync,
  updateSectionAsync,
  setModalOpen,
  fetchCreatedCourseIdAsync
} from "@/redux/course/courseSlice";

const SectionModal = () => {
  const dispatch = useDispatch();
  
  // Redux state
  const { 
    modals, 
    activeSection,
    sections,
    currentCourse,
    formData,
    loading 
  } = useSelector((state) => state.course || {});
  
  const isOpen = modals?.addSection || modals?.editSection || false;
  const isEditing = modals?.editSection || false;
  
  // Memoize current section
  const currentSection = useMemo(() => {
    if (isEditing && activeSection) {
      return sections?.find(s => s.id === activeSection) || null;
    }
    return null;
  }, [isEditing, activeSection, sections]);

  // Memoize course ID extraction
  const courseId = useMemo(() => {
    if (currentCourse?.id && 
        currentCourse.id !== null && 
        !currentCourse.id.toString().startsWith('temp_') &&
        currentCourse.id.toString() !== 'null' &&
        currentCourse.id.toString() !== 'undefined') {
      return currentCourse.id;
    }
    
    if (formData?.id && 
        formData.id !== null && 
        !formData.id.toString().startsWith('temp_') &&
        formData.id.toString() !== 'null' &&
        formData.id.toString() !== 'undefined') {
      return formData.id;
    }
    
    if (formData?.courseId && 
        formData.courseId !== null && 
        !formData.courseId.toString().startsWith('temp_') &&
        formData.courseId.toString() !== 'null' &&
        formData.courseId.toString() !== 'undefined') {
      return formData.courseId;
    }
    
    return null;
  }, [currentCourse?.id, formData?.id, formData?.courseId]);
  
  // Calculate next order number
  const nextOrderNumber = useMemo(() => {
    if (!sections || sections.length === 0) return 1;
    const maxOrder = Math.max(...sections.map(s => s.order || 0));
    return maxOrder + 1;
  }, [sections]);
  
  // Local state
  const [formState, setFormState] = useState({
    courseId: null,
    description: "",
    order: 1,
    duration: 60,
    hideSection: false,
    mandatory: false
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingCourseId, setIsCheckingCourseId] = useState(false);

  // Try to fetch course ID if missing
  const handleFetchCourseId = useCallback(async () => {
    if (currentCourse?.success && formData?.name && formData?.description) {
      setIsCheckingCourseId(true);
      try {
        await dispatch(fetchCreatedCourseIdAsync({
          name: formData.name,
          description: formData.description
        })).unwrap();
      } catch (error) {
        console.error('Failed to fetch course ID:', error);
      } finally {
        setIsCheckingCourseId(false);
      }
    }
  }, [dispatch, currentCourse?.success, formData?.name, formData?.description]);

  // Initialize form data
  useEffect(() => {
    if (!isOpen) return;

    if (isEditing && currentSection) {
      setFormState({
        courseId: currentSection.courseId || courseId,
        description: currentSection.description || "",
        order: currentSection.order || 1,
        duration: currentSection.duration || 60,
        hideSection: Boolean(currentSection.hideSection),
        mandatory: Boolean(currentSection.mandatory)
      });
    } else {
      setFormState({
        courseId: courseId,
        description: "",
        order: nextOrderNumber,
        duration: 60,
        hideSection: false,
        mandatory: false
      });
    }
    
    setErrors({});
  }, [isOpen, isEditing, courseId, currentSection, nextOrderNumber]);

  // Update courseId in form when it changes
  useEffect(() => {
    if (isOpen && !isEditing && courseId !== formState.courseId) {
      setFormState(prev => ({
        ...prev,
        courseId: courseId
      }));
    }
  }, [isOpen, isEditing, courseId, formState.courseId]);

  // Validation
  const validateForm = useCallback(() => {
    const newErrors = {};
    
    if (!formState.description?.trim()) {
      newErrors.description = "Section title is required";
    } else if (formState.description.length < 3) {
      newErrors.description = "Section title must be at least 3 characters";
    } else if (formState.description.length > 200) {
      newErrors.description = "Section title must be less than 200 characters";
    }
    
    if (!formState.duration || formState.duration < 1) {
      newErrors.duration = "Duration must be at least 1 minute";
    } else if (formState.duration > 1440) {
      newErrors.duration = "Duration cannot exceed 24 hours (1440 minutes)";
    }

    if (!formState.order || formState.order < 1) {
      newErrors.order = "Order must be at least 1";
    } else if (formState.order > 999) {
      newErrors.order = "Order cannot exceed 999";
    }

    // Check for duplicate order numbers (only when creating new section)
    if (!isEditing && sections) {
      const existingOrders = sections.map(s => s.order).filter(o => o && o === formState.order);
      if (existingOrders.length > 0) {
        newErrors.order = `Order ${formState.order} is already used by another section`;
      }
    }

    if (!courseId && !currentCourse?.success) {
      newErrors.courseId = "Course must be created first. Please complete Step 1.";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formState, courseId, currentCourse?.success, isEditing, sections]);

  const handleInputChange = useCallback((field, value) => {
    setFormState(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  }, [errors]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    if (!courseId && !currentCourse?.success) {
      setErrors({ submit: "Course ID is missing. Please create the course first in Step 1." });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let result;
      
      if (isEditing && currentSection) {
        const updatePayload = {
          sectionId: currentSection.id,
          id: currentSection.id,
          courseId: courseId ? parseInt(courseId) : null,
          description: formState.description.trim(),
          order: parseInt(formState.order),
          duration: parseInt(formState.duration),
          hideSection: Boolean(formState.hideSection),
          mandatory: Boolean(formState.mandatory),
          courseContentIds: currentSection.courseContentIds || [],
          contents: currentSection.contents || []
        };

        result = await dispatch(updateSectionAsync(updatePayload)).unwrap();
        
      } else {
        const sectionData = {
          courseId: parseInt(courseId),
          description: formState.description.trim(),
          order: parseInt(formState.order),
          duration: parseInt(formState.duration),
          hideSection: Boolean(formState.hideSection),
          mandatory: Boolean(formState.mandatory)
        };

        result = await dispatch(addSectionAsync(sectionData)).unwrap();
      }

      if (result && courseId) {
        const { getSectionsByCourseIdAsync } = await import('@/redux/course/courseSlice');
        await dispatch(getSectionsByCourseIdAsync(courseId));
      }
      
      handleClose();
    } catch (error) {
      console.error("Error saving section:", error);
      setErrors({ submit: error.message || "Failed to save section" });
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm, courseId, currentCourse?.success, isEditing, currentSection, formState, dispatch]);

  const handleClose = useCallback(() => {
    dispatch(setModalOpen({ modal: 'addSection', isOpen: false }));
    dispatch(setModalOpen({ modal: 'editSection', isOpen: false }));
    setFormState({
      courseId: null,
      description: "",
      order: 1,
      duration: 60,
      hideSection: false,
      mandatory: false
    });
    setErrors({});
    setIsSubmitting(false);
  }, [dispatch]);

  const formatDuration = useCallback((minutes) => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditing ? 'Edit Section' : 'Add New Section'}
            </h2>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-6 max-h-[calc(90vh-140px)] overflow-y-auto">
          
          {/* Course Info Display */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-[#0AAC9E]" />
                <span className="font-medium text-gray-700">Course:</span>
                <span className="text-gray-900 font-semibold">{formData?.name || currentCourse?.name || 'Unknown'}</span>
              </div>
              <span className="text-gray-500 text-xs bg-white px-2 py-1 rounded">
                ID: {courseId || 'No ID'}
              </span>
            </div>
            
            {/* Course ID Status */}
            {!courseId && currentCourse?.success && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="text-sm text-orange-600 flex items-center mb-3">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Course created but ID not found.
                </div>
                <button
                  type="button"
                  onClick={handleFetchCourseId}
                  disabled={isCheckingCourseId}
                  className="flex items-center text-sm text-[#0AAC9E] hover:text-[#0AAC9E]/80 disabled:opacity-50"
                >
                  {isCheckingCourseId ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Fetch Course ID
                </button>
              </div>
            )}
            
            {!courseId && !currentCourse?.success && (
              <div className="mt-3 pt-3 border-t border-gray-200 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                Course not created yet. Please complete Step 1 first.
              </div>
            )}
          </div>

          {/* Section Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Section Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formState.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="e.g., Introduction to React"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0AAC9E] transition-colors ${
                errors.description
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300 bg-white'
              }`}
            />
            {errors.description && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.description}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {formState.description?.length || 0}/200 characters
            </p>
          </div>

          {/* Order and Duration */}
          <div className="grid grid-cols-2 gap-4">
            {/* Order Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  min="1"
                  max="999"
                  value={formState.order}
                  onChange={(e) => handleInputChange('order', parseInt(e.target.value) || 1)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0AAC9E] transition-colors ${
                    errors.order
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300 bg-white'
                  }`}
                />
              </div>
              {errors.order && (
                <p className="mt-1 text-xs text-red-600">{errors.order}</p>
              )}
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (min) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  min="1"
                  max="1440"
                  value={formState.duration}
                  onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || '')}
                  placeholder="60"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0AAC9E] transition-colors ${
                    errors.duration
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300 bg-white'
                  }`}
                />
              </div>
              {errors.duration && (
                <p className="mt-1 text-xs text-red-600">{errors.duration}</p>
              )}
              {formState.duration && (
                <p className="mt-1 text-xs text-gray-500">
                  {formatDuration(formState.duration)}
                </p>
              )}
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700">Settings</h3>
            
            {/* Mandatory */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="text-sm font-medium text-gray-900">Required Section</div>
                <div className="text-xs text-gray-500">Learners must complete this section</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formState.mandatory}
                  onChange={(e) => handleInputChange('mandatory', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#0AAC9E]/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0AAC9E]"></div>
              </label>
            </div>

            {/* Hide Section */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="text-sm font-medium text-gray-900">Hide Section</div>
                <div className="text-xs text-gray-500">Not visible to learners</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formState.hideSection}
                  onChange={(e) => handleInputChange('hideSection', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#0AAC9E]/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0AAC9E]"></div>
              </label>
            </div>
          </div>

          {/* Error Messages */}
          {(errors.courseId || errors.submit) && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                {errors.courseId || errors.submit}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || Object.keys(errors).filter(k => k !== 'submit').length > 0}
              className="flex-2 px-6 py-3 text-sm font-medium text-white bg-[#0AAC9E] rounded-lg hover:bg-[#0AAC9E]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
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
        </div>
      </div>
    </div>
  );
};

export default SectionModal;