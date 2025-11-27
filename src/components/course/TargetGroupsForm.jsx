import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { 
  Users, 
  Search, 
  CheckCircle, 
  Circle,
  Clock,
  Settings,
  AlertCircle,
  UserPlus,
  Loader2,
  X,
  Building2,
  Send,
  CheckCircle2,
  Zap,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import {
  setFormData,
  nextStep,
  prevStep,
  publishCourseAsync,
  assignUsersAsync
} from "@/redux/course/courseSlice";
import {
  assignCoursesToClusterAsync
} from "@/redux/cluster/clusterSlice";
import { 
  adminApplicationUserAsync
} from "@/redux/adminApplicationUser/adminApplicationUser";

const CoursePublishForm = ({ isEditing = false }) => {
  const dispatch = useDispatch();
  
  const { 
    formData, 
    currentStep,
    loading,
    currentCourse
  } = useSelector((state) => state.course || {});
  
  // Get users from adminApplicationUser slice
  const { 
    data: usersData
  } = useSelector((state) => state.adminApplicationUser || {});
  
  const {
    clusters = [],
    loading: clusterLoading
  } = useSelector((state) => state.cluster || {});

  // Extract users from the API response structure
  const users = useMemo(() => {
    if (usersData?.length > 0 && usersData[0]?.appUsers) {
      return usersData[0].appUsers || [];
    }
    return [];
  }, [usersData]);

  const totalUserCount = useMemo(() => {
    if (usersData?.length > 0) {
      return usersData[0]?.totalAppUserCount || 0;
    }
    return 0;
  }, [usersData]);

  // Local state
  const [publishSettings, setPublishSettings] = useState({
    publishCourse: formData?.publishCourse || false,
    autoReassign: formData?.autoReassign || false,
    hasEvaluation: formData?.hasEvaluation || false,
    startDuration: formData?.startDuration || null,
    deadline: formData?.deadline || null
  });

  // Enhanced state for dropdowns and modals
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [showPublishConfirmModal, setShowPublishConfirmModal] = useState(false);
  
  // Searchable dropdown states
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [clusterSearchTerm, setClusterSearchTerm] = useState("");
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showClusterDropdown, setShowClusterDropdown] = useState(false);
  
  // Loading states
  const [isPublishing, setIsPublishing] = useState(false);
  const [isAssigningUsers, setIsAssigningUsers] = useState(false);
  const [isAssigningToCluster, setIsAssigningToCluster] = useState(false);
  const [publishResult, setPublishResult] = useState(null);

  // Get course ID - prioritize real ID over temp ID
  const getCourseId = () => {
    const courseId = currentCourse?.id || formData?.courseId || formData?.id;
    return courseId && !courseId.toString().startsWith('temp_') ? courseId : null;
  };

  // Fetch users on component mount
  useEffect(() => {
    dispatch(adminApplicationUserAsync({ page: 1, take: 100 }));
  }, [dispatch]);

  // Update local state when formData changes
  useEffect(() => {
    setPublishSettings({
      publishCourse: formData?.publishCourse || false,
      autoReassign: formData?.autoReassign || false,
      hasEvaluation: formData?.hasEvaluation || false,
      startDuration: formData?.startDuration || null,
      deadline: formData?.deadline || null
    });
  }, [formData]);

  // Filter users for search
  const filteredUsers = useMemo(() => {
    if (!userSearchTerm) return users;
    
    return users.filter(user => {
      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
      const searchLower = userSearchTerm.toLowerCase();
      
      return fullName.toLowerCase().includes(searchLower) ||
             user.email?.toLowerCase().includes(searchLower) ||
             user.userName?.toLowerCase().includes(searchLower) ||
             user.department?.name?.toLowerCase().includes(searchLower) ||
             user.position?.name?.toLowerCase().includes(searchLower);
    });
  }, [users, userSearchTerm]);

  // Filter clusters for search
  const filteredClusters = useMemo(() => {
    if (!clusterSearchTerm) return clusters;
    
    return clusters.filter(cluster =>
      cluster.subject?.toLowerCase().includes(clusterSearchTerm.toLowerCase()) ||
      cluster.description?.toLowerCase().includes(clusterSearchTerm.toLowerCase())
    );
  }, [clusters, clusterSearchTerm]);

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

  // Enhanced user selection handlers
  const handleUserToggle = (userId) => {
    const newSelected = selectedUsers.includes(userId)
      ? selectedUsers.filter(id => id !== userId)
      : [...selectedUsers, userId];
    
    setSelectedUsers(newSelected);
  };

  const handleSelectAllUsers = () => {
    const allUserIds = filteredUsers.map(user => user.id);
    setSelectedUsers(allUserIds);
  };

  const handleDeselectAllUsers = () => {
    setSelectedUsers([]);
  };

  // API Integration Functions

  // 1. Assign users to course API
  const handleAssignUsers = async () => {
    const courseId = getCourseId();
    
    if (!courseId) {
      alert("Please save your course first before assigning users.");
      return;
    }

    if (selectedUsers.length === 0) {
      alert("Please select at least one user to assign.");
      return;
    }

    setIsAssigningUsers(true);
    
    try {
      const assignmentData = {
        appUserIds: selectedUsers,
        courseIds: [parseInt(courseId)]
      };

      const result = await dispatch(assignUsersAsync(assignmentData)).unwrap();
      
      console.log('Users assigned successfully:', result);
      
      // Show success message
      alert(`Successfully assigned ${selectedUsers.length} users to the course.`);
      
      // Reset selection
      setSelectedUsers([]);
      setShowUserDropdown(false);
      
    } catch (error) {
      console.error('Failed to assign users:', error);
      alert(`Failed to assign users: ${error.message || 'Unknown error'}`);
    } finally {
      setIsAssigningUsers(false);
    }
  };

  // 2. Assign course to cluster API
  const handleAssignToCluster = async () => {
    const courseId = getCourseId();
    
    if (!courseId) {
      alert("Please save your course first before assigning to cluster.");
      return;
    }

    if (!selectedCluster) {
      alert("Please select a cluster.");
      return;
    }

    setIsAssigningToCluster(true);
    
    try {
      const assignmentData = {
        clusterId: selectedCluster.id,
        userId: formData.userId,
        courses: [{
          courseId: parseInt(courseId),
          isMandatory: selectedCluster.isMandatory || false,
          orderNumber: selectedCluster.orderNumber || 1,
          coefficient: selectedCluster.coefficient || 0
        }]
      };

      const result = await dispatch(assignCoursesToClusterAsync(assignmentData)).unwrap();
      
      console.log('Course assigned to cluster successfully:', result);
      
      // Show success message
      alert(`Successfully assigned course to cluster: ${selectedCluster.subject}`);
      
      // Reset selection
      setSelectedCluster(null);
      setShowClusterDropdown(false);
      
    } catch (error) {
      console.error('Failed to assign course to cluster:', error);
      alert(`Failed to assign to cluster: ${error.message || 'Unknown error'}`);
    } finally {
      setIsAssigningToCluster(false);
    }
  };

  // 3. Publish course API
  const handlePublishCourse = async () => {
    const courseId = getCourseId();
    
    if (!courseId) {
      alert("Please save your course first before publishing.");
      return;
    }

    setIsPublishing(true);
    setPublishResult(null);
    
    try {
      const result = await dispatch(publishCourseAsync(courseId)).unwrap();
      
      console.log('Course published successfully:', result);
      
      setPublishResult({
        success: true,
        message: result.message || 'Course published successfully!',
        courseId: courseId
      });
      
      // Update publish setting in formData
      dispatch(setFormData({
        ...formData,
        publishCourse: true
      }));
      
      // Auto-close modal after 3 seconds
      setTimeout(() => {
        setShowPublishConfirmModal(false);
        dispatch(nextStep());
      }, 3000);
      
    } catch (error) {
      console.error('Failed to publish course:', error);
      setPublishResult({
        success: false,
        message: error.message || 'Failed to publish course',
        courseId: courseId
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleNext = () => {
    setShowPublishConfirmModal(true);
  };

  // Searchable User Dropdown Component
  const SearchableUserDropdown = ({ isOpen, onToggle, selectedCount }) => (
    <div className="relative">
      <button
        onClick={onToggle}
        className="w-full px-3 py-2 text-left bg-white border border-gray-300 rounded hover:border-[#0AAC9E] focus:ring-2 focus:ring-[#0AAC9E]/20 focus:border-[#0AAC9E] transition-all duration-200 flex items-center justify-between text-sm"
      >
        <div className="flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-[#0AAC9E]" />
          <span className="text-gray-700">
            {selectedCount > 0 ? `${selectedCount} users selected` : 'Select users to assign'}
          </span>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-50 max-h-64 overflow-hidden">
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
              <input
                type="text"
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                placeholder="Search users..."
                className="w-full pl-6 pr-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-[#0AAC9E]/20 focus:border-[#0AAC9E]"
                autoFocus
              />
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-gray-600">{filteredUsers.length} users</span>
              <div className="flex gap-1">
                <button
                  onClick={handleSelectAllUsers}
                  className="px-1.5 py-0.5 text-xs bg-[#0AAC9E] text-white rounded hover:bg-[#0AAC9E]/90 transition-colors"
                >
                  All
                </button>
                <button
                  onClick={handleDeselectAllUsers}
                  className="px-1.5 py-0.5 text-xs border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                >
                  None
                </button>
              </div>
            </div>
          </div>
          
          <div className="max-h-40 overflow-y-auto">
            {filteredUsers.map((user) => {
              const userId = user.id;
              const isSelected = selectedUsers.includes(userId);
              const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
              
              return (
                <div key={userId} className="flex items-center gap-2 p-2 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0">
                  <button
                    onClick={() => handleUserToggle(userId)}
                    className="flex-shrink-0"
                  >
                    {isSelected ? (
                      <CheckCircle className="w-3.5 h-3.5 text-[#0AAC9E]" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                  
                  <div className="w-6 h-6 bg-[#0AAC9E]/10 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-[#0AAC9E]">
                      {user.firstName?.charAt(0) || user.userName?.charAt(0) || 'U'}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate text-xs">
                      {fullName || user.userName}
                    </h4>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <span className="truncate">{user.email}</span>
                      {user.department?.name && (
                        <>
                          <span className="text-gray-300">•</span>
                          <span className="truncate">{user.department.name}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-3 text-gray-500">
              <UserPlus className="w-5 h-5 mx-auto mb-1 text-gray-300" />
              <p className="text-xs">No users found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // Searchable Cluster Dropdown Component
  const SearchableClusterDropdown = ({ isOpen, onToggle, selectedCluster }) => (
    <div className="relative">
      <button
        onClick={onToggle}
        className="w-full px-3 py-2 text-left bg-white border border-gray-300 rounded hover:border-[#0AAC9E] focus:ring-2 focus:ring-[#0AAC9E]/20 focus:border-[#0AAC9E] transition-all duration-200 flex items-center justify-between text-sm"
      >
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[#0AAC9E]" />
          <span className="text-gray-700">
            {selectedCluster ? selectedCluster.subject : 'Select a cluster'}
          </span>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-50 max-h-64 overflow-hidden">
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
              <input
                type="text"
                value={clusterSearchTerm}
                onChange={(e) => setClusterSearchTerm(e.target.value)}
                placeholder="Search clusters..."
                className="w-full pl-6 pr-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-[#0AAC9E]/20 focus:border-[#0AAC9E]"
                autoFocus
              />
            </div>
            <span className="text-xs text-gray-600 mt-1 block">{filteredClusters.length} clusters</span>
          </div>
          
          <div className="max-h-40 overflow-y-auto">
            {filteredClusters.map((cluster) => (
              <div key={cluster.id} className="p-2 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0">
                <button
                  onClick={() => {
                    setSelectedCluster(cluster);
                    setShowClusterDropdown(false);
                  }}
                  className="w-full text-left"
                >
                  <h4 className="font-medium text-gray-900 text-xs">
                    {cluster.subject}
                  </h4>
                  
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                    <span>{cluster.courses?.length || 0} courses</span>
          
             
                  </div>
                </button>
              </div>
            ))}
          </div>
          
          {filteredClusters.length === 0 && (
            <div className="text-center py-3 text-gray-500">
              <Building2 className="w-5 h-5 mx-auto mb-1 text-gray-300" />
              <p className="text-xs">No clusters found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (!users && !totalUserCount) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-[#0AAC9E]" />
        <span className="ml-2 text-gray-600 text-sm">Loading users...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-3 max-w-6xl mx-auto text-sm">
      
      {/* Header */}
      <div className="text-center px-2">
        <h2 className="text-lg font-bold text-gray-900 mb-1">
          Publish & Assign Course
        </h2>
        <p className="text-gray-600 max-w-xl mx-auto text-xs">
          Configure publishing settings, assign users to your course, add to clusters, and publish to make it available to learners.
        </p>
      </div>

      {/* Course Summary */}
      <div className="bg-gradient-to-r from-[#0AAC9E]/5 to-[#0AAC9E]/10 rounded p-3 border border-[#0AAC9E]/20">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              {formData?.name || "Course Name"}
            </h3>
            <p className="text-gray-600 text-xs mb-2">
              {formData?.description || "Course description"}
            </p>
            <div className="flex items-center gap-3 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{formData?.duration || 0} min</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{totalUserCount} users</span>
              </div>
              <div className="flex items-center gap-1">
                <UserPlus className="w-3 h-3" />
                <span>{selectedUsers.length} selected</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course ID Warning */}
      {!getCourseId() && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-yellow-800 text-sm">
                Course Not Saved
              </h4>
              <p className="text-xs text-yellow-700 mt-0.5">
                Please save your course in Step 1 before assigning users or adding to clusters.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Assignment Section */}
      <div className="bg-white rounded border border-gray-200 p-3">
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Settings className="w-4 h-4 text-[#0AAC9E]" />
          Course Assignment
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* User Assignment */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Assign Individual Users
            </label>
            <SearchableUserDropdown
              isOpen={showUserDropdown}
              onToggle={() => setShowUserDropdown(!showUserDropdown)}
              selectedCount={selectedUsers.length}
            />
            {selectedUsers.length > 0 && (
              <div className="mt-2">
                <button
                  onClick={handleAssignUsers}
                  disabled={!getCourseId() || isAssigningUsers}
                  className="w-full px-3 py-1.5 bg-[#0AAC9E] text-white rounded hover:bg-[#0AAC9E]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-xs"
                >
                  {isAssigningUsers ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <UserPlus className="w-3 h-3" />
                  )}
                  Assign {selectedUsers.length} User{selectedUsers.length !== 1 ? 's' : ''}
                </button>
              </div>
            )}
          </div>

          {/* Cluster Assignment */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Add to Learning Cluster
            </label>
            <SearchableClusterDropdown
              isOpen={showClusterDropdown}
              onToggle={() => setShowClusterDropdown(!showClusterDropdown)}
              selectedCluster={selectedCluster}
            />
            {selectedCluster && (
              <div className="mt-2 space-y-2">
                {/* Cluster Configuration */}
                <div className="bg-gray-50 rounded p-2 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">
                        Order
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={selectedCluster.orderNumber || 1}
                        onChange={(e) => setSelectedCluster({
                          ...selectedCluster,
                          orderNumber: parseInt(e.target.value)
                        })}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-[#0AAC9E]/20 focus:border-[#0AAC9E]"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">
                        Coefficient (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={selectedCluster.coefficient || 0}
                        onChange={(e) => setSelectedCluster({
                          ...selectedCluster,
                          coefficient: parseInt(e.target.value)
                        })}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-[#0AAC9E]/20 focus:border-[#0AAC9E]"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={selectedCluster.isMandatory || false}
                        onChange={(e) => setSelectedCluster({
                          ...selectedCluster,
                          isMandatory: e.target.checked
                        })}
                        className="text-[#0AAC9E] focus:ring-[#0AAC9E]"
                      />
                      <span className="text-xs text-gray-700">Make mandatory in cluster</span>
                    </label>
                  </div>
                </div>
                
                <button
                  onClick={handleAssignToCluster}
                  disabled={!getCourseId() || isAssigningToCluster}
                  className="w-full px-3 py-1.5 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-xs"
                >
                  {isAssigningToCluster ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Building2 className="w-3 h-3" />
                  )}
                  Add to Cluster
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Publish Section */}
      <div className="bg-white rounded border border-gray-200 p-3">
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Send className="w-4 h-4 text-[#0AAC9E]" />
          Publish Course
        </h3>
        
        <div className="text-center">
          <p className="text-gray-600 mb-3 text-xs">
            Ready to make your course available to learners? Click below to publish and complete the course creation process.
          </p>
          
          <button
            onClick={handleNext}
            disabled={!getCourseId()}
            className="px-4 py-2 bg-[#0AAC9E] text-white rounded hover:bg-[#0AAC9E]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mx-auto text-sm"
          >
            <Send className="w-4 h-4" />
            Publish Course
          </button>
        </div>
      </div>

      {/* Publish Confirmation Modal */}
      {showPublishConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded shadow-xl w-full max-w-md">
            <div className="p-4">
              {publishResult ? (
                // Success/Error Result
                <div className="text-center">
                  <div className={`w-12 h-12 ${publishResult.success ? 'bg-green-100' : 'bg-red-100'} rounded-full mx-auto mb-3 flex items-center justify-center`}>
                    {publishResult.success ? (
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    ) : (
                      <AlertCircle className="w-6 h-6 text-red-600" />
                    )}
                  </div>
                  
                  <h3 className={`text-sm font-semibold mb-2 ${publishResult.success ? 'text-green-900' : 'text-red-900'}`}>
                    {publishResult.success ? 'Course Published Successfully!' : 'Publishing Failed'}
                  </h3>
                  
                  <p className={`text-xs mb-3 ${publishResult.success ? 'text-green-700' : 'text-red-700'}`}>
                    {publishResult.message}
                  </p>
                  
                  {publishResult.success && (
                    <div className="bg-green-50 border border-green-200 rounded p-2 mb-3">
                      <div className="text-xs text-green-800">
                        <p className="font-medium mb-1">Course is now live!</p>
                        <p>Course ID: {publishResult.courseId}</p>
                        <p>Selected Users: {selectedUsers.length}</p>
                        <p>Available to: {totalUserCount} total users</p>
                      </div>
                    </div>
                  )}
                  
                  {publishResult.success ? (
                    <div className="text-xs text-gray-500">
                      Automatically continuing in 3 seconds...
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowPublishConfirmModal(false)}
                      className="px-3 py-1.5 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-xs"
                    >
                      Close
                    </button>
                  )}
                </div>
              ) : (
                // Confirmation Dialog
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 bg-[#0AAC9E]/10 rounded-full flex items-center justify-center">
                      <Send className="w-5 h-5 text-[#0AAC9E]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">
                        Publish Course
                      </h3>
                      <p className="text-xs text-gray-500">
                        Make your course available to learners
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded p-3 mb-3">
                    <h4 className="font-medium text-gray-900 mb-2 text-xs">Publishing Summary</h4>
                    <div className="space-y-1 text-xs text-gray-700">
                      <div className="flex justify-between">
                        <span>Course:</span>
                        <span className="font-medium">{formData?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Selected Users:</span>
                        <span className="font-medium">{selectedUsers.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Available Users:</span>
                        <span className="font-medium">{totalUserCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Course ID:</span>
                        <span className="font-medium font-mono text-xs">{getCourseId()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded p-2 mb-3">
                    <div className="flex items-start gap-2">
                      <Zap className="w-3 h-3 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-blue-800">
                        <p className="font-medium">What happens when you publish:</p>
                        <ul className="mt-1 space-y-0.5 text-xs">
                          <li>• Course becomes visible to assigned users</li>
                          <li>• Learners receive notifications (if enabled)</li>
                          <li>• Course appears in their learning dashboard</li>
                          <li>• Progress tracking begins</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowPublishConfirmModal(false)}
                      className="flex-1 px-3 py-1.5 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePublishCourse}
                      disabled={isPublishing}
                      className="flex-1 px-3 py-1.5 bg-[#0AAC9E] text-white rounded hover:bg-[#0AAC9E]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 text-xs"
                    >
                      {isPublishing ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Send className="w-3 h-3" />
                      )}
                      Publish Course
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Click outside handlers */}
      {(showUserDropdown || showClusterDropdown) && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowUserDropdown(false);
            setShowClusterDropdown(false);
          }}
        />
      )}
    </div>
  );
};

export default CoursePublishForm;