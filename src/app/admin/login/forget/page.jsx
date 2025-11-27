"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getToken } from "@/authtoken/auth.js";
import { getUserId } from "@/authtoken/auth";
import BrandingSlider from "@/components/brandingSlider"; // Import the reusable component
import {
  Lock,
  Phone,
  ChevronLeft,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

// Constants
const API_URL = "https://demoadmin.databyte.app/api/";

export default function ImprovedForgotPassword() {
  const router = useRouter();
  const [currentView, setCurrentView] = useState("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpToken, setOtpToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatNewPassword, setRepeatNewPassword] = useState("");
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Request password reset by phone number
  const handleRequestReset = async (e) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      setError("Phone number is required");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}AdminApplicationUser/ForgotPassword`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ phoneNumber }),
        }
      );

      if (response.ok) {
        toast.success("OTP sent to your phone number");
        setCurrentView("otp");
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "Phone number not found");
      }
    } catch (err) {
      setError("Connection error. Please try again");
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP and proceed to password reset
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otpToken.trim()) {
      setError("OTP is required");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}AdminApplicationUser/OtpConfirmationForForgotPassword`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ otpToken }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUserId(data.userId || getUserId());
        toast.success("OTP verified successfully");
        setCurrentView("reset");
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "Invalid OTP");
      }
    } catch (err) {
      setError("Connection error. Please try again");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password with new credentials
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!newPassword.trim() || !repeatNewPassword.trim()) {
      setError("Both password fields are required");
      return;
    }

    if (newPassword !== repeatNewPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const token = getToken();
      const effectiveUserId = userId || getUserId();

      const response = await fetch(
        `${API_URL}AdminApplicationUser/ResetPassword`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({
            userId: parseInt(effectiveUserId),
            newPassword,
            repeatNewPassword,
          }),
        }
      );

      if (response.ok) {
        toast.success("Password reset successfully");
        router.push("/admin/login");
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "Failed to reset password");
      }
    } catch (err) {
      setError("Connection error. Please try again");
    } finally {
      setIsLoading(false);
    }
  };

  const renderErrorMessage = (message) => (
    <div className="w-full p-2 bg-red-50 border border-red-200 rounded-lg mt-3 flex items-center space-x-3 overflow-hidden">
      <ShieldCheck className="text-red-500" size={16} />
      <span className="text-red-600 text-xs font-medium">{message}</span>
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case "phone":
        return (
          <div className="w-full space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                Forgot Password?
              </h1>
              <p className="text-gray-500 text-sm">
                Enter your phone number to reset your password
              </p>
            </div>

            <form onSubmit={handleRequestReset} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="text-gray-400" size={20} />
                  </div>
                  <input
                    type="tel"
                    placeholder="Enter your phone number"
                    className="w-full pl-10 pr-4 py-3 border-2 outline-0 border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-500 transition duration-300"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {error && renderErrorMessage(error)}

              <div className="space-y-3">
                <button
                  type="submit"
                  className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition duration-300 flex items-center justify-center space-x-2"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send Verification Code"}
                  <ArrowRight size={20} className="ml-2" />
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/admin/login")}
                  className="w-full border-1 border-black text-black py-2 rounded-lg hover:bg-gray-100 transition duration-300 flex items-center justify-center space-x-2"
                >
                  <ChevronLeft size={20} className="mr-2" />
                  Back to Login
                </button>
              </div>
            </form>
          </div>
        );

      case "otp":
        return (
          <div className="w-full space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                Verify OTP
              </h1>
              <p className="text-gray-500 text-sm">
                Enter the verification code sent to your phone
              </p>
            </div>

            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Verification Code <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ShieldCheck className="text-gray-400" size={20} />
                  </div>
                  <input
                    type="text"
                    placeholder="Enter verification code"
                    className="w-full pl-10 pr-4 py-3 border-2 outline-0 border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-500 transition duration-300"
                    value={otpToken}
                    onChange={(e) => setOtpToken(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {error && renderErrorMessage(error)}

              <div className="space-y-3">
                <button
                  type="submit"
                  className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition duration-300 flex items-center justify-center space-x-2"
                  disabled={isLoading}
                >
                  {isLoading ? "Verifying..." : "Verify Code"}
                  <ArrowRight size={20} className="ml-2" />
                </button>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setCurrentView("phone")}
                    className="w-1/2 border-1 border-black text-black py-2 rounded-lg hover:bg-gray-100 transition duration-300 flex items-center justify-center space-x-2"
                  >
                    <ChevronLeft size={20} className="mr-2" />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleRequestReset}
                    className="w-1/2 text-[#0AAC9E] py-3 rounded-lg hover:bg-[#f2fdfc] transition duration-300"
                    disabled={isLoading}
                  >
                    Resend Code
                  </button>
                </div>
              </div>
            </form>
          </div>
        );

      case "reset":
        return (
          <div className="w-full space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                Reset Password
              </h1>
              <p className="text-gray-500 text-sm">
                Create a new password for your account
              </p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="text-gray-400" size={20} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    className="w-full pl-10 pr-10 py-3 border-2 outline-0 border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-500 transition duration-300"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Confirm New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="text-gray-400" size={20} />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    className="w-full pl-10 pr-10 py-3 border-2 outline-0 border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-500 transition duration-300"
                    value={repeatNewPassword}
                    onChange={(e) => setRepeatNewPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {error && renderErrorMessage(error)}

              <div className="space-y-3">
                <button
                  type="submit"
                  className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition duration-300 flex items-center justify-center space-x-2"
                  disabled={isLoading}
                >
                  {isLoading ? "Updating..." : "Reset Password"}
                  <ArrowRight size={20} className="ml-2" />
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentView("otp")}
                  className="w-full border-1 border-black text-black py-3 rounded-lg hover:bg-gray-100 transition duration-300 flex items-center justify-center space-x-2"
                >
                  <ChevronLeft size={20} className="mr-2" />
                  Back
                </button>
              </div>
            </form>
          </div>
        );

      default:
        return null;
    }
  };

  return <BrandingSlider>{renderContent()}</BrandingSlider>;
}
