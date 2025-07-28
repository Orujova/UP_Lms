import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { 
  X, 
  Users, 
  Search, 
  UserPlus,
  UserCheck,
  UserX,
  Filter,
  CheckCircle,
  AlertCircle,
  Loader2,
  Mail,
  Building,
  Badge,
  ArrowRight,
  Download,
  Upload
} from "lucide-react";
import {
  setModalOpen,
  assignUsersAsync,
  setUserAssignment,
  addSelectedUser,
  removeSelectedUser,
  clearSelectedUsers,
  fetchCourseLearnersAsync
} from "@/redux/course/courseSlice";
import { getAllTargetGroupsAsync } from "@/redux/getAllTargetGroups/getAllTargetGroups";

const AssignUsersModal = () => {
  const dispatch = useDispatch();
  
  const { 
    modals, 
    currentCourse,
    userAssignment,
    courseLearners 
  } = useSelector((state) => state.course || {});
  
  const targetGroups = useSelector((state) => state.getAllTargetGroups.data?.[0]?.targetGroups) || [];
  
  const isOpen = modals?.assignUsers || false;
  
  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTargetGroup, setSelectedTargetGroup] = useState("");
  const [assignmentMode, setAssignmentMode] = useState("individual"); // "individual" | "group"
  const [showFilters, setShowFilters] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Select Users, 2: Review, 3: Confirm
  const [errors, setErrors] = useState({});
  
  // Fetch data when modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch(getAllTargetGroupsAsync());
      if (currentCourse?.id) {
        dispatch(fetchCourseLearnersAsync({ 
          courseId: currentCourse.id, 
          page: 1, 
          take: 100 
        }));
      }
    }
  }, [isOpen, currentCourse?.id, dispatch]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
      setSelectedTargetGroup("");
      setAssignmentMode("individual");
      setShowFilters(false);
      setCurrentStep(1);
      setErrors({});
      dispatch(clearSelectedUsers());
    }
  }, [isOpen, dispatch]);

  // Get available users from target groups (excluding already enrolled)
  const availableUsers = useMemo(() => {
    if (!targetGroups.length) return [];
    
    // Get enrolled user IDs
    const enrolledUserIds = courseLearners.data.flatMap(learner => 
      learner.learnerUsers?.map(user => user.userId) || []
    );
    
    // Get users from all target groups
    const allUsers = targetGroups.flatMap(group => {
      // In real API, you would fetch users for each target group
      // For now, we'll use the topAssignedUsers from the response
      return group.users || [];
    });
    
    // Filter out already enrolled users
    return allUsers.filter(user => !enrolledUserIds.includes(user.userId));
  }, [targetGroups, courseLearners.data]);

  // Filtered users based on search and target group
  const filteredUsers = useMemo(() => {
    let users = availableUsers;
    
    // Filter by search term
    if (searchTerm) {
      users = users.filter(user => 
        user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.userName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by target group
    if (selectedTargetGroup) {
      users = users.filter(user => 
        user.targetGroups?.includes(selectedTargetGroup)
      );
    }
    
    return users;
  }, [availableUsers, searchTerm, selectedTargetGroup]);

  const handleClose = () => {
    dispatch(setModalOpen({ modal: 'assignUsers', isOpen: false }));
  };

  const handleUserToggle = (user) => {
    const isSelected = userAssignment.selectedUsers.some(u => u.userId === user.userId);
    
    if (isSelected) {
      dispatch(removeSelectedUser(user.userId));
    } else {
      dispatch(addSelectedUser({
        userId: user.userId,
        userName: user.userName,
        fullName: user.fullName,
        email: user.email,
        profilePictureUrl: user.profilePictureUrl
      }));
    }
  };

  const handleTargetGroupAssign = async (targetGroupId) => {
    if (!currentCourse?.id || !targetGroupId) {
      setErrors({ targetGroup: "Please select a target group" });
      return;
    }

    try {
      // In real implementation, you would assign all users from target group
      const targetGroup = targetGroups.find(g => g.id === parseInt(targetGroupId));
      if (targetGroup?.users) {
        const userIds = targetGroup.users.map(user => user.userId);
        
        await dispatch(assignUsersAsync({
          appUserIds: userIds,
          courseIds: [currentCourse.id]
        })).unwrap();
        
        handleClose();
      }
    } catch (error) {
      setErrors({ submit: error.message || "Failed to assign users" });
    }
  };

  const handleIndividualAssign = async () => {
    if (!currentCourse?.id || userAssignment.selectedUsers.length === 0) {
      setErrors({ users: "Please select at least one user" });
      return;
    }

    try {
      const userIds = userAssignment.selectedUsers.map(user => user.userId);
      
      await dispatch(assignUsersAsync({
        appUserIds: userIds,
        courseIds: [currentCourse.id]
      })).unwrap();
      
      handleClose();
    } catch (error) {
      setErrors({ submit: error.message || "Failed to assign users" });
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            {/* Assignment Mode Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Assignment Method
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setAssignmentMode("individual")}
                  className={`p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                    assignmentMode === "individual"
                      ? "border-[#0AAC9E] bg-[#0AAC9E]/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <UserPlus className={`w-5 h-5 ${
                      assignmentMode === "individual" ? "text-[#0AAC9E]" : "text-gray-500"
                    }`} />
                    <div>
                      <div className="font-semibold text-sm">Individual Users</div>
                      <div className="text-xs text-gray-500">Select specific users</div>
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={() => setAssignmentMode("group")}
                  className={`p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                    assignmentMode === "group"
                      ? "border-[#0AAC9E] bg-[#0AAC9E]/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Users className={`w-5 h-5 ${
                      assignmentMode === "group" ? "text-[#0AAC9E]" : "text-gray-500"
                    }`} />
                    <div>
                      <div className="font-semibold text-sm">Target Groups</div>
                      <div className="text-xs text-gray-500">Assign entire groups</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {assignmentMode === "group" ? (
              /* Target Group Assignment */
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Select Target Group
                </label>
                <select
                  value={selectedTargetGroup}
                  onChange={(e) => setSelectedTargetGroup(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0AAC9E]/20 focus:border-[#0AAC9E]"
                >
                  <option value="">Choose a target group...</option>
                  {targetGroups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name} ({group.users?.length || 0} users)
                    </option>
                  ))}
                </select>
                {errors.targetGroup && (
                  <p className="mt-2 text-sm text-red-600">{errors.targetGroup}</p>
                )}
              </div>
            ) : (
              /* Individual User Selection */
              <div>
                {/* Search and Filters */}
                <div className="space-y-3 mb-4">
                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search users by name, email, or username..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0AAC9E]/20 focus:border-[#0AAC9E] text-sm"
                      />
                    </div>
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className={`px-4 py-2 border rounded-lg transition-colors text-sm font-medium ${
                        showFilters 
                          ? "border-[#0AAC9E] bg-[#0AAC9E]/5 text-[#0AAC9E]"
                          : "border-gray-300 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <Filter className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {showFilters && (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Filter by Target Group
                      </label>
                      <select
                        value={selectedTargetGroup}
                        onChange={(e) => setSelectedTargetGroup(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-[#0AAC9E]/20 focus:border-[#0AAC9E]"
                      >
                        <option value="">All target groups</option>
                        {targetGroups.map((group) => (
                          <option key={group.id} value={group.name}>
                            {group.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Users List */}
                <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                  {filteredUsers.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                      {filteredUsers.map((user) => {
                        const isSelected = userAssignment.selectedUsers.some(u => u.userId === user.userId);
                        
                        return (
                          <div
                            key={user.userId}
                            className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                              isSelected ? "bg-[#0AAC9E]/5" : ""
                            }`}
                            onClick={() => handleUserToggle(user)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="relative">
                                  {user.profilePictureUrl ? (
                                    <img
                                      src={user.profilePictureUrl}
                                      alt={user.fullName}
                                      className="w-10 h-10 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                      <span className="text-gray-600 font-medium text-sm">
                                        {user.fullName?.charAt(0)?.toUpperCase()}
                                      </span>
                                    </div>
                                  )}
                                  {isSelected && (
                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#0AAC9E] rounded-full flex items-center justify-center">
                                      <CheckCircle className="w-3 h-3 text-white" />
                                    </div>
                                  )}
                                </div>
                                
                                <div>
                                  <h4 className="font-semibold text-gray-900 text-sm">
                                    {user.fullName}
                                  </h4>
                                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                    <span className="flex items-center gap-1">
                                      <Mail className="w-3 h-3" />
                                      {user.email}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Badge className="w-3 h-3" />
                                      {user.userName}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center">
                                {isSelected ? (
                                  <UserCheck className="w-5 h-5 text-[#0AAC9E]" />
                                ) : (
                                  <UserPlus className="w-5 h-5 text-gray-400" />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm">
                        {searchTerm || selectedTargetGroup 
                          ? "No users found matching your criteria" 
                          : "No available users to assign"
                        }
                      </p>
                    </div>
                  )}
                </div>

                {errors.users && (
                  <p className="mt-2 text-sm text-red-600">{errors.users}</p>
                )}
              </div>
            )}
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Review Assignment
              </h3>
              <p className="text-sm text-gray-600">
                Please review the users you're about to assign to the course
              </p>
            </div>
            
            {assignmentMode === "individual" && userAssignment.selectedUsers.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">
                  Selected Users ({userAssignment.selectedUsers.length})
                </h4>
                <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-200">
                  {userAssignment.selectedUsers.map((user) => (
                    <div key={user.userId} className="p-3 flex items-center gap-3">
                      {user.profilePictureUrl ? (
                        <img
                          src={user.profilePictureUrl}
                          alt={user.fullName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-gray-600 font-medium text-xs">
                            {user.fullName?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-sm">{user.fullName}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
        
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-gray-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-[#0AAC9E]/5 to-[#0AAC9E]/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0AAC9E]/20 rounded-lg">
              <Users className="w-5 h-5 text-[#0AAC9E]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Assign Users to Course
              </h2>
              <p className="text-sm text-gray-600">
                {currentCourse?.name}
              </p>
            </div>
          </div>
          
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={userAssignment.loading}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          {renderStepContent()}
          
          {errors.submit && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span className="text-red-700 text-sm font-medium">{errors.submit}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-4">
            {assignmentMode === "individual" && (
              <div className="text-sm text-gray-600">
                {userAssignment.selectedUsers.length} user(s) selected
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 text-sm font-medium"
              disabled={userAssignment.loading}
            >
              Cancel
            </button>
            
            <button
              onClick={assignmentMode === "group" 
                ? () => handleTargetGroupAssign(selectedTargetGroup)
                : handleIndividualAssign
              }
              disabled={
                userAssignment.loading || 
                (assignmentMode === "individual" && userAssignment.selectedUsers.length === 0) ||
                (assignmentMode === "group" && !selectedTargetGroup)
              }
              className="flex items-center gap-2 px-4 py-2 bg-[#0AAC9E] text-white rounded-lg hover:bg-[#0AAC9E]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg text-sm font-medium transform hover:scale-105 disabled:transform-none"
            >
              {userAssignment.loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Assigning...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Assign Users</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignUsersModal;