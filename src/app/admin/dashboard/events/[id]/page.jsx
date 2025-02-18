"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, Eye, ArrowLeft, Edit, User } from "lucide-react";
import { getToken } from "@/authtoken/auth.js";

const EventDetails = ({ params }) => {
  const { id } = params;
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchEventDetails();
  }, []);

  const token = getToken();
  const userId = localStorage.getItem("userId");

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
      console.log(data);
      setEvent(data);
    } catch (error) {
      console.error("Error fetching event details:", error);
    } finally {
      setLoading(false);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-t-[#0AAC9E] border-b-[#0AAC9E] rounded-full animate-spin"></div>
          <p className="mt-2 text-gray-600">Loading event data...</p>
        </div>
      </div>
    );
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

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="inline-flex items-center justify-center p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-medium text-gray-900">
                Event Details
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  router.push(`/admin/dashboard/events/edit/${id}`)
                }
                className="inline-flex items-center gap-2 px-3 py-2 bg-[#0AAC9E] hover:bg-[#127D74] text-white rounded-lg transition-colors text-sm font-medium"
              >
                <Edit className="w-4 h-4" />
                Edit Event
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Image Section */}
          <div className="relative  bg-gray-100">
            <img
              src={
                event.imageUrl
                  ? `https://bravoadmin.uplms.org/uploads/${event.imageUrl.replace(
                      "https://100.42.179.27:7198/",
                      ""
                    )}`
                  : "/placeholder-event.jpg"
              }
              alt={event.subject || "Event Image"}
              className="w-full h-96 object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/placeholder-event.jpg";
              }}
            />
          </div>

          {/* Content */}
          <div className="p-4 md:p-6 space-y-6">
            {/* Title and Description */}
            <div className="space-y-4">
              <h1 className="text-xl font-semibold text-gray-900">
                {event.subject}
              </h1>
              <p className="text-sm text-gray-600 leading-relaxed">
                {event.description}
              </p>
            </div>

            {/* Meta Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-[#f0fdfb] rounded-lg shrink-0">
                  <Calendar className="w-4 h-4 text-[#0AAC9E]" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Event Date</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(event.eventDateTime)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-[#f0fdfb] rounded-lg shrink-0">
                  <Clock className="w-4 h-4 text-[#0AAC9E]" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Created</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(event.createdDate)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-[#f0fdfb] rounded-lg shrink-0">
                  <Eye className="w-4 h-4 text-[#0AAC9E]" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Views</p>
                  <p className="text-sm font-medium text-gray-900">
                    {event.countDown || "No views yet"}
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Details */}
            {event.targetGroupName && (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-[#f0fdfb] rounded-lg">
                    <User className="w-4 h-4 text-[#0AAC9E]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Target Group</p>
                    <div className="inline-flex items-center px-3 py-1 bg-[#f0fdfb] text-[#0AAC9E] rounded-full text-sm font-medium">
                      {event.targetGroupName}
                    </div>
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
