"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, Eye, ArrowLeft, Edit, Loader } from "lucide-react";

const EventDetails = ({ params }) => {
  const { id } = params;
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchEventDetails();
  }, []);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://bravoadmin.uplms.org/api/Event/${id}`);
      const data = await response.json();

      setEvent(data);
    } catch (error) {
      console.error("Error fetching event details:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (dateString === "0001-01-01T00:00:00") return "Not set";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader className="w-8 h-8 text-emerald-500 animate-spin mx-auto" />
          <p className="mt-2 text-gray-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4 mx-auto">
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 text-lg">Event not found.</p>
          <button
            onClick={() => router.back()}
            className="mt-4 text-emerald-600 hover:text-emerald-700"
          >
            Return to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Events</span>
            </button>
            <button
              onClick={() => router.push(`/admin/dashboard/events/edit/${id}`)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Event</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Image */}
          <div className="aspect-video bg-gray-100">
            <img
              src={`https://bravoadmin.uplms.org/uploads/${event.imageUrl.replace('https://100.42.179.27:7198/', '')}`}
              alt={event.subject || "Event Image"}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "";
              }}
            />
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-gray-900 mb-4">{event.subject}</h1>
              <p className="text-gray-600">{event.description}</p>
            </div>

            {/* Meta Information */}
            <div className="grid gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-50 rounded-md">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Event Date</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(event.eventDateTime)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-50 rounded-md">
                    <Clock className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Created</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(event.createdDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-50 rounded-md">
                    <Eye className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Views</p>
                    <p className="text-sm font-medium text-gray-900">
                      {event.countDown || "No data"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Details */}
            {event.targetGroupName && (
              <div className="mt-6">
                <h2 className="text-lg font-medium text-gray-900 mb-2">Target Group</h2>
                <div className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm">
                  {event.targetGroupName}
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