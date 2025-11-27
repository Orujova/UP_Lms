"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  MapPin,
  Award,
  Edit,
  Key,
  Image as ImageIcon,
  XCircle,
  Camera,
  Building,
  Layers,
  FileText,
  Users,
  Globe,
  Box,
  Save,
  ArrowLeft,
  Target,
  Upload,
  CheckCircle,
} from "lucide-react";
import { getToken, getUserId } from "@/authtoken/auth.js";
import PasswordChangeModal from "./PasswordChangeModal ";
import ImageUploadModal from "./ImageUploadModal ";
import noPP from "@/images/noPP.png";
import { toast } from "sonner";
import LoadingSpinner from "@/components/loadingSpinner";
import Placeholder from "@/components/profile/Placeholder";
import ProfileSection from "@/components/profile/ProfileSection";
import ProfileInfoRow from "@/components/profile/ProfileInfoRow";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";

// Redux Async Actions Import
import { functionalAreaAsync } from "@/redux/functionalArea/functionalArea";
import { departmentAsync } from "@/redux/department/department";
import { projectAsync } from "@/redux/project/project";
import { divisionAsync } from "@/redux/division/division";
import { subDivisionAsync } from "@/redux/subDivision/subDivision";
import { positionGroupAsync } from "@/redux/positionGroup/positionGroup";
import { positionAsync } from "@/redux/position/position";
import { genderAsync } from "@/redux/gender/gender";
import { residentalAreaAsync } from "@/redux/residentalArea/residentalArea";
import CoverPhotoUploadModal from "@/components/coverPhotoUploadModal";
// Base selectors
const getFunctionalAreaState = (state) => state.functionalArea;
const getDepartmentState = (state) => state.department;
const getProjectState = (state) => state.project;
const getDivisionState = (state) => state.division;
const getSubDivisionState = (state) => state.subDivision;
const getPositionGroupState = (state) => state.positionGroup;
const getPositionState = (state) => state.position;
const getGenderState = (state) => state.gender;
const getResidentalAreaState = (state) => state.residentalArea;

const extractSafeData = (state, dataKey) => {
  if (!state || !state.data) return [];

  // Try different data structures
  if (
    Array.isArray(state.data) &&
    state.data[0] &&
    Array.isArray(state.data[0][dataKey])
  ) {
    return state.data[0][dataKey] || [];
  }

  if (state.data && Array.isArray(state.data[dataKey])) {
    return state.data[dataKey] || [];
  }

  return [];
};

// Memoized selectors
const selectFunctionalAreas = createSelector(
  [getFunctionalAreaState],
  (state) => extractSafeData(state, "functionalAreas")
);

const selectDepartments = createSelector([getDepartmentState], (state) =>
  extractSafeData(state, "departments")
);

const selectProjects = createSelector([getProjectState], (state) =>
  extractSafeData(state, "projects")
);

const selectDivisions = createSelector([getDivisionState], (state) =>
  extractSafeData(state, "divisions")
);

const selectSubDivisions = createSelector([getSubDivisionState], (state) =>
  extractSafeData(state, "subDivisions")
);

const selectPositionGroups = createSelector([getPositionGroupState], (state) =>
  extractSafeData(state, "positionGroups")
);

const selectPositions = createSelector([getPositionState], (state) =>
  extractSafeData(state, "positions")
);

// Special cases
const selectGenders = createSelector(
  [getGenderState],
  (state) => state?.data || []
);

const selectResidentalAreas = createSelector(
  [getResidentalAreaState],
  (state) => extractSafeData(state, "residentalAreas")
);

// ProfileAvatar component - Enhanced with better shadows and hover effects
const ProfileAvatar = ({ imageUrl, size = "large", onClick, editMode }) => {
  const sizeClasses = {
    small: "w-16 h-16",
    medium: "w-24 h-24",
    large: "w-32 h-32",
  };

  return (
    <div className="relative">
      <div
        className={`${sizeClasses[size]} rounded-full border-4 border-white bg-gray-100 
                    flex items-center justify-center shadow-lg overflow-hidden transition-transform hover:scale-105 duration-300`}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <User
            className={size === "large" ? "w-16 h-16" : "w-10 h-10"}
            text-gray-400
          />
        )}
      </div>
      {onClick && editMode && (
        <button
          onClick={onClick}
          className="absolute bottom-0 right-0 bg-[#54c5bb] text-white rounded-full p-2 hover:bg-[#3bbdb1] shadow-md transition-colors"
          title="Update Photo"
        >
          <Camera className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

// StatusBadge component - Enhanced with animation
const StatusBadge = ({ isActive }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors
    ${isActive ? "bg-[#ecfcfb] text-[#3bbdb1]" : "bg-red-50 text-red-600"}`}
  >
    <span
      className={`h-2 w-2 rounded-full mr-1.5 ${
        isActive ? "bg-[#3bbdb1] animate-pulse" : "bg-red-500"
      }`}
    ></span>
    {isActive ? "Active" : "Inactive"}
  </span>
);

// Main AdminProfilePage Component
const AdminProfilePage = () => {
  const dispatch = useDispatch();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isImageUploadModalOpen, setIsImageUploadModalOpen] = useState(false);
  const [isCoverPhotoModalOpen, setIsCoverPhotoModalOpen] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("User details");
  const [activeSection, setActiveSection] = useState("all");
  const dataFetched = useRef(false);

  // Use Redux selectors
  const functionalAreas = useSelector(selectFunctionalAreas);
  const departments = useSelector(selectDepartments);
  const projects = useSelector(selectProjects);
  const divisions = useSelector(selectDivisions);
  const subDivisions = useSelector(selectSubDivisions);
  const positionGroups = useSelector(selectPositionGroups);
  const positions = useSelector(selectPositions);
  const genders = useSelector(selectGenders);
  const residentalAreas = useSelector(selectResidentalAreas);

  const token = getToken();
  const userId = getUserId();
  const API_URL = "https://demoadmin.databyte.app/api/";

  // Enhanced default cover photo
  const defaultCoverPhoto =
    "https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80";

  // Fetch User Data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) {
        setError("No user ID found");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}AdminApplicationUser/${userId}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();
        // Set the active status based on isDeleted flag (inverted logic)
        data.isActive = !data.isDeleted;
        setUserData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, token, API_URL]);

  // Fetch dropdown options using Redux
  useEffect(() => {
    if (!dataFetched.current) {
      // Dispatch all Redux async actions
      Promise.all([
        dispatch(functionalAreaAsync()),
        dispatch(departmentAsync()),
        dispatch(projectAsync()),
        dispatch(divisionAsync()),
        dispatch(subDivisionAsync()),
        dispatch(positionGroupAsync()),
        dispatch(positionAsync()),
        dispatch(genderAsync()),
        dispatch(residentalAreaAsync()),
      ])
        .then(() => {
          dataFetched.current = true;
        })
        .catch((error) => {
          console.error("Error fetching dropdown data:", error);
          toast.error("Failed to load dropdown options");
        });
    }
  }, [dispatch]);

  // Handle field updates
  const handleFieldUpdate = (fieldName, value) => {
    // Create a deep copy of userData to prevent issues with nested objects
    const updatedUserData = { ...userData };

    if (fieldName.endsWith("Id")) {
      const numericValue = parseInt(value, 10);

      // Handle dropdown selections (IDs)
      updatedUserData[fieldName] = numericValue;

      const objectName = fieldName.slice(0, -2);

      // Find the corresponding object in the options array
      let newObject = null;

      switch (objectName) {
        case "functionalArea":
          newObject = functionalAreas.find((item) => item.id === numericValue);
          break;
        case "department":
          newObject = departments.find((item) => item.id === numericValue);
          break;
        case "project":
          newObject = projects.find((item) => item.id === numericValue);
          break;
        case "division":
          newObject = divisions.find((item) => item.id === numericValue);
          break;
        case "subDivision":
          newObject = subDivisions.find((item) => item.id === numericValue);
          break;
        case "positionGroup":
          newObject = positionGroups.find((item) => item.id === numericValue);
          break;
        case "position":
          newObject = positions.find((item) => item.id === numericValue);

          // Automatically update managerial level based on position level
          if (newObject) {
            if (newObject.level === 0) {
              updatedUserData.managerialLevel = "Manager";
            } else if (newObject.level === 1) {
              updatedUserData.managerialLevel = "Non-manager";
            }
          }
          break;
        case "residentalArea":
          newObject = residentalAreas.find((item) => item.id === numericValue);
          break;
        case "gender":
          newObject = genders.find((item) => item.id === numericValue);
          break;
        default:
          break;
      }

      if (newObject) {
        updatedUserData[objectName] = newObject;
      }
    } else {
      // Handle text fields
      updatedUserData[fieldName] = value;
    }

    setUserData(updatedUserData);
  };

  const prepareUpdateData = () => {
    return {
      Id: userData.id,
      UserName: userData.userName,
      FirstName: userData.firstName,
      LastName: userData.lastName,
      Email: userData.email,
      Badge: userData.badge,
      Pin: userData.pin,
      PhoneNumber: userData.phoneNumber,
      Password: userData.password,
      IsServiceUser: userData.isServiceUser,
      ManagerialLevel: userData.managerialLevel,
      BirthDate: userData.birthDate,
      StartedDate: userData.startedDate,
      GenderId: userData.genderId || userData.gender?.id,
      RoleIds: userData.roleIds || [],
      TargetGroupIds: userData.targetGroupIds || [],
      FunctionalAreaId:
        userData.functionalAreaId || userData.functionalArea?.id,
      DepartmentId: userData.departmentId || userData.department?.id,
      ProjectId: userData.projectId || userData.project?.id,
      DivisionId: userData.divisionId || userData.division?.id,
      SubDivisionId: userData.subDivisionId || userData.subDivision?.id,
      PositionGroupId: userData.positionGroupId || userData.positionGroup?.id,
      PositionId: userData.positionId || userData.position?.id,
      ResidentalAreaId:
        userData.residentalAreaId || userData.residentalArea?.id,
      CoverPhotoUrl: userData.coverPhotoUrl,
      ImageUrl: userData.imageUrl,
    };
  };

  const handleUpdateProfile = async () => {
    setSaveLoading(true);
    try {
      const updateData = prepareUpdateData();
      console.log("Sending data:", updateData);

      // Convert updateData to query parameters
      const queryParams = new URLSearchParams({
        Id: updateData.Id,
        UserName: updateData.UserName,
        FirstName: updateData.FirstName,
        LastName: updateData.LastName,
        Email: updateData.Email,
        Badge: updateData.Badge,
        Pin: updateData.Pin,
        PhoneNumber: updateData.PhoneNumber,
        Password: updateData.Password,
        IsServiceUser: String(updateData.IsServiceUser),
        ManagerialLevel: updateData.ManagerialLevel,
        BirthDate: updateData.BirthDate || "",
        StartedDate: updateData.StartedDate || "",
        GenderId: updateData.GenderId || "",
        FunctionalAreaId: updateData.FunctionalAreaId || "",
        DepartmentId: updateData.DepartmentId || "",
        ProjectId: updateData.ProjectId || "",
        DivisionId: updateData.DivisionId || "",
        SubDivisionId: updateData.SubDivisionId || "",
        PositionGroupId: updateData.PositionGroupId || "",
        PositionId: updateData.PositionId || "",
        ResidentalAreaId: updateData.ResidentalAreaId || "",
        CoverPhotoUrl: updateData.CoverPhotoUrl || "",
        ImageUrl: updateData.ImageUrl || "",
      });

      // Add array fields (RoleIds, TargetGroupIds)
      updateData.RoleIds.forEach((id) => queryParams.append("RoleIds", id));
      updateData.TargetGroupIds.forEach((id) =>
        queryParams.append("TargetGroupIds", id)
      );

      const url = `${API_URL}AdminApplicationUser?${queryParams.toString()}`;

      console.log("Sending request to:", url);

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const responseText = await response.text();
      console.log("Raw API response:", responseText);

      if (response.ok) {
        // 200-299 status codes
        toast.success("Profile updated successfully");
        setEditMode(false);

        // Refresh user data
        const refreshResponse = await fetch(
          `${API_URL}AdminApplicationUser/${userData.id}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (refreshResponse.ok) {
          const refreshedData = await refreshResponse.json();
          refreshedData.isActive = !refreshedData.isDeleted;
          setUserData(refreshedData);
        } else {
          console.warn(
            "Failed to refresh user data:",
            await refreshResponse.text()
          );
        }
      } else {
        let responseData;
        try {
          responseData = responseText
            ? JSON.parse(responseText)
            : { title: response.statusText };
        } catch (e) {
          responseData = { title: "Invalid response from server" };
        }

        if (response.status === 400 && responseData.errors) {
          const errorMessages = Object.values(responseData.errors).flat();
          const displayErrors = errorMessages.slice(0, 3);
          const remaining =
            errorMessages.length > 3
              ? ` and ${errorMessages.length - 3} more errors`
              : "";
          toast.error(
            `Validation errors: ${displayErrors.join(", ")}${remaining}`
          );
        } else {
          toast.error(responseData.title || "Failed to update profile");
        }
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSaveLoading(false);
    }
  };

  // Update Profile Image Handler
  const handleUpdateImage = async (file) => {
    try {
      // Create FormData object
      const formData = new FormData();
      formData.append("ImageFile", file);

      // API endpoint for profile image
      const endpoint = `${API_URL}AdminApplicationUser/UpdateUserImage?Id=${userData.id}`;

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorResponse = await response.text();
        console.error("Server error response:", errorResponse);
        throw new Error("Failed to update profile image");
      }

      // Show success message
      toast.success("Profile image updated successfully");

      // Refresh the user data from the server
      try {
        const updatedResponse = await fetch(
          `${API_URL}AdminApplicationUser/${userData.id}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (updatedResponse.ok) {
          const refreshedData = await updatedResponse.json();
          refreshedData.isActive = !refreshedData.isDeleted;
          setUserData(refreshedData);
        }
      } catch (refreshError) {
        console.warn(
          "Could not refresh user data after image upload",
          refreshError
        );
      }

      return true;
    } catch (error) {
      console.error("Image update error:", error);
      toast.error(error.message || "Failed to update profile image");
      throw error;
    }
  };

  // Update Cover Photo Handler
  const handleUpdateCoverPhoto = async (file) => {
    try {
      // First, upload the file to a temporary location (if needed)
      // Then create a data URL for the selected file
      const reader = new FileReader();
      const coverPhotoPromise = new Promise((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);

      // Get the data URL
      const coverPhotoBase64 = await coverPhotoPromise;

      // Update userData with the new cover photo
      const updatedUserData = {
        ...userData,
        coverPhotoUrl: coverPhotoBase64,
      };

      setUserData(updatedUserData);

      // Now save the profile with the new cover photo
      await handleSaveWithCoverPhoto(updatedUserData);

      toast.success("Cover photo updated successfully");

      return true;
    } catch (error) {
      console.error("Cover photo update error:", error);
      toast.error(error.message || "Failed to update cover photo");
      throw error;
    }
  };

  // Save profile with updated cover photo
  const handleSaveWithCoverPhoto = async (updatedData) => {
    setSaveLoading(true);
    try {
      const updateData = prepareUpdateData(updatedData);

      // Convert updateData to query parameters
      const queryParams = new URLSearchParams({
        Id: updateData.Id,
        UserName: updateData.UserName,
        FirstName: updateData.FirstName,
        LastName: updateData.LastName,
        Email: updateData.Email,
        Badge: updateData.Badge,
        Pin: updateData.Pin,
        PhoneNumber: updateData.PhoneNumber,
        Password: updateData.Password,
        IsServiceUser: String(updateData.IsServiceUser),
        ManagerialLevel: updateData.ManagerialLevel,
        BirthDate: updateData.BirthDate || "",
        StartedDate: updateData.StartedDate || "",
        GenderId: updateData.GenderId || "",
        FunctionalAreaId: updateData.FunctionalAreaId || "",
        DepartmentId: updateData.DepartmentId || "",
        ProjectId: updateData.ProjectId || "",
        DivisionId: updateData.DivisionId || "",
        SubDivisionId: updateData.SubDivisionId || "",
        PositionGroupId: updateData.PositionGroupId || "",
        PositionId: updateData.PositionId || "",
        ResidentalAreaId: updateData.ResidentalAreaId || "",
        CoverPhotoUrl: updateData.CoverPhotoUrl || "",
        ImageUrl: updateData.ImageUrl || "",
      });

      // Add array fields (RoleIds, TargetGroupIds)
      updateData.RoleIds.forEach((id) => queryParams.append("RoleIds", id));
      updateData.TargetGroupIds.forEach((id) =>
        queryParams.append("TargetGroupIds", id)
      );

      const url = `${API_URL}AdminApplicationUser?${queryParams.toString()}`;

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to update cover photo");
      }

      // Refresh user data
      const refreshResponse = await fetch(
        `${API_URL}AdminApplicationUser/${userData.id}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (refreshResponse.ok) {
        const refreshedData = await refreshResponse.json();
        refreshedData.isActive = !refreshedData.isDeleted;
        setUserData(refreshedData);
      }

      return true;
    } catch (error) {
      console.error("Profile update error:", error);
      throw error;
    } finally {
      setSaveLoading(false);
    }
  };

  // Loading State - simplified loader
  if (loading) return <LoadingSpinner />;

  // Error State with minimalist UI
  if (error)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="bg-white p-6 rounded-lg shadow-sm text-center max-w-md mx-4">
          <div className="w-12 h-12 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-6 h-6 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Error loading profile
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#0AAC9E] text-white rounded-md hover:bg-[#099b8e] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );

  // Get profile tab content based on active tab
  const getTabContent = () => {
    switch (activeTab) {
      case "User details":
        return (
          <>
            {/* Profile Content in Grid Layout */}
            {(activeSection === "all" || activeSection === "account") && (
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 mb-6`}>
                {/* Account Information */}
                <ProfileSection
                  title="Account Information"
                  icon={User}
                  className={`col-span-1 ${
                    activeSection !== "all" ? "md:col-span-2" : ""
                  }`}
                >
                  <ProfileInfoRow
                    icon={User}
                    label="Username"
                    value={userData.userName}
                    fieldName="userName"
                    editMode={editMode}
                    onEdit={handleFieldUpdate}
                  />
                  <ProfileInfoRow
                    icon={User}
                    label="First Name"
                    value={userData.firstName}
                    fieldName="firstName"
                    editMode={editMode}
                    onEdit={handleFieldUpdate}
                  />
                  <ProfileInfoRow
                    icon={User}
                    label="Last Name"
                    value={userData.lastName}
                    fieldName="lastName"
                    editMode={editMode}
                    onEdit={handleFieldUpdate}
                  />
                  <ProfileInfoRow
                    icon={Mail}
                    label="Email Address"
                    value={userData.email}
                    fieldName="email"
                    editMode={editMode}
                    onEdit={handleFieldUpdate}
                    type="email"
                  />
                  <ProfileInfoRow
                    icon={Phone}
                    label="Phone Number"
                    value={userData.phoneNumber}
                    fieldName="phoneNumber"
                    editMode={editMode}
                    onEdit={handleFieldUpdate}
                    type="tel"
                  />
                </ProfileSection>

                {activeSection === "all" && (
                  <>
                    {/* Professional Information */}
                    <ProfileSection
                      title="Professional Information"
                      icon={Briefcase}
                      className="col-span-1"
                    >
                      <ProfileInfoRow
                        icon={Briefcase}
                        label="Position"
                        value={userData.position?.name}
                        fieldName="positionId"
                        editMode={editMode}
                        onEdit={handleFieldUpdate}
                        type="select"
                        options={positions}
                      />
                      <ProfileInfoRow
                        icon={Users}
                        label="Position Group"
                        value={userData.positionGroup?.name}
                        fieldName="positionGroupId"
                        editMode={editMode}
                        onEdit={handleFieldUpdate}
                        type="select"
                        options={positionGroups}
                      />
                      <ProfileInfoRow
                        icon={Building}
                        label="Department"
                        value={userData.department?.name}
                        fieldName="departmentId"
                        editMode={editMode}
                        onEdit={handleFieldUpdate}
                        type="select"
                        options={departments}
                      />
                      <ProfileInfoRow
                        icon={Layers}
                        label="Division"
                        value={userData.division?.name}
                        fieldName="divisionId"
                        editMode={editMode}
                        onEdit={handleFieldUpdate}
                        type="select"
                        options={divisions}
                      />
                      <ProfileInfoRow
                        icon={Layers}
                        label="Sub Division"
                        value={userData.subDivision?.name}
                        fieldName="subDivisionId"
                        editMode={editMode}
                        onEdit={handleFieldUpdate}
                        type="select"
                        options={subDivisions}
                      />
                    </ProfileSection>
                  </>
                )}
              </div>
            )}

            {/* Show Additional Section in a second row when viewing all */}
            {activeSection === "all" && (
              <div className="grid grid-cols-1 gap-5 mb-6">
                {/* Additional Information */}
                <ProfileSection title="Additional Information" icon={Globe}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ProfileInfoRow
                      icon={Box}
                      label="Project"
                      value={userData.project?.name}
                      fieldName="projectId"
                      editMode={editMode}
                      onEdit={handleFieldUpdate}
                      type="select"
                      options={projects}
                    />
                    <ProfileInfoRow
                      icon={Award}
                      label="Functional Area"
                      value={userData.functionalArea?.name}
                      fieldName="functionalAreaId"
                      editMode={editMode}
                      onEdit={handleFieldUpdate}
                      type="select"
                      options={functionalAreas}
                    />
                    <ProfileInfoRow
                      icon={MapPin}
                      label="Residential Area"
                      value={userData.residentalArea?.name}
                      fieldName="residentalAreaId"
                      editMode={editMode}
                      onEdit={handleFieldUpdate}
                      type="select"
                      options={residentalAreas}
                    />
                  </div>
                </ProfileSection>
              </div>
            )}
            {/* Target Groups Section as a standalone section when viewing all */}
            {activeSection === "all" &&
              userData.targetGroupNames &&
              userData.targetGroupNames.length > 0 && (
                <div className="mb-6">
                  <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center mb-4">
                      <div className="h-10 w-10 rounded-lg bg-[#ecfcfb] flex items-center justify-center mr-3">
                        <Target className="h-5 w-5 text-[#0AAC9E]" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        Target Groups
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {userData.targetGroupNames.map((group, index) => (
                        <div
                          key={index}
                          className="bg-[#F6FFFD] border text-sm border-[#D0F5F1] py-2 px-4 rounded-lg text-[#0AAC9E] font-medium shadow-sm flex items-center hover:shadow-md transition-shadow duration-200"
                        >
                          <Target className="h-4 w-4 mr-2 text-[#0AAC9E]" />
                          {group}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            {/* Show Professional Info if in professional section */}
            {activeSection === "professional" && (
              <div className="mb-6">
                <ProfileSection
                  title="Professional Information"
                  icon={Briefcase}
                >
                  <ProfileInfoRow
                    icon={Briefcase}
                    label="Position"
                    value={userData.position?.name}
                    fieldName="positionId"
                    editMode={editMode}
                    onEdit={handleFieldUpdate}
                    type="select"
                    options={positions}
                  />
                  <ProfileInfoRow
                    icon={Users}
                    label="Position Group"
                    value={userData.positionGroup?.name}
                    fieldName="positionGroupId"
                    editMode={editMode}
                    onEdit={handleFieldUpdate}
                    type="select"
                    options={positionGroups}
                  />
                  <ProfileInfoRow
                    icon={Building}
                    label="Department"
                    value={userData.department?.name}
                    fieldName="departmentId"
                    editMode={editMode}
                    onEdit={handleFieldUpdate}
                    type="select"
                    options={departments}
                  />
                  <ProfileInfoRow
                    icon={Layers}
                    label="Division"
                    value={userData.division?.name}
                    fieldName="divisionId"
                    editMode={editMode}
                    onEdit={handleFieldUpdate}
                    type="select"
                    options={divisions}
                  />
                  <ProfileInfoRow
                    icon={Layers}
                    label="Sub Division"
                    value={userData.subDivision?.name}
                    fieldName="subDivisionId"
                    editMode={editMode}
                    onEdit={handleFieldUpdate}
                    type="select"
                    options={subDivisions}
                  />
                </ProfileSection>
              </div>
            )}

            {/* Show Additional Info if in additional section */}
            {activeSection === "additional" && (
              <div className="mb-6">
                <ProfileSection title="Additional Information" icon={Globe}>
                  <ProfileInfoRow
                    icon={Box}
                    label="Project"
                    value={userData.project?.name}
                    fieldName="projectId"
                    editMode={editMode}
                    onEdit={handleFieldUpdate}
                    type="select"
                    options={projects}
                  />
                  <ProfileInfoRow
                    icon={Award}
                    label="Functional Area"
                    value={userData.functionalArea?.name}
                    fieldName="functionalAreaId"
                    editMode={editMode}
                    onEdit={handleFieldUpdate}
                    type="select"
                    options={functionalAreas}
                  />
                  <ProfileInfoRow
                    icon={MapPin}
                    label="Residential Area"
                    value={userData.residentalArea?.name}
                    fieldName="residentalAreaId"
                    editMode={editMode}
                    onEdit={handleFieldUpdate}
                    type="select"
                    options={residentalAreas}
                  />
                  <ProfileInfoRow
                    icon={FileText}
                    label="Roles"
                    value={
                      userData.roleIds && userData.roleIds.length > 0
                        ? `${userData.roleIds.length} roles assigned`
                        : "No roles"
                    }
                    fieldName="roleIds"
                    editMode={false}
                    onEdit={handleFieldUpdate}
                  />
                </ProfileSection>
              </div>
            )}
          </>
        );
      case "Achievements":
        return <Placeholder />;
      case "Trainings":
        return <Placeholder />;
      case "Courses":
        return <Placeholder />;
      default:
        return null;
    }
  };

  // Render Profile Page
  return (
    <div className="min-h-screen bg-gray-50 pt-10">
      <div className="mx-auto">
        {/* Back button for mobile */}
        {activeSection !== "all" && (
          <button
            onClick={() => setActiveSection("all")}
            className="inline-flex items-center text-[#808080] text-sm font-medium mt-4 mb-2 lg:hidden"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </button>
        )}

        {/* Profile Header with Cover */}
        <div className="bg-white shadow-sm rounded-lg mb-6 overflow-hidden">
          <div className="relative">
            {/* Cover Photo with direct update button */}
            {/* Cover Photo with update modal button */}
            <div
              className="h-48 bg-cover bg-center relative"
              style={{
                backgroundImage: userData.coverPhotoUrl
                  ? `url(${userData.coverPhotoUrl.replace(
                      "https://100.42.179.27:7298/",
                      "https://demoadmin.databyte.app/uploads/"
                    )})`
                  : `url(${defaultCoverPhoto})`,
              }}
            >
              {/* Cover Photo Edit Button */}
              {editMode && (
                <div className="absolute top-4 right-4">
                  <button
                    onClick={() => setIsCoverPhotoModalOpen(true)}
                    className="bg-black/50 hover:bg-black/70 text-white px-4 py-2 rounded-md flex items-center text-sm transition-colors backdrop-blur-sm shadow-lg"
                  >
                    <Camera className="w-4 h-4 mr-2" /> Update Cover Photo
                  </button>
                </div>
              )}
            </div>

            {/* Enhanced Profile and Actions Bar */}
            <div className="p-4 flex flex-col sm:flex-row items-start sm:items-end justify-between relative">
              {/* Profile Image - positioned higher */}
              <div className="absolute -top-20 left-6 flex items-end">
                <ProfileAvatar
                  imageUrl={
                    userData?.imageUrl
                      ? userData.imageUrl.replace(
                          "https://100.42.179.27:7298/",
                          "https://demoadmin.databyte.app/uploads/"
                        )
                      : noPP
                  }
                  size="large"
                  editMode={editMode}
                  onClick={() => setIsImageUploadModalOpen(true)}
                />
              </div>

              {/* User Info with better spacing and typography */}
              <div className="mt-16 sm:mt-0 sm:ml-40">
                <div className="flex items-center flex-wrap">
                  <h1 className="text-2xl font-bold text-gray-800 mr-3">
                    {userData.firstName} {userData.lastName}
                  </h1>
                  <StatusBadge isActive={userData.isActive} className="ml-2" />
                </div>
                <p className="text-sm text-gray-600 mt-1.5 font-medium">
                  {userData.position?.name || "No Position"}{" "}
                  {userData.managerialLevel
                    ? `(${userData.managerialLevel})`
                    : ""}
                </p>
                <div className="flex flex-wrap items-center mt-3 text-sm text-gray-500">
                  <div className="flex items-center mr-5 mb-1.5">
                    <Mail className="w-4 h-4 mr-1.5 text-[#808080]" />
                    <span>{userData.email}</span>
                  </div>
                  <div className="flex items-center mb-1.5">
                    <Phone className="w-4 h-4 mr-1.5 text-[#808080]" />
                    <span>{userData.phoneNumber || "No Phone"}</span>
                  </div>
                </div>
              </div>

              {/* Edit/Save Buttons */}
              <div className="mt-4 sm:mt-0 w-full sm:w-auto flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                {activeTab === "User details" && (
                  <>
                    {editMode ? (
                      <>
                        <button
                          onClick={() => setEditMode(false)}
                          className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md text-sm flex items-center justify-center transition-colors border border-gray-200"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleUpdateProfile}
                          disabled={saveLoading}
                          className={`bg-[#0AAC9E] hover:bg-[#099b8e] text-white px-4 py-1.5 rounded-md text-sm flex items-center justify-center transition-colors ${
                            saveLoading ? "opacity-70 cursor-not-allowed" : ""
                          }`}
                        >
                          {saveLoading ? (
                            <>
                              <div className="animate-spin h-4 w-4 mr-1.5 border-2 border-white border-t-transparent rounded-full"></div>
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-1.5" /> Save
                            </>
                          )}
                        </button>
                      </>
                    ) : (
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => setIsPasswordModalOpen(true)}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md flex items-center text-sm transition-colors"
                        >
                          <Key className="w-4 h-4 mr-1.5" /> Change Password
                        </button>
                        <button
                          onClick={() => setEditMode(true)}
                          className="bg-[#0AAC9E] hover:bg-[#099b8e] text-white px-4 py-1.5 rounded-md text-sm flex items-center justify-center transition-colors"
                        >
                          <Edit className="w-4 h-4 mr-1.5" /> Edit Profile
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex overflow-x-auto">
              {["User details", "Achievements", "Trainings", "Courses"].map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`whitespace-nowrap py-4 px-6 font-medium text-sm border-b-2 transition-colors ${
                      activeTab === tab
                        ? "border-[#0AAC9E] text-[#0AAC9E]"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {tab}
                  </button>
                )
              )}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mb-6">{getTabContent()}</div>

        {/* Modals */}
        {isPasswordModalOpen && (
          <PasswordChangeModal
            isOpen={isPasswordModalOpen}
            onClose={() => setIsPasswordModalOpen(false)}
            userId={userId}
          />
        )}
        {isImageUploadModalOpen && (
          <ImageUploadModal
            isOpen={isImageUploadModalOpen}
            onClose={() => setIsImageUploadModalOpen(false)}
            onUpload={handleUpdateImage}
            title={"Update Profile Photo"}
          />
        )}
        {isCoverPhotoModalOpen && (
          <CoverPhotoUploadModal
            isOpen={isCoverPhotoModalOpen}
            onClose={() => setIsCoverPhotoModalOpen(false)}
            onUpload={handleUpdateCoverPhoto}
          />
        )}
      </div>
    </div>
  );
};

export default AdminProfilePage;
