'use client'
import React, { useEffect, useState, useCallback, useRef } from "react";
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
  Bell,
  Camera,
  Eye,
  Users,
  AlertTriangle,
  Info,
  Upload,
  FileImage,
  TrendingUp,
  Calendar,
  Briefcase
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
  nextStep,
  fetchDistinctCourseNamesAsync,
  fetchCoursePositionsInfoAsync,
  selectAvailableCourseNames,
  selectSelectedCoursePositionsInfo,
  selectCourseNamesLoading,
  selectPositionsInfoLoading
} from "@/redux/course/courseSlice";
import dynamic from "next/dynamic";
import { fetchCourseCategoriesAsync } from "@/redux/courseCategory/courseCategorySlice";
import { fetchCourseTagsAsync } from "@/redux/courseTag/courseTagSlice";
import { fetchCertificatesAsync } from "@/redux/certificate/certificateSlice";
import { fetchClustersAsync } from "@/redux/cluster/clusterSlice";
import { fetchBadgesAsync } from "@/redux/badge/badgeSlice";
import { getToken } from "@/authtoken/auth.js";

const PageTextComponent = dynamic(
  () => import("@/components/pageTextComponent"),
  {
    ssr: false,
    loading: () => (
      <div className="border rounded p-4 min-h-[300px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-t-emerald-500 border-b-emerald-700 rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-gray-600 text-sm">Loading editor...</p>
        </div>
      </div>
    ),
  }
);

import { getUserId } from "@/authtoken/auth.js";
const API_URL = "https://demoadmin.databyte.app/api/";

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
  
  // Persistent image state
  const [persistentImagePreview, setPersistentImagePreview] = useState(null);
  const [persistentImageFile, setPersistentImageFile] = useState(null);
  const [defaultBrandingImage, setDefaultBrandingImage] = useState(null);

  // Course name search state
  const [courseNameSearch, setCourseNameSearch] = useState("");
  const [showCourseNameDropdown, setShowCourseNameDropdown] = useState(false);
  const courseNameRef = useRef(null);

  // Tag/Category creation states
  const [showCreateTag, setShowCreateTag] = useState(false);
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [showOptionalSettings, setShowOptionalSettings] = useState(false);
  // Refs for outside click detection
  const categoryDropdownRef = useRef(null);
  const tagsDropdownRef = useRef(null);
  const certificateDropdownRef = useRef(null);
  const clusterDropdownRef = useRef(null);

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
  
  // Position-Course selectors
  const availableCourseNames = useSelector(selectAvailableCourseNames);
  const coursePositionsInfo = useSelector(selectSelectedCoursePositionsInfo);
  const courseNamesLoading = useSelector(selectCourseNamesLoading);
  const positionsInfoLoading = useSelector(selectPositionsInfoLoading);

  // Outside click handler for course name dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (courseNameRef.current && !courseNameRef.current.contains(event.target)) {
        setShowCourseNameDropdown(false);
      }
    };

    if (showCourseNameDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showCourseNameDropdown]);

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
    
    // Settings tab is now optional
    if (visitedTabs.has('settings')) {
      newCompletedTabs.add('settings');
    }
    
    // Check if badges tab is complete
    if (formData.verifiedCertificate) {
      if (isEditing) {
        if (isBadgesTabValid()) {
          newCompletedTabs.add('badges');
        } else {
          newCompletedTabs.delete('badges');
        }
      } else {
        if (isBadgesTabValid() && visitedTabs.has('badges')) {
          newCompletedTabs.add('badges');
        } else {
          newCompletedTabs.delete('badges');
        }
      }
    } else {
      if (isEditing || visitedTabs.has('badges')) {
        newCompletedTabs.add('badges');
      }
    }
    
    if (newCompletedTabs.size !== completedTabs.size || 
        [...newCompletedTabs].some(tab => !completedTabs.has(tab))) {
      setCompletedTabs(newCompletedTabs);
    }
  }, [formData, visitedTabs, completedTabs, isEditing]);

  // Load course names on mount
  useEffect(() => {
    dispatch(fetchDistinctCourseNamesAsync());
  }, [dispatch]);

  // Fetch positions info when course name is selected
  useEffect(() => {
    if (formData.name && availableCourseNames.includes(formData.name)) {
      dispatch(fetchCoursePositionsInfoAsync({ courseName: formData.name }));
    }
  }, [formData.name, dispatch, availableCourseNames]);

  // Initialize form data for editing
  useEffect(() => {
    if (isEditing && currentCourse && Object.keys(currentCourse).length > 0) {
      console.log('EDITING MODE: Current course data:', currentCourse);
      
      if (currentCourse.success === true && currentCourse.message && 
          (!currentCourse.id && !currentCourse.name)) {
        console.log('Update success message received, preserving form data');
        return;
      }
      
      if (currentCourse.success === false) {
        console.warn('Course fetch failed:', currentCourse.message);
        return;
      }
      
      if (!currentCourse.id && !currentCourse.name && !currentCourse.description) {
        console.warn('Invalid course data received, skipping form reset');
        return;
      }
      
      if (formData.id === currentCourse.id && formData.name && formData.name === currentCourse.name) {
        console.log('Form data already initialized for this course, skipping...');
        return;
      }
      
      let clusterId = null;
      let clusterOrderNumber = null;
      let clusterCoefficient = null;

      if (currentCourse.clusters && Array.isArray(currentCourse.clusters) && currentCourse.clusters.length > 0) {
        const cluster = currentCourse.clusters[0];
        clusterId = cluster.id || null;
        
        if (cluster.hasOwnProperty('orderNumber')) {
          clusterOrderNumber = Number(cluster.orderNumber);
        } else if (cluster.hasOwnProperty('clusterOrderNumber')) {
          clusterOrderNumber = Number(cluster.clusterOrderNumber);
        }
        
        if (cluster.hasOwnProperty('coefficient')) {
          clusterCoefficient = Number(cluster.coefficient);
        } else if (cluster.hasOwnProperty('clusterCoefficient')) {
          clusterCoefficient = Number(cluster.clusterCoefficient);
        }
      }
      
      const comprehensiveFormData = {
        id: currentCourse.id,
        courseId: currentCourse.id,
        name: currentCourse.name || "",
        description: currentCourse.description || "",
        aboutCourse: currentCourse.aboutCourse || "",
        duration: currentCourse.duration || 60,
        categoryId: currentCourse.courseCategoryId || currentCourse.categoryId || "",
        verifiedCertificate: Boolean(currentCourse.verifiedCertificate),
        certificateId: currentCourse.courseCertificateId || currentCourse.certificateId || null,
        tagIds: currentCourse.courseTags?.map(tag => tag.id) || currentCourse.tagIds || [],
        startDuration: currentCourse.startDuration,
        deadline: currentCourse.deadLine !== undefined ? currentCourse.deadLine : currentCourse.deadline,
        expirationDate: currentCourse.expirationDate,
        hasNotification: Boolean(currentCourse.hasNotification),
        isPromoted: Boolean(currentCourse.isPromoted),
        publishCourse: Boolean(currentCourse.publishCourse),
        autoReassign: Boolean(currentCourse.autoReassign),
        clusterId: clusterId,
        clusterOrderNumber: clusterOrderNumber,
        clusterCoefficient: clusterCoefficient,
        successionRates: (currentCourse.successionRates || []).map(rate => ({
          minRange: rate.minRange,
          maxRange: rate.maxRange,
          badgeId: rate.badgeId
        })),
        imageFile: null,
      };
      
      console.log('Setting comprehensive form data:', comprehensiveFormData);
      dispatch(setFormData(comprehensiveFormData));

      if (currentCourse.imageUrl) {
        const transformedImageUrl = transformCourseImageUrl(currentCourse.imageUrl);
        setPersistentImagePreview(transformedImageUrl);
        dispatch(setImagePreview(transformedImageUrl));
      }
    }
  }, [dispatch, isEditing, currentCourse, formData.id]);

  // Transform image URL helpers
  const transformImageUrl = (urlStr) => {
    if (!urlStr) return null;
   
    if (urlStr.includes("100.42.179.27:7198")) {
      const baseDir = urlStr.includes("brending/") ? "" : "brending/";
      const fileName = urlStr.split("/").pop();
      return `https://demoadmin.databyte.app/uploads/brending/${baseDir}${fileName}`;
    }
   
    if (urlStr.startsWith("https://demoadmin.databyte.app/uploads/brending/")) {
      return urlStr;
    }
   
    if (urlStr.startsWith("brending/")) {
      return `https://demoadmin.databyte.app/uploads/${urlStr}`;
    }
   
    if (!urlStr.startsWith("http") && !urlStr.startsWith("https")) {
      const baseDir = urlStr.includes("brending/") ? "" : "brending/";
      const cleanPath = urlStr.replace(/^\/+/, "");
      return `https://demoadmin.databyte.app/uploads/brending/${baseDir}${cleanPath}`;
    }
   
    return urlStr;
  };

  const transformCourseImageUrl = (urlStr) => {
    if (!urlStr) return null;

    if (urlStr.includes("100.42.179.27:7198")) {
      const fileName = urlStr.split("/").pop();
      return `https://demoadmin.databyte.app/uploads/course/${fileName}`;
    }

    if (urlStr.startsWith("https://demoadmin.databyte.app/uploads/course/")) {
      return urlStr;
    }

    if (urlStr.startsWith("course/")) {
      return `https://demoadmin.databyte.app/uploads/${urlStr}`;
    }

    if (!urlStr.startsWith("http") && !urlStr.startsWith("https")) {
      const cleanPath = urlStr.replace(/^\/+/, "");
      return `https://demoadmin.databyte.app/uploads/course/${cleanPath}`;
    }

    return urlStr;
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

  // Load required data and branding settings
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          dispatch(fetchCourseCategoriesAsync({ page: 1, take: 100 })),
          dispatch(fetchCourseTagsAsync({ page: 1, take: 100 })),
          dispatch(fetchCertificatesAsync({ page: 1, take: 100 })),
          dispatch(fetchClustersAsync({ page: 1, take: 100 })),
          dispatch(fetchBadgesAsync({ page: 1, take: 100 }))
        ]);

        const fetchBrandingSettings = async () => {
          try {
            const token = getToken();
            if (!token) return;
      
            const response = await fetch(`${API_URL}BrendingSetting?IsCourse=true`, {
              method: "GET",
              headers: {
                accept: "*/*",
                Authorization: `Bearer ${token}`,
              },
            });
      
            if (response.ok) {
              const data = await response.json();
              if (data && data.length > 0 && data[0].courseCoverPhotoUrl) {
                const transformedUrl = transformImageUrl(data[0].courseCoverPhotoUrl);
                setDefaultBrandingImage(transformedUrl);
              }
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
        
      case 'description':
        if (!value?.trim()) return "Description is required";
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

  const handleAboutCourseChange = useCallback((editorData) => {
    handleInputChange('aboutCourse', editorData);
  }, []);

  const handleMultipleSelect = (field, optionId) => {
    const currentValues = formData[field] || [];
    const newValues = currentValues.includes(optionId)
      ? currentValues.filter(id => id !== optionId)
      : [...currentValues, optionId];
    handleInputChange(field, newValues);
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
        await dispatch(fetchCourseTagsAsync({ page: 1, take: 100 }));
        if (newTag.id) {
          handleMultipleSelect('tagIds', newTag.id);
        }
        setNewTagName("");
        setShowCreateTag(false);
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
        await dispatch(fetchCourseCategoriesAsync({ page: 1, take: 100 }));
        if (newCategory.id) {
          handleInputChange('categoryId', newCategory.id);
        }
        setNewCategoryName("");
        setShowCreateCategory(false);
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

  // Check if badges tab is properly configured
  const isBadgesTabValid = () => {
    if (!formData.verifiedCertificate) return true;
    
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

  // Get required tabs based on current form state
  const getRequiredTabs = () => {
    const required = ['basic'];
    if (formData.verifiedCertificate) {
      required.push('badges');
    }
    return required;
  };

  // Check if all required tabs are completed
  const areAllRequiredTabsCompleted = () => {
    const requiredTabs = getRequiredTabs();
    
    if (isEditing) {
      const basicComplete = isBasicFormValid();
      const badgesComplete = formData.verifiedCertificate ? isBadgesTabValid() : true;
      return basicComplete && badgesComplete;
    } else {
      return requiredTabs.every(tab => completedTabs.has(tab));
    }
  };

  // Overall form validation
  const isFormValid = () => {
    const basicValid = isBasicFormValid();
    const badgesValid = isBadgesTabValid();
    const allTabsCompleted = areAllRequiredTabsCompleted();
    
    const startDurationError = validateField('startDuration', formData.startDuration);
    const deadlineError = validateField('deadline', formData.deadline);
    
    return basicValid && badgesValid && allTabsCompleted && !startDurationError && !deadlineError;
  };

  const prepareCourseDataForAPI = useCallback(() => {
    const userId = getUserId();
    
    const apiData = {
      userId: userId,
      name: (formData.name || "").trim(),
      description: (formData.description || "").trim(),
      aboutCourse: (formData.aboutCourse || "").trim(),
      duration: parseInt(formData.duration) || 60,
      categoryId: parseInt(formData.categoryId),
      verifiedCertificate: Boolean(formData.verifiedCertificate),
      autoReassign: Boolean(formData.autoReassign),
      hasNotification: Boolean(formData.hasNotification),
      isPromoted: Boolean(formData.isPromoted),
      publishCourse: Boolean(formData.publishCourse),
      certificateId: formData.certificateId ? parseInt(formData.certificateId) : null,
      clusterId: formData.clusterId ? parseInt(formData.clusterId) : null,
      tagIds: (formData.tagIds || [])
        .filter(id => id !== null && id !== undefined && id !== "")
        .map(id => parseInt(id))
        .filter(id => !isNaN(id)),
      startDuration: formData.startDuration !== null && formData.startDuration !== undefined && formData.startDuration !== '' 
        ? parseInt(formData.startDuration) : null,
      deadline: formData.deadline !== null && formData.deadline !== undefined && formData.deadline !== '' 
        ? parseInt(formData.deadline) : null,
      expirationDate: formData.expirationDate !== null && formData.expirationDate !== undefined && formData.expirationDate !== '' 
        ? parseInt(formData.expirationDate) : null,
      clusterOrderNumber: formData.clusterOrderNumber !== null && formData.clusterOrderNumber !== undefined && formData.clusterOrderNumber !== '' 
        ? parseInt(formData.clusterOrderNumber) : null,
      clusterCoefficient: formData.clusterCoefficient !== null && formData.clusterCoefficient !== undefined && formData.clusterCoefficient !== '' 
        ? parseFloat(formData.clusterCoefficient) : null,
      successionRates: (formData.successionRates || [])
        .filter(rate => 
          rate.minRange !== null && rate.minRange !== undefined && 
          rate.maxRange !== null && rate.maxRange !== undefined
        )
        .map(rate => ({
          minRange: parseInt(rate.minRange),
          maxRange: parseInt(rate.maxRange),
          badgeId: rate.badgeId && !isNaN(parseInt(rate.badgeId)) ? parseInt(rate.badgeId) : null
        })),
      imageFile: persistentImageFile
    };

    if (isEditing && currentCourse?.id) {
      apiData.id = currentCourse.id;
    }

    console.log('Prepared API data with userId:', apiData);
    return apiData;
  }, [formData, persistentImageFile, isEditing, currentCourse]);

   const handleSaveOnly = async () => {
    const requiredFields = ['name', 'description', 'categoryId', 'duration'];
    const newTouched = {};
    requiredFields.forEach(field => {
      newTouched[field] = true;
    });
    
    setIsSaving(true);
    try {
      const courseDataForAPI = prepareCourseDataForAPI();
      console.log('Sending course data to API:', courseDataForAPI);

      let result;
      if (isEditing && currentCourse?.id) {
        result = await dispatch(updateCourseAsync(courseDataForAPI)).unwrap();
      } else {
        result = await dispatch(createCourseAsync(courseDataForAPI)).unwrap();
      }
      
      if (result?.success) {
        setSaveSuccess(true);
        
        // Redirect to home page after short delay
        setTimeout(() => {
          router.push(`/admin/dashboard/courses/`);
        }, 1000);
      }
    } catch (error) {
      console.error('Error saving course:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAndContinue = async () => {
    const requiredFields = ['name', 'description', 'categoryId', 'duration'];
    const newTouched = {};
    requiredFields.forEach(field => {
      newTouched[field] = true;
    });
    
    setIsSaving(true);
    try {
      const courseDataForAPI = prepareCourseDataForAPI();
      console.log('Sending course data to API:', courseDataForAPI);

      let result;
      if (isEditing && currentCourse?.id) {
        result = await dispatch(updateCourseAsync(courseDataForAPI)).unwrap();
      } else {
        result = await dispatch(createCourseAsync(courseDataForAPI)).unwrap();
      }
      
      if (result?.success) {
        setSaveSuccess(true);
        
        setTimeout(() => {
          dispatch(nextStep());
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

  // Filter course names based on search
  const filteredCourseNames = availableCourseNames.filter(name =>
    name.toLowerCase().includes(courseNameSearch.toLowerCase())
  );

  // Position Info Preview Component
  // Position Info Preview Component - Updated with collapsible design
const PositionInfoPreview = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!coursePositionsInfo) return null;
  
  const totalUsers = coursePositionsInfo.positions?.reduce((sum, pos) => sum + (pos.userCount || 0), 0) || 0;
  
  return (
    <div className="mt-3 bg-gradient-to-br from-[#0AAC9E]/5 to-blue-50 border border-[#0AAC9E]/20 rounded-lg overflow-hidden">
      {/* Compact Header - Always Visible */}
      <div 
        className="p-3 cursor-pointer hover:bg-[#0AAC9E]/5 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-[#0AAC9E] rounded-lg flex items-center justify-center mr-3">
              <Info className="w-4 h-4 text-white" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">
                Position Requirements
              </h4>
              <p className="text-xs text-gray-600">
                {coursePositionsInfo.totalPositionCount} positions • {totalUsers} users assigned
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-xs text-[#0AAC9E] font-medium">
              {isExpanded ? 'Hide details' : 'View details'}
            </span>
            <ChevronDown 
              className={`w-5 h-5 text-[#0AAC9E] transition-transform duration-200 ${
                isExpanded ? 'rotate-180' : ''
              }`} 
            />
          </div>
        </div>
      </div>
      
      {/* Expandable Content */}
      {isExpanded && (
        <div className="px-3 pb-3 border-t border-[#0AAC9E]/10">
          <div className="grid grid-cols-3 gap-3 mt-3 mb-3">
            <div className="bg-white rounded-lg p-3 border border-[#0AAC9E]/10">
              <div className="flex items-center mb-1">
                <BookOpen className="w-4 h-4 text-[#0AAC9E] mr-1" />
                <span className="text-xs text-gray-600">Course</span>
              </div>
              <p className="text-sm font-semibold text-gray-900 truncate">
                {coursePositionsInfo.courseName}
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-3 border border-[#0AAC9E]/10">
              <div className="flex items-center mb-1">
                <Briefcase className="w-4 h-4 text-[#0AAC9E] mr-1" />
                <span className="text-xs text-gray-600">Positions</span>
              </div>
              <p className="text-sm font-semibold text-[#0AAC9E]">
                {coursePositionsInfo.totalPositionCount}
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-3 border border-[#0AAC9E]/10">
              <div className="flex items-center mb-1">
                <Users className="w-4 h-4 text-[#0AAC9E] mr-1" />
                <span className="text-xs text-gray-600">Total Users</span>
              </div>
              <p className="text-sm font-semibold text-[#0AAC9E]">
                {totalUsers}
              </p>
            </div>
          </div>
          
          {coursePositionsInfo.positions && coursePositionsInfo.positions.length > 0 && (
            <div>
              <h5 className="text-xs font-medium text-gray-700 mb-2 flex items-center">
               <div><Briefcase className="w-3.5 h-3 mr-1" />
                </div> 
                Position Breakdown
              </h5>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {coursePositionsInfo.positions.map((position) => (
                  <div 
                    key={position.positionId}
                    className="flex items-center justify-between bg-white rounded-lg p-2.5 border border-gray-100 hover:border-[#0AAC9E]/30 transition-colors"
                  >
                    <div className="flex items-center flex-1">
                      <div className="w-7 h-7 bg-[#0AAC9E]/10 rounded-full flex items-center justify-center mr-2">
                        <Briefcase className="w-3.5 h-3.5 text-[#0AAC9E]" />
                      </div>
                      <span className="text-xs font-medium text-gray-900">
                        {position.positionName}
                      </span>
                    </div>
                    
                    <div className="flex items-center bg-[#0AAC9E]/5 px-2 py-1 rounded">
                      <Users className="w-3.5 h-3 text-[#0AAC9E] mr-1" />
                      <span className="text-xs font-semibold text-[#0AAC9E]">
                        {position.userCount}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

  // Smart Dropdown Component
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
    onCreateNew = null,
    dropdownRef = null
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const localRef = useRef(null);
    const effectiveRef = dropdownRef || localRef;
    
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (effectiveRef.current && !effectiveRef.current.contains(event.target)) {
          setIsOpen(false);
          setSearchTerm("");
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
        };
      }
    }, [isOpen, effectiveRef]);
    
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
        if (value === optionId) {
          onChange('');
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
      <div className="space-y-2" ref={effectiveRef}>
        <label className="block text-xs font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        
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
              
              <div className="max-h-40 overflow-y-auto">
                {allowCreate && onCreateNew && (
                  <div
                    onClick={() => {
                      onCreateNew();
                      setIsOpen(false);
                      setSearchTerm("");
                    }}
                    className="px-3 py-2 text-xs cursor-pointer hover:bg-[#0AAC9E]/10 transition-colors border-b border-gray-200 flex items-center text-[#0AAC9E] font-medium"
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
                        className={`px-3 py-2 text-xs cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 flex items-center justify-between ${
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

   const tabs = [
    { 
      id: 'basic', 
      label: 'Basic Info', 
      icon: BookOpen,
      required: true,
      description: 'Essential course details'
    },
    { 
      id: 'settings', 
      label: 'Advanced Settings', 
      icon: Settings,
      required: false,
      description: 'Optional configurations',
      badge: 'Optional'
    },
    { 
      id: 'badges', 
      label: 'Achievement Badges', 
      icon: Award,
      required: formData.verifiedCertificate,
      description: 'Score-based rewards',
      badge: formData.verifiedCertificate ? 'Required' : 'Optional'
    }
  ];

  // Check if we should show "Configure More" button
  const shouldShowConfigureMore = () => {
    return isBasicFormValid() && !showOptionalSettings && activeTab === 'basic';
  };

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
              const isRequired = tab.required;
              const isActive = activeTab === tab.id;
              const isCompleted = completedTabs.has(tab.id);
              
              // Hide optional tabs unless explicitly shown
              if (!tab.required && !showOptionalSettings && !isEditing) {
                return null;
              }
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group relative py-3 px-4 border-b-2 font-medium text-sm flex items-center transition-all ${
                    isActive
                      ? 'border-[#0AAC9E] text-[#0AAC9E]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`flex items-center justify-center w-6 h-6 rounded-full mr-2 ${
                      isCompleted 
                        ? 'bg-green-100 text-green-600' 
                        : isActive 
                        ? 'bg-[#0AAC9E]/10 text-[#0AAC9E]'
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <tab.icon className="w-4 h-4" />
                      )}
                    </div>
                    
                    <div className="text-left">
                      <div className="flex items-center">
                        <span>{tab.label}</span>
                        {isRequired && !isCompleted && (
                          <span className="ml-1 text-red-500">*</span>
                        )}
                        {tab.badge && (
                          <span className={`ml-2 px-1.5 py-0.5 text-xs rounded ${
                            tab.badge === 'Required' 
                              ? 'bg-red-100 text-red-700' 
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {tab.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 font-normal">
                        {tab.description}
                      </p>
                    </div>
                  </div>
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
            {/* Course Name with Position-Course Integration */}
            <div ref={courseNameRef}>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Course Name <span className="text-red-500">*</span>
              </label>
              
              <div className="relative">
                <div
                  onClick={() => setShowCourseNameDropdown(!showCourseNameDropdown)}
                  className={`relative w-full px-3 py-2 text-sm border rounded-lg cursor-pointer focus:outline-none transition-all duration-200 bg-white flex items-center justify-between ${
                    errors.name && touched.name ? 'border-red-300' : 'border-gray-300 hover:border-[#0AAC9E]'
                  }`}
                >
                  <div className="flex items-center flex-1">
                    <BookOpen className="w-4 h-5 mr-3 text-gray-400" />
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => {
                        handleInputChange('name', e.target.value);
                        setCourseNameSearch(e.target.value);
                        setShowCourseNameDropdown(true);
                      }}
                      placeholder="Search or enter course name"
                      className="flex-1 outline-none bg-transparent"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowCourseNameDropdown(true);
                      }}
                    />
                  </div>
                  <ChevronDown 
                    className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                      showCourseNameDropdown ? 'rotate-180' : ''
                    }`} 
                  />
                </div>
                
                {showCourseNameDropdown && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-hidden">
                    <div className="max-h-60 overflow-y-auto">
                      {courseNamesLoading ? (
                        <div className="p-4 text-center text-gray-500 text-sm">
                          <Loader2 className="w-4 h-4 animate-spin mx-auto mb-1" />
                          Loading course names...
                        </div>
                      ) : filteredCourseNames.length > 0 ? (
                        filteredCourseNames.map((courseName, index) => {
                          const isSelected = formData.name === courseName;
                          
                          return (
                            <div
                              key={index}
                              onClick={() => {
                                handleInputChange('name', courseName);
                                setShowCourseNameDropdown(false);
                                setCourseNameSearch("");
                              }}
                              className={`px-3 py-2 text-xs cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 flex items-center justify-between ${
                                isSelected ? 'bg-[#0AAC9E]/10 text-[#0AAC9E] font-medium' : 'text-gray-900'
                              }`}
                            >
                              <span>{courseName}</span>
                              {isSelected && <CheckCircle className="w-4 h-4 text-[#0AAC9E]" />}
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-4 text-center">
                          <p className="text-sm text-gray-500 mb-2">
                            {courseNameSearch ? 'No matching course names found' : 'No course names available'}
                          </p>
                          <p className="text-xs text-gray-400">
                            You can enter a custom name
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between mt-1">
                {errors.name && touched.name && (
                  <p className="text-xs text-red-600 flex items-center">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {errors.name}
                  </p>
                )}
               
              </div>
              
              {/* Position Info Preview */}
              {positionsInfoLoading ? (
                <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto text-gray-400" />
                  <p className="text-xs text-gray-500 mt-2">Loading position information...</p>
                </div>
              ) : (
                <PositionInfoPreview />
              )}
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
                dropdownRef={categoryDropdownRef}
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

          {/* Description */}
          <div className="col-span-12 mt-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Provide a brief description of the course..."
              rows={4}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0AAC9E] transition-all resize-vertical ${
                errors.description && touched.description ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.description && touched.description && (
              <p className="mt-1 text-xs text-red-600 flex items-center">
                <AlertTriangle className="w-3 h-3 mr-1" />
                {errors.description}
              </p>
            )}
          </div>

          {/* About Course */}
          <div className="col-span-12 mt-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              About Course (Detailed Information)
            </label>
            <div className="relative">
              <PageTextComponent
                desc={formData.aboutCourse || null}
                onChange={handleAboutCourseChange}
                readOnly={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
 <>
<div className="mb-4 bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="flex items-start">
              <Info className="w-5 h-5 text-gray-500 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">
                  Advanced Settings (Optional)
                </h4>
                <p className="text-xs text-gray-600">
                  These settings are optional but can help you organize courses better, track progress, and provide certificates to learners.
                </p>
              </div>
            </div>
          </div>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
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
                dropdownRef={tagsDropdownRef}
              />

              {formData.verifiedCertificate && (
                <SmartDropdown
                  label="Certificate"
                  value={formData.certificateId}
                  options={certificates}
                  onChange={(certificateId) => handleInputChange('certificateId', certificateId)}
                  placeholder="Select certificate"
                  loading={certificatesLoading}
                  icon={Award}
                  dropdownRef={certificateDropdownRef}
                />
              )}

              <SmartDropdown
                label="Assign to Cluster"
                value={formData.clusterId}
                options={clusters.map(cluster => ({ id: cluster.id, name: cluster.subject }))}
                onChange={(clusterId) => handleInputChange('clusterId', clusterId)}
                placeholder="No cluster"
                loading={clustersLoading}
                icon={Package}
                dropdownRef={clusterDropdownRef}
              />

              <div className="bg-gray-50 rounded-lg px-4 py-2 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <BookOpen className="w-4 h-5 text-[#0AAC9E] mr-2" />
                      <label className="text-sm font-medium text-gray-900">Publish course</label>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Make this course available to learners
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.publishCourse || false}
                    onChange={(e) => {
                      handleInputChange('publishCourse', e.target.checked);
                      handleInputChange('hasNotification', e.target.checked);
                    }}
                    className="h-4 w-4 text-[#0AAC9E] border-gray-300 rounded focus:ring-[#0AAC9E]"
                  />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Start Duration (days)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.startDuration !== null && formData.startDuration !== undefined ? formData.startDuration : ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      handleInputChange('startDuration', value === '' ? null : parseInt(value));
                    }}
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
                    min="1"
                    value={formData.deadline !== null && formData.deadline !== undefined ? formData.deadline : ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      handleInputChange('deadline', value === '' ? null : parseInt(value));
                    }}
                    placeholder="30"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0AAC9E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Expiration Date (months)
                  </div>
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.expirationDate !== null && formData.expirationDate !== undefined ? formData.expirationDate : ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    handleInputChange('expirationDate', value === '' ? null : parseInt(value));
                  }}
                  placeholder="12"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0AAC9E]"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Months after which the course expires for learners
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg px-4 py-2 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <ArrowRight className="w-4 h-5 text-[#0AAC9E] mr-2" />
                      <label className="text-sm font-medium text-gray-900">Auto reassign when certificate expired</label>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.autoReassign || false}
                    onChange={(e) => handleInputChange('autoReassign', e.target.checked)}
                    className="h-3 w-4 text-[#0AAC9E] border-gray-300 rounded focus:ring-[#0AAC9E]"
                  />
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg px-4 py-2 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <TrendingUp className="w-4 h-5 text-[#0AAC9E] mr-2" />
                      <label className="text-sm font-medium text-gray-900">Promoted course</label>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Feature this course in promoted sections
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.isPromoted || false}
                    onChange={(e) => handleInputChange('isPromoted', e.target.checked)}
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
                    onChange={(e) => {
                      handleInputChange('verifiedCertificate', e.target.checked);
                      if (!e.target.checked) {
                        handleInputChange('certificateId', null);
                      }
                    }}
                    className="h-4 w-4 text-[#0AAC9E] border-gray-300 rounded focus:ring-[#0AAC9E]"
                  />
                </div>
              </div>
            </div>
          </div>

          {formData.clusterId && (
            <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200 space-y-3">
              <div className="flex items-center mb-3">
                <Info className="w-4 h-5 text-[#0AAC9E] mr-2" />
                <h4 className="text-sm font-medium text-gray-900">Cluster Configuration</h4>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Order in Cluster
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={
                      formData.clusterOrderNumber !== null && 
                      formData.clusterOrderNumber !== undefined && 
                      formData.clusterOrderNumber !== '' 
                        ? formData.clusterOrderNumber 
                        : ''
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      const numValue = value === '' ? null : parseInt(value);
                      handleInputChange('clusterOrderNumber', numValue);
                    }}
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
                    value={
                      formData.clusterCoefficient !== null && 
                      formData.clusterCoefficient !== undefined && 
                      formData.clusterCoefficient !== '' 
                        ? formData.clusterCoefficient 
                        : ''
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      const numValue = value === '' ? null : parseFloat(value);
                      handleInputChange('clusterCoefficient', numValue);
                    }}
                    placeholder="0.0"
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0AAC9E]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
       
        </>
      )}

      {/* Badges Tab */}
      {activeTab === 'badges' && (
        <>
  {formData.verifiedCertificate && (
            <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start">
                <Award className="w-5 h-5 text-amber-600 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-amber-900 mb-1">
                    Achievement Badges Setup
                  </h4>
                  <p className="text-xs text-amber-700">
                    Configure score ranges to automatically award badges to learners based on their performance. This is required when verified certificates are enabled.
                  </p>
                </div>
              </div>
            </div>
          )}
        <div className="space-y-4">
          {formData.verifiedCertificate ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center mb-1">
                    <Award className="w-5 h-5 text-[#0AAC9E] mr-2" />
                    <h3 className="text-base font-medium text-gray-900">Achievement Badges</h3>
                  </div>
                </div>
                <button
                  onClick={handleAddSuccessionRate}
                  className="flex items-center px-3 py-2 text-sm font-medium text-white bg-[#0AAC9E] rounded-lg hover:bg-[#0AAC9E]/90"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Range
                </button>
              </div>

              {formData.successionRates && formData.successionRates.length > 0 ? (
                <div className="space-y-2">
                  {formData.successionRates.map((rate, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className="w-5 h-5 bg-[#0AAC9E]/10 rounded flex items-center justify-center mr-2">
                            <span className="text-xs font-bold text-[#0AAC9E]">{index + 1}</span>
                          </div>
                          <h4 className="text-sm font-medium text-gray-900">Range #{index + 1}</h4>
                        </div>
                        <button
                          onClick={() => handleRemoveSuccessionRate(index)}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Min %</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={rate.minRange === null || rate.minRange === undefined ? '' : rate.minRange}
                            onChange={(e) => handleUpdateSuccessionRate(index, 'minRange', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#0AAC9E]"
                            placeholder="0"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Max %</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={rate.maxRange === null || rate.maxRange === undefined ? '' : rate.maxRange}
                            onChange={(e) => handleUpdateSuccessionRate(index, 'maxRange', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#0AAC9E]"
                            placeholder="100"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Badge</label>
                          <select
                            value={rate.badgeId || ''}
                            onChange={(e) => handleUpdateSuccessionRate(index, 'badgeId', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#0AAC9E]"
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
                <div className="text-center py-4 border-2 border-dashed border-gray-300 rounded-lg bg-white">
                  <h3 className="text-sm font-medium text-gray-900 mb-1">No badge ranges yet</h3>
                  <p className="text-xs text-gray-600">
                    Add score ranges to award badges automatically
                  </p>
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
        </div>     </>
      )}

{/* Improved Save Actions - Cleaner Layout */}
<div className="pt-4 border-t border-gray-200 mt-6">
  {/* Status Info
  <div className="mb-3">
    {areAllRequiredTabsCompleted() && isFormValid() ? (
      <div className="flex items-center text-green-600">
        <CheckCircle className="w-4 h-4 mr-2" />
        <span className="text-sm font-medium">Ready to save - All required information is complete</span>
      </div>
    ) : isBasicFormValid() ? (
      <div className="flex items-center text-blue-600">
        <Info className="w-4 h-4 mr-2" />
        <span className="text-sm font-medium">
          {formData.verifiedCertificate && !isBadgesTabValid() ? 
            'Configure badge ranges to continue' : 
            'Basic info complete - You can save now or add more details'
          }
        </span>
      </div>
    ) : (
      <div className="flex items-center text-orange-600">
        <AlertTriangle className="w-4 h-4 mr-2" />
        <span className="text-sm font-medium">Complete required fields: course name, category, duration, and description</span>
      </div>
    )}
  </div> */}

  {/* Action Buttons */}
  <div className="flex items-center justify-between">
    {/* Left side - Optional settings link */}
    <div>
      {activeTab === 'basic' && isBasicFormValid() && !showOptionalSettings && !isEditing && (
        <button
          onClick={() => {
            setShowOptionalSettings(true);
            setActiveTab('settings');
          }}
          className="flex items-center text-sm text-[#0AAC9E] hover:text-[#0AAC9E]/80 font-medium"
        >
          <Settings className="w-4 h-4 mr-1" />
          Add tags, certificates & advanced settings
          <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      )}
      
      {(activeTab === 'settings' || activeTab === 'badges') && (
        <button
          onClick={() => setActiveTab('basic')}
          className="flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowRight className="w-4 h-4 mr-1 rotate-180" />
          Back to basic info
        </button>
      )}
    </div>

    {/* Right side - Save buttons */}
    <div className="flex items-center space-x-2">
      {/* Skip & Save for optional tabs */}
      {(activeTab === 'settings' || (activeTab === 'badges' && !formData.verifiedCertificate)) && (
        <button
          onClick={handleSaveOnly}
          disabled={!isBasicFormValid() || isSaving}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Skip & Save
        </button>
      )}
      
      {/* Save Draft on basic tab */}
      {activeTab === 'basic' && (
        <button
          onClick={handleSaveOnly}
          disabled={!isBasicFormValid() || isSaving}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save Draft
        </button>
      )}

      {/* Main Save & Continue button */}
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