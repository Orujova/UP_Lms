import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { 
  Users, 
  Calendar, 
  Clock, 
  Settings, 
  CheckCircle, 
  AlertCircle,
  Globe,
  X,
  Target,
  Award,
  BarChart3,
  Zap,
  Timer,
  UserCheck,
  Send,
  Save,
  Eye,
  ChevronRight
} from "lucide-react";
import {
  setFormData,
  createCourseAsync,
  updateCourseAsync,
  publishCourseAsync
} from "@/redux/course/courseSlice";
import { getAllTargetGroupsAsync } from "@/redux/getAllTargetGroups/getAllTargetGroups";

// TargetGroupSelector Component
const TargetGroupSelector = ({ 
  targetGroups, 
  searchValue, 
  selectedTargetGroups, 
  showDropdown, 
  onSearchChange, 
  onToggleDropdown, 
  onSelect, 
  onRemove 
}) => {
  const filteredGroups = targetGroups.filter(group => 
    group.name.toLowerCase().includes(searchValue.toLowerCase()) &&
    !selectedTargetGroups.some(selected => selected.id === group.id)
  );

  return (
    <div>
      {/* Target Group Selector */}
      <div className="relative mb-3">
        <button
          onClick={() => onToggleDropdown(!showDropdown)}
          className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-300 rounded-lg hover:border-[#0AAC9E] focus:ring-2 focus:ring-[#0AAC9E] focus:border-[#0AAC9E] bg-white"
        >
          <span className="text-gray-500">Search target groups...</span>
          <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${showDropdown ? 'rotate-90' : ''}`} />
        </button>

        {/* Dropdown */}
        {showDropdown && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-hidden">
            <div className="p-2 border-b border-gray-100">
              <input
                type="text"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search target groups..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#0AAC9E] focus:border-[#0AAC9E]"
                autoFocus
              />
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filteredGroups.length > 0 ? (
                filteredGroups.map((group) => (
                  <button
                    key={group.id}
                    onClick={() => onSelect(group)}
                    className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-[#0AAC9E]/5 transition-colors"
                  >
                    <div className="w-8 h-8 bg-[#0AAC9E] text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {group.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{group.name}</div>
                      <div className="text-xs text-gray-500">Click to add</div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-3 py-4 text-center text-gray-500 text-sm">
                  {searchValue ? 'No matching target groups found' : 'No available target groups'}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Selected Groups */}
      <div className="space-y-2">
        {selectedTargetGroups.map((group) => (
          <div
            key={group.id}
            className="flex items-center justify-between p-3 bg-[#0AAC9E]/5 border border-[#0AAC9E]/20 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#0AAC9E] text-white rounded-full flex items-center justify-center text-sm font-medium">
                {group.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <span className="text-sm font-medium text-gray-900">{group.name}</span>
                {group.description && (
                  <div className="text-xs text-gray-500">{group.description}</div>
                )}
              </div>
            </div>
            <button
              onClick={() => onRemove(group)}
              className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const TargetGroupsForm = ({ isEditing = false }) => {
  const dispatch = useDispatch();
  const [showTargetGroupDropdown, setShowTargetGroupDropdown] = useState(false);
  const [targetGroupSearch, setTargetGroupSearch] = useState("");
  const [publishSettings, setPublishSettings] = useState({
    publishImmediately: true,
    scheduledDate: "",
    scheduledTime: "",
    autoReassign: false,
    startDuration: null,
    deadline: null,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { 
    formData = {}, 
    loading, 
    currentCourse,
    sections = []
  } = useSelector((state) => state.course || {});
  
  const targetGroups = useSelector((state) => state.getAllTargetGroups.data?.[0]?.targetGroups) || [];

  useEffect(() => {
    dispatch(getAllTargetGroupsAsync());
  }, [dispatch]);

  useEffect(() => {
    if (isEditing && currentCourse) {
      setPublishSettings({
        publishImmediately: currentCourse.publishCourse || false,
        scheduledDate: currentCourse.startDate ? new Date(currentCourse.startDate).toISOString().split('T')[0] : "",
        scheduledTime: currentCourse.startDate ? new Date(currentCourse.startDate).toTimeString().slice(0, 5) : "",
        autoReassign: currentCourse.autoReassign || false,
        startDuration: currentCourse.startDuration || null,
        deadline: currentCourse.deadLine ? new Date(currentCourse.deadLine).toISOString().split('T')[0] : null,
      });
    }
  }, [isEditing, currentCourse]);

  const selectedTargetGroups = React.useMemo(() => {
    return targetGroups.filter(group => 
      (formData.targetGroupIds || []).includes(group.id)
    );
  }, [targetGroups, formData.targetGroupIds]);

  const handleTargetGroupSelect = (group) => {
    const currentIds = formData.targetGroupIds || [];
    if (!currentIds.includes(group.id)) {
      dispatch(setFormData({ 
        targetGroupIds: [...currentIds, group.id] 
      }));
    }
    setShowTargetGroupDropdown(false);
    setTargetGroupSearch("");
  };

  const handleTargetGroupRemove = (group) => {
    const currentIds = formData.targetGroupIds || [];
    dispatch(setFormData({ 
      targetGroupIds: currentIds.filter(id => id !== group.id) 
    }));
  };

  const handlePublishSettingChange = (field, value) => {
    setPublishSettings(prev => ({ ...prev, [field]: value }));
    
    if (field === 'autoReassign') {
      dispatch(setFormData({ autoReassign: value }));
    } else if (field === 'startDuration') {
      dispatch(setFormData({ startDuration: value }));
    } else if (field === 'deadline') {
      dispatch(setFormData({ deadline: value }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name?.trim()) {
      newErrors.name = "Course name is required";
    }

    if (!formData.description?.trim()) {
      newErrors.description = "Course description is required";
    }

    if (!formData.categoryId) {
      newErrors.category = "Course category is required";
    }

    if (sections.length === 0) {
      newErrors.content = "Course must have at least one section with content";
    }

    if (!publishSettings.publishImmediately && !publishSettings.scheduledDate) {
      newErrors.schedule = "Please select a publish date or choose to publish immediately";
    }

    if (publishSettings.deadline && publishSettings.scheduledDate) {
      const scheduleDate = new Date(publishSettings.scheduledDate);
      const deadlineDate = new Date(publishSettings.deadline);
      if (deadlineDate <= scheduleDate) {
        newErrors.deadline = "Deadline must be after the start date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveAndPublish = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const courseData = {
        ...formData,
        autoReassign: publishSettings.autoReassign,
        startDuration: publishSettings.startDuration,
        deadline: publishSettings.deadline,
        publishCourse: publishSettings.publishImmediately,
      };

      if (isEditing && currentCourse?.id) {
        await dispatch(updateCourseAsync({ 
          ...courseData, 
          id: currentCourse.id 
        })).unwrap();

        if (publishSettings.publishImmediately && !currentCourse.publishCourse) {
          await dispatch(publishCourseAsync(currentCourse.id)).unwrap();
        }
      } else {
        const result = await dispatch(createCourseAsync(courseData)).unwrap();
        
        if (publishSettings.publishImmediately && result?.id) {
          await dispatch(publishCourseAsync(result.id)).unwrap();
        }
      }

    } catch (error) {
      setErrors({ submit: error.message || "Failed to save course" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!formData.name?.trim() || !formData.description?.trim() || !formData.categoryId) {
      setErrors({ submit: "Please fill in the basic course information first" });
      return;
    }

    setIsSubmitting(true);

    try {
      const courseData = {
        ...formData,
        autoReassign: publishSettings.autoReassign,
        startDuration: publishSettings.startDuration,
        deadline: publishSettings.deadline,
        publishCourse: false,
      };

      if (isEditing && currentCourse?.id) {
        await dispatch(updateCourseAsync({ 
          ...courseData, 
          id: currentCourse.id 
        })).unwrap();
      } else {
        await dispatch(createCourseAsync(courseData)).unwrap();
      }

    } catch (error) {
      setErrors({ submit: error.message || "Failed to save draft" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const courseStats = {
    totalSections: sections.length,
    totalContent: sections.reduce((total, section) => total + (section.contents?.length || 0), 0),
    estimatedDuration: sections.reduce((total, section) => total + (section.duration || 0), 0),
    targetGroups: selectedTargetGroups.length,
    requiredSections: sections.filter(s => s.mandatory).length,
    visibleSections: sections.filter(s => !s.hideSection).length,
  };

  const getReadinessStatus = () => {
    const hasBasicInfo = formData.name && formData.description && formData.categoryId;
    const hasContent = sections.length > 0 && courseStats.totalContent > 0;
    const hasTargetGroups = selectedTargetGroups.length > 0;
    
    if (hasBasicInfo && hasContent && hasTargetGroups) {
      return { status: 'ready', message: 'Course is ready to publish!', color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' };
    } else if (hasBasicInfo && hasContent) {
      return { status: 'almost', message: 'Almost ready - just add target groups', color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' };
    } else {
      return { status: 'incomplete', message: 'Complete previous steps first', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' };
    }
  };

  const readiness = getReadinessStatus();

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="text-center lg:text-left">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Target Groups & Publishing
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Define who can access your course and configure publishing settings
        </p>
      </div>

      {/* Course Readiness Status */}
      <div className={`rounded-lg border-2 p-4 ${readiness.borderColor} ${readiness.bgColor}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-white shadow-sm`}>
              {readiness.status === 'ready' ? (
                <CheckCircle className={`w-5 h-5 ${readiness.color}`} />
              ) : readiness.status === 'almost' ? (
                <Clock className={`w-5 h-5 ${readiness.color}`} />
              ) : (
                <AlertCircle className={`w-5 h-5 ${readiness.color}`} />
              )}
            </div>
            <div>
              <h3 className={`text-sm font-semibold ${readiness.color}`}>
                {readiness.status === 'ready' ? 'Ready to Publish' : 
                 readiness.status === 'almost' ? 'Almost Ready' : 'Incomplete'}
              </h3>
              <p className="text-xs text-gray-600">{readiness.message}</p>
            </div>
          </div>
          {readiness.status === 'ready' && (
            <div className="flex items-center gap-1 text-xs text-green-600">
              <Zap className="w-3 h-3" />
              <span>All requirements met</span>
            </div>
          )}
        </div>
      </div>

      {/* Course Summary Dashboard */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-[#0AAC9E]/5 p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#0AAC9E]" />
            Course Summary
          </h3>
          
          <div className="grid grid-cols-6 gap-3">
            <div className="text-center p-3 bg-white rounded border border-[#0AAC9E]/20">
              <div className="text-lg font-bold text-[#0AAC9E]">{courseStats.totalSections}</div>
              <div className="text-xs text-gray-600">Sections</div>
            </div>
            <div className="text-center p-3 bg-white rounded border border-blue-200">
              <div className="text-lg font-bold text-blue-600">{courseStats.totalContent}</div>
              <div className="text-xs text-gray-600">Content</div>
            </div>
            <div className="text-center p-3 bg-white rounded border border-green-200">
              <div className="text-lg font-bold text-green-600">{courseStats.estimatedDuration}</div>
              <div className="text-xs text-gray-600">Minutes</div>
            </div>
            <div className="text-center p-3 bg-white rounded border border-purple-200">
              <div className="text-lg font-bold text-purple-600">{courseStats.targetGroups}</div>
              <div className="text-xs text-gray-600">Groups</div>
            </div>
            <div className="text-center p-3 bg-white rounded border border-orange-200">
              <div className="text-lg font-bold text-orange-600">{courseStats.requiredSections}</div>
              <div className="text-xs text-gray-600">Required</div>
            </div>
            <div className="text-center p-3 bg-white rounded border border-gray-200">
              <div className="text-lg font-bold text-gray-600">{courseStats.visibleSections}</div>
              <div className="text-xs text-gray-600">Visible</div>
            </div>
          </div>
        </div>

        {/* Course Information Summary */}
        <div className="p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Course Details</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <div>
                <span className="text-xs font-medium text-gray-500">Course Name</span>
                <p className="text-gray-900 font-medium">{formData.name || "Not set"}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-500">Category</span>
                <p className="text-gray-900">{formData.categoryName || "Not set"}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <span className="text-xs font-medium text-gray-500">Certificate</span>
                <div className="flex items-center gap-1">
                  {formData.verifiedCertificate ? (
                    <>
                      <Award className="w-3 h-3 text-[#0AAC9E]" />
                      <span className="text-[#0AAC9E] font-medium text-xs">Enabled</span>
                    </>
                  ) : (
                    <span className="text-gray-500 text-xs">Disabled</span>
                  )}
                </div>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-500">Status</span>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${
                    currentCourse?.publishCourse ? "bg-green-500" : "bg-yellow-500"
                  }`}></div>
                  <span className={`text-xs font-medium ${
                    currentCourse?.publishCourse ? "text-green-700" : "text-yellow-700"
                  }`}>
                    {currentCourse?.publishCourse ? "Published" : "Draft"}
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <span className="text-xs font-medium text-gray-500">Duration</span>
                <p className="text-gray-900">{formData.duration || 0} minutes</p>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-500">Content Progress</span>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-[#0AAC9E] h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${courseStats.totalContent > 0 ? 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-600">
                    {courseStats.totalContent > 0 ? "Complete" : "Empty"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Validation Warnings */}
        {Object.keys(errors).length > 0 && (
          <div className="mx-4 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="font-medium text-red-800 text-sm">Please fix the following issues:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
              {Object.values(errors).map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Target Groups Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-[#0AAC9E]/5 p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-[#0AAC9E]/10 rounded">
                  <Users className="w-4 h-4 text-[#0AAC9E]" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Target Groups</h3>
                  <p className="text-sm text-gray-600">Define who can access this course</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-[#0AAC9E]">{selectedTargetGroups.length}</div>
                <div className="text-xs text-gray-500">Selected</div>
              </div>
            </div>
          </div>

          <div className="p-4">
            {/* Target Group Selector Component */}
            <TargetGroupSelector
              targetGroups={targetGroups}
              searchValue={targetGroupSearch}
              selectedTargetGroups={selectedTargetGroups}
              showDropdown={showTargetGroupDropdown}
              onSearchChange={setTargetGroupSearch}
              onToggleDropdown={setShowTargetGroupDropdown}
              onSelect={handleTargetGroupSelect}
              onRemove={handleTargetGroupRemove}
            />

            {targetGroups.length === 0 && (
              <div className="text-center py-6 text-gray-500">
                <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No target groups available</p>
                <p className="text-xs text-gray-400 mt-1">Contact your administrator to create target groups</p>
              </div>
            )}

            {selectedTargetGroups.length > 0 && (
              <div className="mt-4 p-3 bg-[#0AAC9E]/5 rounded-lg border border-[#0AAC9E]/20">
                <h4 className="text-sm font-medium text-[#0AAC9E] mb-2 flex items-center gap-2">
                  <Target className="w-3 h-3" />
                  Course Access Summary
                </h4>
                <p className="text-sm text-gray-600">
                  This course will be available to <strong>{selectedTargetGroups.length}</strong> target group{selectedTargetGroups.length !== 1 ? 's' : ''}.
                  Learners in these groups will be able to enroll and access the course content.
                </p>
                
                {/* Selected Groups Preview */}
                <div className="mt-2 flex flex-wrap gap-1">
                  {selectedTargetGroups.slice(0, 3).map((group) => (
                    <span key={group.id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-[#0AAC9E]/30 rounded-full text-xs text-[#0AAC9E]">
                      <UserCheck className="w-2 h-2" />
                      {group.name}
                    </span>
                  ))}
                  {selectedTargetGroups.length > 3 && (
                    <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-500">
                      +{selectedTargetGroups.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Publishing Settings Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-green-50 p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-green-100 rounded">
                <Settings className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Publishing Options</h3>
                <p className="text-sm text-gray-600">Configure publishing</p>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* Publishing Timing */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-1">
                <Globe className="w-4 h-4 text-green-600" />
                Publishing Options
              </h4>
              
              <div className="space-y-2">
                <label className="flex items-start gap-2 p-3 border-2 border-[#0AAC9E] rounded-lg cursor-pointer bg-[#0AAC9E]/5">
                  <input
                    type="radio"
                    name="publishTiming"
                    checked={publishSettings.publishImmediately}
                    onChange={() => handlePublishSettingChange('publishImmediately', true)}
                    className="w-4 h-4 text-[#0AAC9E] border-gray-300 focus:ring-[#0AAC9E] mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Send className="w-4 h-4 text-[#0AAC9E]" />
                      <span className="text-sm font-medium text-gray-900">Publish Immediately</span>
                    </div>
                    <p className="text-xs text-gray-600">Make course available right away</p>
                  </div>
                  <CheckCircle className="w-4 h-4 text-[#0AAC9E] mt-0.5" />
                </label>

                <label className="flex items-start gap-2 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="publishTiming"
                    checked={!publishSettings.publishImmediately}
                    onChange={() => handlePublishSettingChange('publishImmediately', false)}
                    className="w-4 h-4 text-[#0AAC9E] border-gray-300 focus:ring-[#0AAC9E] mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Timer className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-900">Schedule for Later</span>
                    </div>
                    <p className="text-xs text-gray-600">Set specific publish date and time</p>
                  </div>
                </label>

                {!publishSettings.publishImmediately && (
                  <div className="ml-6 grid grid-cols-2 gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        Publish Date
                      </label>
                      <input
                        type="date"
                        value={publishSettings.scheduledTime}
                        onChange={(e) => handlePublishSettingChange('scheduledTime', e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-[#0AAC9E] focus:border-[#0AAC9E]"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Advanced Settings */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-1">
                <Settings className="w-4 h-4 text-green-600" />
                Advanced Settings
              </h4>
              
              <div className="space-y-3">
                <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={publishSettings.autoReassign}
                    onChange={(e) => handlePublishSettingChange('autoReassign', e.target.checked)}
                    className="w-4 h-4 text-[#0AAC9E] border-gray-300 rounded focus:ring-[#0AAC9E]"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Enable Auto-reassign</div>
                    <div className="text-xs text-gray-500">Automatically reassign incomplete courses</div>
                  </div>
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Start Duration (days)</label>
                    <input
                      type="number"
                      value={publishSettings.startDuration || ""}
                      onChange={(e) => handlePublishSettingChange('startDuration', parseInt(e.target.value) || null)}
                      placeholder="Optional"
                      min="0"
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-[#0AAC9E] focus:border-[#0AAC9E]"
                    />
                    <p className="text-xs text-gray-500 mt-0.5">Days to wait before starting</p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Course Deadline</label>
                    <input
                      type="date"
                      value={publishSettings.deadline || ""}
                      onChange={(e) => handlePublishSettingChange('deadline', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-[#0AAC9E] focus:border-[#0AAC9E]"
                    />
                    <p className="text-xs text-gray-500 mt-0.5">Final completion date</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div>
            {isEditing ? (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-0.5">
                  Update Course: {formData.name}
                </h4>
                <p className="text-xs text-gray-600">Save your changes and publish when ready</p>
              </div>
            ) : (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-0.5">Ready to Create Your Course?</h4>
                <p className="text-xs text-gray-600">Review your settings and publish when ready</p>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveDraft}
              disabled={isSubmitting}
              className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center gap-2 text-sm"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save as Draft</span>
                </>
              )}
            </button>
            
            <button
              onClick={handleSaveAndPublish}
              disabled={isSubmitting || Object.keys(errors).length > 0}
              className="px-4 py-2 bg-[#0AAC9E] text-white rounded-lg hover:bg-[#0AAC9E]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md font-medium transform hover:scale-105 disabled:transform-none text-sm"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  {publishSettings.publishImmediately ? (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Save & Publish Course</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Course</span>
                    </>
                  )}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Publishing Tips */}
      <div className="bg-[#0AAC9E]/5 rounded-lg border border-[#0AAC9E]/20 p-4">
        <h4 className="text-sm font-medium text-[#0AAC9E] mb-3 flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          Publishing Best Practices
        </h4>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="space-y-2">
            <div>
              <h5 className="font-medium text-gray-900 mb-0.5 flex items-center gap-1">
                <Target className="w-3 h-3 text-[#0AAC9E]" />
                Target Selection
              </h5>
              <p className="text-gray-600">Choose relevant groups for right audience reach.</p>
            </div>
            <div>
              <h5 className="font-medium text-gray-900 mb-0.5 flex items-center gap-1">
                <Timer className="w-3 h-3 text-[#0AAC9E]" />
                Timing Strategy
              </h5>
              <p className="text-gray-600">Schedule for optimal learner engagement.</p>
            </div>
          </div>
          <div className="space-y-2">
            <div>
              <h5 className="font-medium text-gray-900 mb-0.5 flex items-center gap-1">
                <Settings className="w-3 h-3 text-[#0AAC9E]" />
                Advanced Settings
              </h5>
              <p className="text-gray-600">Use auto-reassign for better completion rates.</p>
            </div>
            <div>
              <h5 className="font-medium text-gray-900 mb-0.5 flex items-center gap-1">
                <Eye className="w-3 h-3 text-[#0AAC9E]" />
                Preview & Test
              </h5>
              <p className="text-gray-600">Always preview before publishing.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TargetGroupsForm;