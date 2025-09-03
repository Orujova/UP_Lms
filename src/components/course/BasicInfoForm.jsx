'use client'
import React, { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { 
  X, 
  Clock, 
  Award, 
  Tag, 
  CheckCircle, 
  Loader2,
  BookOpen,
  Settings,
  Package,
  ChevronDown,
  Save,
  Plus,
  Trash2,
  ArrowRight,
  Bell ,
  Camera,
  Eye,
  Users,
  AlertTriangle,
  Info,
  Upload,
  FileImage
} from "lucide-react";
import {
  setFormData,
  setImagePreview,
  setImageFile,
  addSuccessionRate,
  updateSuccessionRate,
  removeSuccessionRate,
  createCourseAsync,
  updateCourseAsync,
  nextStep
} from "@/redux/course/courseSlice";
import { fetchCourseCategoriesAsync } from "@/redux/courseCategory/courseCategorySlice";
import { fetchCourseTagsAsync } from "@/redux/courseTag/courseTagSlice";
import { fetchCertificatesAsync } from "@/redux/certificate/certificateSlice";
import { fetchClustersAsync } from "@/redux/cluster/clusterSlice";
import { fetchBadgesAsync } from "@/redux/badge/badgeSlice";
import { getAllTargetGroupsAsync } from "@/redux/getAllTargetGroups/getAllTargetGroups";
import { getToken } from "@/authtoken/auth.js";
import SimpleRichTextEditor from "@/components/SimpleRichText";

const API_URL = "https://bravoadmin.uplms.org/api/";

const BasicInfoForm = ({ isEditing = false }) => {
  const dispatch = useDispatch();
  
  // Local state
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [showPreview, setShowPreview] = useState(false);
  const [imageUploadError, setImageUploadError] = useState(null);
  
  // Tab completion tracking
  const [completedTabs, setCompletedTabs] = useState(new Set());
  const [visitedTabs, setVisitedTabs] = useState(new Set(['basic']));
  
  // Persistent image state - survives tab changes
  const [persistentImagePreview, setPersistentImagePreview] = useState(null);
  const [persistentImageFile, setPersistentImageFile] = useState(null);
  const [defaultBrandingImage, setDefaultBrandingImage] = useState(null);

  // Target Group states
  const [targetGroupSearch, setTargetGroupSearch] = useState("");
  const [showTargetDropdown, setShowTargetDropdown] = useState(false);

  // Tag/Category creation states
  const [showCreateTag, setShowCreateTag] = useState(false);
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  // Redux selectors
  const { 
    formData = {},
    imagePreview,
    imageFile,
    error: courseError,
    currentCourse
  } = useSelector((state) => state.course || {});
  
  const { categories = [], loading: categoriesLoading } = useSelector((state) => state.courseCategory || {});
  const { tags = [], loading: tagsLoading } = useSelector((state) => state.courseTag || {});
  const { certificates = [], loading: certificatesLoading } = useSelector((state) => state.certificate || {});
  const { clusters = [], loading: clustersLoading } = useSelector((state) => state.cluster || {});
  const { badges = [], loading: badgesLoading } = useSelector((state) => state.badge || {});
  const { data: targetGroupsData } = useSelector((state) => state.getAllTargetGroups || {});

  const targetGroups = targetGroupsData?.[0]?.targetGroups || [];
  const selectedTargetGroups = targetGroups.filter(group => 
    (formData.targetGroupIds || []).includes(group.id)
  );

  // Track tab visits
  useEffect(() => {
    setVisitedTabs(prev => new Set([...prev, activeTab]));
  }, [activeTab]);

  // Track tab completion
  useEffect(() => {
    const newCompletedTabs = new Set(completedTabs);
    
    // Check if basic tab is complete
    if (isBasicFormValid()) {
      newCompletedTabs.add('basic');
    } else {
      newCompletedTabs.delete('basic');
    }
    
    // Check if settings tab is complete (requires visit and target groups)
    if (visitedTabs.has('settings') && (formData.targetGroupIds || []).length > 0) {
      newCompletedTabs.add('settings');
    } else {
      newCompletedTabs.delete('settings');
    }
    
    // Check if badges tab is complete
    if (formData.verifiedCertificate) {
      if (isBadgesTabValid() && visitedTabs.has('badges')) {
        newCompletedTabs.add('badges');
      } else {
        newCompletedTabs.delete('badges');
      }
    } else {
      // If verified certificates is disabled, badges tab is not required but mark as complete if visited
      if (visitedTabs.has('badges')) {
        newCompletedTabs.add('badges');
      }
    }
    
    if (newCompletedTabs.size !== completedTabs.size || 
        [...newCompletedTabs].some(tab => !completedTabs.has(tab))) {
      setCompletedTabs(newCompletedTabs);
    }
  }, [formData, visitedTabs, completedTabs]);

  // Get required tabs based on current form state
  const getRequiredTabs = () => {
    const required = ['basic', 'settings'];
    if (formData.verifiedCertificate) {
      required.push('badges');
    }
    return required;
  };

  // Check if all required tabs are completed
  const areAllRequiredTabsCompleted = () => {
    const requiredTabs = getRequiredTabs();
    return requiredTabs.every(tab => completedTabs.has(tab));
  };

  // Initialize image from Redux on mount
  useEffect(() => {
    if (imagePreview && !persistentImagePreview) {
      setPersistentImagePreview(imagePreview);
    }
    if (imageFile && !persistentImageFile) {
      setPersistentImageFile(imageFile);
    }
  }, [imagePreview, imageFile, persistentImagePreview, persistentImageFile]);

  // Transform image URL helper for branding images
  const transformImageUrl = (urlStr) => {
    if (!urlStr) return null;
   
    if (urlStr.includes("100.42.179.27:7198")) {
      const baseDir = urlStr.includes("brending/") ? "" : "brending/";
      const fileName = urlStr.split("/").pop();
      return `https://bravoadmin.uplms.org/uploads/brending/${baseDir}${fileName}`;
    }
   
    if (urlStr.startsWith("https://bravoadmin.uplms.org/uploads/brending/")) {
      return urlStr;
    }
   
    if (urlStr.startsWith("brending/")) {
      return `https://bravoadmin.uplms.org/uploads/${urlStr}`;
    }
   
    if (!urlStr.startsWith("http") && !urlStr.startsWith("https")) {
      const baseDir = urlStr.includes("brending/") ? "" : "brending/";
      const cleanPath = urlStr.replace(/^\/+/, "");
      return `https://bravoadmin.uplms.org/uploads/brending/${baseDir}${cleanPath}`;
    }
   
    return urlStr;
  };

  // Transform course image URL helper
  const transformCourseImageUrl = (urlStr) => {
    if (!urlStr) return null;

    if (urlStr.includes("100.42.179.27:7198")) {
      const fileName = urlStr.split("/").pop();
      return `https://bravoadmin.uplms.org/uploads/course/${fileName}`;
    }

    if (urlStr.startsWith("https://bravoadmin.uplms.org/uploads/course/")) {
      return urlStr;
    }

    if (urlStr.startsWith("course/")) {
      return `https://bravoadmin.uplms.org/uploads/${urlStr}`;
    }

    if (!urlStr.startsWith("http") && !urlStr.startsWith("https")) {
      const cleanPath = urlStr.replace(/^\/+/, "");
      return `https://bravoadmin.uplms.org/uploads/course/${cleanPath}`;
    }

    return urlStr;
  };

  // Initialize form data for editing
  useEffect(() => {
    if (isEditing && currentCourse) {
      // Populate form with existing course data
      dispatch(setFormData({
        name: currentCourse.name || "",
        description: currentCourse.description || "",
        duration: currentCourse.duration || 60,
        categoryId: currentCourse.courseCategoryId || "",
        verifiedCertificate: currentCourse.verifiedCertificate || false,
        imageFile: null,
        targetGroupIds: currentCourse.targetGroupIds || [],
        certificateId: currentCourse.courseCertificateId || null,
        tagIds: currentCourse.courseTags?.map(tag => tag.id) || [],
        startDuration: currentCourse.startDuration || null,
        expirationDate: currentCourse.expirationDate || null,
        hasNotification: currentCourse.hasNotification || null,
        deadline: currentCourse.deadLine || null,
        autoReassign: currentCourse.autoReassign || false,
        clusterId: currentCourse.clusterId || null,
        clusterOrderNumber: currentCourse.clusterOrderNumber || null,
        clusterCoefficient: currentCourse.clusterCoefficient || null,
        clusterIsMandatory: currentCourse.clusterIsMandatory || false,
        successionRates: currentCourse.successionRates || []
      }));

      // Handle existing course image
      if (currentCourse.imageUrl) {
        const transformedImageUrl = transformCourseImageUrl(currentCourse.imageUrl);
        setPersistentImagePreview(transformedImageUrl);
        dispatch(setImagePreview(transformedImageUrl));
      }
    } else if (!formData.name && !isEditing) {
      // Initialize empty form for new course
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
  }, [dispatch, isEditing, currentCourse, formData.name]);

  // Load required data and branding settings
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          dispatch(fetchCourseCategoriesAsync({ page: 1, take: 100 })),
          dispatch(fetchCourseTagsAsync({ page: 1, take: 100 })),
          dispatch(fetchCertificatesAsync({ page: 1, take: 100 })),
          dispatch(fetchClustersAsync({ page: 1, take: 100 })),
          dispatch(fetchBadgesAsync({ page: 1, take: 100 })),
          dispatch(getAllTargetGroupsAsync())
        ]);

        // Fetch branding settings for default course image
        const fetchBrandingSettings = async () => {
          try {
            const token = getToken();
            if (!token) {
              console.error("No authorization token found");
              return;
            }
      
            const response = await fetch(
              `${API_URL}BrendingSetting?IsCourse=true`,
              {
                method: "GET",
                headers: {
                  accept: "*/*",
                  Authorization: `Bearer ${token}`,
                },
              }
            );
      
            if (response.ok) {
              const data = await response.json();
              if (data && data.length > 0 && data[0].courseCoverPhotoUrl) {
                const transformedUrl = transformImageUrl(data[0].courseCoverPhotoUrl);
                setDefaultBrandingImage(transformedUrl);
              } else {
                console.warn("No course image URL found in branding settings");
              }
            } else {
              console.error("Failed to fetch branding settings:", response.status);
            }
          } catch (error) {
            console.error("Error fetching branding settings:", error);
          }
        };

        await fetchBrandingSettings();
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, [dispatch]);

  // Validation function
  const validateField = useCallback((field, value) => {
    switch (field) {
      case 'name':
        if (!value?.trim()) return "Course name is required";
        if (value.length < 3) return "Must be at least 3 characters";
        if (value.length > 100) return "Must be less than 100 characters";
        return "";
      
      case 'categoryId':
        if (!value) return "Please select a category";
        return "";
      case 'duration':
        if (!value || value < 1) return "Duration must be at least 1 minute";
        if (value > 10080) return "Duration cannot exceed 1 week";
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

  // Handler for the rich text editor
  const handleDescriptionChange = useCallback((editorData) => {
    handleInputChange('description', editorData);
  }, []);

  const handleMultipleSelect = (field, optionId) => {
    const currentValues = formData[field] || [];
    const newValues = currentValues.includes(optionId)
      ? currentValues.filter(id => id !== optionId)
      : [...currentValues, optionId];
    handleInputChange(field, newValues);
  };

  // Target Group handlers
  const handleTargetGroupSelect = (group) => {
    const currentIds = formData.targetGroupIds || [];
    const isSelected = currentIds.includes(group.id);
    
    if (isSelected) {
      handleInputChange('targetGroupIds', currentIds.filter(id => id !== group.id));
    } else {
      handleInputChange('targetGroupIds', [...currentIds, group.id]);
    }
  };

  const handleTargetGroupRemove = (group) => {
    const currentIds = formData.targetGroupIds || [];
    handleInputChange('targetGroupIds', currentIds.filter(id => id !== group.id));
  };

  // Create new tag handler
  const handleCreateNewTag = async () => {
    if (!newTagName.trim()) return;
    
    setIsCreatingTag(true);
    try {
      const response = await fetch(`${API_URL}CourseTag`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
          'accept': '*/*'
        },
        body: JSON.stringify({ name: newTagName.trim() })
      });

      if (response.ok) {
        const newTag = await response.json();
        // Refresh tags list
        await dispatch(fetchCourseTagsAsync({ page: 1, take: 100 }));
        // Auto-select the new tag
        if (newTag.id) {
          handleMultipleSelect('tagIds', newTag.id);
        }
        setNewTagName("");
        setShowCreateTag(false);
      } else {
        console.error('Failed to create tag:', response.status);
      }
    } catch (error) {
      console.error('Error creating tag:', error);
    } finally {
      setIsCreatingTag(false);
    }
  };

  // Create new category handler
  const handleCreateNewCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    setIsCreatingCategory(true);
    try {
      const response = await fetch(`${API_URL}CourseCategory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
          'accept': '*/*'
        },
        body: JSON.stringify({ name: newCategoryName.trim() })
      });

      if (response.ok) {
        const newCategory = await response.json();
        // Refresh categories list
        await dispatch(fetchCourseCategoriesAsync({ page: 1, take: 100 }));
        // Auto-select the new category
        if (newCategory.id) {
          handleInputChange('categoryId', newCategory.id);
        }
        setNewCategoryName("");
        setShowCreateCategory(false);
      } else {
        console.error('Failed to create category:', response.status);
      }
    } catch (error) {
      console.error('Error creating category:', error);
    } finally {
      setIsCreatingCategory(false);
    }
  };

  // Image upload handlers
  const handleImageUpload = useCallback((file) => {
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setImageUploadError('Please upload a valid image file');
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setImageUploadError('Image size must be less than 5MB');
      return;
    }

    setImageUploadError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target.result;
      setPersistentImagePreview(result);
      setPersistentImageFile(file);
      dispatch(setImagePreview(result));
      // Don't dispatch File object to Redux - keep only in local state
    };
    reader.readAsDataURL(file);
  }, [dispatch]);

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
  };

  const removeImage = () => {
    setPersistentImagePreview(null);
    setPersistentImageFile(null);
    dispatch(setImagePreview(null));
    // Don't dispatch null File object to Redux - keep only in local state
    setImageUploadError(null);
  };

  // Badge succession rate handlers
  const handleAddSuccessionRate = () => {
    dispatch(addSuccessionRate({ minRange: 0, maxRange: 100, badgeId: null }));
  };

  const handleUpdateSuccessionRate = (index, field, value) => {
    let processedValue = value;
    if (field === 'minRange' || field === 'maxRange') {
      processedValue = value === '' ? null : Math.max(0, Math.min(100, parseInt(value) || 0));
    } else if (field === 'badgeId') {
      processedValue = value === '' ? null : parseInt(value);
    }
    dispatch(updateSuccessionRate({ index, updates: { [field]: processedValue } }));
  };

  const handleRemoveSuccessionRate = (index) => {
    dispatch(removeSuccessionRate(index));
  };

  // Check if all required fields are filled for basic tab
  const isBasicFormValid = () => {
    const requiredFields = ['name', 'description', 'categoryId', 'duration'];
    return requiredFields.every(field => formData[field] && !validateField(field, formData[field]));
  };

  // Check if badges tab is properly configured (only if verified certificates is enabled)
  const isBadgesTabValid = () => {
    if (!formData.verifiedCertificate) return true; // Badges not required if no verified certificates
    
    // If verified certificates is enabled, check if succession rates are properly configured
    const rates = formData.successionRates || [];
    if (rates.length === 0) return false;
    
    return rates.every(rate => 
      rate.minRange !== null && 
      rate.maxRange !== null && 
      rate.minRange >= 0 && 
      rate.maxRange <= 100 && 
      rate.minRange < rate.maxRange &&
      rate.badgeId !== null
    );
  };

  // Overall form validation - now requires all tabs to be completed
  const isFormValid = () => {
    const basicValid = isBasicFormValid();
    const badgesValid = isBadgesTabValid();
    const allTabsCompleted = areAllRequiredTabsCompleted();
    return basicValid && badgesValid && allTabsCompleted;
  };

  // Save handlers
  const handleSaveOnly = async () => {
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
      let result;
      // Use persistent file from local state instead of Redux
      const formDataWithImage = {
        ...formData,
        imageFile: persistentImageFile
      };

      if (isEditing && currentCourse?.id) {
        result = await dispatch(updateCourseAsync({
          ...formDataWithImage,
          id: currentCourse.id
        })).unwrap();
      } else {
        result = await dispatch(createCourseAsync(formDataWithImage)).unwrap();
      }
      
      if (result?.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error saving course:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAndContinue = async () => {
  // First save the course
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
    let result;
    const formDataWithImage = {
      ...formData,
      imageFile: persistentImageFile
    };

    if (isEditing && currentCourse?.id) {
      result = await dispatch(updateCourseAsync({
        ...formDataWithImage,
        id: currentCourse.id
      })).unwrap();
    } else {
      result = await dispatch(createCourseAsync(formDataWithImage)).unwrap();
    }
    
    if (result?.success) {
      setSaveSuccess(true);
      
      // Navigate to course structure step after successful save
      setTimeout(() => {
        dispatch(nextStep()); // This will move to step 2 (Content Structure)
        setSaveSuccess(false);
      }, 1000);
    }
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

  // Enhanced Dropdown Component with search functionality
  const SmartDropdown = ({ 
    label, 
    value, 
    options, 
    onChange, 
    placeholder,
    loading,
    icon: Icon, 
    multiple = false,
    required = false,
    error,
    showSelected = true,
    allowCreate = false,
    createLabel = "Create New",
    onCreateNew = null
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    
    const selectedOptions = multiple 
      ? options.filter(opt => (value || []).includes(opt.id))
      : options.find(opt => opt.id === value);
    
    const filteredOptions = options.filter(option =>
      option.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const displayText = multiple
      ? selectedOptions.length > 0 
        ? showSelected ? selectedOptions.map(opt => opt.name).join(', ') : `${selectedOptions.length} selected`
        : placeholder
      : selectedOptions?.name || placeholder;

    const handleSelect = (optionId) => {
      if (multiple) {
        onChange(optionId);
      } else {
        // For single select, allow unselecting by clicking same option
        if (value === optionId) {
          onChange(''); // Unselect
        } else {
          onChange(optionId);
        }
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    const handleDropdownToggle = () => {
      if (!loading) {
        setIsOpen(!isOpen);
        if (!isOpen) {
          setSearchTerm("");
        }
      }
    };

    return (
      <div className="space-y-2">
        <label className="block text-xs font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        
        {/* Selected items for multiple select */}
        {multiple && showSelected && selectedOptions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedOptions.map((option) => (
              <span
                key={option.id}
                className="inline-flex items-center px-3 py-1 text-sm bg-[#0AAC9E]/10 text-[#0AAC9E] rounded border border-[#0AAC9E]/20 font-medium"
              >
                {option.name}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(option.id);
                  }}
                  className="ml-2 text-[#0AAC9E]/70 hover:text-[#0AAC9E] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </span>
            ))}
          </div>
        )}
        
        <div className="relative">
          <div
            onClick={handleDropdownToggle}
            className={`relative w-full px-4 py-2 text-sm border rounded-lg cursor-pointer focus:outline-none transition-all duration-200 bg-white flex items-center justify-between ${
              error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 hover:border-[#0AAC9E] focus:ring-[#0AAC9E] focus:border-[#0AAC9E]'
            } ${loading ? 'cursor-not-allowed opacity-50' : 'hover:shadow-sm'}`}
          >
            <div className="flex items-center">
              {Icon && <Icon className="w-4 h-5 mr-3 text-gray-400" />}
              <span className={!value || (multiple && value.length === 0) ? 'text-gray-500' : 'text-gray-900'}>
                {loading ? 'Loading...' : displayText}
              </span>
            </div>
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </div>
          
          {isOpen && !loading && (
            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-hidden">
              {/* Search input */}
              <div className="p-3 border-b border-gray-200">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={`Search ${label.toLowerCase()}...`}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0AAC9E]"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              
              {/* Options list */}
              <div className="max-h-40 overflow-y-auto">
                {/* Create new option */}
                {allowCreate && onCreateNew && (
                  <div
                    onClick={() => {
                      onCreateNew();
                      setIsOpen(false);
                      setSearchTerm("");
                    }}
                    className="px-4 py-3 text-sm cursor-pointer hover:bg-[#0AAC9E]/10 transition-colors border-b border-gray-200 flex items-center text-[#0AAC9E] font-medium"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {createLabel}
                  </div>
                )}
                
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option) => {
                    const isSelected = multiple 
                      ? (value || []).includes(option.id)
                      : value === option.id;
                    
                    return (
                      <div
                        key={option.id}
                        onClick={() => handleSelect(option.id)}
                        className={`px-4 py-2 text-xs cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 flex items-center justify-between ${
                          isSelected ? 'bg-[#0AAC9E]/10 text-[#0AAC9E] font-medium' : 'text-gray-900'
                        }`}
                      >
                        <span>{option.name}</span>
                        {isSelected && <CheckCircle className="w-4 h-4 text-[#0AAC9E]" />}
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    {searchTerm ? 'No results found' : 'No options available'}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {error && (
          <p className="text-sm text-red-600 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-1" />
            {error}
          </p>
        )}
      </div>
    );
  };

  // Target Group Selector Component
  const TargetGroupSelector = () => {
    const [isOpen, setIsOpen] = useState(showTargetDropdown);
    
    const filteredGroups = targetGroups.filter(group => 
      group.name.toLowerCase().includes(targetGroupSearch.toLowerCase())
    );

    return (
      <div className="space-y-2">
        <label className="block text-xs font-medium text-gray-700">
          Target Groups <span className="text-red-500">*</span>
        </label>
        
        {/* Selected items */}
        {selectedTargetGroups.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedTargetGroups.map((group) => (
              <span
                key={group.id}
                className="inline-flex items-center px-3 py-1 text-sm bg-[#0AAC9E]/10 text-[#0AAC9E] rounded border border-[#0AAC9E]/20 font-medium"
              >
                {group.name}
                <button
                  onClick={() => handleTargetGroupRemove(group)}
                  className="ml-2 text-[#0AAC9E]/70 hover:text-[#0AAC9E] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </span>
            ))}
          </div>
        )}
        
        <div className="relative">
          <div
            onClick={() => setIsOpen(!isOpen)}
            className="relative w-full px-4 py-2 text-sm border rounded-lg cursor-pointer focus:outline-none transition-all duration-200 bg-white flex items-center justify-between border-gray-300 hover:border-[#0AAC9E] hover:shadow-sm"
          >
            <div className="flex items-center">
              <Users className="w-4 h-5 mr-3 text-gray-400" />
              <span className="text-gray-500">
                {selectedTargetGroups.length > 0 
                  ? `${selectedTargetGroups.length} selected`
                  : 'Select target groups'
                }
              </span>
            </div>
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </div>
          
          {isOpen && (
            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-hidden">
              {/* Search input */}
              <div className="p-3 border-b border-gray-200">
                <input
                  type="text"
                  value={targetGroupSearch}
                  onChange={(e) => setTargetGroupSearch(e.target.value)}
                  placeholder="Search target groups..."
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0AAC9E]"
                />
              </div>
              
              {/* Options list */}
              <div className="max-h-40 overflow-y-auto">
                {filteredGroups.length > 0 ? (
                  filteredGroups.map((group) => {
                    const isSelected = (formData.targetGroupIds || []).includes(group.id);
                    
                    return (
                      <div
                        key={group.id}
                        onClick={() => handleTargetGroupSelect(group)}
                        className={`px-4 py-3 text-xs cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 flex items-center justify-between ${
                          isSelected ? 'bg-[#0AAC9E]/10 text-[#0AAC9E] font-medium' : 'text-gray-900'
                        }`}
                      >
                        <span>{group.name}</span>
                        {isSelected && <CheckCircle className="w-4 h-4 text-[#0AAC9E]" />}
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    No target groups found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const tabs = [
    { 
      id: 'basic', 
      label: 'Basic Info', 
      icon: BookOpen,
      required: true
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: Settings,
      required: true
    },
    { 
      id: 'badges', 
      label: 'Badges', 
      icon: Award,
      required: formData.verifiedCertificate
    }
  ];

  return (
    <div className="p-4">
      {/* Status Messages */}
      {courseError && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex">
            <AlertTriangle className="w-4 h-4 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-1 text-sm text-red-700">{courseError}</div>
            </div>
          </div>
        </div>
      )}

      {saveSuccess && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex">
            <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-green-800">Success</h3>
              <div className="mt-1 text-sm text-green-700">Course saved successfully</div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-4">
        <nav className="-mb-px flex space-x-6">
          {tabs.map(tab => {
            const isCompleted = completedTabs.has(tab.id);
            const isRequired = tab.required;
            const isActive = activeTab === tab.id;
            const isVisited = visitedTabs.has(tab.id);
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center transition-colors relative ${
                  isActive
                    ? 'border-[#0AAC9E] text-[#0AAC9E]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div><tab.icon className="w-4 h-4 mr-1.5" /></div>
                {tab.label}
                
                {/* Required indicator */}
                {isRequired && (
                  <span className="ml-1 text-red-500">*</span>
                )}
                
                {/* Completion indicator */}
               <div>{isCompleted && (
                  <CheckCircle className="w-3 h-3 ml-1 text-green-500" />
                )}</div> 
                
                {/* Warning indicator for required incomplete tabs */}
               <div>{isRequired && isVisited && !isCompleted && (
                  <AlertTriangle className="w-3 h-3 ml-1 text-orange-500" />
                )}</div> 
              </button>
            );
          })}
        </nav>
      </div>

      {/* Basic Information Tab */}
      {activeTab === 'basic' && (
        <div className="grid grid-cols-12 gap-3">
          {/* Course Details - 8 columns */}
          <div className="col-span-8 space-y-3">
            {/* Course Name */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Course Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter course name"
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0AAC9E] transition-all ${
                  errors.name && touched.name ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              <div className="flex items-center justify-between mt-1">
                {errors.name && touched.name && (
                  <p className="text-xs text-red-600 flex items-center">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {errors.name}
                  </p>
                )}
                <p className={`text-xs ml-auto ${
                  (formData.name?.length || 0) > 80 ? 'text-red-500' : 'text-gray-500'
                }`}>
                  {formData.name?.length || 0}/100
                </p>
              </div>
            </div>

            {/* Category and Duration */}
            <div className="grid grid-cols-2 gap-3 mb-2">
              <SmartDropdown
                label="Category"
                value={formData.categoryId}
                options={categories}
                onChange={(categoryId) => handleInputChange('categoryId', categoryId)}
                placeholder="Select category"
                loading={categoriesLoading}
                icon={Settings}
                required={true}
                error={errors.categoryId && touched.categoryId ? errors.categoryId : null}
                allowCreate={true}
                createLabel="Create New Category"
                onCreateNew={() => setShowCreateCategory(true)}
              />

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Duration <span className="text-red-500">*</span>
                </label>
                <div className="flex">
                  <input
                    type="number"
                    min="1"
                    max="10080"
                    value={formData.duration || ''}
                    onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || '')}
                    placeholder="60"
                    className={`flex-1 px-3 py-2 text-sm border rounded-l-lg focus:outline-none focus:ring-1 focus:ring-[#0AAC9E] transition-all ${
                      errors.duration && touched.duration ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  <div className="px-3 py-2 bg-[#0AAC9E]/10 border border-l-0 border-[#0AAC9E]/20 rounded-r-lg text-xs text-[#0AAC9E] flex items-center font-medium">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatDuration(formData.duration) || '0m'}
                  </div>
                </div>
                {errors.duration && touched.duration && (
                  <p className="mt-1 text-xs text-red-600 flex items-center">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {errors.duration}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Course Image - 4 columns */}
          <div className="col-span-4">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Course Image
            </label>
            
            {persistentImagePreview ? (
              <div className="relative group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <img
                  src={persistentImagePreview}
                  alt="Course preview"
                  className="w-full h-32 object-cover rounded-lg border border-gray-200 cursor-pointer transition-all group-hover:shadow-md"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all rounded-lg flex items-center justify-center">
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowPreview(true);
                      }}
                      className="p-2 bg-white/80 rounded-lg hover:bg-white transition-all"
                    >
                      <Eye className="w-4 h-4 text-gray-700" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage();
                      }}
                      className="p-2 bg-red-500/80 rounded-lg hover:bg-red-500 transition-all"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            ) : defaultBrandingImage ? (
              <div className="relative group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <img
                  src={defaultBrandingImage}
                  alt="Default course image"
                  className="w-full h-32 object-cover rounded-lg border border-gray-200 cursor-pointer transition-all group-hover:shadow-md opacity-75"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all rounded-lg flex items-center justify-center">
                  <div className="flex flex-col items-center text-white text-center">
                    <Upload className="w-6 h-6 mb-1" />
                    <p className="text-xs font-medium">Upload Image</p>
                    <p className="text-xs opacity-80">or keep default</p>
                  </div>
                </div>
                <div className="absolute top-2 right-2 bg-blue-500/80 px-2 py-1 rounded text-xs text-white font-medium">
                  Default
                </div>
              </div>
            ) : (
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center transition-all cursor-pointer hover:border-[#0AAC9E] hover:bg-[#0AAC9E]/5 group h-32 flex flex-col justify-center"
                onClick={() => document.getElementById('image-upload')?.click()}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                  className="hidden"
                  id="image-upload"
                />
                <Camera className="w-6 h-6 text-gray-400 mx-auto mb-1 group-hover:text-[#0AAC9E]" />
                <p className="text-xs font-medium text-gray-900 mb-1">Add Image</p>
                <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
              </div>
            )}
            
            {imageUploadError && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs text-red-600 flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {imageUploadError}
                </p>
              </div>
            )}
          </div>

          {/* Description with Simple Rich Text Editor - Full Width */}
          <div className="col-span-12 mt-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <div className={`transition-all ${
              errors.description && touched.description ? 'ring-1 ring-red-300 rounded-lg' : ''
            }`}>
              <SimpleRichTextEditor
                value={formData.description || ''}
                onChange={handleDescriptionChange}
                placeholder="Describe what students will learn in this course..."
                minHeight={150}
                readOnly={false}
              />
            </div>
            {errors.description && touched.description && (
              <p className="mt-1 text-xs text-red-600 flex items-center">
                <AlertTriangle className="w-3 h-3 mr-1" />
                {errors.description}
              </p>
            )}
          </div>
        </div>
      )}

     
{/* Settings Tab */}
{activeTab === 'settings' && (
  <div className="space-y-6">
    {/* Main settings in 2 columns */}
    <div className="grid grid-cols-2 gap-6">
      {/* Left Column */}
      <div className="space-y-4">
        <TargetGroupSelector />

        <SmartDropdown
          label="Tags"
          value={formData.tagIds}
          options={tags}
          onChange={(tagId) => handleMultipleSelect('tagIds', tagId)}
          placeholder="Select tags"
          loading={tagsLoading}
          icon={Tag}
          multiple={true}
          allowCreate={true}
          createLabel="Create New Tag"
          onCreateNew={() => setShowCreateTag(true)}
        />

        <SmartDropdown
          label="Certificate"
          value={formData.certificateId}
          options={certificates}
          onChange={(certificateId) => handleInputChange('certificateId', certificateId)}
          placeholder="No certificate"
          loading={certificatesLoading}
          icon={Award}
        />

        <SmartDropdown
          label="Assign to Cluster"
          value={formData.clusterId}
          options={clusters.map(cluster => ({ id: cluster.id, name: cluster.subject }))}
          onChange={(clusterId) => handleInputChange('clusterId', clusterId)}
          placeholder="No cluster"
          loading={clustersLoading}
          icon={Package}
        />
      </div>

      {/* Right Column */}
      <div className="space-y-4">
        {/* Duration fields in a grid */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Start Duration (days)
            </label>
            <input
              type="number"
              value={formData.startDuration || ''}
              onChange={(e) => handleInputChange('startDuration', e.target.value ? parseInt(e.target.value) : null)}
              placeholder="0"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0AAC9E]"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Deadline (days)
            </label>
            <input
              type="number"
              value={formData.deadline || ''}
              onChange={(e) => handleInputChange('deadline', e.target.value ? parseInt(e.target.value) : null)}
              placeholder="30"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0AAC9E]"
            />
          </div>
        </div>

        {/* NEW FIELD: Expiration Date */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Expiration Date (days)
          </label>
          <input
            type="number"
            value={formData.expirationDate || ''}
            onChange={(e) => handleInputChange('expirationDate', e.target.value ? parseInt(e.target.value) : null)}
            placeholder="365"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0AAC9E]"
          />
          <p className="text-xs text-gray-500 mt-1">
            Days after which the course expires for learners
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg px-4 py-2 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center">
                <ArrowRight className="w-4 h-5 text-[#0AAC9E] mr-2" />
                <label className="text-sm font-medium text-gray-900">Auto reassign on target group changes</label>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Automatically reassign course when target groups update
              </p>
            </div>
            <input
              type="checkbox"
              checked={formData.autoReassign || false}
              onChange={(e) => handleInputChange('autoReassign', e.target.checked)}
              className="h-4 w-4 text-[#0AAC9E] border-gray-300 rounded focus:ring-[#0AAC9E]"
            />
          </div>
        </div>

        {/* NEW FIELD: Has Notification */}
        <div className="bg-gray-50 rounded-lg px-4 py-2 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center">
                <Bell className="w-4 h-5 text-[#0AAC9E] mr-2" />
                <label className="text-sm font-medium text-gray-900">Enable notifications</label>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Send notifications to learners about this course
              </p>
            </div>
            <input
              type="checkbox"
              checked={formData.hasNotification || false}
              onChange={(e) => handleInputChange('hasNotification', e.target.checked)}
              className="h-4 w-4 text-[#0AAC9E] border-gray-300 rounded focus:ring-[#0AAC9E]"
            />
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg px-4 py-2 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-5 text-[#0AAC9E] mr-3" />
                <label className="text-sm font-medium text-gray-900">Verified certificates</label>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Require verification for certificates
              </p>
            </div>
            <input
              type="checkbox"
              checked={formData.verifiedCertificate || false}
              onChange={(e) => handleInputChange('verifiedCertificate', e.target.checked)}
              className="h-4 w-4 text-[#0AAC9E] border-gray-300 rounded focus:ring-[#0AAC9E]"
            />
          </div>
        </div>
      </div>
    </div>

    {/* Cluster Configuration - Full Width when active */}
    {formData.clusterId && (
      <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200 space-y-3">
        <div className="flex items-center mb-3">
          <Info className="w-4 h-5 text-[#0AAC9E] mr-2" />
          <h4 className="text-sm font-medium text-gray-900">Cluster Configuration</h4>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Order in Cluster
            </label>
            <input
              type="number"
              min="1"
              value={formData.clusterOrderNumber || ''}
              onChange={(e) => handleInputChange('clusterOrderNumber', parseInt(e.target.value) || null)}
              placeholder="1"
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0AAC9E]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Coefficient
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
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0AAC9E]"
            />
          </div>

          <div className="bg-white rounded-lg px-3 py-2 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center">
                  <AlertTriangle className="w-4 h-5 text-orange-500 mr-2" />
                  <label className="text-xs font-medium text-gray-900">Required in cluster</label>
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.clusterIsMandatory || false}
                onChange={(e) => handleInputChange('clusterIsMandatory', e.target.checked)}
                className="h-4 w-4 text-[#0AAC9E] border-gray-300 rounded focus:ring-[#0AAC9E]"
              />
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
)}

      {/* Badges Tab */}
      {activeTab === 'badges' && (
        <div className="space-y-4">
          {formData.verifiedCertificate ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center mb-1">
                    <Award className="w-5 h-5 text-[#0AAC9E] mr-2" />
                    <h3 className="text-base font-medium text-gray-900">Achievement Badges</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Set score ranges to award badges based on performance
                  </p>
                </div>
                <button
                  onClick={handleAddSuccessionRate}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-[#0AAC9E] rounded-lg hover:bg-[#0AAC9E]/90"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Range
                </button>
              </div>

              {formData.successionRates && formData.successionRates.length > 0 ? (
                <div className="space-y-3">
                  {formData.successionRates.map((rate, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="w-6 h-6 bg-[#0AAC9E]/10 rounded flex items-center justify-center mr-2">
                            <span className="text-sm font-bold text-[#0AAC9E]">{index + 1}</span>
                          </div>
                          <h4 className="text-sm font-medium text-gray-900">
                            Range #{index + 1}
                          </h4>
                        </div>
                        <button
                          onClick={() => handleRemoveSuccessionRate(index)}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Min Score (%)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={rate.minRange === null || rate.minRange === undefined ? '' : rate.minRange}
                            onChange={(e) => handleUpdateSuccessionRate(index, 'minRange', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0AAC9E]"
                            placeholder="0"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Max Score (%)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={rate.maxRange === null || rate.maxRange === undefined ? '' : rate.maxRange}
                            onChange={(e) => handleUpdateSuccessionRate(index, 'maxRange', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0AAC9E]"
                            placeholder="100"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Badge
                          </label>
                          <select
                            value={rate.badgeId || ''}
                            onChange={(e) => handleUpdateSuccessionRate(index, 'badgeId', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0AAC9E]"
                            disabled={badgesLoading}
                          >
                            <option value="">No badge</option>
                            {badges && badges.length > 0 ? (
                              badges.map((badge) => (
                                <option key={badge.id} value={badge.id}>
                                  {badge.badgeName || badge.name || 'Unknown Badge'}
                                </option>
                              ))
                            ) : (
                              <option disabled>
                                {badgesLoading ? 'Loading...' : 'No badges available'}
                              </option>
                            )}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-white">
                  <Award className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-base font-medium text-gray-900 mb-1">No badge ranges yet</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Add score ranges to award badges automatically
                  </p>
                  <button
                    onClick={handleAddSuccessionRate}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#0AAC9E] rounded-lg hover:bg-[#0AAC9E]/90"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add First Range
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
              <Award className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <h3 className="text-base font-medium text-gray-900 mb-2">Badge ranges require verified certificates</h3>
              <p className="text-sm text-gray-600 mb-4">
                Enable "Verified certificates" in the Settings tab to configure achievement badges
              </p>
              <button
                onClick={() => setActiveTab('settings')}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-[#0AAC9E] bg-[#0AAC9E]/10 rounded-lg hover:bg-[#0AAC9E]/20"
              >
                <Settings className="w-4 h-4 mr-1" />
                Go to Settings
              </button>
            </div>
          )}
        </div>
      )}

      {/* Save Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-6">
        <div className="flex items-center">
          {areAllRequiredTabsCompleted() && isFormValid() ? (
            <div className="flex items-center text-green-600">
              <CheckCircle className="w-4 h-5 mr-2" />
              <div>
                <span className="text-xs font-medium">Ready to continue</span>
                <p className="text-xs text-green-500">All required tabs completed</p>
              </div>
            </div>
          ) : isBasicFormValid() ? (
            <div className="flex items-center text-blue-600">
              <Info className="w-5 h-5 mr-2" />
              <div>
                <span className="text-sm font-medium">Basic info complete</span>
                <p className="text-sm text-blue-500">
                  {!visitedTabs.has('settings') ? 'Visit Settings tab to continue' :
                   !completedTabs.has('settings') ? 'Complete Settings tab (select target groups)' :
                   formData.verifiedCertificate && !visitedTabs.has('badges') ? 'Visit Badges tab to continue' :
                   formData.verifiedCertificate && !isBadgesTabValid() ? 'Configure badge ranges to continue' :
                   'Ready to save'}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center text-orange-600">
              <AlertTriangle className="w-4 h-5 mr-2" />
              <div>
                <span className="text-xs font-medium">Complete required fields</span>
             
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleSaveOnly}
            disabled={!isBasicFormValid() || isSaving}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Draft
          </button>

          <button
            onClick={handleSaveAndContinue}
            disabled={!areAllRequiredTabsCompleted() || !isFormValid() || isSaving}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-[#0AAC9E] rounded-lg hover:bg-[#0AAC9E]/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                {isEditing ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-1" />
                Save & Continue
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Create New Tag Modal */}
      {showCreateTag && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Create New Tag</h3>
              <button
                onClick={() => {
                  setShowCreateTag(false);
                  setNewTagName("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tag Name
                </label>
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="Enter tag name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0AAC9E]"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateNewTag();
                    }
                  }}
                />
              </div>
              
              <div className="flex items-center space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowCreateTag(false);
                    setNewTagName("");
                  }}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateNewTag}
                  disabled={!newTagName.trim() || isCreatingTag}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#0AAC9E] rounded-lg hover:bg-[#0AAC9E]/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isCreatingTag ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Tag'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create New Category Modal */}
      {showCreateCategory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Create New Category</h3>
              <button
                onClick={() => {
                  setShowCreateCategory(false);
                  setNewCategoryName("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Enter category name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0AAC9E]"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateNewCategory();
                    }
                  }}
                />
              </div>
              
              <div className="flex items-center space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowCreateCategory(false);
                    setNewCategoryName("");
                  }}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateNewCategory}
                  disabled={!newCategoryName.trim() || isCreatingCategory}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#0AAC9E] rounded-lg hover:bg-[#0AAC9E]/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isCreatingCategory ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Category'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && persistentImagePreview && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowPreview(false)}>
          <div className="relative max-w-3xl max-h-full">
            <img 
              src={persistentImagePreview} 
              alt="Course preview" 
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white rounded-full"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BasicInfoForm;