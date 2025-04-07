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
  FilePlus2,
  ChevronDown,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import { getToken } from "@/authtoken/auth.js";
import SearchableDropdown from "@/components/vacancy/SearchableDropdown";
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
import { roleAsync } from "@/redux/role/role";
import { genderAsync } from "@/redux/gender/gender";
import { residentalAreaAsync } from "@/redux/residentalArea/residentalArea";

// Utility Imports
import { downloadTemplate } from "@/utils/templateDownload";

// Create optimized selectors for each data type
const selectFunctionalAreas = createSelector(
  [(state) => state.functionalAreaAsync?.data?.[0]?.functionalAreas],
  (functionalAreas) => functionalAreas || []
);

const selectDepartments = createSelector(
  [(state) => state.departmentAsync?.data?.[0]?.departments],
  (departments) => departments || []
);

const selectProjects = createSelector(
  [(state) => state.projectAsync?.data?.[0]?.projects],
  (projects) => projects || []
);

const selectDivisions = createSelector(
  [(state) => state.divisionAsync?.data?.[0]?.divisions],
  (divisions) => divisions || []
);

const selectSubDivisions = createSelector(
  [(state) => state.subDivisionAsync?.data?.[0]?.subDivisions],
  (subDivisions) => subDivisions || []
);

const selectPositionGroups = createSelector(
  [(state) => state.positionGroupAsync?.data?.[0]?.positionGroups],
  (positionGroups) => positionGroups || []
);

const selectPositions = createSelector(
  [(state) => state.positionAsync?.data?.[0]?.positions],
  (positions) => positions || []
);

const selectRoles = createSelector(
  [(state) => state.roleAsync?.data?.[0]?.roles],
  (roles) => roles || []
);

const selectGenders = createSelector(
  [(state) => state.genderAsync?.data.genders],
  (genders) => genders || []
);

const selectResidentalAreas = createSelector(
  [(state) => state.residentalAreaAsync?.data?.[0]?.residentalAreas],
  (residentalAreas) => residentalAreas || []
);

const UserCreationPage = () => {
  const dispatch = useDispatch();
  const token = getToken();

  // Use optimized selectors
  const functionalAreas = useSelector(selectFunctionalAreas);
  console.log(functionalAreas);
  const departments = useSelector(selectDepartments);
  const projects = useSelector(selectProjects);
  const divisions = useSelector(selectDivisions);
  const subDivisions = useSelector(selectSubDivisions);
  const positionGroups = useSelector(selectPositionGroups);
  const positions = useSelector(selectPositions);
  const roles = useSelector(selectRoles);
  const genders = useSelector(selectGenders);
  const residentalAreas = useSelector(selectResidentalAreas);

  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  const dataFetched = useRef(false);

  // State Management
  const [activeTab, setActiveTab] = useState("manual");
  const [manualUserData, setManualUserData] = useState({
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
  });

  const [bulkFile, setBulkFile] = useState(null);

  // Fetch Dropdown Options
  useEffect(() => {
    if (!dataFetched.current) {
      setIsLoading(true);

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
          toast.error("Failed to load some options. Please refresh.");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [dispatch]);

  // Debug data availability
  useEffect(() => {
    console.log("Roles count:", roles?.length);
    console.log("Departments count:", departments?.length);
  }, [roles, departments]);

  // Manual User Creation Handler
  const handleManualUserCreation = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        "https://bravoadmin.uplms.org/api/AdminApplicationUser/CreateUser",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(manualUserData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "User creation failed");
      }

      toast.success("User created successfully");
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
        managerialLevel: "N/A",
      });
    } catch (error) {
      toast.error(error.message);
      console.error("User creation error:", error);
    }
  };

  // Bulk Upload Handler
  const handleBulkUpload = async (e) => {
    e.preventDefault();
    if (!bulkFile) {
      toast.error("Please select a file");
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
    }
  };

  // Render Dropdown Fields - Using SearchableDropdown
  const renderDropdown = (label, options, fieldName, required = false) => (
    <SearchableDropdown
      label={label}
      options={options}
      value={manualUserData[fieldName]}
      onChange={(value) =>
        setManualUserData((prev) => ({
          ...prev,
          [fieldName]: value,
        }))
      }
      placeholder={`Select ${label}`}
      required={required}
    />
  );

  return (
    <div className="min-h-screen bg-gray-50/50 pt-14">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800 flex items-center">
          <Users className="mr-2 text-teal-600" size={22} />
          User Management
        </h1>
        <button className="text-gray-600 text-sm hover:text-teal-600 transition-colors flex items-center">
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

      <div className=" py-6 ">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab("manual")}
                className={`px-6 py-3 font-medium text-sm flex items-center
                  ${
                    activeTab === "manual"
                      ? "text-teal-600 border-b-2 border-teal-600"
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
                      ? "text-teal-600 border-b-2 border-teal-600"
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
              <div className="flex flex-col items-center justify-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-600 mb-2"></div>
                <span className="text-gray-600">Loading data...</span>
              </div>
            ) : activeTab === "manual" ? (
              <form onSubmit={handleManualUserCreation} className="space-y-6">
                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                  {/* Left Column - 3 parts */}
                  <div className="lg:col-span-3 space-y-6">
                    {/* Basic Information */}
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
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
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500"
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
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Username <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="Username"
                            value={manualUserData.userName}
                            onChange={(e) =>
                              setManualUserData((prev) => ({
                                ...prev,
                                userName: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500"
                            required
                          />
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500"
                            required
                          />
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
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500"
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
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Professional Details */}
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                        <h2 className="font-medium text-gray-700">
                          Professional Details
                        </h2>
                      </div>
                      <div className="p-5 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            {renderDropdown(
                              "Department",
                              departments,
                              "departmentId"
                            )}
                          </div>
                          <div>
                            {renderDropdown(
                              "Functional Area",
                              functionalAreas,
                              "functionalAreaId"
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            {renderDropdown(
                              "Division",
                              divisions,
                              "divisionId"
                            )}
                          </div>
                          <div>
                            {renderDropdown(
                              "Sub Division",
                              subDivisions,
                              "subDivisionId"
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            {renderDropdown("Project", projects, "projectId")}
                          </div>
                          <div>
                            {renderDropdown(
                              "Position",
                              positions,
                              "positionId"
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            {renderDropdown(
                              "Position Group",
                              positionGroups,
                              "positionGroupId"
                            )}
                          </div>
                          <div>
                            {renderDropdown(
                              "Residential Area",
                              residentalAreas,
                              "residentalAreaId"
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - 2 parts */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Additional Information */}
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
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
                            value={manualUserData.birthDate}
                            onChange={(e) =>
                              setManualUserData((prev) => ({
                                ...prev,
                                birthDate: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Started Date
                          </label>
                          <input
                            type="date"
                            value={manualUserData.startedDate}
                            onChange={(e) =>
                              setManualUserData((prev) => ({
                                ...prev,
                                startedDate: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500"
                          />
                        </div>

                        <div>
                          {renderDropdown(
                            "Gender",
                            genders.genderName,
                            "genderId"
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Managerial Level
                          </label>
                          <select
                            value={manualUserData.managerialLevel}
                            onChange={(e) =>
                              setManualUserData((prev) => ({
                                ...prev,
                                managerialLevel: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500"
                          >
                            <option value="N/A">N/A</option>
                            <option value="Manager">Manager</option>
                            <option value="Non-manager">Non-manager</option>
                          </select>
                        </div>

                        <div className="flex items-center mt-3">
                          <div
                            className={`w-5 h-5 rounded flex items-center justify-center border cursor-pointer ${
                              manualUserData.isServiceUser
                                ? "bg-teal-600 border-teal-600"
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

                    {/* Roles Section - Made explicitly visible */}
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
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
                                className={`w-5 h-5 rounded flex items-center justify-center border cursor-pointer ${
                                  manualUserData.roleIds.includes(role.id)
                                    ? "bg-teal-600 border-teal-600"
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
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 text-sm font-medium"
                    onClick={() => {
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
                      });
                    }}
                  >
                    <X className="inline-block mr-1" size={14} />
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 text-sm font-medium"
                  >
                    <Plus className="inline-block mr-1" size={14} />
                    Create User
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
                    />

                    {!bulkFile ? (
                      <label
                        htmlFor="bulk-upload"
                        className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 text-sm font-medium cursor-pointer inline-flex items-center"
                      >
                        <Upload className="mr-2" size={16} />
                        Browse Files
                      </label>
                    ) : (
                      <div className="border border-gray-200 rounded-md p-3 bg-white flex items-center max-w-md w-full">
                        <FileSpreadsheet
                          className="text-teal-600 mr-3 flex-shrink-0"
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
                        >
                          <X size={18} />
                        </button>
                      </div>
                    )}
                  </div>

                  {bulkFile && (
                    <button
                      onClick={handleBulkUpload}
                      className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 text-sm font-medium inline-flex items-center"
                    >
                      <Upload className="mr-2" size={16} />
                      Upload Users
                    </button>
                  )}
                </div>

                {/* Template Download */}
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-700 flex items-center">
                      <Download className="mr-2 text-teal-600" size={18} />
                      Download Template
                    </h3>
                    <button
                      onClick={() => downloadTemplate("UserCreate.xlsx")}
                      className="px-3 py-1.5 bg-teal-50 text-teal-600 rounded hover:bg-teal-100 text-sm"
                    >
                      <Download className="inline-block mr-1" size={14} />
                      Get Template
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
