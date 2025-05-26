"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { getToken } from "@/authtoken/auth.js";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Video,
  Plus,
  PenSquare,
  Eye,
  Trash,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  Building,
  CalendarDays,
  ArrowUpDown,
  List,
  Grid,
} from "lucide-react";
import DeleteConfirmationModal from "@/components/deleteModal";
import LoadingSpinner from "@/components/loadingSpinner";

const TrainingListPage = () => {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState("all");
  const [sortField, setSortField] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    trainingId: null,
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const itemsPerPage = 8;

  useEffect(() => {
    fetchTrainings();
  }, []);

  const fetchTrainings = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await fetch(
        "https://bravoadmin.uplms.org/api/Training",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTrainings(data);
      } else {
        console.error("Failed to fetch trainings");
      }
    } catch (error) {
      console.error("Error fetching trainings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteModal({ isOpen: true, trainingId: id });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, trainingId: null });
  };

  const confirmDelete = async () => {
    try {
      const token = getToken();
      const response = await fetch(
        "https://bravoadmin.uplms.org/api/Training",
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: deleteModal.trainingId }),
        }
      );

      if (response.ok) {
        fetchTrainings();
      } else {
        console.error("Failed to delete training");
      }
    } catch (error) {
      console.error("Error deleting training:", error);
    } finally {
      closeDeleteModal();
    }
  };

  // Memoized filtered and sorted trainings
  const filteredTrainings = useMemo(() => {
    return trainings.filter((training) => {
      const matchesSearch =
        training.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        training.location?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType =
        filterType === "all" ||
        (filterType === "online" && training.isOnline) ||
        (filterType === "in-person" && !training.isOnline);
      return matchesSearch && matchesType;
    });
  }, [trainings, searchTerm, filterType]);

  const sortedTrainings = useMemo(() => {
    return [...filteredTrainings].sort((a, b) => {
      if (sortField === "date") {
        return sortDirection === "asc"
          ? new Date(a.datetime) - new Date(b.datetime)
          : new Date(b.datetime) - new Date(a.datetime);
      } else if (sortField === "subject") {
        return sortDirection === "asc"
          ? a.subject.localeCompare(b.subject)
          : b.subject.localeCompare(a.subject);
      } else if (sortField === "participants") {
        const aCount = a.participants?.length || 0;
        const bCount = b.participants?.length || 0;
        return sortDirection === "asc" ? aCount - bCount : bCount - aCount;
      }
      return 0;
    });
  }, [filteredTrainings, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(sortedTrainings.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedTrainings.slice(indexOfFirstItem, indexOfLastItem);

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const toggleSortDirection = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pt-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Training Management
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Organize and manage your training sessions efficiently
            </p>
          </div>
          <Link
            href="/admin/dashboard/trainings/create"
            className="inline-flex items-center gap-2 bg-[#0AAC9E] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#089385] transition-colors focus:outline-none focus:ring-0 focus:border-[#01DBC8] whitespace-nowrap shadow-sm"
          >
            <Plus size={16} />
            Create Training
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden">
          <div className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              {/* Search */}
              <div className="relative flex-grow w-full">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search trainings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-10 bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-0 focus:border-[#01DBC8] transition-colors"
                />
              </div>

              <div className="flex items-center gap-2 ml-auto">
                {/* View Toggle */}
                <div className="flex items-center bg-gray-100 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 transition-colors ${
                      viewMode === "grid"
                        ? "bg-[#0AAC9E] text-white"
                        : "bg-gray-100 text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <Grid size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 transition-colors ${
                      viewMode === "list"
                        ? "bg-[#0AAC9E] text-white"
                        : "bg-gray-100 text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <List size={16} />
                  </button>
                </div>

                {/* Type Filter */}
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-gray-50 border border-gray-200 text-sm pl-3 pr-8 py-2 rounded-lg text-gray-700 focus:outline-none focus:ring-0 focus:border-[#01DBC8] transition-colors h-10 appearance-none bg-no-repeat bg-right"
                  style={{
                    backgroundImage:
                      "url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%23555%22%20d%3D%22M6%209L1%203h10z%22%2F%3E%3C%2Fsvg%3E')",
                    backgroundPosition: "right 0.75rem center",
                    backgroundSize: "0.8em auto",
                  }}
                >
                  <option value="all">All Types</option>
                  <option value="online">Online</option>
                  <option value="in-person">On-site</option>
                </select>

                {/* Sort */}
                <div className="relative">
                  <select
                    value={`${sortField}-${sortDirection}`}
                    onChange={(e) => {
                      const [field, direction] = e.target.value.split("-");
                      setSortField(field);
                      setSortDirection(direction);
                    }}
                    className="bg-gray-50 border border-gray-200 text-sm pl-3 pr-8 py-2 rounded-lg text-gray-700 focus:outline-none focus:ring-0 focus:border-[#01DBC8] transition-colors h-10 appearance-none bg-no-repeat bg-right"
                    style={{
                      backgroundImage:
                        "url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%23555%22%20d%3D%22M6%209L1%203h10z%22%2F%3E%3C%2Fsvg%3E')",
                      backgroundPosition: "right 0.75rem center",
                      backgroundSize: "0.8em auto",
                    }}
                  >
                    <option value="date-desc">Latest First</option>
                    <option value="date-asc">Oldest First</option>
                    <option value="subject-asc">Subject (A-Z)</option>
                    <option value="subject-desc">Subject (Z-A)</option>
                    <option value="participants-desc">Most Participants</option>
                    <option value="participants-asc">Least Participants</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-500">
            {filteredTrainings.length} trainings found
          </p>
          {filteredTrainings.length > 0 && (
            <p className="text-xs text-gray-500">
              Showing {indexOfFirstItem + 1}-
              {Math.min(indexOfLastItem, filteredTrainings.length)} of{" "}
              {filteredTrainings.length}
            </p>
          )}
        </div>

        {/* Empty State */}
        {filteredTrainings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <Calendar size={40} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Trainings Found
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              {searchTerm || filterType !== "all"
                ? "Try adjusting your search or filters to find trainings."
                : "Get started by creating your first training session."}
            </p>
            {!searchTerm && filterType === "all" && (
              <Link
                href="/admin/dashboard/trainings/create"
                className="inline-flex items-center gap-2 bg-[#0AAC9E] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#089385] transition-colors"
              >
                <Plus size={16} />
                Create Training
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Grid View */}
            {viewMode === "grid" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {currentItems.map((training) => (
                  <div
                    key={training.id}
                    className="bg-white rounded-xl shadow-sm hover:shadow transition-shadow duration-300 overflow-hidden group flex flex-col h-full border border-gray-100"
                  >
                    {/* Top color indicator */}
                    <div></div>

                    {/* Card content */}
                    <div className="p-4 flex-grow">
                      {/* Badge */}
                      <div
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium mb-3 ${
                          training.isOnline
                            ? "bg-blue-100 text-blue-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {training.isOnline ? (
                          <>
                            <Video size={12} />
                            <span>Online</span>
                          </>
                        ) : (
                          <>
                            <Building size={12} />
                            <span>On-site</span>
                          </>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-base font-semibold text-gray-900 line-clamp-2 mb-3">
                        {training.subject}
                      </h3>

                      {/* Details */}
                      <div className="space-y-2 text-xs text-gray-600">
                        <div className="flex items-center gap-2">
                          <CalendarDays
                            size={14}
                            className="text-gray-400 flex-shrink-0"
                          />
                          <span className="truncate">
                            {formatDate(training.datetime)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock
                            size={14}
                            className="text-gray-400 flex-shrink-0"
                          />
                          <span>{training.duration} hours</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users
                            size={14}
                            className="text-gray-400 flex-shrink-0"
                          />
                          <span>
                            {training.participants?.length || 0} participants
                          </span>
                        </div>

                        {!training.isOnline && training.location && (
                          <div className="flex items-center gap-2">
                            <MapPin
                              size={14}
                              className="text-gray-400 flex-shrink-0"
                            />
                            <span className="truncate">
                              {training.location}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Target Groups */}
                      {training.targetGroups &&
                        training.targetGroups.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {training.targetGroups.slice(0, 2).map((group) => (
                              <span
                                key={group.id}
                                className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs"
                              >
                                {group.name}
                              </span>
                            ))}
                            {training.targetGroups.length > 2 && (
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                                +{training.targetGroups.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                    </div>

                    {/* Card Actions */}
                    <div className="grid grid-cols-3 divide-x divide-gray-100 border-t border-gray-100 bg-gray-50 mt-auto">
                      <Link
                        href={`/admin/dashboard/trainings/${training.id}`}
                        className="flex items-center justify-center py-2.5 text-gray-500 hover:bg-gray-100 hover:text-[#0AAC9E] transition-colors"
                      >
                        <Eye size={16} />
                      </Link>
                      <Link
                        href={`/admin/dashboard/trainings/edit/${training.id}`}
                        className="flex items-center justify-center py-2.5 text-gray-500 hover:bg-gray-100 hover:text-blue-500 transition-colors"
                      >
                        <PenSquare size={16} />
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(training.id)}
                        className="flex items-center justify-center py-2.5 text-gray-500 hover:bg-gray-100 hover:text-red-500 transition-colors"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* List View */}
            {viewMode === "list" && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Training
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Participants
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentItems.map((training) => (
                      <tr key={training.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {training.subject}
                              </div>
                              {training.location && !training.isOnline && (
                                <div className="text-xs text-gray-500 flex items-center mt-1">
                                  <MapPin
                                    size={12}
                                    className="mr-1 text-gray-400"
                                  />
                                  {training.location}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(training.datetime)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {training.duration} hours
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                              training.isOnline
                                ? "bg-blue-100 text-blue-700"
                                : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            {training.isOnline ? (
                              <>
                                <Video size={12} />
                                <span>Online</span>
                              </>
                            ) : (
                              <>
                                <Building size={12} />
                                <span>On-site</span>
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {training.participants?.length || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/admin/dashboard/trainings/${training.id}`}
                              className="text-gray-500 hover:text-[#0AAC9E] p-1 rounded-md hover:bg-gray-100"
                            >
                              <Eye size={16} />
                            </Link>
                            <Link
                              href={`/admin/dashboard/trainings/edit/${training.id}`}
                              className="text-gray-500 hover:text-blue-500 p-1 rounded-md hover:bg-gray-100"
                            >
                              <PenSquare size={16} />
                            </Link>
                            <button
                              onClick={() => handleDeleteClick(training.id)}
                              className="text-gray-500 hover:text-red-500 p-1 rounded-md hover:bg-gray-100"
                            >
                              <Trash size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <nav
                  className="inline-flex items-center bg-white rounded-lg shadow-sm border border-gray-200"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-2 rounded-l-lg ${
                      currentPage === 1
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-600 hover:bg-gray-50"
                    } focus:outline-none`}
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {Array.from({ length: totalPages }).map((_, index) => {
                    const pageNumber = index + 1;

                    // Show first, last, and pages around current
                    if (
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
                      (pageNumber >= currentPage - 1 &&
                        pageNumber <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => goToPage(pageNumber)}
                          className={`px-3.5 py-2 text-sm ${
                            pageNumber === currentPage
                              ? "bg-[#0AAC9E] text-white"
                              : "text-gray-600 hover:bg-gray-50"
                          } focus:outline-none`}
                          aria-current={
                            pageNumber === currentPage ? "page" : undefined
                          }
                        >
                          {pageNumber}
                        </button>
                      );
                    } else if (
                      (pageNumber === currentPage - 2 && currentPage > 3) ||
                      (pageNumber === currentPage + 2 &&
                        currentPage < totalPages - 2)
                    ) {
                      return (
                        <span
                          key={pageNumber}
                          className="px-2 py-2 text-sm text-gray-400"
                        >
                          …
                        </span>
                      );
                    }
                    return null;
                  })}

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-2 rounded-r-lg ${
                      currentPage === totalPages
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-600 hover:bg-gray-50"
                    } focus:outline-none`}
                    aria-label="Next page"
                  >
                    <ChevronRight size={16} />
                  </button>
                </nav>
              </div>
            )}
          </>
        )}

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={deleteModal.isOpen}
          onClose={closeDeleteModal}
          onConfirm={confirmDelete}
          item="training"
        />
      </div>
    </div>
  );
};

export default TrainingListPage;
