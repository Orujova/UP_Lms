"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getToken } from "@/authtoken/auth.js";
import DeleteConfirmationModal from "@/components/deleteModal";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Video,
  ArrowLeft,
  PenSquare,
  Trash,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  ArrowUpRight,
  ExternalLink,
  PieChart,
  BarChart3,
  Megaphone,
  UserPlus,
  User,
  CheckCheck,
  CalendarDays,
  Download,
  BookOpen,
  Plus,
  Printer,
  FileSpreadsheet,
  Building,
} from "lucide-react";
import LoadingSpinner from "@/components/loadingSpinner";

const TrainingDetailsPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [training, setTraining] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabView, setTabView] = useState("overview"); // overview, participants, materials
  const [expandedSection, setExpandedSection] = useState("confirmed");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchTrainingDetails();
  }, []);

  const fetchTrainingDetails = async () => {
    try {
      const token = getToken();
      const response = await fetch(
        `https://demoadmin.databyte.app/api/Training/GetById?Id=${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTraining(data);
      } else {
        console.error("Failed to fetch training details");
      }
    } catch (error) {
      console.error("Error fetching training details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      const token = getToken();
      const response = await fetch(
        "https://demoadmin.databyte.app/api/Training",
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id }),
        }
      );

      if (response.ok) {
        router.push("/admin/dashboard/trainings");
      } else {
        console.error("Failed to delete training");
      }
    } catch (error) {
      console.error("Error deleting training:", error);
    } finally {
      setShowDeleteModal(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Confirmed":
        return <CheckCircle size={14} className="text-green-500" />;
      case "Declined":
        return <XCircle size={14} className="text-red-500" />;
      default:
        return <AlertCircle size={14} className="text-yellow-500" />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-50 text-green-700";
      case "Declined":
        return "bg-red-50 text-red-700";
      default:
        return "bg-yellow-50 text-yellow-700";
    }
  };

  // Helper for attendance data
  const getAttendanceStats = () => {
    if (!training?.participants)
      return { confirmed: 0, declined: 0, pending: 0, total: 0 };

    const confirmed = training.participants.filter(
      (p) => p.attendanceStatus === "Confirmed"
    ).length;
    const declined = training.participants.filter(
      (p) => p.attendanceStatus === "Declined"
    ).length;
    const pending = training.participants.filter(
      (p) => p.attendanceStatus === "NotResponded"
    ).length;

    return {
      confirmed,
      declined,
      pending,
      total: training.participants.length,
    };
  };

  const stats = getAttendanceStats();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!training) {
    return (
      <div className="min-h-screen bg-gray-50/50 pt-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-3">
              <AlertCircle size={28} className="text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Training Not Found
            </h2>
            <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
              The training you're looking for doesn't exist or has been removed.
            </p>
            <Link
              href="/admin/dashboard/trainings"
              className="inline-flex items-center gap-2 bg-[#0AAC9E] hover:bg-[#089385] text-white px-5 py-2 rounded-lg transition-colors text-sm"
            >
              <ArrowLeft size={16} />
              <span>Back to Trainings</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pt-14">
      <div className="">
        {/* Navigation and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-3">
          <Link
            href="/admin/dashboard/trainings"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 text-base"
          >
            <ArrowLeft size={16} />
            <span>Back to Trainings</span>
          </Link>

          <div className="flex gap-2">
            <Link
              href={`/admin/dashboard/trainings/edit/${training.id}`}
              className="inline-flex items-center  gap-1.5 px-3 py-2 bg-white text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg shadow-sm transition-colors text-sm"
            >
              <PenSquare size={14} />
              <span>Edit</span>
            </Link>
            <button
              onClick={handleDeleteClick}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white text-red-600 hover:bg-red-50 border border-red-200 rounded-lg shadow-sm transition-colors text-sm"
            >
              <Trash size={14} />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left Column - Training Info */}
          <div className="lg:col-span-2">
            {/* Training Header Card */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-5">
              <div></div>
              <div className="p-5">
                <div className="flex items-start gap-3">
                  <div
                    className={`flex-shrink-0 p-2.5 rounded-xl ${
                      training.isOnline
                        ? "bg-blue-100 text-blue-500"
                        : "bg-[#e6f7f5] text-[#0AAC9E]"
                    }`}
                  >
                    {training.isOnline ? (
                      <Video size={20} />
                    ) : (
                      <Building size={20} />
                    )}
                  </div>

                  <div className="flex-grow">
                    <h1 className="text-lg font-semibold text-gray-800 mb-2">
                      {training.subject}
                    </h1>

                    <div className="flex flex-wrap gap-4 text-gray-600 text-sm">
                      <div className="flex items-center">
                        <Calendar
                          size={14}
                          className="mr-1.5 text-gray-500 flex-shrink-0"
                        />
                        <span className="truncate">{training.datetime}</span>
                      </div>

                      <div className="flex items-center">
                        <Clock
                          size={14}
                          className="mr-1.5 text-gray-500 flex-shrink-0"
                        />
                        <span>{training.duration} hours</span>
                      </div>

                      <div className="flex items-center">
                        <Users
                          size={14}
                          className="mr-1.5 text-gray-500 flex-shrink-0"
                        />
                        <span>
                          {training.participants?.length || 0} participants
                        </span>
                      </div>

                      {!training.isOnline && training.location && (
                        <div className="flex items-center">
                          <MapPin
                            size={14}
                            className="mr-1.5 text-gray-500 flex-shrink-0"
                          />
                          <span className="truncate">{training.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="bg-white rounded-t-xl overflow-hidden border-b border-gray-200 mb-0">
              <div className="flex">
                <button
                  onClick={() => setTabView("overview")}
                  className={`px-4 py-3 text-sm flex items-center gap-1.5 ${
                    tabView === "overview"
                      ? "text-[#0AAC9E] border-b-2 border-[#01DBC8]"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <PieChart size={16} />
                  Overview
                </button>

                <button
                  onClick={() => setTabView("participants")}
                  className={`px-4 py-3 text-sm flex items-center gap-1.5 ${
                    tabView === "participants"
                      ? "text-[#0AAC9E] border-b-2 border-[#01DBC8]"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <Users size={16} />
                  Participants
                </button>

                <button
                  onClick={() => setTabView("materials")}
                  className={`px-4 py-3 text-sm flex items-center gap-1.5 ${
                    tabView === "materials"
                      ? "text-[#0AAC9E] border-b-2 border-[#01DBC8]"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <BookOpen size={16} />
                  Materials
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-b-xl shadow-sm overflow-hidden mb-5">
              {/* Overview Tab */}
              {tabView === "overview" && (
                <div className="p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Location/Platform Info */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="text-sm font-medium text-gray-800 mb-2 flex items-center">
                        {training.isOnline ? (
                          <>
                            <Video size={16} className="mr-2 text-blue-500" />
                            Online Training Platform
                          </>
                        ) : (
                          <>
                            <Building
                              size={16}
                              className="mr-2 text-[#0AAC9E]"
                            />
                            Training Location
                          </>
                        )}
                      </h3>

                      {training.isOnline ? (
                        <div>
                          <p className="text-xs text-gray-600 mb-3">
                            This training will be conducted online via a virtual
                            meeting platform.
                          </p>
                          {training.hyperlink && (
                            <a
                              href={training.hyperlink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition-colors text-xs"
                            >
                              <ExternalLink size={14} className="mr-2" />
                              <span>Join Online Session</span>
                            </a>
                          )}
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs text-gray-600 mb-2">
                            {training.location}
                          </p>
                          <a
                            href={`https://maps.google.com/?q=${encodeURIComponent(
                              training.location
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-xs text-[#0AAC9E] hover:text-[#089385]"
                          >
                            <ArrowUpRight size={12} className="mr-1" />
                            View on map
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Target Groups */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="text-sm font-medium text-gray-800 mb-2 flex items-center">
                        <Users size={16} className="mr-2 text-[#0AAC9E]" />
                        Target Groups
                      </h3>

                      <div className="space-y-2">
                        {training.targetGroups.map((group) => (
                          <div
                            key={group.id}
                            className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200"
                          >
                            <div className="w-6 h-6 bg-[#e6f7f5] rounded-full flex items-center justify-center flex-shrink-0">
                              <Megaphone size={12} className="text-[#0AAC9E]" />
                            </div>
                            <span className="text-xs text-gray-700">
                              {group.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Attendance Charts */}
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-800 mb-3 flex items-center">
                      <BarChart3 size={14} className="mr-1.5 text-[#0AAC9E]" />
                      Attendance Overview
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      {/* Total Participants */}
                      <div className="bg-gray-50 rounded-xl p-3 text-center">
                        <div className="text-xl font-bold text-gray-800 mb-1">
                          {stats.total}
                        </div>
                        <div className="text-xs text-gray-600">
                          Total Participants
                        </div>
                      </div>

                      {/* Confirmed */}
                      <div className="bg-green-50 rounded-xl p-3 text-center">
                        <div className="text-xl font-bold text-green-700 mb-1">
                          {stats.confirmed}
                        </div>
                        <div className="text-xs text-green-700">Confirmed</div>
                      </div>

                      {/* Pending */}
                      <div className="bg-yellow-50 rounded-xl p-3 text-center">
                        <div className="text-xl font-bold text-yellow-700 mb-1">
                          {stats.pending}
                        </div>
                        <div className="text-xs text-yellow-700">Pending</div>
                      </div>

                      {/* Declined */}
                      <div className="bg-red-50 rounded-xl p-3 text-center">
                        <div className="text-xl font-bold text-red-700 mb-1">
                          {stats.declined}
                        </div>
                        <div className="text-xs text-red-700">Declined</div>
                      </div>
                    </div>

                    {/* Attendance Progress Bar */}
                    <div className="mt-4 bg-gray-50 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-700">
                          Response Rate
                        </span>
                        <span className="text-xs font-medium text-gray-700">
                          {stats.total
                            ? Math.round(
                                ((stats.confirmed + stats.declined) /
                                  stats.total) *
                                  100
                              )
                            : 0}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-[#01DBC8]"
                          style={{
                            width: `${
                              stats.total
                                ? Math.round(
                                    ((stats.confirmed + stats.declined) /
                                      stats.total) *
                                      100
                                  )
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Participants Tab */}
              {tabView === "participants" && (
                <div className="p-5">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-medium text-gray-800">
                      All Participants ({stats.total})
                    </h3>
                  </div>

                  {/* Participant Filters */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <button
                      onClick={() => setExpandedSection("all")}
                      className={`px-2.5 py-1 rounded-lg text-xs ${
                        expandedSection === "all"
                          ? "bg-gray-800 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setExpandedSection("confirmed")}
                      className={`px-2.5 py-1 rounded-lg text-xs ${
                        expandedSection === "confirmed"
                          ? "bg-green-600 text-white"
                          : "bg-green-50 text-green-700 hover:bg-green-100"
                      }`}
                    >
                      Confirmed ({stats.confirmed})
                    </button>
                    <button
                      onClick={() => setExpandedSection("pending")}
                      className={`px-2.5 py-1 rounded-lg text-xs ${
                        expandedSection === "pending"
                          ? "bg-yellow-500 text-white"
                          : "bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                      }`}
                    >
                      Pending ({stats.pending})
                    </button>
                    <button
                      onClick={() => setExpandedSection("declined")}
                      className={`px-2.5 py-1 rounded-lg text-xs ${
                        expandedSection === "declined"
                          ? "bg-red-600 text-white"
                          : "bg-red-50 text-red-700 hover:bg-red-100"
                      }`}
                    >
                      Declined ({stats.declined})
                    </button>
                  </div>

                  {/* Participants List */}
                  {training.participants?.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-xl">
                      <div className="mx-auto w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-3">
                        <Users size={20} className="text-gray-400" />
                      </div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">
                        No participants yet
                      </h4>
                      <p className="text-xs text-gray-500">
                        No participants have been added to this training
                        session.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                      <div className="grid grid-cols-1 divide-y divide-gray-200">
                        {training.participants
                          .filter((participant) => {
                            if (expandedSection === "all") return true;
                            if (expandedSection === "confirmed")
                              return (
                                participant.attendanceStatus === "Confirmed"
                              );
                            if (expandedSection === "pending")
                              return (
                                participant.attendanceStatus === "NotResponded"
                              );
                            if (expandedSection === "declined")
                              return (
                                participant.attendanceStatus === "Declined"
                              );
                            return true;
                          })
                          .map((participant) => (
                            <div
                              key={participant.userId}
                              className="p-3 hover:bg-gray-50"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                                    <User size={16} className="text-gray-500" />
                                  </div>
                                  <div className="ml-3">
                                    <div className="text-xs font-medium text-gray-800">
                                      {participant.fullName}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      ID: {participant.userId}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <span
                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${getStatusClass(
                                      participant.attendanceStatus
                                    )}`}
                                  >
                                    {getStatusIcon(
                                      participant.attendanceStatus
                                    )}
                                    <span className="ml-1">
                                      {participant.attendanceStatus ===
                                      "NotResponded"
                                        ? "Pending"
                                        : participant.attendanceStatus}
                                    </span>
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Materials Tab */}
              {tabView === "materials" && (
                <div className="p-5">
                  <h3 className="text-sm font-medium text-gray-800 mb-4 flex items-center">
                    <BookOpen size={16} className="mr-2 text-[#0AAC9E]" />
                    Training Materials
                  </h3>

                  <div className="grid gap-3">
                    {/* Sample training materials for demonstration */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex items-center">
                        <div className="bg-blue-100 p-2 rounded-lg mr-3">
                          <BookOpen size={16} className="text-blue-600" />
                        </div>
                        <div>
                          <h4 className="text-xs font-medium text-gray-800">
                            Training Slides
                          </h4>
                          <p className="text-xs text-gray-500">
                            PDF Document • 2.4MB
                          </p>
                        </div>
                      </div>
                      <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg">
                        <Download size={14} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex items-center">
                        <div className="bg-green-100 p-2 rounded-lg mr-3">
                          <FileSpreadsheet
                            size={16}
                            className="text-green-600"
                          />
                        </div>
                        <div>
                          <h4 className="text-xs font-medium text-gray-800">
                            Exercises Worksheet
                          </h4>
                          <p className="text-xs text-gray-500">
                            Excel Document • 1.1MB
                          </p>
                        </div>
                      </div>
                      <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg">
                        <Download size={14} />
                      </button>
                    </div>

                    <div className="mt-3 text-center">
                      <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0AAC9E] hover:bg-[#089385] text-white rounded-lg transition-colors text-xs">
                        <Plus size={14} />
                        <span>Add Material</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Summary and Quick Actions */}
          <div className="lg:col-span-1 space-y-5">
            {/* Training Summary Card */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4">
                <h3 className="font-medium text-sm text-gray-800 mb-3">
                  Training Summary
                </h3>

                <ul className="space-y-3">
                  <li className="flex justify-between items-center">
                    <div className="flex items-center text-gray-600 text-xs">
                      <CalendarDays size={14} className="mr-2 text-gray-400" />
                      <span>Date</span>
                    </div>
                    <span className="text-xs font-medium text-gray-800">
                      {training.datetime}
                    </span>
                  </li>

                  <li className="flex justify-between items-center">
                    <div className="flex items-center text-gray-600 text-xs">
                      <Clock size={14} className="mr-2 text-gray-400" />
                      <span>Duration</span>
                    </div>
                    <span className="text-xs font-medium text-gray-800">
                      {training.duration} hours
                    </span>
                  </li>

                  <li className="flex justify-between items-center">
                    <div className="flex items-center text-gray-600 text-xs">
                      {training.isOnline ? (
                        <Video size={14} className="mr-2 text-blue-500" />
                      ) : (
                        <Building size={14} className="mr-2 text-[#0AAC9E]" />
                      )}
                      <span>Type</span>
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        training.isOnline ? "text-blue-600" : "text-[#0AAC9E]"
                      }`}
                    >
                      {training.isOnline ? "Online" : "On-site"}
                    </span>
                  </li>

                  <li className="flex justify-between items-center">
                    <div className="flex items-center text-gray-600 text-xs">
                      <Users size={14} className="mr-2 text-gray-400" />
                      <span>Participants</span>
                    </div>
                    <span className="text-xs font-medium text-gray-800">
                      {training.participants?.length || 0}
                    </span>
                  </li>

                  <li className="flex justify-between items-center">
                    <div className="flex items-center text-gray-600 text-xs">
                      <CheckCheck size={14} className="mr-2 text-gray-400" />
                      <span>Confirmation Rate</span>
                    </div>
                    <span className="text-xs font-medium text-gray-800">
                      {stats.total
                        ? Math.round((stats.confirmed / stats.total) * 100)
                        : 0}
                      %
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4">
                <h3 className="font-medium text-sm text-gray-800 mb-3">
                  Quick Actions
                </h3>

                <div className="space-y-2">
                  <button className="w-full flex items-center justify-between p-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors text-xs">
                    <div className="flex items-center">
                      <MessageSquare size={14} className="mr-1.5" />
                      <span>Send Reminder</span>
                    </div>
                    <ArrowUpRight size={12} />
                  </button>

                  <button className="w-full flex items-center justify-between p-2.5 bg-[#e6f7f5] hover:bg-[#d1f1ed] text-[#0AAC9E] rounded-lg transition-colors text-xs">
                    <div className="flex items-center">
                      <FileSpreadsheet size={14} className="mr-1.5" />
                      <span>Export Attendance</span>
                    </div>
                    <ArrowUpRight size={12} />
                  </button>

                  <button className="w-full flex items-center justify-between p-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors text-xs">
                    <div className="flex items-center">
                      <Printer size={14} className="mr-1.5" />
                      <span>Print Details</span>
                    </div>
                    <ArrowUpRight size={12} />
                  </button>
                </div>
              </div>
            </div>

            {/* Notes Card */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4">
                <h3 className="font-medium text-sm text-gray-800 mb-3">
                  Notes
                </h3>

                <textarea
                  className="w-full h-24 p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-0 focus:border-[#01DBC8] resize-none text-xs"
                  placeholder="Add private notes about this training..."
                ></textarea>

                <button className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0AAC9E] hover:bg-[#089385] text-white rounded-lg transition-colors text-xs">
                  <Plus size={14} />
                  <span>Save Note</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        item="training"
      />
    </div>
  );
};

export default TrainingDetailsPage;
