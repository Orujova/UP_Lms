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
  Shield,
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

const StatusBadge = ({ scheduledDate, expiryDate }) => {
  const now = new Date();
  const scheduled = new Date(scheduledDate);
  const expiry = new Date(expiryDate);

  if (scheduled > now) {
    return (
      <span className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded-full">
        Scheduled
      </span>
    );
  } else if (expiry < now && expiry.getFullYear() !== 1) {
    return (
      <span className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full">
        Expired
      </span>
    );
  } else if (scheduled <= now && (expiry > now || expiry.getFullYear() === 1)) {
    return (
      <span className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-full">
        Active
      </span>
    );
  }
  return (
    <span className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-full">
      Draft
    </span>
  );
};

const PriorityBadge = ({ priority }) => {
  const priorityStyles = {
    HIGH: "bg-red-100 text-red-700",
    NORMAL: "bg-yellow-100 text-yellow-700",
    LOW: "bg-gray-100 text-gray-700",
  };

  return (
    <span
      className={`px-3 py-1.5 text-xs font-medium rounded-full ${
        priorityStyles[priority] || priorityStyles.LOW
      }`}
    >
      {priority}
    </span>
  );
};

const DateInfoCard = ({ icon: Icon, label, date, color }) => (
  <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
    <div className="flex items-center gap-3">
      <div className={`p-1.5 rounded-md bg-${color}-50`}>
        <Icon className={`w-4 h-4 text-${color}-500`} />
      </div>
      <span className="text-sm text-gray-600">{label}</span>
    </div>
    <span className="text-sm font-medium text-gray-900">{date}</span>
  </div>
);

const InfoRow = ({ icon: Icon, label, value, color = "blue" }) => (
  <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-lg">
    <div className="flex items-center gap-3">
      <div className={`p-1.5 rounded-md bg-${color}-50`}>
        <Icon className={`w-4 h-4 text-${color}-500`} />
      </div>
      <span className="text-sm text-gray-600">{label}</span>
    </div>
    <span className="text-sm font-medium text-gray-900">{value}</span>
  </div>
);

export default function AnnouncementDetail({ params }) {
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const router = useRouter();
  const { id } = params;

  useEffect(() => {
    fetchAnnouncementDetail();
  }, []);

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

  if (loading) {
    return <LoadingSpinner />;
  }

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
    <div className="min-h-screen bg-gray-50/50 pt-14 pb-8">
      <div>
        {/* Top Navigation */}
        <nav className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push("/admin/dashboard/announcements")}
            className="inline-flex items-center  py-2 text-base text-gray-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Announcements
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                router.push(
                  `/admin/dashboard/announcements/edit/${announcement.id}`
                )
              }
              className="inline-flex items-center px-4 py-2 text-sm text-blue-600 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Pencil className="w-4 h-4 mr-2" />
              Edit
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="inline-flex items-center px-4 py-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </button>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-8 space-y-6">
            {/* Hero Image */}
            {announcement.imageUrl && (
              <div className="relative rounded-xl overflow-hidden bg-gray-100 shadow-sm">
                <img
                  src={`https://bravoadmin.uplms.org/uploads/${announcement.imageUrl.replace(
                    "https://100.42.179.27:7198/",
                    ""
                  )}`}
                  alt={announcement.title}
                  className="w-full h-80 object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/api/placeholder/800/400";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
            )}

            {/* Title Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                    {announcement.title}
                  </h1>
                  {announcement.subTitle && (
                    <p className="text-base text-gray-600">
                      {announcement.subTitle}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <PriorityBadge priority={announcement.priority} />
                  <StatusBadge
                    scheduledDate={announcement.scheduledDate}
                    expiryDate={announcement.expiryDate}
                  />
                </div>
              </div>

              {/* View Count - Only show what's available from API */}
              {announcement.totalView && (
                <div className="p-4 bg-gray-50 rounded-xl flex items-center justify-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-full">
                      <Eye className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <span className="text-2xl font-semibold text-gray-900">
                        {announcement.totalView}
                      </span>
                      <span className="text-sm text-gray-500 ml-2">Views</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Description Content */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-medium text-gray-900 mb-6">
                Content
              </h2>

              <div className="space-y-6">
                {announcement.shortDescription && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                      Short Description
                    </h3>
                    <div className="p-5 bg-gray-50 rounded-xl text-base text-gray-600 leading-relaxed border border-gray-200">
                      {announcement.shortDescription}
                    </div>
                  </div>
                )}

                {announcement.description && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                      Full Description
                    </h3>
                    <div className="p-5 bg-gray-50 rounded-xl text-base text-gray-600 leading-relaxed border border-gray-200">
                      {announcement.description}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-medium text-gray-900 mb-6">
                Status Information
              </h2>
              <div className="space-y-4">
                {announcement.createdDate && (
                  <DateInfoCard
                    icon={Calendar}
                    label="Created"
                    date={formatDate(announcement.createdDate)}
                    color="blue"
                  />
                )}

                {announcement.scheduledDate && (
                  <DateInfoCard
                    icon={Clock}
                    label="Scheduled"
                    date={formatDate(announcement.scheduledDate)}
                    color="green"
                  />
                )}

                {announcement.expiryDate && (
                  <DateInfoCard
                    icon={Timer}
                    label="Expires"
                    date={formatDate(announcement.expiryDate)}
                    color="red"
                  />
                )}
              </div>
            </div>

            {/* Additional Meta Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-medium text-gray-900 mb-6">
                Additional Information
              </h2>
              <div className="space-y-4">
                {announcement.pollUnitId && (
                  <InfoRow
                    icon={ChartBar}
                    label="Poll Unit ID"
                    value={announcement.pollUnitId}
                    color="purple"
                  />
                )}

                {announcement.hasNotification !== undefined && (
                  <InfoRow
                    icon={Bell}
                    label="Has Notification"
                    value={announcement.hasNotification === true ? "Yes" : "No"}
                    color="yellow"
                  />
                )}

                {announcement.createdBy && (
                  <InfoRow
                    icon={User}
                    label="Created By"
                    value={announcement.createdBy}
                    color="indigo"
                  />
                )}
              </div>

              {/* Target Groups Section */}
              {announcement.targetGroups &&
                announcement.targetGroups.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-1.5 rounded-md bg-green-50">
                        <Users className="w-4 h-4 text-green-500" />
                      </div>
                      <h3 className="text-base font-medium text-gray-700">
                        Target Groups
                      </h3>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex flex-wrap gap-2">
                        {announcement.targetGroups.map((group, index) => (
                          <span
                            key={index}
                            className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-full border border-blue-100"
                          >
                            {group}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
            </div>

            {/* Announcement ID Card */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Announcement ID</span>
                <span className="text-sm font-medium bg-gray-100 px-3 py-1 rounded-full">
                  {announcement.id}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={deleteAnnouncement}
        item={"announcement"}
      />
    </div>
  );
}
