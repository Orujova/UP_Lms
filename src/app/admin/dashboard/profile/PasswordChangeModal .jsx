"use client";
import React, { useState } from "react";
import { XCircle, Eye, EyeOff, Key } from "lucide-react";
import { toast } from "sonner";
import { getToken } from "@/authtoken/auth.js";

const PasswordChangeModal = ({ isOpen, onClose, userId }) => {
  // State management
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordVisibility, setPasswordVisibility] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  // Password validation utility
  const validatePassword = (password) => {
    const validationRules = [
      {
        test: (pw) => pw.length >= 8,
        message: "At least 8 characters long",
      },
      {
        test: (pw) => /[A-Z]/.test(pw),
        message: "Include an uppercase letter",
      },
      {
        test: (pw) => /[0-9]/.test(pw),
        message: "Include a number",
      },
      {
        test: (pw) => /[!@#$%^&*(),.?":{}|<>]/.test(pw),
        message: "Include a special character",
      },
    ];

    return validationRules
      .filter((rule) => !rule.test(password))
      .map((rule) => rule.message);
  };

  // Input change handler
  const handleInputChange = (field, value) => {
    setPasswords((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError(""); // Clear any previous errors
  };

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setPasswordVisibility((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validation checks
      if (
        !passwords.currentPassword ||
        !passwords.newPassword ||
        !passwords.confirmPassword
      ) {
        throw new Error("All password fields are required");
      }

      if (passwords.newPassword !== passwords.confirmPassword) {
        throw new Error("New passwords do not match");
      }

      const passwordErrors = validatePassword(passwords.newPassword);
      if (passwordErrors.length > 0) {
        throw new Error(passwordErrors.join(", "));
      }

      // Fetch configuration
      const token = getToken();
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "https://demoadmin.databyte.app/api/";

      const response = await fetch(
        `${API_URL}AdminApplicationUser/ChangePassword`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            id: userId,
            currentPassword: passwords.currentPassword,
            newPassword: passwords.newPassword,
            repeatNewPassword: passwords.confirmPassword,
          }),
        }
      );
      console.log(
        JSON.stringify({
          id: userId,
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
          repeatNewPassword: passwords.confirmPassword,
        })
      );
      // Error handling
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.message ||
          errorData.title ||
          `Password change failed (${response.status})`;

        throw new Error(errorMessage);
      }

      // Success handling
      toast.success("Password changed successfully");
      resetForm();
      onClose();
    } catch (error) {
      // User-friendly error messages
      const userFriendlyMessage = error.message.includes("401")
        ? "Authentication failed. Please log in again."
        : error.message.includes("403")
        ? "You do not have permission to change the password."
        : error.message.includes("current password")
        ? "Current password is incorrect."
        : error.message;

      setError(userFriendlyMessage);
      toast.error(userFriendlyMessage);
      console.error("Password Change Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Form reset
  const resetForm = () => {
    setPasswords({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setError("");
    setPasswordVisibility({
      currentPassword: false,
      newPassword: false,
      confirmPassword: false,
    });
  };

  // Render password input with toggle
  const renderPasswordInput = (label, field, value, showPassword) => (
    <div className="mb-4">
      <label
        htmlFor={field}
        className="block mb-2 text-sm font-medium text-gray-900"
      >
        {label}
      </label>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          id={field}
          className="bg-gray-50 border border-gray-300 text-gray-900 
            text-sm rounded-lg focus:ring-[#0AAC9E] focus:border-[#0AAC9E] 
            block w-full p-2.5 pr-10"
          placeholder={`Enter ${label.toLowerCase()}`}
          value={value}
          onChange={(e) => handleInputChange(field, e.target.value)}
          required
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 pr-3 flex items-center 
            text-gray-500 hover:text-gray-700"
          onClick={() => togglePasswordVisibility(field)}
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );

  // Don't render if modal is closed
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <Key className="w-6 h-6 mr-2 text-[#0AAC9E]" />
            Change Password
          </h3>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="text-gray-400 bg-transparent hover:bg-gray-200 
              hover:text-gray-900 rounded-lg text-sm w-8 h-8 
              ms-auto inline-flex justify-center items-center"
          >
            <XCircle className="w-5 h-5" />
            <span className="sr-only">Close modal</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 md:p-5">
          {/* Error Display */}
          {error && (
            <div
              className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 
              text-red-700 rounded"
            >
              <p className="font-medium">Password Change Error</p>
              <p>{error}</p>
            </div>
          )}

          {/* Password Inputs */}
          {renderPasswordInput(
            "Current Password",
            "currentPassword",
            passwords.currentPassword,
            passwordVisibility.currentPassword
          )}

          {renderPasswordInput(
            "New Password",
            "newPassword",
            passwords.newPassword,
            passwordVisibility.newPassword
          )}

          {renderPasswordInput(
            "Confirm New Password",
            "confirmPassword",
            passwords.confirmPassword,
            passwordVisibility.confirmPassword
          )}

          {/* Password Requirements */}
          <div
            className="mb-4 p-3 bg-[#0AAC9E]/10 
            border-l-4 border-[#0AAC9E] text-[#0AAC9E] text-sm rounded"
          >
            <p className="font-medium mb-1">Password Requirements:</p>
            <ul className="list-disc list-inside">
              <li>At least 8 characters long</li>
              <li>Include an uppercase letter</li>
              <li>Include a number</li>
              <li>Include a special character</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 
                text-gray-800 rounded-lg transition-colors"
              onClick={() => {
                resetForm();
                onClose();
              }}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 bg-[#0AAC9E] hover:bg-[#099b8e] 
                text-white rounded-lg transition-colors flex items-center 
                ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div
                    className="animate-spin h-4 w-4 mr-2 border-2 
                    border-white border-t-transparent rounded-full"
                  ></div>
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordChangeModal;
