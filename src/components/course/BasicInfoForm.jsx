'use client'
import React, { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { 
  Upload, 
  X, 
  Clock, 
  Award, 
  Tag, 
  AlertCircle, 
  CheckCircle, 
  Info, 
  Loader2,
  BookOpen,
  Settings,
  Image as ImageIcon,
  Package,
  ChevronDown,
  AlertTriangle,
  Save,
  ArrowRight,
  Plus,
  Trash2
} from "lucide-react";
import {
  setFormData,
  setImagePreview,
  setImageFile,
  addSuccessionRate,
  updateSuccessionRate,
  removeSuccessionRate,
  createCourseAsync,
  updateCourseAsync
} from "@/redux/course/courseSlice";
import { fetchCourseCategoriesAsync } from "@/redux/courseCategory/courseCategorySlice";
import { fetchCourseTagsAsync } from "@/redux/courseTag/courseTagSlice";
import { fetchCertificatesAsync } from "@/redux/certificate/certificateSlice";
import { fetchClustersAsync } from "@/redux/cluster/clusterSlice";
import { fetchBadgesAsync, testBadgeConnectionAsync } from "@/redux/badge/badgeSlice";
import { getAllTargetGroupsAsync } from "@/redux/getAllTargetGroups/getAllTargetGroups";

const BasicInfoForm = ({ isEditing = false }) => {
  const dispatch = useDispatch();
  
  // Local state
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [imageUploadError, setImageUploadError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    advanced: false,
    badges: false
  });

  // Redux selectors
  const { 
    formData = {},
    imagePreview,
    imageFile,
    error: courseError,
    currentCourse,
    loading: courseLoading
  } = useSelector((state) => state.course || {});
  
  const { categories = [], loading: categoriesLoading } = useSelector((state) => state.courseCategory || {});
  const { tags = [], loading: tagsLoading } = useSelector((state) => state.courseTag || {});
  const { certificates = [], loading: certificatesLoading } = useSelector((state) => state.certificate || {});
  const { clusters = [], loading: clustersLoading } = useSelector((state) => state.cluster || {});
  const { badges = [], loading: badgesLoading, error: badgeError, connectionTested, isConnected } = useSelector((state) => state.badge || {});
  const { data: targetGroupsData, loading: targetGroupsLoading } = useSelector((state) => state.getAllTargetGroups || {});

  // Extract target groups from API response
  const targetGroups = targetGroupsData?.[0]?.targetGroups || [];

  // Initialize form data for new course
  useEffect(() => {
    if (!formData.name && !isEditing) {
      dispatch(setFormData({
        name: "",
        description: "",
        duration: 60,
        categoryId: "",
        verifiedCertificate: false,
        imageFile: null,
        targetGroupIds: [],
        certificateId: null,
        tagIds: [],
        startDuration: null,
        deadline: null,
        autoReassign: false,
        clusterId: null,
        clusterOrderNumber: null,
        clusterCoefficient: null,
        clusterIsMandatory: false,
        successionRates: []
      }));
    }
  }, [dispatch, formData.name, isEditing]);

  // Load all required data
  useEffect(() => {
    const loadData = async () => {
      try {
        await dispatch(testBadgeConnectionAsync());
        await Promise.all([
          dispatch(fetchCourseCategoriesAsync({ page: 1, take: 100 })),
          dispatch(fetchCourseTagsAsync({ page: 1, take: 100 })),
          dispatch(fetchCertificatesAsync({ page: 1, take: 100 })),  
          dispatch(fetchClustersAsync({ page: 1, take: 100 })),
          dispatch(fetchBadgesAsync({ page: 1, take: 100 })),
          dispatch(getAllTargetGroupsAsync())
        ]);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, [dispatch]);

  // Validation functions
  const validateField = useCallback((field, value) => {
    switch (field) {
      case 'name':
        if (!value?.trim()) return "Course name is required";
        if (value.length < 3) return "Must be at least 3 characters";
        if (value.length > 100) return "Must be less than 100 characters";
        return "";
      case 'description':
        if (!value?.trim()) return "Description is required";
        if (value.length < 10) return "Must be at least 10 characters";
        if (value.length > 1000) return "Must be less than 1000 characters";
        return "";
      case 'categoryId':
        if (!value) return "Please select a category";
        return "";
      case 'duration':
        if (!value || value < 1) return "Duration must be at least 1 minute";
        if (value > 10080) return "Duration cannot exceed 1 week (10080 minutes)";
        return "";
      default:
        return "";
    }
  }, []);

  // Real-time validation
  useEffect(() => {
    const newErrors = {};
    Object.keys(touched).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });
    setErrors(newErrors);
  }, [formData, touched, validateField]);

  const handleInputChange = (field, value) => {
    dispatch(setFormData({ [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
    setSaveSuccess(false);
  };

  // Multiple select handlers
  const handleMultipleSelect = (field, optionId) => {
    const currentValues = formData[field] || [];
    const newValues = currentValues.includes(optionId)
      ? currentValues.filter(id => id !== optionId)
      : [...currentValues, optionId];
    
    handleInputChange(field, newValues);
  };

  // Image upload handlers
  const handleImageUpload = useCallback((file) => {
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setImageUploadError('Please upload a valid image file (JPEG, PNG, WebP, or GIF)');
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setImageUploadError('Image size must be less than 5MB');
      return;
    }

    setImageUploadError(null);
    const reader = new FileReader();
    reader.onload = (e) => dispatch(setImagePreview(e.target.result));
    reader.readAsDataURL(file);
    dispatch(setImageFile(file));
    handleInputChange('imageFile', file);
  }, [dispatch, handleInputChange]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageUpload(file);
  }, [handleImageUpload]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
  };

  const removeImage = () => {
    dispatch(setImagePreview(null));
    dispatch(setImageFile(null));
    handleInputChange('imageFile', null);
  };

  // Succession rates handlers
  const handleAddSuccessionRate = () => {
    const newRate = { minRange: 0, maxRange: 100, badgeId: null };
    dispatch(addSuccessionRate(newRate));
  };

  const handleUpdateSuccessionRate = (index, field, value) => {
    let processedValue = value;
    
    if (field === 'minRange' || field === 'maxRange') {
      if (value === '') {
        processedValue = null;
      } else {
        const numValue = parseInt(value);
        processedValue = isNaN(numValue) ? null : Math.max(0, Math.min(100, numValue));
      }
    } else if (field === 'badgeId') {
      processedValue = value === '' || value === null ? null : parseInt(value);
    }
    
    dispatch(updateSuccessionRate({ index, updates: { [field]: processedValue } }));
  };

  const handleRemoveSuccessionRate = (index) => {
    dispatch(removeSuccessionRate(index));
  };

  // Save course
  const handleSaveCourse = async () => {
    const requiredFields = ['name', 'description', 'categoryId', 'duration'];
    const newTouched = {};
    requiredFields.forEach(field => {
      newTouched[field] = true;
    });
    setTouched(newTouched);

    const hasErrors = requiredFields.some(field => validateField(field, formData[field]));
    if (hasErrors) {
      setErrors(prev => ({
        ...prev,
        ...requiredFields.reduce((acc, field) => {
          const error = validateField(field, formData[field]);
          if (error) acc[field] = error;
          return acc;
        }, {})
      }));
      return;
    }

    setIsSaving(true);
    try {
      if (isEditing && currentCourse?.id) {
        await dispatch(updateCourseAsync({
          ...formData,
          id: currentCourse.id
        })).unwrap();
      } else {
        await dispatch(createCourseAsync(formData)).unwrap();
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving course:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  const isFieldValid = (field) => touched[field] && !errors[field] && formData[field];
  const getBadgeName = (badge) => badge?.badgeName || badge?.name || 'Unknown Badge';

  const isFormValid = () => {
    const requiredFields = ['name', 'description', 'categoryId', 'duration'];
    return requiredFields.every(field => formData[field] && !validateField(field, formData[field]));
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Custom dropdown component
  const CustomDropdown = ({ 
    label, 
    value, 
    options, 
    onChange, 
    placeholder, 
    loading, 
    icon: Icon, 
    multiple = false,
    required = false,
    error
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    const selectedOptions = multiple 
      ? options.filter(opt => (value || []).includes(opt.id))
      : options.find(opt => opt.id === value);
    
    const displayText = multiple
      ? selectedOptions.length > 0 
        ? `${selectedOptions.length} selected`
        : placeholder
      : selectedOptions?.name || placeholder;

    return (
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div
          onClick={() => !loading && setIsOpen(!isOpen)}
          className={`w-full px-4 py-3 border rounded-lg cursor-pointer focus:outline-none focus:ring-2 transition-colors bg-white flex items-center justify-between ${
            error ? 'border-red-300' : isFieldValid(label.toLowerCase()) ? 'border-green-300' : 'border-gray-300'
          } ${loading ? 'cursor-not-allowed opacity-50' : 'hover:border-gray-400'}`}
        >
          <div className="flex items-center">
            {Icon && <Icon className="w-4 h-4 mr-2 text-gray-400" />}
            <span className={!value || (multiple && value.length === 0) ? 'text-gray-500' : 'text-gray-900'}>
              {loading ? 'Loading...' : displayText}
            </span>
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
        
        {isOpen && !loading && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
            {options.length > 0 ? (
              options.map((option) => {
                const isSelected = multiple 
                  ? (value || []).includes(option.id)
                  : value === option.id;
                
                return (
                  <div
                    key={option.id}
                    onClick={() => {
                      if (multiple) {
                        onChange(option.id);
                      } else {
                        onChange(option.id);
                        setIsOpen(false);
                      }
                    }}
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-50 ${
                      isSelected ? 'bg-[#0AAC9E]/10 text-[#0AAC9E]' : 'text-gray-900'
                    }`}
                  >
                    <div className="flex items-center">
                      {multiple && (
                        <div className={`w-4 h-4 rounded border mr-3 flex items-center justify-center ${
                          isSelected ? 'bg-[#0AAC9E] border-[#0AAC9E]' : 'border-gray-300'
                        }`}>
                          {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                        </div>
                      )}
                      <span>{option.name}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-center text-gray-500 text-sm">
                No options available
              </div>
            )}
          </div>
        )}
        
        {error && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {error}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0AAC9E]/5 to-[#0AAC9E]/10 rounded-xl p-6 border border-[#0AAC9E]/20">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {isEditing ? 'Edit Course Information' : 'Create New Course'}
            </h2>
            <p className="text-gray-600">
              {isEditing 
                ? 'Update your course details and settings'
                : 'Fill in the essential information to create your course'
              }
            </p>
          </div>
          
          {/* Save Button */}
          <div className="flex items-center gap-3">
            {saveSuccess && (
              <div className="flex items-center text-green-600 text-sm font-medium bg-green-50 px-3 py-2 rounded-lg">
                <CheckCircle className="w-4 h-4 mr-2" />
                Saved successfully!
              </div>
            )}
            <button
              onClick={handleSaveCourse}
              disabled={!isFormValid() || isSaving}
              className="flex items-center px-6 py-3 bg-[#0AAC9E] text-white rounded-lg hover:bg-[#0AAC9E]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEditing ? 'Update Course' : 'Save & Continue'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Course Error */}
      {courseError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-red-800 mb-1">
                Course {isEditing ? 'Update' : 'Creation'} Failed
              </h4>
              <p className="text-sm text-red-700">{courseError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Basic Information Section */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div 
          className="flex items-center justify-between p-6 bg-gray-50 border-b cursor-pointer"
          onClick={() => toggleSection('basic')}
        >
          <div className="flex items-center">
            <BookOpen className="w-5 h-5 text-[#0AAC9E] mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
            <span className="ml-2 text-sm text-red-500">*Required</span>
          </div>
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.basic ? 'rotate-180' : ''}`} />
        </div>
        
        {expandedSections.basic && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Course Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter course name..."
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                        errors.name && touched.name
                          ? 'border-red-300 focus:ring-red-500'
                          : isFieldValid('name')
                          ? 'border-green-300 focus:ring-green-500'
                          : 'border-gray-300 focus:ring-[#0AAC9E]'
                      }`}
                    />
                    {isFieldValid('name') && (
                      <CheckCircle className="absolute right-3 top-3.5 w-5 h-5 text-green-500" />
                    )}
                  </div>
                  {errors.name && touched.name && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.name}
                    </p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    {formData.name?.length || 0}/100 characters
                  </p>
                </div>

                {/* Course Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe what learners will gain from this course..."
                      rows={4}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors resize-none ${
                        errors.description && touched.description
                          ? 'border-red-300 focus:ring-red-500'
                          : isFieldValid('description')
                          ? 'border-green-300 focus:ring-green-500'
                          : 'border-gray-300 focus:ring-[#0AAC9E]'
                      }`}
                    />
                    {isFieldValid('description') && (
                      <CheckCircle className="absolute right-3 top-3 w-5 h-5 text-green-500" />
                    )}
                  </div>
                  {errors.description && touched.description && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.description}
                    </p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    {formData.description?.length || 0}/1000 characters
                  </p>
                </div>

                {/* Category and Duration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CustomDropdown
                    label="Category"
                    value={formData.categoryId}
                    options={categories}
                    onChange={(categoryId) => handleInputChange('categoryId', categoryId)}
                    placeholder="Select category"
                    loading={categoriesLoading}
                    icon={Settings}
                    required={true}
                    error={errors.categoryId && touched.categoryId ? errors.categoryId : null}
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (minutes) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="flex">
                        <input
                          type="number"
                          min="1"
                          max="10080"
                          value={formData.duration || ''}
                          onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || '')}
                          placeholder="60"
                          className={`flex-1 px-4 py-3 border rounded-l-lg focus:outline-none focus:ring-2 transition-colors ${
                            errors.duration && touched.duration
                              ? 'border-red-300 focus:ring-red-500'
                              : isFieldValid('duration')
                              ? 'border-green-300 focus:ring-green-500'
                              : 'border-gray-300 focus:ring-[#0AAC9E]'
                          }`}
                        />
                        <div className="px-4 py-3 bg-gray-50 border border-l-0 border-gray-300 rounded-r-lg text-sm text-gray-600 flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          {formatDuration(formData.duration)}
                        </div>
                      </div>
                    </div>
                    {errors.duration && touched.duration && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.duration}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Image
                </label>
                
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Course preview"
                      className="w-full h-48 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      dragActive 
                        ? 'border-[#0AAC9E] bg-[#0AAC9E]/5' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileInput}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        Drop an image here, or click to browse
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, WebP or GIF up to 5MB
                      </p>
                    </div>
                  </div>
                )}
                
                {imageUploadError && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {imageUploadError}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Advanced Settings */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div 
          className="flex items-center justify-between p-6 bg-gray-50 border-b cursor-pointer"
          onClick={() => toggleSection('advanced')}
        >
          <div className="flex items-center">
            <Settings className="w-5 h-5 text-[#0AAC9E] mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Advanced Settings</h3>
            <span className="ml-2 text-sm text-gray-500">Optional</span>
          </div>
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.advanced ? 'rotate-180' : ''}`} />
        </div>
        
        {expandedSections.advanced && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Target Groups */}
                <CustomDropdown
                  label="Target Groups"
                  value={formData.targetGroupIds}
                  options={targetGroups}
                  onChange={(groupId) => handleMultipleSelect('targetGroupIds', groupId)}
                  placeholder="Select target groups"
                  loading={targetGroupsLoading}
                  icon={Package}
                  multiple={true}
                />

                {/* Tags */}
                <CustomDropdown
                  label="Tags"
                  value={formData.tagIds}
                  options={tags}
                  onChange={(tagId) => handleMultipleSelect('tagIds', tagId)}
                  placeholder="Select tags"
                  loading={tagsLoading}
                  icon={Tag}
                  multiple={true}
                />

                {/* Certificate */}
                <CustomDropdown
                  label="Certificate Template"
                  value={formData.certificateId}
                  options={certificates}
                  onChange={(certificateId) => handleInputChange('certificateId', certificateId)}
                  placeholder="No certificate"
                  loading={certificatesLoading}
                  icon={Award}
                />

                {/* Certificate Settings */}
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="verifiedCertificate"
                    checked={formData.verifiedCertificate || false}
                    onChange={(e) => handleInputChange('verifiedCertificate', e.target.checked)}
                    className="w-4 h-4 text-[#0AAC9E] border-gray-300 rounded focus:ring-[#0AAC9E]"
                  />
                  <label htmlFor="verifiedCertificate" className="text-sm font-medium text-gray-700 flex items-center">
                    <Award className="w-4 h-4 mr-2 text-[#0AAC9E]" />
                    Enable verified certificates
                  </label>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Cluster Settings */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-700 flex items-center">
                    <Package className="w-4 h-4 mr-2" />
                    Cluster Settings
                  </h4>

                  <CustomDropdown
                    label="Assign to Cluster"
                    value={formData.clusterId}
                    options={clusters.map(cluster => ({ id: cluster.id, name: cluster.subject }))}
                    onChange={(clusterId) => handleInputChange('clusterId', clusterId)}
                    placeholder="No cluster"
                    loading={clustersLoading}
                    icon={Package}
                  />

                  {formData.clusterId && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Order in Cluster
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={formData.clusterOrderNumber || ''}
                            onChange={(e) => handleInputChange('clusterOrderNumber', parseInt(e.target.value) || null)}
                            placeholder="1"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0AAC9E] transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Coefficient (Weight)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.1"
                            value={formData.clusterCoefficient !== null ? formData.clusterCoefficient : ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              const numValue = value === '' ? null : parseFloat(value);
                              handleInputChange('clusterCoefficient', numValue);
                            }}
                            placeholder="0.0"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0AAC9E] transition-colors"
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="clusterIsMandatory"
                          checked={formData.clusterIsMandatory || false}
                          onChange={(e) => handleInputChange('clusterIsMandatory', e.target.checked)}
                          className="w-4 h-4 text-[#0AAC9E] border-gray-300 rounded focus:ring-[#0AAC9E]"
                        />
                        <label htmlFor="clusterIsMandatory" className="text-sm text-gray-700">
                          Mandatory in cluster
                        </label>
                      </div>
                    </>
                  )}
                </div>

                {/* Date Settings */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-700 flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Date Settings
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Duration
                      </label>
                      <input
                        type="number"
                        value={formData.startDuration || ''}
                        onChange={(e) => handleInputChange('startDuration', e.target.value ? parseInt(e.target.value) : null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0AAC9E]/20 focus:border-[#0AAC9E]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Deadline
                      </label>
                      <input
                        type="number"
                        value={formData.deadline || ''}
                        onChange={(e) => handleInputChange('deadline', e.target.value ? parseInt(e.target.value) : null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0AAC9E]/20 focus:border-[#0AAC9E]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="autoReassign"
                      checked={formData.autoReassign || false}
                      onChange={(e) => handleInputChange('autoReassign', e.target.checked)}
                      className="w-4 h-4 text-[#0AAC9E] border-gray-300 rounded focus:ring-[#0AAC9E]"
                    />
                    <label htmlFor="autoReassign" className="text-sm text-gray-700">
                      Auto reassign when target groups change
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Achievement Badges Section */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div 
          className="flex items-center justify-between p-6 bg-gray-50 border-b cursor-pointer"
          onClick={() => toggleSection('badges')}
        >
          <div className="flex items-center">
            <Award className="w-5 h-5 text-[#0AAC9E] mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Achievement Badges</h3>
            <span className="ml-2 text-sm text-gray-500">Optional</span>
          </div>
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.badges ? 'rotate-180' : ''}`} />
        </div>
        
        {expandedSections.badges && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Define score ranges for awarding badges based on course completion performance
                </p>
                {badgeError && (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {badgeError}
                  </p>
                )}
              </div>
              <button
                onClick={handleAddSuccessionRate}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-[#0AAC9E] rounded-lg hover:bg-[#0AAC9E]/90 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Achievement Range
              </button>
            </div>

            {formData.successionRates && formData.successionRates.length > 0 ? (
              <div className="space-y-4">
                {formData.successionRates.map((rate, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-medium text-gray-900">
                        Achievement Range #{index + 1}
                      </h4>
                      <button
                        onClick={() => handleRemoveSuccessionRate(index)}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Min Range */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Min Score (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={rate.minRange === null || rate.minRange === undefined ? '' : rate.minRange}
                          onChange={(e) => handleUpdateSuccessionRate(index, 'minRange', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0AAC9E]/20 focus:border-[#0AAC9E]"
                        />
                      </div>
                      
                      {/* Max Range */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Max Score (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={rate.maxRange === null || rate.maxRange === undefined ? '' : rate.maxRange}
                          onChange={(e) => handleUpdateSuccessionRate(index, 'maxRange', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0AAC9E]/20 focus:border-[#0AAC9E]"
                        />
                      </div>
                      
                      {/* Badge Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Award Badge
                        </label>
                        <div className="relative">
                          <select
                            value={rate.badgeId || ''}
                            onChange={(e) => handleUpdateSuccessionRate(index, 'badgeId', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0AAC9E]/20 focus:border-[#0AAC9E] appearance-none bg-white"
                            disabled={badgesLoading}
                          >
                            <option value="">No badge</option>
                            {badges && badges.length > 0 ? (
                              badges.map((badge) => (
                                <option key={badge.id} value={badge.id}>
                                  {getBadgeName(badge)}
                                </option>
                              ))
                            ) : (
                              <option disabled>
                                {badgesLoading ? 'Loading badges...' : 'No badges available'}
                              </option>
                            )}
                          </select>
                          <Award className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                        
                        {/* Badge Status */}
                        <div className="mt-2 text-xs">
                          {badgesLoading ? (
                            <span className="text-gray-500 flex items-center">
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              Loading badges...
                            </span>
                          ) : badgeError ? (
                            <span className="text-red-600">Failed to load badges</span>
                          ) : badges && badges.length === 0 ? (
                            <span className="text-orange-600">No badges available</span>
                          ) : badges && badges.length > 0 ? (
                            <span className="text-green-600 flex items-center">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              {badges.length} badges available
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    
                    {/* Range Preview */}
                    <div className="mt-3 p-3 bg-white rounded border">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          Score range: {rate.minRange || 0}% - {rate.maxRange || 100}%
                        </span>
                        {rate.badgeId && badges && badges.length > 0 && (
                          <span className="text-[#0AAC9E] font-medium">
                            Badge: {(() => {
                              const selectedBadge = badges.find(b => b.id === rate.badgeId);
                              return selectedBadge ? getBadgeName(selectedBadge) : 'Unknown Badge';
                            })()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <Award className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                <h3 className="text-sm font-medium text-gray-900 mb-1">No achievement ranges defined</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Add score ranges to automatically award badges based on completion performance
                </p>
                <button
                  onClick={handleAddSuccessionRate}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-[#0AAC9E] rounded-lg hover:bg-[#0AAC9E]/90 transition-colors mx-auto"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Range
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Success Message for Course Creation */}
      {currentCourse?.id && !isEditing && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-start">
            <CheckCircle className="w-6 h-6 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-green-800 mb-1">
                Course Created Successfully!
              </h4>
              <p className="text-sm text-green-700 mb-3">
                Your course "{currentCourse.name}" has been created. You can now proceed to add content and structure your course.
              </p>
              <div className="flex items-center gap-3">
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  Course ID: #{currentCourse.id}
                </span>
                <button
                  onClick={() => window.location.reload()}
                  className="text-sm text-green-700 hover:text-green-800 underline"
                >
                  Continue to next step
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Requirements Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-2">Course Creation Requirements</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li className="flex items-center">
                {isFormValid() ? (
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-blue-600 mr-2" />
                )}
                Complete all required fields: Name, Description, Category, Duration
              </li>
              <li className="flex items-center">
                <Info className="w-4 h-4 text-blue-600 mr-2" />
                Advanced settings and achievement badges are optional
              </li>
              <li className="flex items-center">
                <Info className="w-4 h-4 text-blue-600 mr-2" />
                You can update these settings anytime after course creation
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicInfoForm;