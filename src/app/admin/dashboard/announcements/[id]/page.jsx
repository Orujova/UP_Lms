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
  Loader2,
  Eye,
  MessageSquare,
  Share2,
  BookOpen,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import DeleteConfirmationModal from "@/components/deleteModal";
import { getToken } from "@/authtoken/auth.js";

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
    High: "bg-red-100 text-red-700",
    Medium: "bg-yellow-100 text-yellow-700",
    Low: "bg-gray-100 text-gray-700",
  };

  return (
    <span
      className={`px-3 py-1.5 text-xs font-medium rounded-full ${
        priorityStyles[priority] || priorityStyles.Low
      }`}
    >
      {priority}
    </span>
  );
};

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="text-center transform hover:scale-105 transition-transform">
    <div
      className={`flex items-center justify-center w-12 h-10 mx-auto mb-3 bg-${color}-50 rounded-xl`}
    >
      <Icon className={`w-5 h-4 text-${color}-500`} />
    </div>
    <span className="text-sm font-medium text-gray-900 mb-1">{value}</span>
    <span className="text-xs text-gray-500 ml-2">{label}</span>
  </div>
);

const DateInfoCard = ({ icon: Icon, label, date, color }) => (
  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
    <div className="flex items-center gap-3">
      <Icon className={`w-4 h-5 text-${color}-500`} />
      <span className="text-xs text-gray-600">{label}</span>
    </div>
    <span className="text-[0.7rem] font-medium text-gray-900">{date}</span>
  </div>
);

export default function AnnouncementDetail({ params }) {
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const router = useRouter();
  const { id } = params;
  const token = getToken();
  const userId = localStorage.getItem("userId");

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
      toast.error("Failed to load announcement details");
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
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#0AAC9E] mx-auto mb-3" />
          <p className="text-sm text-gray-600">
            Loading announcement details...
          </p>
        </div>
      </div>
    );
  }

  if (!announcement) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-base text-gray-600 mb-4">Announcement not found</p>
          <button
            onClick={() => router.push("/admin/dashboard/announcements")}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Return to List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pt-14">
      <div className=" mx-auto ">
        {/* Top Navigation */}
        <nav className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push("/admin/dashboard/announcements")}
            className="inline-flex items-center px-4 py-2 text-base text-gray-600 font-semibold  rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to List
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Image */}
            {announcement.imageUrl && (
              <div className="relative rounded-xl overflow-hidden bg-gray-100 shadow-sm">
                <img
                  src={`https://bravoadmin.uplms.org/uploads/${announcement.imageUrl.replace(
                    "https://100.42.179.27:7198/",
                    ""
                  )}`}
                  alt={announcement.title}
                  className="w-full h-72 object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/api/placeholder/800/400";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
            )}

            {/* Title Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-xl font-semibold text-gray-900 mb-2">
                    {announcement.title}
                  </h1>
                  <p className="text-sm text-gray-600">
                    {announcement.subTitle}
                  </p>
                </div>
                <PriorityBadge priority={announcement.priority} />
              </div>

              {/* Engagement Stats */}
              <div className="grid grid-cols-3 gap-6 p-4 bg-gray-50 rounded-xl">
                <StatCard icon={Eye} label="Views" value="1.2k" color="blue" />
                <StatCard
                  icon={MessageSquare}
                  label="Comments"
                  value="24"
                  color="green"
                />
                <StatCard
                  icon={Share2}
                  label="Shares"
                  value="8"
                  color="purple"
                />
              </div>
            </div>

            {/* Description Content */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <BookOpen className="w-5 h-5 text-blue-500" />
                <h2 className="text-base font-medium text-gray-900">Content</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Short Description
                  </h3>
                  <div className="p-4 bg-gray-50 rounded-xl text-sm text-gray-600 leading-relaxed">
                    {announcement.shortDescription}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Full Description
                  </h3>
                  <div className="p-4 bg-gray-50 rounded-xl text-sm text-gray-600 leading-relaxed">
                    {announcement.description}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Status Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-base font-medium text-gray-900 mb-6">
                Status Information
              </h2>
              <div className="space-y-5">
                <DateInfoCard
                  icon={Calendar}
                  label="Created"
                  date={formatDate(announcement.createdDate)}
                  color="blue"
                />

                <DateInfoCard
                  icon={Clock}
                  label="Scheduled"
                  date={formatDate(announcement.scheduledDate)}
                  color="green"
                />

                <DateInfoCard
                  icon={Timer}
                  label="Expires"
                  date={formatDate(announcement.expiryDate)}
                  color="red"
                />

                {announcement.pollUnitId && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <ChartBar className="w-4 h-5 text-purple-500" />
                      <span className="text-xs text-gray-600">Poll ID</span>
                    </div>
                    <span className="text-[0.7rem] font-medium text-gray-900">
                      {announcement.pollUnitId}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Meta Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-base font-medium text-gray-900 mb-6">
                Additional Information
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Shield className="w-4 h-5 text-green-500" />
                    <span className="text-xs text-gray-600">Status</span>
                  </div>
                  <StatusBadge
                    scheduledDate={announcement.scheduledDate}
                    expiryDate={announcement.expiryDate}
                  />
                </div>
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
