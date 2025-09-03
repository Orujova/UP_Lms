"use client";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllTargetGroupsAsync } from "@/redux/getAllTargetGroups/getAllTargetGroups";
import { getUserId } from "@/authtoken/auth";
import TargetGroupSelector from "@/components/targetSelect";
import {
  Bell,
  Users,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function Page() {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    title: "",
    body: "",
  });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const storedUserId = getUserId();

  // Target group selection states
  const [searchValue, setSearchValue] = useState("");
  const [selectedTargetGroups, setSelectedTargetGroups] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const Useridd = Number(storedUserId);
    if (storedUserId) {
      setUserId(Useridd);
    }
  }, []);

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

  // Target group selection handlers
  const handleSearchChange = (value) => {
    setSearchValue(value);
  };

  const handleToggleDropdown = (value) => {
    setShowDropdown(value);
  };

  const handleSelectTargetGroup = (group) => {
    if (!selectedTargetGroups.some((selected) => selected.id === group.id)) {
      setSelectedTargetGroups([...selectedTargetGroups, group]);
    } else {
      handleRemoveTargetGroup(group);
    }
  };

  const handleRemoveTargetGroup = (group) => {
    setSelectedTargetGroups(
      selectedTargetGroups.filter((item) => item.id !== group.id)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate target group selection
    if (selectedTargetGroups.length === 0) {
      setStatus({
        type: "error",
        message: "Please select at least one target group.",
      });
      return;
    }

    setIsLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const response = await fetch(
        "https://bravoadmin.uplms.org/api/Notification/SendMobile",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            accept: "*/*",
          },
          body: JSON.stringify({
            title: formData.title,
            body: formData.body,
            targetGroupIds: selectedTargetGroups.map((group) => group.id),
            notificationUserMap: {
              additionalProp1: "",
              additionalProp2: "",
              additionalProp3: "",
            },
            notificationType: "string",

  notificationIds: [
    0
  ],
          }),
        }
      );

      if (response.ok) {
        setStatus({
          type: "success",
          message: "Notification sent successfully!",
        });
        toast.success("Notification sent successfully!");
        setFormData({
          title: "",
          body: "",
        });
        setSelectedTargetGroups([]);
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
    <div className="bg-gray-50 py-8">
      <div className="mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-lg font-bold text-gray-900">
            Send Push Notification
          </h1>
          <p className="mt-2 text-xs text-gray-600">
            Send targeted notifications to specific user groups
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <form onSubmit={handleSubmit} className="p-5 space-y-5">
            {/* Title Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Notification Title
              </label>
              <div className="relative">
                <div className="absolute inset-y-4 bottom-8 left-3 flex items-center pointer-events-none">
                  <Bell className="h-4 w-4 text-[#01DBC8]" />
                </div>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter notification title"
                  maxLength={50}
                  required
                  className="block w-full text-sm pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg outline-0 focus:border-[#01DBC8] transition-colors"
                />
                <div className="mt-1 text-xs text-gray-500 flex justify-end">
                  {formData.title.length}/50 characters
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
                  className="block w-full p-3 border border-gray-200 rounded-lg outline-0 focus:border-[#01DBC8] transition-colors resize-none outline-none"
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

            {/* Target Group Selector */}
            <div className="space-y-2">
              <TargetGroupSelector
                targetGroups={targetGroups}
                searchValue={searchValue}
                selectedTargetGroups={selectedTargetGroups}
                showDropdown={showDropdown}
                onSearchChange={handleSearchChange}
                onToggleDropdown={handleToggleDropdown}
                onSelect={handleSelectTargetGroup}
                onRemove={handleRemoveTargetGroup}
              />
            </div>

            {/* Status Message */}
            {status.message && (
              <div
                className={`flex items-center gap-2 p-4 rounded-lg ${
                  status.type === "error"
                    ? "bg-red-50 text-red-700 border border-red-100"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-100"
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
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className={`text-center px-4 py-2 text-white font-medium rounded-lg flex items-center justify-center gap-2
                ${
                  isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#0aac9e] hover:bg-[#00c4b3] active:bg-[#00ad9f] transition-colors"
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-sm">Sending...</span>
                  </>
                ) : (
                  <>
                    <Bell className="h-4 w-4" />
                    <span className="text-sm">Send Notification</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
