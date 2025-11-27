"use client";

import { useState, useEffect } from "react";
import { Users, Filter, Plus, Trash2, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import { getToken } from "@/authtoken/auth.js";
import TargetGroupsComponent from "@/components/targetGroupsComponent";

export default function TargetPage() {
  const router = useRouter();
  const [targetGroups, setTargetGroups] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showDeleted, setShowDeleted] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [targetToToggle, setTargetToToggle] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(null);

  // Fetch target groups with isDeleted parameter
  const fetchTargetGroups = async (isDeleted = false) => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) {
        toast.error("Authentication token not found. Please login again.");
        setLoading(false);
        return;
      }

      const response = await fetch(
        `https://demoadmin.databyte.app/api/TargetGroup/GetAllTargetGroups?IsDeleted=${isDeleted}`,
        {
          method: "GET",
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch data. Status: ${response.status}`);
      }

      const data = await response.json();
      if (data && data[0]) {
        setTargetGroups(data[0].targetGroups || []);
        setTotalCount(data[0].totalTargetGroupCount || 0);
      } else {
        setTargetGroups([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error("Error fetching target groups:", error);
      toast.error("Failed to load target groups");
      setTargetGroups([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Initialize data
  useEffect(() => {
    fetchTargetGroups(showDeleted);
  }, [showDeleted]);

  // Toggle between active and deleted target groups
  const toggleShowDeleted = () => {
    setShowDeleted(!showDeleted);
  };

  // Handle toggling activation/deactivation
  const handleToggleActivation = async (id) => {
    setConfirmDialogOpen(false);
    setActionInProgress(id);

    try {
      const token = getToken();
      if (!token) {
        toast.error("Authentication token not found. Please login again.");
        return;
      }

      // Use the same API endpoint for both deactivation and restoration
      const response = await fetch(
        "https://demoadmin.databyte.app/api/TargetGroup/DeactivateTargetGroup",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ id }),
        }
      );

      if (response.ok) {
        toast.success(
          showDeleted
            ? "Target group restored successfully"
            : "Target group deactivated successfully"
        );

        // Refresh the list
        fetchTargetGroups(showDeleted);
      } else {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            (showDeleted
              ? "Failed to restore target group"
              : "Failed to deactivate target group")
        );
      }
    } catch (error) {
      console.error(
        `Error ${showDeleted ? "restoring" : "deactivating"} target group:`,
        error
      );
      toast.error(
        error.message ||
          `Failed to ${showDeleted ? "restore" : "deactivate"} target group`
      );
    } finally {
      setActionInProgress(null);
    }
  };

  // Show confirmation dialog before deactivating or restoring
  const confirmAction = (target) => {
    setTargetToToggle(target);
    setConfirmDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pt-14">
      {/* Confirmation Modal */}
      {confirmDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div
            className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {showDeleted ? "Confirm Restoration" : "Confirm Deactivation"}
            </h3>
            <p className="text-gray-600 mb-6">
              {showDeleted
                ? `Are you sure you want to restore the target group "${targetToToggle?.name}"? This will move it back to the active list.`
                : `Are you sure you want to deactivate the target group "${targetToToggle?.name}"? This will remove it from the active list.`}
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                onClick={() => setConfirmDialogOpen(false)}
              >
                Cancel
              </button>
              <button
                className={`px-4 py-2 text-sm text-white ${
                  showDeleted ? "bg-[#0AAC9E]" : "bg-red-500"
                } rounded-md ${
                  showDeleted ? "hover:bg-[#099b8e]" : "hover:bg-red-600"
                } flex items-center`}
                onClick={() => handleToggleActivation(targetToToggle.id)}
              >
                {actionInProgress === targetToToggle?.id ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                ) : showDeleted ? (
                  <RotateCcw className="w-4 h-4 mr-2" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                {showDeleted ? "Restore" : "Deactivate"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4 leading-tight">
          <div className="flex justify-between items-center">
            {/* Counter Section */}
            <div className="flex items-center gap-3">
              <div className="bg-[#e6fbf9] p-2 rounded-md">
                <Users className="w-4 h-4 text-[#0AAC9E]" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-base font-semibold text-gray-900">
                  {totalCount || 0}
                </span>
                <span className="text-gray-500 text-sm">
                  Target Groups in Total
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleShowDeleted}
                className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg border 
                  ${
                    showDeleted
                      ? "border-[#0AAC9E] text-[#0AAC9E] bg-[#ecfcfb]"
                      : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                  }`}
              >
                <Filter className="w-4 h-4" />
                {showDeleted ? "Show Active" : "Show Deactivated"}
              </button>

              {!showDeleted && (
                <button
                  onClick={() => router.push("/admin/dashboard/targets/add")}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#0AAC9E] rounded-lg hover:bg-[#099b8e] flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add new target
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm p-4 leading-tight">
          <TargetGroupsComponent
            data={targetGroups}
            loading={loading}
            showDeleted={showDeleted}
            onToggleActivation={confirmAction}
            actionInProgress={actionInProgress}
          />
        </div>
      </div>
    </div>
  );
}
