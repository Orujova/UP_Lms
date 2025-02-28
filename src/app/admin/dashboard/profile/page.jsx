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
  CheckCircle,
  XCircle,
  Camera,
  Building,
  Layers,
  FileText,
  Users,
  Globe,
  Hash,
  Box,
  Save,
  Search,
  ArrowLeft,
} from "lucide-react";
import { getToken } from "@/authtoken/auth.js";
import PasswordChangeModal from "./PasswordChangeModal ";
import ImageUploadModal from "./ImageUploadModal ";
import noPP from "@/images/noPP.png";
import { toast } from "sonner";

// Enhanced profile section card with hover effect
const ProfileSection = ({ title, icon: Icon, children, className = "" }) => (
  <div
    className={`bg-white rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg ${className}`}
  >
    <div className="flex items-center mb-5">
      {Icon && (
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#ecfcfb] text-[#0AAC9E] mr-3">
          <Icon className="w-5 h-5" />
        </div>
      )}
      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
    </div>
    <div className="space-y-1">{children}</div>
  </div>
);

// Enhanced profile info row with better spacing and transitions
const ProfileInfoRow = ({
  icon: Icon,
  label,
  value,
  fieldName,
  editMode,
  onEdit,
  type = "text",
  options = [],
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [searchText, setSearchText] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSave = () => {
    onEdit(fieldName, editValue);
    setIsEditing(false);
    setShowDropdown(false);
  };

  if (editMode && isEditing) {
    return (
      <div className="flex items-center py-3 transition-colors bg-gray-50 rounded-lg p-3 my-2">
        <Icon className="w-4 h-4 mr-3 text-gray-950 flex-shrink-0" />

        {type === "select" ? (
          <div className="flex-grow mr-3 relative" ref={dropdownRef}>
            <div
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full px-3 py-2 border rounded-lg flex justify-between items-center cursor-pointer hover:border-[#01DBC8] bg-white transition-colors"
            >
              <span className="truncate">
                {options && Array.isArray(options) && options.length > 0
                  ? options.find((opt) => opt.id === parseInt(editValue))
                      ?.name || "Select an option"
                  : "Select an option"}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 transition-transform ${
                  showDropdown ? "transform rotate-180" : ""
                }`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            {showDropdown && options && Array.isArray(options) && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                <div className="p-2 sticky top-0 bg-white border-b">
                  <div className="relative">
                    <Search className="absolute left-2 top-2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-sm border rounded-md"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
                <div>
                  {options
                    .filter((option) =>
                      option.name
                        ?.toLowerCase()
                        .includes(searchText.toLowerCase())
                    )
                    .map((option) => (
                      <div
                        key={option.id}
                        className={`px-3 py-2 text-xs font-medium cursor-pointer hover:bg-[#f2fdfc] transition-colors ${
                          parseInt(editValue) === option.id
                            ? "bg-[#f2fdfc] text-[#0AAC9E] font-medium"
                            : ""
                        }`}
                        onClick={() => {
                          setEditValue(option.id.toString());
                          setShowDropdown(false);
                        }}
                      >
                        {option.name}
                      </div>
                    ))}
                  {options.filter((option) =>
                    option.name
                      ?.toLowerCase()
                      .includes(searchText.toLowerCase())
                  ).length === 0 && (
                    <div className="px-3 py-2 text-sm text-gray-500 italic text-center">
                      No results found
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <input
            type={type}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="flex-grow mr-3 px-3 py-2 border outline-0 rounded-lg focus:ring-0 focus:border-[#01DBC8]  text-sm"
            autoFocus
          />
        )}

        <div className="flex space-x-2">
          <button
            onClick={handleSave}
            className="p-1.5 bg-[#ecfcfb]  text-[#0AAC9E] rounded-md hover:bg-[#e0fbf8] transition-colors"
            title="Save"
          >
            <CheckCircle className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setIsEditing(false);
              setShowDropdown(false);
            }}
            className="p-1.5 bg-red-50 text-red-500 rounded-md hover:bg-red-100 transition-colors"
            title="Cancel"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center py-3 border-b border-gray-100 last:border-b-0 transition-colors hover:bg-gray-50 rounded-md px-3">
      <Icon className="w-4 h-4 text-gray-500 mr-3" />
      <div className="flex-grow">
        <span className="text-xs text-gray-500 block">{label}</span>
        <span className="font-medium text-gray-800 text-sm">
          {value || "N/A"}
        </span>
      </div>

      {editMode && (
        <button
          onClick={() => setIsEditing(true)}
          className="p-1.5 text-gray-400 hover:text-[#0AAC9E] hover:bg-[#f2fdfc] rounded-md transition-colors"
          title="Edit"
        >
          <Edit className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

// Enhanced profile avatar with better shadows and hover effects
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
      {editMode && onClick && (
        <button
          onClick={onClick}
          className="absolute bottom-0 right-0 bg-[#54c5bb] text-white rounded-full p-2 hover:bg-[#3bbdb1] shadow-md transition-colors"
        >
          <Camera className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

// Enhanced status badge with animation
const StatusBadge = ({ isActive }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors
    ${isActive ? "bg-[#ecfcfb] text-[#3bbdb1]" : "bg-gray-100 text-gray-700"}`}
  >
    <span
      className={`h-2 w-2 rounded-full mr-1.5 ${
        isActive ? "bg-[#3bbdb1] animate-pulse" : "bg-gray-500"
      }`}
    ></span>
    {isActive ? "Active" : "Inactive"}
  </span>
);

// Main AdminProfilePage Component
const AdminProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isImageUploadModalOpen, setIsImageUploadModalOpen] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const [activeSection, setActiveSection] = useState("all"); // For mobile view: "all", "account", "professional", "additional"

  // Options for dropdown lists
  const [functionalAreas, setFunctionalAreas] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [subDivisions, setSubDivisions] = useState([]);
  const [positionGroups, setPositionGroups] = useState([]);
  const [positions, setPositions] = useState([]);
  const [residentialAreas, setResidentialAreas] = useState([]);

  const token = getToken();
  const userId = localStorage.getItem("userId");
  const API_URL = "https://bravoadmin.uplms.org/api/";

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

  // Fetch dropdown options
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        if (!token) return;

        // Fetch functional areas
        const fetchFunctionalAreas = async () => {
          const response = await fetch(`${API_URL}FunctionalArea`, {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) throw new Error("Failed to fetch functional areas");

          const data = await response.json();
          if (data && data[0] && Array.isArray(data[0].functionalAreas)) {
            setFunctionalAreas(data[0].functionalAreas);
          }
        };

        // Fetch departments
        const fetchDepartments = async () => {
          const response = await fetch(`${API_URL}Department`, {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) throw new Error("Failed to fetch departments");

          const data = await response.json();
          if (data && data[0] && Array.isArray(data[0].departments)) {
            setDepartments(data[0].departments);
          }
        };

        // Fetch projects
        const fetchProjects = async () => {
          const response = await fetch(`${API_URL}Project`, {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) throw new Error("Failed to fetch projects");

          const data = await response.json();
          if (data && data[0] && Array.isArray(data[0].projects)) {
            setProjects(data[0].projects);
          }
        };

        // Fetch divisions
        const fetchDivisions = async () => {
          const response = await fetch(`${API_URL}Division`, {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) throw new Error("Failed to fetch divisions");

          const data = await response.json();
          if (data && data[0] && Array.isArray(data[0].divisions)) {
            setDivisions(data[0].divisions);
          }
        };

        // Fetch sub divisions
        const fetchSubDivisions = async () => {
          const response = await fetch(`${API_URL}SubDivision`, {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) throw new Error("Failed to fetch sub divisions");

          const data = await response.json();
          if (data && data[0] && Array.isArray(data[0].subDivisions)) {
            setSubDivisions(data[0].subDivisions);
          }
        };

        // Fetch position groups
        const fetchPositionGroups = async () => {
          const response = await fetch(`${API_URL}PositionGroup`, {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) throw new Error("Failed to fetch position groups");

          const data = await response.json();
          if (data && data[0] && Array.isArray(data[0].positionGroups)) {
            setPositionGroups(data[0].positionGroups);
          }
        };

        // Fetch positions
        const fetchPositions = async () => {
          const response = await fetch(`${API_URL}Position`, {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) throw new Error("Failed to fetch positions");

          const data = await response.json();
          if (data && data[0] && Array.isArray(data[0].positions)) {
            setPositions(data[0].positions);
          } else {
            // Fallback if structure is different
            setPositions(data && Array.isArray(data) ? data : []);
          }
        };

        // Fetch residential areas
        const fetchResidentialAreas = async () => {
          const response = await fetch(`${API_URL}ResidentalArea`, {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok)
            throw new Error("Failed to fetch residential areas");

          const data = await response.json();
          if (data && data[0] && Array.isArray(data[0].residentialAreas)) {
            setResidentialAreas(data[0].residentialAreas);
          }
        };

        // Execute all fetches in parallel for better performance
        await Promise.all([
          fetchFunctionalAreas(),
          fetchDepartments(),
          fetchProjects(),
          fetchDivisions(),
          fetchSubDivisions(),
          fetchPositionGroups(),
          fetchPositions(),
          fetchResidentialAreas(),
        ]);
      } catch (error) {
        console.error("Error fetching dropdown options:", error);
        toast("error", "Failed to load dropdown options");
      }
    };

    fetchOptions();
  }, [token, API_URL]);
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
          break;
        case "residentalArea":
          newObject = residentialAreas.find((item) => item.id === numericValue);
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

  // Prepare data for PUT request
  const prepareUpdateData = () => {
    return {
      id: userData.id,
      userName: userData.userName,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phoneNumber: userData.phoneNumber,
      functionalAreaId:
        userData.functionalAreaId || userData.functionalArea?.id,
      departmentId: userData.departmentId || userData.department?.id,
      projectId: userData.projectId || userData.project?.id,
      divisionId: userData.divisionId || userData.division?.id,
      subDivisionId: userData.subDivisionId || userData.subDivision?.id,
      positionGroupId: userData.positionGroupId || userData.positionGroup?.id,
      positionId: userData.positionId || userData.position?.id,
      residentalAreaId:
        userData.residentalAreaId || userData.residentalArea?.id,
      roleIds: userData.roleIds || [],
      imageUrl: userData.imageUrl,
      coverPhotoUrl: userData.coverPhotoUrl,
      isActive: userData.isActive,
    };
  };

  // Handle Update Profile
  const handleUpdateProfile = async () => {
    setSaveLoading(true);
    try {
      const updateData = prepareUpdateData();

      const response = await fetch(`${API_URL}AdminApplicationUser`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Profile update failed");
      }

      // Fetch updated user data
      const updatedResponse = await fetch(
        `${API_URL}AdminApplicationUser/${userId}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (updatedResponse.ok) {
        const updatedData = await updatedResponse.json();
        setUserData(updatedData);
      }

      setEditMode(false);
      toast("success", "Profile updated successfully");
    } catch (error) {
      console.error("Profile update error:", error);
    } finally {
      setSaveLoading(false);
    }
  };

  // Change Password Handler
  const handleChangePassword = async (currentPassword, newPassword) => {
    try {
      const response = await fetch(
        `${API_URL}AdminApplicationUser/ChangePassword`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId: userData.id,
            currentPassword,
            newPassword,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to change password");
      }

      toast("success", "Password changed successfully");
      return true;
    } catch (error) {
      console.error("Password change error:", error);

      throw error;
    }
  };

  // Update Profile Image Handler
  const handleUpdateProfileImage = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("id", userData.id);

      const response = await fetch(
        `${API_URL}AdminApplicationUser/UpdateUserImage`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile image");
      }

      // Update user data with new image URL
      const updatedUser = await response.json();
      setUserData((prev) => ({ ...prev, imageUrl: updatedUser.imageUrl }));

      toast("success", "Profile image updated successfully");
      return true;
    } catch (error) {
      console.error("Profile image update error:", error);

      throw error;
    }
  };

  // Update Cover Photo Handler
  const handleUpdateCoverPhoto = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("id", userData.id);

      const response = await fetch(
        `${API_URL}AdminApplicationUser/UpdateCoverPhoto`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update cover photo");
      }

      // Update user data with new cover photo URL
      const updatedUser = await response.json();
      setUserData((prev) => ({
        ...prev,
        coverPhotoUrl: updatedUser.coverPhotoUrl,
      }));

      toast("success", "Cover photo updated successfully");
      return true;
    } catch (error) {
      console.error("Cover photo update error:", error);

      throw error;
    }
  };

  // Loading State - simplified loader
  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="w-10 h-10 border-2 border-[#0AAC9E] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

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

  // Render Profile Page
  return (
    <div className="min-h-screen bg-gray-50 pt-10  ">
      <div className=" mx-auto ">
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
        {/* Profile Header with Cover - Simplified */}
        <div className="bg-white shadow-sm rounded-lg mb-6 overflow-hidden">
          <div className="relative">
            {/* Cover Photo */}
            <div
              className="h-48 bg-cover bg-center"
              style={{
                backgroundImage: userData.coverPhotoUrl
                  ? `url(${userData.coverPhotoUrl})`
                  : `url(${defaultCoverPhoto})`,
              }}
            >
              {/* Cover Photo Edit Button */}
              {editMode && (
                <div className="absolute top-4 right-4">
                  <label
                    htmlFor="cover-upload"
                    className="cursor-pointer bg-black/30 hover:bg-black/40 text-white px-4 py-2 rounded-lg flex items-center text-sm backdrop-blur-sm transition-colors"
                  >
                    <Camera className="w-4 h-4 mr-2" /> Change Cover Photo
                  </label>
                  <input
                    id="cover-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleUpdateCoverPhoto(e.target.files[0]);
                      }
                    }}
                  />
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
                      ? `https://bravoadmin.uplms.org/uploads/${userData.imageUrl.replace(
                          "https://100.42.179.27:7198/",
                          ""
                        )}`
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
                  {userData.position?.name || "No Position"}
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

              {/* Action Buttons */}
              <div className="mt-4 sm:mt-0 w-full sm:w-auto flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
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
                  <button
                    onClick={() => setEditMode(true)}
                    className="bg-[#0AAC9E] hover:bg-[#099b8e] text-white px-4 py-1.5 rounded-md text-sm flex items-center justify-center transition-colors"
                  >
                    <Edit className="w-4 h-4 mr-1.5" /> Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
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
                  options={residentialAreas}
                />
              </div>
            </ProfileSection>
          </div>
        )}
        {/* Show Professional Info if in professional section */}
        {activeSection === "professional" && (
          <div className="mb-6">
            <ProfileSection title="Professional Information" icon={Briefcase}>
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
                options={residentialAreas}
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
        )}{" "}
        {/* Action Buttons - Simplified */}
        <div className="flex flex-wrap justify-center sm:justify-end gap-3 mb-16 sm:mb-6">
          <button
            onClick={() => setIsPasswordModalOpen(true)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md flex items-center text-sm transition-colors"
          >
            <Key className="w-4 h-4 mr-1.5" /> Change Password
          </button>
          <button
            onClick={() => setIsImageUploadModalOpen(true)}
            className="bg-[#0AAC9E] hover:bg-[#099b8e] text-white px-4 py-2 rounded-md flex items-center text-sm transition-colors"
          >
            <ImageIcon className="w-4 h-4 mr-1.5" /> Update Photo
          </button>
        </div>
        {/* Modals */}
        {isPasswordModalOpen && (
          <PasswordChangeModal
            isOpen={isPasswordModalOpen}
            onClose={() => setIsPasswordModalOpen(false)}
            onSubmit={handleChangePassword}
          />
        )}
        {isImageUploadModalOpen && (
          <ImageUploadModal
            isOpen={isImageUploadModalOpen}
            onClose={() => setIsImageUploadModalOpen(false)}
            onUpload={handleUpdateProfileImage}
          />
        )}
      </div>
    </div>
  );
};

export default AdminProfilePage;
