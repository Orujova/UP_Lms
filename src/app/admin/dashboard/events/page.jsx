"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Search,
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Eye,
  SortAsc,
  ChevronDown,
  SquareArrowOutUpRight,
} from "lucide-react";
import LoadingSpinner from "@/components/loadingSpinner";
import DeleteConfirmationModal from "@/components/deleteModal";

const PAGE_SIZE = 8;

const SORT_OPTIONS = [
  { value: "nameasc", label: "Name (A-Z)" },
  { value: "namedesc", label: "Name (Z-A)" },
  { value: "dateasc", label: "Date (Oldest)" },
  { value: "datedesc", label: "Date (Newest)" },
];

export default function EventList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalViews, setTotalViews] = useState(0);
  const [sortOrder, setSortOrder] = useState("nameasc");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchEvents();
  }, [currentPage, search, sortOrder]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://bravoadmin.uplms.org/api/Event?Page=${currentPage}&ShowMore.Take=${PAGE_SIZE}&Search=${search}&OrderBy=${sortOrder}`
      );
      const data = await response.json();
      setEvents(data[0].events);
      setTotalCount(data[0].totalEventCount);

      // Calculate total views by summing all event views
      const totalViewsCount = data[0].events.reduce(
        (sum, event) => sum + (event.view || 0),
        0
      );
      setTotalViews(totalViewsCount);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (id) => {
    setEventToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!eventToDelete) return;

    try {
      const response = await fetch(
        `https://bravoadmin.uplms.org/api/Event/${eventToDelete}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        setEvents((prev) => prev.filter((event) => event.id !== eventToDelete));
        fetchEvents();
      } else {
        throw new Error("Failed to delete event.");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
    } finally {
      setDeleteModalOpen(false);
      setEventToDelete(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pt-14">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        <h1 className="text-lg font-bold text-gray-900">Events Management</h1>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          <div className="bg-white rounded-xl shadow-sm p-3 md:p-5">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="bg-[#f9f9f9] p-2.5 rounded-lg">
                <Calendar className="w-4 h-4 text-[#0AAC9E]" />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold text-gray-900">
                  {totalCount}
                </span>
                <p className="text-sm text-gray-500">Total Events</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-3 md:p-5">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="bg-[#f9f9f9] p-2.5 rounded-lg">
                <Eye className="w-4 h-4 text-[#0AAC9E]" />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold text-gray-900">
                  {totalViews}
                </span>
                <p className="text-sm text-gray-500">Total Views</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-3 md:p-5">
            <div className="flex items-center  gap-3 md:gap-4">
              <div className="bg-[#f9f9f9] p-2.5 rounded-lg">
                <Calendar className="w-4 h-4 text-[#0AAC9E]" />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold text-gray-900">
                  {
                    events.filter(
                      (e) =>
                        new Date(e.createdDate) >
                        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    ).length
                  }
                </span>
                <p className="text-sm text-gray-500">New This Week</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-9 pr-4 py-2.5 w-full rounded-lg border border-gray-200 focus:outline-none focus:border-[#01DBC8] focus:ring-2 focus:ring-[#01DBC8]/20 text-sm transition-all"
                />
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-200 hover:border-[#01DBC8] text-gray-700 hover:text-[#01DBC8] transition-all text-sm whitespace-nowrap"
                >
                  <SortAsc className="w-4 h-4" />
                  <span>Sort by</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {showSortDropdown && (
                  <div className="absolute top-full mt-1 right-0 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10 min-w-[180px]">
                    {SORT_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortOrder(option.value);
                          setShowSortDropdown(false);
                        }}
                        className={`w-full px-3 py-2 text-left hover:bg-gray-50 text-sm ${
                          sortOrder === option.value
                            ? "text-[#0AAC9E] font-medium"
                            : "text-gray-700"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => router.push("/admin/dashboard/events/add")}
              className="bg-[#0AAC9E] hover:bg-[#127D74] text-white px-4 py-2.5 rounded-lg
                     flex items-center justify-center gap-2 text-sm font-medium transition-all
                     hover:shadow-lg hover:shadow-[#0AAC9E]/20"
            >
              <Plus className="w-4 h-4" />
              Create New Event
            </button>
          </div>
        </div>

        {/* Events Grid */}
        {events.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 md:p-10 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-base font-medium text-gray-900 mb-1">
              No events found
            </p>
            <p className="text-sm text-gray-500">
              Try adjusting your search or create a new event
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="p-4 md:p-5">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <h2
                        className="text-base font-medium flex items-center text-gray-900 hover:text-[#0AAC9E] cursor-pointer mb-2 truncate"
                        onClick={() =>
                          router.push(`/admin/dashboard/events/${event.id}`)
                        }
                      >
                        {event.subject}
                        <SquareArrowOutUpRight className="w-3.5 h-3.5 ml-2 cursor-pointer" />
                      </h2>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="flex items-center gap-1.5 text-gray-500 text-sm">
                          <Calendar className="w-4 h-4" />
                          {formatDate(event.createdDate)}
                        </span>
                        <span className="flex items-center gap-1.5 bg-[#f0fdfb] text-[#0AAC9E] px-2.5 py-1 rounded-full text-sm">
                          <Eye className="w-3.5 h-3.5" />
                          {event.view || 0} views
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() =>
                          router.push(
                            `/admin/dashboard/events/edit/${event.id}`
                          )
                        }
                        className="p-1.5 text-gray-400 hover:text-[#0AAC9E] hover:bg-[#f0fdfb] rounded-md transition-all"
                        title="Edit event"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(event.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"
                        title="Delete event"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-1 bg-white rounded-xl shadow-sm p-3">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`p-2 rounded-md transition-all ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400"
                  : "bg-white text-gray-700 hover:bg-gray-50 hover:text-[#0AAC9E]"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => setCurrentPage(index + 1)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  currentPage === index + 1
                    ? "bg-[#0AAC9E] text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50 hover:text-[#0AAC9E]"
                }`}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className={`p-2 rounded-md transition-all ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400"
                  : "bg-white text-gray-700 hover:bg-gray-50 hover:text-[#0AAC9E]"
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        item="event"
      />
    </div>
  );
}
