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
  MapPin,
  Users,
  Target,
  CheckCircle,
  ExternalLink,
  Share2,
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

  const getFormattedDateComponents = (dateString) => {
    if (!dateString || dateString === "0001-01-01T00:00:00") return null;

    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleString("en-US", { month: "short" }),
      year: date.getFullYear(),
      time: date.toLocaleString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3 mx-auto">
            <Calendar className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-900 text-base font-medium mb-1">
            Event not found
          </p>
          <p className="text-gray-500 text-xs mb-3">
            This event may have been removed or is no longer available.
          </p>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#0AAC9E] hover:text-[#127D74] transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
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

  const eventDate = getFormattedDateComponents(event.eventDateTime);

  return (
    <div className="min-h-screen bg-gray-50 pt-8">
      <div className="px-1">
        {/* Header Bar */}
        <div className="flex items-center justify-between mb-3 bg-white p-2 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/admin/dashboard/events")}
              className="p-1.5 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft size={16} className="text-gray-600" />
            </button>
            <h1 className="text-base font-medium text-gray-700">
              Event Details
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push(`/admin/dashboard/events/edit/${id}`)}
              className="px-3 py-1.5 bg-[#0AAC9E] text-white rounded-md hover:bg-[#099b8e] text-xs flex items-center gap-1"
            >
              <Edit size={14} />
              <span>Edit</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Left Column - Image and Details */}
          <div className="md:col-span-2">
            {/* Main Content Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mb-3">
              {/* Image Section */}
              <div className="relative">
                {event.imageUrl ? (
                  <div className="w-full h-52 overflow-hidden">
                    <img
                      src={getImageUrl(event.imageUrl)}
                      alt={event.subject || "Event Image"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                    <Calendar size={32} className="text-gray-300" />
                  </div>
                )}

                {/* Date badge */}
                {eventDate && (
                  <div className="absolute right-3 top-3 bg-white/90 backdrop-blur-sm px-2 py-1.5 rounded-md shadow-sm flex items-center">
                    <div className="text-center mr-2">
                      <span className="block text-base font-bold text-[#0AAC9E]">
                        {eventDate.day}
                      </span>
                      <span className="block text-xs text-gray-500">
                        {eventDate.month}
                      </span>
                    </div>
                    <div className="h-8 w-px bg-gray-200 mx-1.5"></div>
                    <div>
                      <div className="text-xs font-medium text-gray-800">
                        {eventDate.time}
                      </div>
                      <div className="text-xs text-gray-500">
                        {eventDate.year}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Event Title and Description */}
              <div className="p-3">
                <h1 className="text-lg font-semibold text-gray-800 mb-2">
                  {event.subject}
                </h1>
                <div className="flex items-center text-xs text-gray-500 mb-3 flex-wrap gap-3">
                  <div className="flex items-center gap-1">
                    <Eye size={14} className="text-gray-400" />
                    <span>{event.totalView || 0} views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} className="text-gray-400" />
                    <span>
                      Created {formatDate(event.createdDate).split("at")[0]}
                    </span>
                  </div>
                </div>

                <div className="text-sm text-gray-600 mb-3">
                  {event.description || "No description provided."}
                </div>

                {/* Location */}
                {event.location && (
                  <div className="flex items-start gap-2 mt-3 bg-gray-50 p-2 rounded-md">
                    <MapPin
                      size={16}
                      className="text-[#0AAC9E] flex-shrink-0 mt-0.5"
                    />
                    <div>
                      <p className="text-sm text-gray-700">{event.location}</p>
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(
                          event.location
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#0AAC9E] flex items-center gap-1 mt-0.5 hover:underline"
                      >
                        View on Maps
                        <ExternalLink size={10} />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Requirements Card */}
            {event.eventRequirements && event.eventRequirements.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-100 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                    <Users size={14} className="text-[#0AAC9E]" />
                    Requirements
                  </h2>
                  <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
                    {event.eventRequirements.length}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {event.eventRequirements.map((requirement, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 bg-gray-50 p-2 rounded-md"
                    >
                      <CheckCircle
                        size={14}
                        className="text-[#0AAC9E] flex-shrink-0 mt-0.5"
                      />
                      <span className="text-xs text-gray-700">
                        {requirement}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Event Info */}
          <div className="space-y-3">
            {/* Event Details Card */}
            <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-100">
              <h2 className="text-sm font-medium text-gray-700 border-b border-gray-100 pb-2 mb-3">
                Event Details
              </h2>

              <div className="space-y-3">
                {/* Date & Time */}
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-gray-50 rounded-md">
                    <Calendar size={14} className="text-[#0AAC9E]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Event Date & Time</p>
                    <p className="text-xs font-medium text-gray-700">
                      {formatDate(event.eventDateTime)}
                    </p>
                  </div>
                </div>

                {/* Countdown Format */}
                {event.countDown && (
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-gray-50 rounded-md">
                      <Clock size={14} className="text-[#0AAC9E]" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Countdown Format</p>
                      <p className="text-xs text-gray-700">
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
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-gray-50 rounded-md">
                    <Bell size={14} className="text-[#0AAC9E]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Push Notifications</p>
                    <div className="flex items-center mt-0.5">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          event.hasNotification ? "bg-green-500" : "bg-red-500"
                        } mr-1.5`}
                      ></div>
                      <span className="text-xs text-gray-700">
                        {event.hasNotification ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Target Groups Card */}
            <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-100">
              <h2 className="text-sm font-medium text-gray-700 border-b border-gray-100 pb-2 mb-3">
                Target Audience
              </h2>

              {event.targetGroups && event.targetGroups.length > 0 ? (
                <div className="space-y-2">
                  {event.targetGroups.map((group, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1.5 px-2 py-1.5 bg-gray-50 rounded-md"
                    >
                      <Target size={12} className="text-[#0AAC9E]" />
                      <span className="text-xs text-gray-700">{group}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-md p-2 text-center">
                  <p className="text-xs text-gray-500">
                    No target groups specified
                  </p>
                </div>
              )}

              {/* Poll Unit */}
              {event.pollUnitId && (
                <div className="mt-2 pt-2">
                  <div className="text-xs text-gray-500 mb-1">Poll Unit</div>
                  <div className="flex items-center gap-1.5 px-2 py-1.5 bg-gray-50 rounded-md">
                    <span className="text-xs text-gray-700">
                      Poll Unit #{event.pollUnitId}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Creator Card */}
            {event.createdBy && (
              <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-100">
                <h2 className="text-sm font-medium text-gray-700 border-b border-gray-100 pb-2 mb-3">
                  Created By
                </h2>

                <div className="flex items-center gap-3">
                  {event.createdByImage ? (
                    <img
                      src={getImageUrl(event.createdByImage)}
                      alt={event.createdBy}
                      className="w-10 h-10 rounded-full object-cover border border-gray-100"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <User size={16} className="text-gray-400" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {event.createdBy}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(event.createdDate).split("at")[0]}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Stats Card */}
            <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-100">
              <h2 className="text-sm font-medium text-gray-700 border-b border-gray-100 pb-2 mb-3">
                Statistics
              </h2>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-gray-50 rounded-md">
                    <Eye size={14} className="text-[#0AAC9E]" />
                  </div>
                  <span className="text-xs text-gray-500">Total Views</span>
                </div>
                <div className="text-lg font-semibold text-gray-700">
                  {event.totalView || 0}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
