"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Calendar,
  Clock,
  Timer,
  AlertCircle,
  ChartBar,
  Eye,
  User,
  Users,
  Bell,
} from "lucide-react";
import { toast } from "sonner";
import DeleteConfirmationModal from "@/components/deleteModal";
import { getToken, getUserId } from "@/authtoken/auth.js";
import LoadingSpinner from "@/components/loadingSpinner";

const token = getToken();
const userId = getUserId();

// Badge components
const StatusBadge = ({ scheduledDate, expiryDate }) => {
  const now = new Date();
  const scheduled = new Date(scheduledDate);
  const expiry = new Date(expiryDate);

  if (scheduled > now) {
    return (
      <div className="inline-flex items-center bg-yellow-50 border border-yellow-100 rounded-md px-2 py-1">
        <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 mr-1.5"></div>
        <span className="text-xs font-medium text-yellow-700">Scheduled</span>
      </div>
    );
  } else if (expiry < now && expiry.getFullYear() !== 1) {
    return (
      <div className="inline-flex items-center bg-gray-50 border border-gray-100 rounded-md px-2 py-1">
        <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-1.5"></div>
        <span className="text-xs font-medium text-gray-700">Expired</span>
      </div>
    );
  } else if (scheduled <= now && (expiry > now || expiry.getFullYear() === 1)) {
    return (
      <div className="inline-flex items-center bg-green-50 border border-green-100 rounded-md px-2 py-1">
        <div className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5"></div>
        <span className="text-xs font-medium text-green-700">Active</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center bg-purple-50 border border-purple-100 rounded-md px-2 py-1">
      <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mr-1.5"></div>
      <span className="text-xs font-medium text-purple-700">Draft</span>
    </div>
  );
};

const PriorityBadge = ({ priority }) => {
  const styles = {
    HIGH: {
      bg: "bg-red-50",
      border: "border-red-100",
      dot: "bg-red-400",
      text: "text-red-700",
    },
    NORMAL: {
      bg: "bg-yellow-50",
      border: "border-yellow-100",
      dot: "bg-yellow-400",
      text: "text-yellow-700",
    },
    LOW: {
      bg: "bg-gray-50",
      border: "border-gray-100",
      dot: "bg-gray-400",
      text: "text-gray-700",
    },
  };

  const style = styles[priority] || styles.LOW;

  return (
    <div
      className={`inline-flex items-center ${style.bg} border ${style.border} rounded-md px-2 py-1`}
    >
      <div className={`w-1.5 h-1.5 rounded-full ${style.dot} mr-1.5`}></div>
      <span className={`text-xs font-medium ${style.text}`}>{priority}</span>
    </div>
  );
};

export default function AnnouncementDetail({ params }) {
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const router = useRouter();
  const { id } = params;

  useEffect(() => {
    fetchAnnouncementDetail();
  }, []);

  // Fetch announcement data
  const fetchAnnouncementDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://bravoadmin.uplms.org/api/Announcement/${id}?userid=${userId}`
      );
      const data = await response.json();
      setAnnouncement(data);
    } catch (error) {
      console.error("Error fetching announcement details:", error);
    } finally {
      setLoading(false);
    }
  };

  // Delete announcement handler
  const deleteAnnouncement = async () => {
    try {
      const response = await fetch(
        `https://bravoadmin.uplms.org/api/Announcement/${id}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        toast.success("Announcement deleted successfully");
        router.push("/admin/dashboard/announcements/");
      } else {
        throw new Error("Failed to delete announcement");
      }
    } catch (error) {
      console.error("Error deleting announcement:", error);
      toast.error("Failed to delete announcement");
    }
    setIsDeleteModalOpen(false);
  };

  // Helper function to format dates
  const formatDate = (dateString) => {
    if (dateString === "0001-01-01T00:00:00") return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Show loading spinner while data is being fetched
  if (loading) {
    return <LoadingSpinner />;
  }

  // Show "not found" message if announcement doesn't exist
  if (!announcement) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="bg-red-50 p-4 rounded-full inline-block mb-4">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <p className="text-xl font-medium text-gray-800 mb-2">
            Announcement not found
          </p>
          <p className="text-base text-gray-600 mb-6">
            The announcement you're looking for doesn't exist or has been
            removed.
          </p>
          <button
            onClick={() => router.push("/admin/dashboard/announcements")}
            className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Return to Announcements
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-14">
      <div>
        {/* Header and Action Buttons */}
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/admin/dashboard/announcements")}
              className="text-gray-600 hover:bg-gray-100 rounded-lg p-1 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-base font-medium text-gray-900">
              Back to Announcements
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                router.push(
                  `/admin/dashboard/announcements/edit/${announcement.id}`
                )
              }
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-100 rounded-md hover:bg-blue-100 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5 mr-1.5" />
              Edit
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-100 rounded-md hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Delete
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-5">
            {/* Title and Status Card */}
            <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
              {/* Hero Image Section */}
              {announcement.imageUrl && (
                <div className="relative h-48 bg-gray-100">
                  <img
                    src={`https://bravoadmin.uplms.org/uploads/${announcement.imageUrl.replace(
                      "https://100.42.179.27:7198/",
                      ""
                    )}`}
                    alt={announcement.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/api/placeholder/800/400";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                </div>
              )}

              {/* Title and Description */}
              <div className="p-5 grid grid-cols-2 gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {announcement.title}
                  </h2>
                  {announcement.subTitle && (
                    <p className="text-sm text-gray-600 mb-2">
                      {announcement.subTitle}
                    </p>
                  )}
                </div>

                {/* Status badges and view counter */}
                <div className="flex flex-col items-end space-y-2">
                  <div className="flex space-x-2">
                    <StatusBadge
                      scheduledDate={announcement.scheduledDate}
                      expiryDate={announcement.expiryDate}
                    />
                    <PriorityBadge priority={announcement.priority} />
                  </div>

                  {/* View Counter */}
                  {announcement.totalView && (
                    <div className="flex items-center bg-blue-50 px-2 py-1 rounded-md">
                      <Eye className="w-4 h-4 text-blue-500 mr-2" />
                      <div>
                        <span className="text-sm  text-gray-900 mr-1">
                          {announcement.totalView}
                        </span>
                        <span className="text-xs text-gray-500">Views</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description Content */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h3 className="text-base font-medium text-gray-900 mb-3 pb-2 border-b border-gray-100">
                Content
              </h3>

              <div className="space-y-4">
                {announcement.shortDescription && (
                  <div>
                    <h4 className="text-xs uppercase tracking-wider font-medium text-gray-500 mb-2">
                      Short Description
                    </h4>
                    <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600 leading-relaxed border border-gray-200">
                      {announcement.shortDescription}
                    </div>
                  </div>
                )}

                {announcement.description && (
                  <div>
                    <h4 className="text-xs uppercase tracking-wider font-medium text-gray-500 mb-2">
                      Full Description
                    </h4>
                    <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600 leading-relaxed border border-gray-200">
                      {announcement.description}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-5">
            {/* Status Information Card */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h3 className="text-base font-medium text-gray-900 mb-3 pb-2 border-b border-gray-100">
                Status Information
              </h3>
              <div className="space-y-3">
                {announcement.createdDate && (
                  <div className="flex items-center justify-between bg-gray-50 p-2.5 rounded-lg">
                    <div className="flex items-center">
                      <div className="p-1.5 bg-blue-50 rounded-md mr-2">
                        <Calendar className="w-3.5 h-3.5 text-blue-500" />
                      </div>
                      <span className="text-xs font-medium text-gray-600">
                        Created
                      </span>
                    </div>
                    <span className="text-xs text-gray-800">
                      {formatDate(announcement.createdDate)}
                    </span>
                  </div>
                )}

                {announcement.scheduledDate && (
                  <div className="flex items-center justify-between bg-gray-50 p-2.5 rounded-lg">
                    <div className="flex items-center">
                      <div className="p-1.5 bg-green-50 rounded-md mr-2">
                        <Clock className="w-3.5 h-3.5 text-green-500" />
                      </div>
                      <span className="text-xs font-medium text-gray-600">
                        Scheduled
                      </span>
                    </div>
                    <span className="text-xs text-gray-800">
                      {formatDate(announcement.scheduledDate)}
                    </span>
                  </div>
                )}

                {announcement.expiryDate && (
                  <div className="flex items-center justify-between bg-gray-50 p-2.5 rounded-lg">
                    <div className="flex items-center">
                      <div className="p-1.5 bg-red-50 rounded-md mr-2">
                        <Timer className="w-3.5 h-3.5 text-red-500" />
                      </div>
                      <span className="text-xs font-medium text-gray-600">
                        Expires
                      </span>
                    </div>
                    <span className="text-xs text-gray-800">
                      {formatDate(announcement.expiryDate)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h3 className="text-base font-medium text-gray-900 mb-3 pb-2 border-b border-gray-100">
                Additional Information
              </h3>
              <div className="space-y-3">
                {announcement.pollUnitId && (
                  <div className="flex items-center justify-between bg-gray-50 p-2.5 rounded-lg">
                    <div className="flex items-center">
                      <div className="p-1.5 bg-purple-50 rounded-md mr-2">
                        <ChartBar className="w-3.5 h-3.5 text-purple-500" />
                      </div>
                      <span className="text-xs font-medium text-gray-600">
                        Poll Unit ID
                      </span>
                    </div>
                    <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-md">
                      {announcement.pollUnitId}
                    </span>
                  </div>
                )}

                {announcement.hasNotification !== undefined && (
                  <div className="flex items-center justify-between bg-gray-50 p-2.5 rounded-lg">
                    <div className="flex items-center">
                      <div className="p-1.5 bg-yellow-50 rounded-md mr-2">
                        <Bell className="w-3.5 h-3.5 text-yellow-500" />
                      </div>
                      <span className="text-xs font-medium text-gray-600">
                        Has Notification
                      </span>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-md ${
                        announcement.hasNotification
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {announcement.hasNotification ? "Yes" : "No"}
                    </span>
                  </div>
                )}

                {announcement.createdBy && (
                  <div className="flex items-center justify-between bg-gray-50 p-2.5 rounded-lg">
                    <div className="flex items-center">
                      <div className="p-1.5 bg-indigo-50 rounded-md mr-2">
                        <User className="w-3.5 h-3.5 text-indigo-500" />
                      </div>
                      <span className="text-xs font-medium text-gray-600">
                        Created By
                      </span>
                    </div>
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md">
                      {announcement.createdBy}
                    </span>
                  </div>
                )}
              </div>

              {/* Target Groups */}
              {announcement.targetGroups &&
                announcement.targetGroups.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center mb-3">
                      <div className="p-1.5 bg-green-50 rounded-md mr-2">
                        <Users className="w-3.5 h-3.5 text-green-500" />
                      </div>
                      <h4 className="text-xs uppercase tracking-wider font-medium text-gray-500">
                        Target Groups
                      </h4>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {announcement.targetGroups.map((group, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-md border border-blue-100"
                        >
                          {group}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={deleteAnnouncement}
        item="announcement"
      />
    </div>
  );
}
