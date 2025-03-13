"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  Eye,
  ArrowLeft,
  Edit,
  User,
  Bell,
} from "lucide-react";
import { getToken, getUserId } from "@/authtoken/auth.js";
import LoadingSpinner from "@/components/loadingSpinner";

const EventDetails = ({ params }) => {
  const { id } = params;
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchEventDetails();
  }, []);

  const token = getToken();
  const userId = getUserId();

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://bravoadmin.uplms.org/api/Event/${id}?userid=${userId}`,
        {
          headers: {
            accept: "accept: */*",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      console.log("Event data:", data);
      setEvent(data);
    } catch (error) {
      console.error("Error fetching event details:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === "0001-01-01T00:00:00") return "Not set";
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

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 mx-auto">
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-900 text-lg font-medium mb-2">
            Event not found
          </p>
          <p className="text-gray-500 text-sm mb-4">
            This event may have been removed or is no longer available.
          </p>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#0AAC9E] hover:text-[#127D74] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Events
          </button>
        </div>
      </div>
    );
  }

  // Fix image URL if it contains the legacy server path
  const getImageUrl = (url) => {
    if (!url) return null;

    if (url.includes("https://100.42.179.27:7198/")) {
      return `https://bravoadmin.uplms.org/uploads/${url.replace(
        "https://100.42.179.27:7198/",
        ""
      )}`;
    }
    return url;
  };

  return (
    <div className="min-h-screen bg-gray-50/50 py-6 ">
      <div>
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="inline-flex items-center justify-center p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#f0fdfb] rounded-full">
                  <Calendar className="w-5 h-5 text-[#0AAC9E]" />
                </div>
                <h1 className="text-lg font-semibold text-gray-900">
                  Event Details
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  router.push(`/admin/dashboard/events/edit/${id}`)
                }
                className="inline-flex items-center gap-2 px-3 py-2 bg-[#0AAC9E] hover:bg-[#01c5b4] text-white rounded-lg transition-colors text-sm font-medium"
              >
                <Edit className="w-4 h-4" />
                Edit Event
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Image Section */}
              {event.imageUrl && (
                <div className="relative bg-gray-100">
                  <div className="w-full h-auto aspect-video overflow-hidden">
                    <img
                      src={getImageUrl(event.imageUrl)}
                      alt={event.subject || "Event Image"}
                      className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                      onError={(e) => {
                        e.target.onerror = null;
                        console.error("Failed to load image:", event.imageUrl);
                        e.target.src = "/placeholder-event.jpg";
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Title and Description */}
                <div className="space-y-4">
                  <h1 className="text-xl font-bold text-gray-900">
                    {event.subject}
                  </h1>
                  <p className="text-base text-gray-600 leading-relaxed whitespace-pre-line">
                    {event.description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Event Details Card */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 space-y-6">
                <h2 className="text-base font-semibold text-gray-900 border-b pb-2">
                  Event Details
                </h2>

                {/* Event Date */}
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-gray-50 rounded-lg shrink-0">
                    <Calendar className="w-4 h-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Event Date</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(event.eventDateTime)}
                    </p>
                  </div>
                </div>

                {/* Created Date */}
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-gray-50  rounded-lg shrink-0">
                    <Clock className="w-4 h-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Created</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(event.createdDate)}
                    </p>
                  </div>
                </div>

                {/* Views */}
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-gray-50rounded-lg shrink-0">
                    <Eye className="w-4 h-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Views</p>
                    <p className="text-sm font-medium text-gray-900">
                      {event.totalView || 0}
                    </p>
                  </div>
                </div>

                {/* Countdown Format */}
                {event.countDown && (
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-gray-50 rounded-lg shrink-0">
                      <Clock className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">
                        Countdown Format
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {event.countDown === "1" && "Days only"}
                        {event.countDown === "2" && "Days + Hours + Minutes"}
                        {event.countDown === "3" &&
                          "Days + Hours + Minutes + Seconds"}
                        {!["1", "2", "3"].includes(event.countDown) &&
                          `Format ${event.countDown}`}
                      </p>
                    </div>
                  </div>
                )}

                {/* Notification Status */}
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-gray-50 rounded-lg shrink-0">
                    <Bell className="w-4 h-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      Push Notification
                    </p>
                    <div
                      className={`inline-flex items-center px-2 py-2 ${
                        event.hasNotification
                          ? " text-[#0AAC9E]"
                          : " text-gray-700"
                      } rounded-full text-sm font-normal`}
                    >
                      {event.hasNotification === true ? "Enabled" : "Disabled"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Creator Card */}
            {event.createdBy && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">
                    Creator
                  </h2>
                  <div className="flex items-center gap-4">
                    {event.createdByImage ? (
                      <img
                        src={getImageUrl(event.createdByImage)}
                        alt={event.createdBy}
                        className="w-12 h-12 rounded-full object-cover border-2 border-[#f0fdfb]"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/placeholder-user.jpg";
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-[#f0fdfb] flex items-center justify-center">
                        <User className="w-6 h-6 text-[#0AAC9E]" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Created by</p>
                      <p className="text-base font-medium text-gray-900">
                        {event.createdBy}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Target Groups Card */}
            {event.targetGroups && event.targetGroups.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">
                    Target Groups
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {event.targetGroups.map((group, index) => (
                      <div
                        key={index}
                        className="inline-flex items-center px-4 py-2 bg-[#f0fdfb] text-[#0AAC9E] rounded-full text-sm font-medium"
                      >
                        {group}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
