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
} from "lucide-react";
import { toast } from "sonner";

export default function AnnouncementDetail({ params }) {
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id } = params;

  useEffect(() => {
    fetchAnnouncementDetail();
  }, []);

  const fetchAnnouncementDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://bravoadmin.uplms.org/api/Announcement/${id}`
      );
      const data = await response.json();
      setAnnouncement(data);
    } catch (error) {
      console.error("Error fetching announcement details:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteAnnouncement = async (id) => {
    if (!confirm("Are you sure you want to delete this announcement?")) {
      return;
    }

    try {
      const response = await fetch(
        `https://bravoadmin.uplms.org/api/Announcement/${id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        toast.success("Announcement deleted successfully.");

        router.push('/admin/dashboard/announcements/');
      } else {
        throw new Error("Failed to delete announcement.");
      }
    } catch (error) {
      console.error("Error deleting announcement:", error);
      toast.error("Failed to delete announcement.");
    }
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
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">
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
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 text-lg mb-4">Announcement not found</p>
          <button
            onClick={() => router.push("/admin/dashboard/announcements")}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Return to Announcements
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <button
            onClick={() => router.push("/admin/dashboard/announcements")}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 font-medium"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Announcements
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                router.push(
                  `/admin/dashboard/announcements/edit/${announcement.id}`
                )
              }
              className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              <Pencil className="w-4 h-4 mr-2" />
              Edit
            </button>
            <button
              onClick={() => deleteAnnouncement(announcement.id)}
              className="inline-flex items-center px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-sm font-medium text-red-600 hover:bg-red-100 hover:border-red-300 transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Hero Section with Image */}
          {announcement.imageUrl && (
            <div className="relative w-full h-72 bg-gray-100">
              <img
                src={`https://bravoadmin.uplms.org/uploads/${announcement.imageUrl.replace(
                  "https://100.42.179.27:7198/",
                  ""
                )}`}
                alt={announcement.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/api/placeholder/1920/1080";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          )}

          <div className="p-6 sm:p-8">
            {/* Title Section */}
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                {announcement.title}
              </h1>
              <p className="text-lg text-gray-600">{announcement.subTitle}</p>
            </div>

            {/* Meta Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-600">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="min-w-24 font-medium">Created:</span>
                  <span>{formatDate(announcement.createdDate)}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <span className="min-w-24 font-medium">Scheduled:</span>
                  <span>{formatDate(announcement.scheduledDate)}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Timer className="w-5 h-5 text-gray-400" />
                  <span className="min-w-24 font-medium">Expires:</span>
                  <span>{formatDate(announcement.expiryDate)}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-600">
                  <AlertCircle className="w-5 h-5 text-gray-400" />
                  <span className="min-w-24 font-medium">Priority:</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700">
                    {announcement.priority}
                  </span>
                </div>
                {announcement.pollUnitId && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <ChartBar className="w-5 h-5 text-gray-400" />
                    <span className="min-w-24 font-medium">Poll Unit ID:</span>
                    <span>{announcement.pollUnitId}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Description Sections */}
            <div className="space-y-8">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  Short Description
                </h2>
                <div className="p-4 bg-gray-50 rounded-xl text-gray-600">
                  {announcement.shortDescription}
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  Full Description
                </h2>
                <div className="p-4 bg-gray-50 rounded-xl text-gray-600">
                  {announcement.description}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
