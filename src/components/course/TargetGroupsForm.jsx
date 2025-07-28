import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { 
  Users, 
  Target, 
  Search, 
  CheckCircle, 
  Circle,
  ChevronDown,
  ChevronRight,
  Calendar,
  Clock,
  Settings,
  Eye,
  EyeOff,
  AlertCircle,
  UserPlus,
  Globe,
  Loader2,
  Filter,
  X,
  Plus
} from "lucide-react";
import {
  setFormData,
  setModalOpen,
  nextStep,
  prevStep
} from "@/redux/course/courseSlice";

const TargetGroupsForm = ({ isEditing = false }) => {
  const dispatch = useDispatch();
  
  const { 
    formData, 
    currentStep,
    loading 
  } = useSelector((state) => state.course || {});
  
  const { 
    data: targetGroupsData, 
    loading: targetGroupsLoading 
  } = useSelector((state) => state.getAllTargetGroups || {});
  
  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedGroups, setExpandedGroups] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    department: '',
    role: '',
    location: ''
  });
  const [selectedTargetGroups, setSelectedTargetGroups] = useState(
    formData?.targetGroupIds || []
  );
  const [publishSettings, setPublishSettings] = useState({
    publishCourse: formData?.publishCourse || false,
    autoReassign: formData?.autoReassign || false,
    hasEvaluation: formData?.hasEvaluation || false,
    startDuration: formData?.startDuration || null,
    deadline: formData?.deadline || null
  });

  // Extract target groups from the API response structure
  const targetGroups = useMemo(() => {
    return targetGroupsData?.[0]?.targetGroups || [];
  }, [targetGroupsData]);

  // Fetch target groups on component mount
  useEffect(() => {
    dispatch(getAllTargetGroupsAsync());
  }, [dispatch]);

  // Update local state when formData changes
  useEffect(() => {
    setSelectedTargetGroups(formData?.targetGroupIds || []);
    setPublishSettings({
      publishCourse: formData?.publishCourse || false,
      autoReassign: formData?.autoReassign || false,
      hasEvaluation: formData?.hasEvaluation || false,
      startDuration: formData?.startDuration || null,
      deadline: formData?.deadline || null
    });
  }, [formData]);

  // Filter target groups based on search and filters
  const filteredTargetGroups = useMemo(() => {
    let filtered = targetGroups;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(group =>
        group.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Additional filters (if your API provides these fields)
    if (filterOptions.department) {
      filtered = filtered.filter(group => 
        group.department?.toLowerCase().includes(filterOptions.department.toLowerCase())
      );
    }

    if (filterOptions.role) {
      filtered = filtered.filter(group => 
        group.role?.toLowerCase().includes(filterOptions.role.toLowerCase())
      );
    }

    if (filterOptions.location) {
      filtered = filtered.filter(group => 
        group.location?.toLowerCase().includes(filterOptions.location.toLowerCase())
      );
    }

    return filtered;
  }, [targetGroups, searchTerm, filterOptions]);

  // Get statistics for target groups
  const targetGroupStats = useMemo(() => {
    const selectedGroups = targetGroups.filter(group => 
      selectedTargetGroups.includes(group.id)
    );
    
    const totalUsers = selectedGroups.reduce((sum, group) => 
      sum + (group.users?.length || 0), 0
    );
    
    return {
      selectedCount: selectedGroups.length,
      totalUsers: totalUsers,
      selectedGroups: selectedGroups
    };
  }, [targetGroups, selectedTargetGroups]);

  const handleTargetGroupToggle = (groupId) => {
    const newSelected = selectedTargetGroups.includes(groupId)
      ? selectedTargetGroups.filter(id => id !== groupId)
      : [...selectedTargetGroups, groupId];
    
    setSelectedTargetGroups(newSelected);
    
    // Update formData
    dispatch(setFormData({
      ...formData,
      targetGroupIds: newSelected
    }));
  };

  const handleSelectAll = () => {
    const allGroupIds = filteredTargetGroups.map(group => group.id);
    setSelectedTargetGroups(allGroupIds);
    dispatch(setFormData({
      ...formData,
      targetGroupIds: allGroupIds
    }));
  };

  const handleDeselectAll = () => {
    setSelectedTargetGroups([]);
    dispatch(setFormData({
      ...formData,
      targetGroupIds: []
    }));
  };

  const toggleGroupExpansion = (groupId) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const handlePublishSettingChange = (setting, value) => {
    const newSettings = {
      ...publishSettings,
      [setting]: value
    };
    setPublishSettings(newSettings);
    
    // Update formData
    dispatch(setFormData({
      ...formData,
      ...newSettings
    }));
  };

  const handleNext = () => {
    // Validate that at least one target group is selected
    if (selectedTargetGroups.length === 0) {
      // You could show an error toast here
      return;
    }
    
    // Open publish confirmation modal
    dispatch(setModalOpen({ modal: 'publishConfirm', isOpen: true }));
  };

  const handleAssignUsers = () => {
    dispatch(setModalOpen({ modal: 'assignUsers', isOpen: true }));
  };

  if (targetGroupsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#0AAC9E]" />
        <span className="ml-2 text-gray-600">Loading target groups...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Assign Target Groups
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Select the target groups who should have access to this course. 
          You can also configure publishing settings and assign individual users.
        </p>
      </div>

      {/* Course Summary */}
      <div className="bg-gradient-to-r from-[#0AAC9E]/5 to-[#0AAC9E]/10 rounded-xl p-6 border border-[#0AAC9E]/20">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {formData?.name || "Course Name"}
            </h3>
            <p className="text-gray-600 text-sm mb-3">
              {formData?.description || "Course description"}
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{formData?.duration || 0} minutes</span>
              </div>
              <div className="flex items-center gap-1">
                <Target className="w-4 h-4" />
                <span>{targetGroupStats.selectedCount} groups selected</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{targetGroupStats.totalUsers} total users</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Target Groups Selection */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        
        {/* Search and Filters Header */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#0AAC9E]" />
              Select Target Groups
            </h3>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleSelectAll}
                className="px-3 py-1 text-sm bg-[#0AAC9E] text-white rounded hover:bg-[#0AAC9E]/90 transition-colors"
              >
                Select All
              </button>
              <button
                onClick={handleDeselectAll}
                className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
              >
                Deselect All
              </button>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search target groups..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0AAC9E]/20 focus:border-[#0AAC9E] text-sm"
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 border rounded-lg transition-colors text-sm font-medium flex items-center gap-2 ${
                showFilters 
                  ? 'border-[#0AAC9E] bg-[#0AAC9E]/5 text-[#0AAC9E]' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <select
                    value={filterOptions.department}
                    onChange={(e) => setFilterOptions(prev => ({
                      ...prev,
                      department: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#0AAC9E]/20 focus:border-[#0AAC9E]"
                  >
                    <option value="">All Departments</option>
                    <option value="hr">Human Resources</option>
                    <option value="it">Information Technology</option>
                    <option value="sales">Sales</option>
                    <option value="marketing">Marketing</option>
                    <option value="finance">Finance</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role Level
                  </label>
                  <select
                    value={filterOptions.role}
                    onChange={(e) => setFilterOptions(prev => ({
                      ...prev,
                      role: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#0AAC9E]/20 focus:border-[#0AAC9E]"
                  >
                    <option value="">All Roles</option>
                    <option value="junior">Junior</option>
                    <option value="senior">Senior</option>
                    <option value="manager">Manager</option>
                    <option value="director">Director</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <select
                    value={filterOptions.location}
                    onChange={(e) => setFilterOptions(prev => ({
                      ...prev,
                      location: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#0AAC9E]/20 focus:border-[#0AAC9E]"
                  >
                    <option value="">All Locations</option>
                    <option value="remote">Remote</option>
                    <option value="office">Office</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-3 flex justify-end">
                <button
                  onClick={() => setFilterOptions({ department: '', role: '', location: '' })}
                  className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Target Groups List */}
        <div className="max-h-96 overflow-y-auto">
          {filteredTargetGroups.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">No target groups found</p>
              <p className="text-sm text-gray-400 mt-1">
                {searchTerm || Object.values(filterOptions).some(v => v) 
                  ? "Try adjusting your search or filters" 
                  : "No target groups are available"
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredTargetGroups.map((group) => {
                const isSelected = selectedTargetGroups.includes(group.id);
                const isExpanded = expandedGroups.has(group.id);
                
                return (
                  <div key={group.id} className="hover:bg-gray-50 transition-colors">
                    
                    {/* Group Header */}
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        
                        {/* Checkbox */}
                        <button
                          onClick={() => handleTargetGroupToggle(group.id)}
                          className="flex-shrink-0"
                        >
                          {isSelected ? (
                            <CheckCircle className="w-5 h-5 text-[#0AAC9E]" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                          )}
                        </button>
                        
                        {/* Group Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900 truncate">
                              {group.name}
                            </h4>
                            {group.isActive === false && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                Inactive
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {group.users?.length || 0} users
                            </span>
                            {group.department && (
                              <span>{group.department}</span>
                            )}
                            {group.location && (
                              <span>{group.location}</span>
                            )}
                          </div>
                          
                          {group.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {group.description}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Expand/Collapse Button */}
                      {group.users && group.users.length > 0 && (
                        <button
                          onClick={() => toggleGroupExpansion(group.id)}
                          className="p-1 text-gray-400 hover:text-gray-600 rounded"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                    
                    {/* Expanded User List */}
                    {isExpanded && group.users && group.users.length > 0 && (
                      <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
                        <div className="pt-3">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">
                            Group Members ({group.users.length})
                          </h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                            {group.users.map((user) => (
                              <div key={user.userId} className="flex items-center gap-2 text-sm">
                                <div className="w-6 h-6 bg-[#0AAC9E]/10 rounded-full flex items-center justify-center">
                                  <span className="text-xs font-medium text-[#0AAC9E]">
                                    {user.fullName?.charAt(0) || 'U'}
                                  </span>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-gray-900 truncate">
                                    {user.fullName}
                                  </p>
                                  <p className="text-gray-500 text-xs truncate">
                                    {user.email}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Selected Groups Summary */}
      {targetGroupStats.selectedCount > 0 && (
        <div className="bg-[#0AAC9E]/5 border border-[#0AAC9E]/20 rounded-xl p-4">
          <h4 className="font-semibold text-[#0AAC9E] mb-2 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Course Access Summary
          </h4>
        
          
          <div className="mt-3 flex flex-wrap gap-2">
            {targetGroupStats.selectedGroups.slice(0, 3).map((group) => (
              <span key={group.id} className="px-2 py-1 bg-white text-[#0AAC9E] text-xs rounded border border-[#0AAC9E]/20">
                {group.name}
              </span>
            ))}
            {targetGroupStats.selectedGroups.length > 3 && (
              <span className="px-2 py-1 bg-white text-[#0AAC9E] text-xs rounded border border-[#0AAC9E]/20">
                +{targetGroupStats.selectedGroups.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Publishing Settings */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#0AAC9E]" />
          Publishing Settings
        </h3>
        
        <div className="space-y-4">
          
          {/* Publish Course Toggle */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-[#0AAC9E]" />
              <div>
                <div className="font-medium text-sm">Publish Course</div>
                <div className="text-xs text-gray-500">
                  Make course available to assigned learners
                </div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={publishSettings.publishCourse}
                onChange={(e) => handlePublishSettingChange('publishCourse', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#0AAC9E]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0AAC9E]"></div>
            </label>
          </div>

          {/* Auto Reassign */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-[#0AAC9E]" />
              <div>
                <div className="font-medium text-sm">Auto Reassign</div>
                <div className="text-xs text-gray-500">
                  Automatically reassign when target groups change
                </div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={publishSettings.autoReassign}
                onChange={(e) => handlePublishSettingChange('autoReassign', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#0AAC9E]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0AAC9E]"></div>
            </label>
          </div>

          {/* Course Evaluation */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-[#0AAC9E]" />
              <div>
                <div className="font-medium text-sm">Enable Course Evaluation</div>
                <div className="text-xs text-gray-500">
                  Allow learners to rate and provide feedback
                </div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={publishSettings.hasEvaluation}
                onChange={(e) => handlePublishSettingChange('hasEvaluation', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#0AAC9E]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0AAC9E]"></div>
            </label>
          </div>

          {/* Start Date and Deadline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date (Optional)
              </label>
              <input
                type="date"
                value={publishSettings.startDuration || ''}
                onChange={(e) => handlePublishSettingChange('startDuration', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0AAC9E]/20 focus:border-[#0AAC9E]"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deadline (Optional)
              </label>
              <input
                type="date"
                value={publishSettings.deadline || ''}
                onChange={(e) => handlePublishSettingChange('deadline', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0AAC9E]/20 focus:border-[#0AAC9E]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Individual User Assignment */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">
              Need to assign individual users?
            </h4>
            <p className="text-sm text-blue-800">
              You can also assign specific users who may not be in your selected target groups.
            </p>
          </div>
          <button
            onClick={handleAssignUsers}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4" />
            Assign Users
          </button>
        </div>
      </div>

      {/* Validation Warning */}
      {selectedTargetGroups.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-yellow-800">
                No Target Groups Selected
              </h4>
              <p className="text-sm text-yellow-700 mt-1">
                Please select at least one target group to make your course accessible to learners.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <button
          onClick={() => dispatch(prevStep())}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          Back to Content
        </button>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleNext}
            disabled={selectedTargetGroups.length === 0}
            className="px-6 py-2 bg-[#0AAC9E] text-white rounded-lg hover:bg-[#0AAC9E]/90 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <span>Review & Publish</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TargetGroupsForm;