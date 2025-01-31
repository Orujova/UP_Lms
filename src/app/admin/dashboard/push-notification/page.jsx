"use client";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllTargetGroupsAsync } from "@/redux/getAllTargetGroups/getAllTargetGroups";
import SelectComponent from "@/components/selectComponent";
import {
  Bell,
  Users,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";

export default function Page() {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    targetGroupId: "1",
  });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(false);

  const targetGroups =
    useSelector((state) => state.getAllTargetGroups.data?.[0]?.targetGroups) ||
    [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const response = await fetch(
        "https://bravoadmin.uplms.org/api/Notification/SendMobileNotification",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            accept: "*/*",
          },
          body: JSON.stringify({
            title: formData.title,
            body: formData.body,
            targetGroupId: parseInt(formData.targetGroupId),
          }),
        }
      );

      if (response.ok) {
        setStatus({
          type: "success",
          message: "Notification sent successfully!",
        });
        setFormData({
          title: "",
          body: "",
          targetGroupId: "1",
        });
      } else {
        throw new Error("Failed to send notification");
      }
    } catch (error) {
      setStatus({
        type: "error",
        message: "Failed to send notification. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    dispatch(getAllTargetGroupsAsync());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Send Push Notification
          </h1>
          <p className="mt-2 text-gray-600">
            Send targeted notifications to specific user groups
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Title Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Notification Title
              </label>
              <div className="relative">
                <div className="relative">
                  <div className="absolute inset-y-0  flex items-center left-3 bottom-4 pointer-events-none">
                    <Bell className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter notification title"
                    maxLength={50}
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <div className="mt-1 text-xs text-gray-500 flex justify-end">
                    {formData.title.length}/50 characters
                  </div>
                </div>
              </div>
            </div>

            {/* Message Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Notification Message
              </label>
              <div>
                <textarea
                  name="body"
                  value={formData.body}
                  onChange={handleChange}
                  placeholder="Enter notification message"
                  maxLength={150}
                  required
                  rows={4}
                  className="block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <div className="mt-1 text-xs text-gray-500 flex justify-end">
                  {formData.body.length}/150 characters
                </div>
                {formData.body.length > 130 && (
                  <div className="mt-1 text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    Message might be truncated on some devices
                  </div>
                )}
              </div>
            </div>

            {/* Target Group Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Group
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Users className="h-5 w-5 text-gray-400" />
                </div>
                <SelectComponent
                  text="Select target group"
                  className="block w-full pl-10"
                  name="targetGroupId"
                  required
                  value={formData.targetGroupId}
                  onChange={handleChange}
                  options={targetGroups}
                />
              </div>
            </div>

            {/* Status Message */}
            {status.message && (
              <div
                className={`flex items-center gap-2 p-4 rounded-lg ${
                  status.type === "error"
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                }`}
              >
                {status.type === "error" ? (
                  <XCircle className="h-5 w-5 flex-shrink-0" />
                ) : (
                  <CheckCircle className="h-5 w-5 flex-shrink-0" />
                )}
                <p className="text-sm font-medium">{status.message}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full px-4 py-2 text-white font-medium rounded-lg flex items-center justify-center gap-2
                ${
                  isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-700 transition-colors"
                }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Bell className="h-5 w-5" />
                  Send Notification
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
