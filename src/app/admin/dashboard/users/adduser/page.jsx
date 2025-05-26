"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Users,
  Upload,
  Download,
  FileSpreadsheet,
  Plus,
  UserPlus,
  X,
  CheckCircle,
  Loader,
} from "lucide-react";
import { toast } from "sonner";
import { getToken } from "@/authtoken/auth.js";
import SearchableDropdown from "@/components/vacancy/SearchableDropdown";
import LoadingSpinner from "@/components/loadingSpinner";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { createSelector } from "reselect"; // Import createSelector

// Redux Async Actions Import
import { functionalAreaAsync } from "@/redux/functionalArea/functionalArea";
import { departmentAsync } from "@/redux/department/department";
import { projectAsync } from "@/redux/project/project";
import { divisionAsync } from "@/redux/division/division";
import { subDivisionAsync } from "@/redux/subDivision/subDivision";
import { positionGroupAsync } from "@/redux/positionGroup/positionGroup";
import { positionAsync } from "@/redux/position/position";
import { roleAsync } from "@/redux/role/role";
import { genderAsync } from "@/redux/gender/gender";
import { residentalAreaAsync } from "@/redux/residentalArea/residentalArea";

// Utility Imports
import { downloadTemplate } from "@/utils/templateDownload";

// Base selectors
const getFunctionalAreaState = (state) => state.functionalArea;
const getDepartmentState = (state) => state.department;
const getProjectState = (state) => state.project;
const getDivisionState = (state) => state.division;
const getSubDivisionState = (state) => state.subDivision;
const getPositionGroupState = (state) => state.positionGroup;
const getPositionState = (state) => state.position;
const getRoleState = (state) => state.role;
const getGenderState = (state) => state.gender;
const getResidentalAreaState = (state) => state.residentalArea;

// Helper function to safely extract data from different possible structures
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

const selectRoles = createSelector([getRoleState], (state) =>
  extractSafeData(state, "roles")
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

const UserCreationPage = () => {
  const dispatch = useDispatch();
  const token = getToken();
  const router = useRouter();

  // Date formatting helper function
  const formatDate = (inputDate) => {
    if (!inputDate) return "";
    const date = new Date(inputDate);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  // Format date for input fields (YYYY-MM-DD)
  const formatDateForInput = (displayDate) => {
    if (!displayDate) return "";
    const [month, day, year] = displayDate.split("/");
    return `${year}-${month}-${day}`;
  };

  // Use Redux selectors
  const functionalAreas = useSelector(selectFunctionalAreas);
  const departments = useSelector(selectDepartments);
  const projects = useSelector(selectProjects);
  const divisions = useSelector(selectDivisions);
  const subDivisions = useSelector(selectSubDivisions);
  const positionGroups = useSelector(selectPositionGroups);
  const positions = useSelector(selectPositions);
  const roles = useSelector(selectRoles);
  const genders = useSelector(selectGenders);
  const residentalAreas = useSelector(selectResidentalAreas);

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isUploadingUsers, setIsUploadingUsers] = useState(false);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const dataFetched = useRef(false);

  // State Management
  const [activeTab, setActiveTab] = useState("manual");
  const [manualUserData, setManualUserData] = useState({
    userName: "", // Use lowercase 'userName' to match the API format
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    isServiceUser: false,
    birthDate: "",
    startedDate: "",
    genderId: "",
    functionalAreaId: "",
    departmentId: "",
    projectId: "",
    divisionId: "",
    subDivisionId: "",
    positionGroupId: "",
    positionId: "",
    residentalAreaId: "",
    roleIds: [],
    managerialLevel: "", // Remove default "N/A"
    badge: "",
    pin: "",
  });

  const [bulkFile, setBulkFile] = useState(null);

  // Fetch Dropdown Options
  useEffect(() => {
    if (!dataFetched.current) {
      setIsLoading(true);

      // Dispatch all data fetching actions
      Promise.all([
        dispatch(functionalAreaAsync()),
        dispatch(departmentAsync()),
        dispatch(projectAsync()),
        dispatch(divisionAsync()),
        dispatch(subDivisionAsync()),
        dispatch(positionGroupAsync()),
        dispatch(positionAsync()),
        dispatch(roleAsync()),
        dispatch(genderAsync()),
        dispatch(residentalAreaAsync()),
      ])
        .then(() => {
          dataFetched.current = true;
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [dispatch]);

  const handleManualUserCreation = async (e) => {
    e.preventDefault();
    setIsCreatingUser(true);

    const requiredFields = {
      userName: "Username",
      firstName: "First Name",
      lastName: "Last Name",
      email: "Email",
      phoneNumber: "Phone Number",
      password: "Password",
      badge: "Badge",
      pin: "Pin",
      managerialLevel: "Managerial Level",
    };

    const missingFields = [];
    for (const [field, label] of Object.entries(requiredFields)) {
      if (
        !manualUserData[field] ||
        manualUserData[field].toString().trim() === ""
      ) {
        missingFields.push(label);
      }
    }

    if (missingFields.length > 0) {
      toast.error(
        `Please fill in required fields: ${missingFields.join(", ")}`
      );
      setIsCreatingUser(false);
      return;
    }

    if (manualUserData.userName.length < 5) {
      toast.error("Username must be at least 5 characters long");
      setIsCreatingUser(false);
      return;
    }

    try {
      const formatDateForAPI = (dateString) => {
        if (!dateString) return null;
        const [month, day, year] = dateString.split("/");
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      };

      // Prepare data for query parameters
      const queryParams = new URLSearchParams({
        UserName: manualUserData.userName,
        FirstName: manualUserData.firstName,
        LastName: manualUserData.lastName,
        Email: manualUserData.email,
        PhoneNumber: manualUserData.phoneNumber,
        Password: manualUserData.password,
        IsServiceUser: String(manualUserData.isServiceUser),
        BirthDate: formatDateForAPI(manualUserData.birthDate) || "",
        StartedDate: formatDateForAPI(manualUserData.startedDate) || "",
        GenderId: manualUserData.genderId || "",
        FunctionalAreaId: manualUserData.functionalAreaId || "",
        DepartmentId: manualUserData.departmentId || "",
        ProjectId: manualUserData.projectId || "",
        DivisionId: manualUserData.divisionId || "",
        SubDivisionId: manualUserData.subDivisionId || "",
        PositionGroupId: manualUserData.positionGroupId || "",
        PositionId: manualUserData.positionId || "",
        ResidentalAreaId: manualUserData.residentalAreaId || "",
        ManagerialLevel: manualUserData.managerialLevel || "Non-manager",
        Badge: manualUserData.badge,
        Pin: manualUserData.pin,
      });

      manualUserData.roleIds.forEach((id) => queryParams.append("RoleIds", id));

      const url = `https://bravoadmin.uplms.org/api/AdminApplicationUser/CreateUser?${queryParams.toString()}`;

      console.log("Sending request:", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        url,
      });

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const responseText = await response.text();
      console.log("Raw API response:", responseText);

      if (response.ok) {
        // 200-299 status codes
        toast.success("User created successfully");
        setTimeout(() => router.push("/admin/dashboard/users"), 1500);

        // Reset form
        setManualUserData({
          userName: "",
          firstName: "",
          lastName: "",
          email: "",
          phoneNumber: "",
          password: "",
          isServiceUser: false,
          birthDate: "",
          startedDate: "",
          genderId: "",
          functionalAreaId: "",
          departmentId: "",
          projectId: "",
          divisionId: "",
          subDivisionId: "",
          positionGroupId: "",
          positionId: "",
          residentalAreaId: "",
          roleIds: [],
          managerialLevel: "",
          badge: "",
          pin: "",
        });
      } else {
        // Try to parse response if it exists, otherwise use status text
        let responseData;
        try {
          responseData = responseText
            ? JSON.parse(responseText)
            : { title: response.statusText };
        } catch (parseError) {
          responseData = { title: "Invalid response from server" };
        }

        if (response.status === 400) {
          const errorMessages = Object.values(responseData.errors).flat();
          toast.error(responseText);
        }
      }
    } catch (error) {
      console.error("User creation error:", error);
      toast.error("An error occurred while creating the user");
    } finally {
      setIsCreatingUser(false);
    }
  };

  // Bulk Upload Handler
  const handleBulkUpload = async (e) => {
    e.preventDefault();
    setIsUploadingUsers(true);

    if (!bulkFile) {
      toast.error("Please select a file");
      setIsUploadingUsers(false);
      return;
    }

    const formData = new FormData();
    formData.append("file", bulkFile);

    try {
      const response = await fetch(
        "https://bravoadmin.uplms.org/api/AdminApplicationUser/import-excel",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Bulk upload failed");
      }

      toast.success("Users imported successfully");
      setBulkFile(null);
    } catch (error) {
      toast.error(error.message);
      console.error("Bulk upload error:", error);
    } finally {
      setIsUploadingUsers(false);
    }
  };

  // Template download handler with loading state
  const handleTemplateDownload = async () => {
    setIsDownloadingTemplate(true);
    try {
      await downloadTemplate("UserCreate.xlsx");
    } catch (error) {
      console.error("Template download error:", error);
      toast.error("Failed to download template");
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  const handleCancel = () => {
    setManualUserData({
      userName: "",
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      password: "",
      isServiceUser: false,
      birthDate: "",
      startedDate: "",
      genderId: "",
      functionalAreaId: "",
      departmentId: "",
      projectId: "",
      divisionId: "",
      subDivisionId: "",
      positionGroupId: "",
      positionId: "",
      residentalAreaId: "",
      roleIds: [],
      managerialLevel: "N/A",
      badge: "",
      pin: "",
    });

    setTimeout(() => {
      router.push("/admin/dashboard/users");
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pt-14">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800 flex items-center">
          <Users className="mr-2 text-[#0AAC9E]" size={22} />
          User Management
        </h1>
        <button
          className="text-gray-600 text-sm hover:text-[#0AAC9E] transition-colors flex items-center"
          onClick={handleCancel}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-1"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Users List
        </button>
      </div>

      <div className="py-6">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm  mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab("manual")}
                className={`px-6 py-3 font-medium text-sm flex items-center
                  ${
                    activeTab === "manual"
                      ? "text-[#0AAC9E] border-b-2 border-[#0AAC9E]"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                <UserPlus className="mr-2" size={16} />
                Manual Creation
              </button>
              <button
                onClick={() => setActiveTab("bulk")}
                className={`px-6 py-3 font-medium text-sm flex items-center
                  ${
                    activeTab === "bulk"
                      ? "text-[#0AAC9E] border-b-2 border-[#0AAC9E]"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                <Upload className="mr-2" size={16} />
                Bulk Upload
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {isLoading ? (
              <LoadingSpinner />
            ) : activeTab === "manual" ? (
              <form onSubmit={handleManualUserCreation} className="space-y-6">
                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                  {/* Left Column - 3 parts */}
                  <div className="lg:col-span-3 space-y-6">
                    {/* Basic Information */}
                    <div className="bg-white rounded-lg border border-gray-200 ">
                      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                        <h2 className="font-medium text-gray-700">
                          Basic Information
                        </h2>
                      </div>
                      <div className="p-5 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              First Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              placeholder="First Name"
                              value={manualUserData.firstName}
                              onChange={(e) =>
                                setManualUserData((prev) => ({
                                  ...prev,
                                  firstName: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-0 focus:border-[#01DBC8]"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Last Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              placeholder="Last Name"
                              value={manualUserData.lastName}
                              onChange={(e) =>
                                setManualUserData((prev) => ({
                                  ...prev,
                                  lastName: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-0 focus:border-[#01DBC8]"
                              required
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Username <span className="text-red-500">*</span>
                            </label>
                            <div>
                              <input
                                type="text"
                                placeholder="Username (min 5 characters)"
                                value={manualUserData.userName}
                                onChange={(e) =>
                                  setManualUserData((prev) => ({
                                    ...prev,
                                    userName: e.target.value,
                                  }))
                                }
                                className={`w-full px-3 py-2 border ${
                                  manualUserData.userName &&
                                  manualUserData.userName.length < 5
                                    ? "border-red-500 focus:border-red-500"
                                    : "border-gray-300 focus:border-[#01DBC8]"
                                } rounded-md text-xs focus:outline-none focus:ring-0`}
                                required
                                minLength={5}
                              />
                              {manualUserData.userName &&
                                manualUserData.userName.length < 5 && (
                                  <p className="text-red-500 text-xs mt-1">
                                    Username must be at least 5 characters long
                                  </p>
                                )}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Email <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="email"
                              placeholder="Email"
                              value={manualUserData.email}
                              onChange={(e) =>
                                setManualUserData((prev) => ({
                                  ...prev,
                                  email: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-0 focus:border-[#01DBC8]"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Phone Number
                            </label>
                            <input
                              type="tel"
                              placeholder="Phone Number"
                              value={manualUserData.phoneNumber}
                              onChange={(e) =>
                                setManualUserData((prev) => ({
                                  ...prev,
                                  phoneNumber: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-0 focus:border-[#01DBC8]"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Password <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="password"
                              placeholder="Password"
                              value={manualUserData.password}
                              onChange={(e) =>
                                setManualUserData((prev) => ({
                                  ...prev,
                                  password: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-0 focus:border-[#01DBC8]"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Badge
                            </label>
                            <input
                              type="text"
                              placeholder="Badge"
                              value={manualUserData.badge || ""}
                              onChange={(e) =>
                                setManualUserData((prev) => ({
                                  ...prev,
                                  badge: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-0 focus:border-[#01DBC8]"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Pin
                            </label>
                            <input
                              type="text"
                              placeholder="Pin"
                              value={manualUserData.pin || ""}
                              onChange={(e) =>
                                setManualUserData((prev) => ({
                                  ...prev,
                                  pin: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-0 focus:border-[#01DBC8]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Professional Details */}
                    <div className="bg-white rounded-lg border border-gray-200 ">
                      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                        <h2 className="font-medium text-gray-700">
                          Professional Details
                        </h2>
                      </div>
                      <div className="p-5 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <SearchableDropdown
                              label="Department"
                              options={departments || []}
                              value={manualUserData.departmentId}
                              onChange={(value) =>
                                setManualUserData((prev) => ({
                                  ...prev,
                                  departmentId: value,
                                }))
                              }
                              placeholder="Select Department"
                              displayKey="name"
                              valueKey="id"
                            />
                          </div>
                          <div>
                            <SearchableDropdown
                              label="Functional Area"
                              options={functionalAreas || []}
                              value={manualUserData.functionalAreaId}
                              onChange={(value) =>
                                setManualUserData((prev) => ({
                                  ...prev,
                                  functionalAreaId: value,
                                }))
                              }
                              placeholder="Select Functional Area"
                              displayKey="name"
                              valueKey="id"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <SearchableDropdown
                              label="Division"
                              options={divisions || []}
                              value={manualUserData.divisionId}
                              onChange={(value) =>
                                setManualUserData((prev) => ({
                                  ...prev,
                                  divisionId: value,
                                }))
                              }
                              placeholder="Select Division"
                              displayKey="name"
                              valueKey="id"
                            />
                          </div>
                          <div>
                            <SearchableDropdown
                              label="Sub Division"
                              options={subDivisions || []}
                              value={manualUserData.subDivisionId}
                              onChange={(value) =>
                                setManualUserData((prev) => ({
                                  ...prev,
                                  subDivisionId: value,
                                }))
                              }
                              placeholder="Select Sub Division"
                              displayKey="name"
                              valueKey="id"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <SearchableDropdown
                              label="Project"
                              options={projects || []}
                              value={manualUserData.projectId}
                              onChange={(value) =>
                                setManualUserData((prev) => ({
                                  ...prev,
                                  projectId: value,
                                }))
                              }
                              placeholder="Select Project"
                              displayKey="name"
                              valueKey="id"
                            />
                          </div>
                          <div>
                            <SearchableDropdown
                              label="Position"
                              options={positions || []}
                              value={manualUserData.positionId}
                              onChange={(value) => {
                                // Find selected position
                                const selectedPosition = positions.find(
                                  (p) => p.id.toString() === value.toString()
                                );

                                // Automatically set managerial level based on position level
                                let managerialLevel = "N/A";
                                if (selectedPosition) {
                                  if (selectedPosition.level === 0) {
                                    managerialLevel = "Manager";
                                  } else if (selectedPosition.level === 1) {
                                    managerialLevel = "Non-manager";
                                  }

                                  setManualUserData((prev) => ({
                                    ...prev,
                                    positionId: value,
                                    managerialLevel: managerialLevel,
                                  }));
                                }
                              }}
                              placeholder="Select Position"
                              displayKey="name"
                              valueKey="id"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <SearchableDropdown
                              label="Position Group"
                              options={positionGroups || []}
                              value={manualUserData.positionGroupId}
                              onChange={(value) =>
                                setManualUserData((prev) => ({
                                  ...prev,
                                  positionGroupId: value,
                                }))
                              }
                              placeholder="Select Position Group"
                              displayKey="name"
                              valueKey="id"
                            />
                          </div>
                          <div>
                            <SearchableDropdown
                              label="Residential Area"
                              options={residentalAreas || []}
                              value={manualUserData.residentalAreaId}
                              onChange={(value) =>
                                setManualUserData((prev) => ({
                                  ...prev,
                                  residentalAreaId: value,
                                }))
                              }
                              placeholder="Select Residential Area"
                              displayKey="name"
                              valueKey="id"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - 2 parts */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Additional Information */}
                    <div className="bg-white rounded-lg border border-gray-200 ">
                      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                        <h2 className="font-medium text-gray-700">
                          Additional Details
                        </h2>
                      </div>
                      <div className="p-5 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Birth Date
                          </label>
                          <input
                            type="date"
                            value={formatDateForInput(manualUserData.birthDate)}
                            onChange={(e) => {
                              const selectedDate = e.target.value;
                              const formattedDate = formatDate(selectedDate);
                              setManualUserData((prev) => ({
                                ...prev,
                                birthDate: formattedDate,
                              }));
                            }}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-0 focus:border-[#01DBC8]"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Started Date
                          </label>
                          <input
                            type="date"
                            value={formatDateForInput(
                              manualUserData.startedDate
                            )}
                            onChange={(e) => {
                              const selectedDate = e.target.value;
                              const formattedDate = formatDate(selectedDate);
                              setManualUserData((prev) => ({
                                ...prev,
                                startedDate: formattedDate,
                              }));
                            }}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-0 focus:border-[#01DBC8]"
                          />
                        </div>
                        <div>
                          <SearchableDropdown
                            label="Gender"
                            options={genders || []}
                            value={manualUserData.genderId}
                            onChange={(value) =>
                              setManualUserData((prev) => ({
                                ...prev,
                                genderId: value,
                              }))
                            }
                            placeholder="Select Gender"
                            displayKey="genderName"
                            valueKey="id"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Managerial Level
                          </label>
                          <div className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-md text-xs">
                            {manualUserData.positionId ? (
                              <div className="flex items-center">
                                {manualUserData.managerialLevel ===
                                "Manager" ? (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    Manager
                                  </span>
                                ) : manualUserData.managerialLevel ===
                                  "Non-manager" ? (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    Non-manager
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                                    N/A
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-500">
                                Select a position to determine managerial level
                              </span>
                            )}
                          </div>
                          <input
                            type="hidden"
                            value={manualUserData.managerialLevel}
                            name="managerialLevel"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Roles Section - Made explicitly visible */}
                    <div className="bg-white rounded-lg border border-gray-200">
                      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                        <h2 className="font-medium text-gray-700">
                          User Roles
                        </h2>
                      </div>

                      <div className="p-2 max-h-60 overflow-y-auto">
                        {roles && roles.length > 0 ? (
                          roles.map((role) => (
                            <div
                              key={role.id}
                              className="flex items-center px-3 py-2 hover:bg-gray-50 rounded-md"
                            >
                              <div
                                className={`w-4 h-4 rounded flex items-center justify-center border cursor-pointer ${
                                  manualUserData.roleIds.includes(role.id)
                                    ? "bg-[#0AAC9E] border-[#0AAC9E]"
                                    : "border-gray-300"
                                }`}
                                onClick={() => {
                                  setManualUserData((prev) => ({
                                    ...prev,
                                    roleIds: prev.roleIds.includes(role.id)
                                      ? prev.roleIds.filter(
                                          (id) => id !== role.id
                                        )
                                      : [...prev.roleIds, role.id],
                                  }));
                                }}
                              >
                                {manualUserData.roleIds.includes(role.id) && (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="white"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                  </svg>
                                )}
                              </div>
                              <label
                                className="ml-2 text-sm text-gray-700 cursor-pointer flex-1"
                                onClick={() => {
                                  setManualUserData((prev) => ({
                                    ...prev,
                                    roleIds: prev.roleIds.includes(role.id)
                                      ? prev.roleIds.filter(
                                          (id) => id !== role.id
                                        )
                                      : [...prev.roleIds, role.id],
                                  }));
                                }}
                              >
                                {role.roleName}
                              </label>
                            </div>
                          ))
                        ) : (
                          <div className="p-3 text-center text-sm text-gray-500">
                            No roles available. Please refresh the page.
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center mt-3">
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center border cursor-pointer ${
                          manualUserData.isServiceUser
                            ? "bg-[#0AAC9E] border-[#0AAC9E]"
                            : "border-gray-300"
                        }`}
                        onClick={() =>
                          setManualUserData((prev) => ({
                            ...prev,
                            isServiceUser: !prev.isServiceUser,
                          }))
                        }
                      >
                        {manualUserData.isServiceUser && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        )}
                      </div>
                      <label
                        className="ml-2 text-sm text-gray-700 cursor-pointer"
                        onClick={() =>
                          setManualUserData((prev) => ({
                            ...prev,
                            isServiceUser: !prev.isServiceUser,
                          }))
                        }
                      >
                        Is Service User
                      </label>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 text-sm font-medium"
                    onClick={handleCancel}
                    disabled={isCreatingUser}
                  >
                    <X className="inline-block mr-1" size={14} />
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#0AAC9E] text-white rounded-md hover:bg-[#099b8e] text-sm font-medium flex items-center"
                    disabled={isCreatingUser}
                  >
                    {isCreatingUser ? (
                      <>
                        <Loader
                          className="inline-block mr-1 animate-spin"
                          size={14}
                        />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="inline-block mr-1" size={14} />
                        Create User
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                {/* Simple Upload Section */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                  <FileSpreadsheet
                    className="mx-auto mb-3 text-gray-400"
                    size={42}
                  />
                  <h3 className="text-lg font-medium mb-2 text-gray-700">
                    Upload User Data
                  </h3>
                  <p className="text-gray-500 text-sm mb-4 max-w-md mx-auto">
                    Import multiple users at once by uploading an Excel file
                  </p>

                  <div className="flex flex-col items-center">
                    <input
                      type="file"
                      id="bulk-upload"
                      accept=".xlsx,.xls,.csv"
                      onChange={(e) => setBulkFile(e.target.files[0])}
                      className="hidden"
                      disabled={isUploadingUsers}
                    />

                    {!bulkFile ? (
                      <label
                        htmlFor="bulk-upload"
                        className={`px-4 py-2 bg-[#0AAC9E] text-white rounded-md hover:bg-[#099b8e] text-sm font-medium cursor-pointer inline-flex items-center ${
                          isUploadingUsers
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <Upload className="mr-2" size={16} />
                        Browse Files
                      </label>
                    ) : (
                      <div className="border border-gray-200 rounded-md p-3 bg-white flex items-center max-w-md w-full">
                        <FileSpreadsheet
                          className="text-[#0AAC9E] mr-3 flex-shrink-0"
                          size={20}
                        />
                        <div className="flex-1 truncate">
                          <span className="text-sm font-medium">
                            {bulkFile.name}
                          </span>
                          <p className="text-xs text-gray-500">
                            {(bulkFile.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <button
                          onClick={() => setBulkFile(null)}
                          className="text-gray-400 hover:text-red-500 ml-2"
                          disabled={isUploadingUsers}
                        >
                          <X size={18} />
                        </button>
                      </div>
                    )}
                  </div>

                  {bulkFile && (
                    <button
                      onClick={handleBulkUpload}
                      className="mt-4 px-4 py-2 bg-[#0AAC9E] text-white rounded-md hover:bg-[#099b8e] text-sm font-medium inline-flex items-center"
                      disabled={isUploadingUsers}
                    >
                      {isUploadingUsers ? (
                        <>
                          <Loader className="mr-2 animate-spin" size={16} />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2" size={16} />
                          Upload Users
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Template Download */}
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-700 flex items-center">
                      <Download className="mr-2 text-[#0AAC9E]" size={18} />
                      Download Template
                    </h3>
                    <button
                      onClick={handleTemplateDownload}
                      className="px-3 py-1.5 bg-[#e6fbfa] text-[#0AAC9E] rounded hover:bg-[#e6fbfa] text-sm flex items-center"
                      disabled={isDownloadingTemplate}
                    >
                      {isDownloadingTemplate ? (
                        <>
                          <Loader
                            className="inline-block mr-1 animate-spin"
                            size={14}
                          />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Download className="inline-block mr-1" size={14} />
                          Get Template
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-sm text-gray-500">
                    Use our Excel template to ensure your data follows the
                    required format. Fill in all required fields and upload the
                    completed file.
                  </p>
                </div>

                {/* Upload Tips */}
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <h3 className="font-medium text-blue-800 mb-2 text-sm">
                    Upload Tips
                  </h3>
                  <ul className="text-xs text-blue-700 space-y-1.5">
                    <li className="flex items-center">
                      <CheckCircle size={14} className="mr-2 flex-shrink-0" />
                      Ensure all required fields are completed
                    </li>
                    <li className="flex items-center">
                      <CheckCircle size={14} className="mr-2 flex-shrink-0" />
                      Maximum file size: 10MB
                    </li>
                    <li className="flex items-center">
                      <CheckCircle size={14} className="mr-2 flex-shrink-0" />
                      Supported formats: .xlsx, .xls, .csv
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCreationPage;
