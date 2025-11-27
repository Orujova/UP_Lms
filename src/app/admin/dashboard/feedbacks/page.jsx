"use client";
import React, { useState, useEffect, useRef } from "react";
import { format, parseISO } from "date-fns";
import axios from "axios";
import {
  Calendar,
  Search,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  X,
  Filter,
  RefreshCw,
  User,
  ChevronDown,
} from "lucide-react";
import { getToken } from "@/authtoken/auth.js";

// Pagination Component
const Pagination = ({
  totalItems,
  currentPage,
  onPageChange,
  itemsPerPage = 10,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  const generatePageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pageNumbers = [1];

    if (currentPage <= 4) {
      pageNumbers.push(2, 3, 4, 5, "...", totalPages);
    } else if (currentPage >= totalPages - 3) {
      pageNumbers.push(
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages
      );
    } else {
      pageNumbers.push(
        "...",
        currentPage - 1,
        currentPage,
        currentPage + 1,
        "...",
        totalPages
      );
    }

    return pageNumbers;
  };

  return (
    <div className="flex justify-between items-center p-3 bg-white border-t border-gray-100 rounded-b-lg">
      <div className="text-xs text-gray-500">
        Total <span className="font-semibold text-[#0AAC9E]">{totalItems}</span>{" "}
        feedbacks
      </div>
      <div className="flex items-center space-x-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-50 transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>

        {generatePageNumbers().map((page, index) =>
          page === "..." ? (
            <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`
                w-7 h-7 rounded-md text-xs font-medium transition-colors
                ${
                  currentPage === page
                    ? "bg-[#0AAC9E] text-white"
                    : "hover:bg-gray-100 text-gray-700"
                }
              `}
            >
              {page}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-50 transition-colors"
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

// FeedbackItem Component
const FeedbackItem = ({ user, feedback }) => {
  return (
    <div className="p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <div className="h-7 w-7 rounded-full bg-[#0AAC9E]/10 text-[#0AAC9E] flex items-center justify-center mr-2 text-xs">
            {(user.firstName?.[0] || "") + (user.lastName?.[0] || "")}
          </div>
          <div className="font-medium text-gray-800 text-sm">
            {user.firstName || "Unknown"} {user.lastName || "User"}
          </div>
        </div>
        <div className="text-xs text-gray-500 flex items-center">
          <Calendar size={12} className="mr-1" />
          {feedback.createdDate
            ? format(parseISO(feedback.createdDate), "MMM dd, yyyy HH:mm")
            : "Date not specified"}
        </div>
      </div>
      <div className="mt-2 pl-9">
        <p className="text-sm text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
          {feedback.comment || "Empty feedback"}
        </p>
      </div>
    </div>
  );
};

// Main Component
export default function UserFeedbackPage() {
  // State management
  const [feedbacks, setFeedbacks] = useState({
    totalCount: 0,
    feedbacks: [],
  });
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({
    from: null,
    to: null,
  });
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFiltered, setIsFiltered] = useState(false);

  // Create refs for click outside detection
  const datePickerRef = useRef(null);

  // Close date picker when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target)
      ) {
        setIsDatePickerOpen(false);
      }
    }

    // Add event listener
    document.addEventListener("mousedown", handleClickOutside);

    // Clean up the event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [datePickerRef]);

  // Fetch feedbacks from API
  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const token = getToken();

      // Prepare query parameters
      const queryParams = new URLSearchParams();
      queryParams.append("Page", page);
      queryParams.append("ShowMore.Take", "10");

      // Add date range if specified
      if (dateRange.from) {
        queryParams.append("StartDate", dateRange.from.toISOString());
        setIsFiltered(true);
      }
      if (dateRange.to) {
        queryParams.append("EndDate", dateRange.to.toISOString());
        setIsFiltered(true);
      }

      const response = await axios.get(
        `https://demoadmin.databyte.app/api/AdminApplicationUser/feedbacks?${queryParams}`,
        {
          headers: {
            Accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const feedbackData = {
        totalCount: response.data[0].totalAppUserFeedBackCount || 0,
        feedbacks: response.data[0].appUserFeedBacks || [],
      };

      setFeedbacks(feedbackData);
      setFilteredFeedbacks(feedbackData.feedbacks);
      setError(null);
    } catch (err) {
      console.error("Error fetching feedbacks:", err);
      setError("An error occurred while loading feedback data.");
      setFeedbacks({ totalCount: 0, feedbacks: [] });
      setFilteredFeedbacks([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial and filtered data fetching
  useEffect(() => {
    fetchFeedbacks();
  }, [page, dateRange]);

  // Filter feedbacks by search term
  const filterFeedbacks = () => {
    let result = feedbacks.feedbacks || [];

    // Filter by search term
    if (searchTerm) {
      result = result.filter(
        (user) =>
          (user &&
            `${user.firstName || ""} ${user.lastName || ""}`
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          (user.feedbackResponses || []).some((feedback) =>
            feedback.comment.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
      setIsFiltered(true);
    } else if (!dateRange.from && !dateRange.to) {
      setIsFiltered(false);
    }

    setFilteredFeedbacks(result);
    setPage(1);
  };

  // Trigger search filtering
  useEffect(() => {
    filterFeedbacks();
  }, [searchTerm, feedbacks]);

  // Pagination calculation
  const itemsPerPage = 10;
  const totalPages = Math.ceil((filteredFeedbacks?.length || 0) / itemsPerPage);
  const paginatedFeedbacks = (filteredFeedbacks || []).slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, dateRange]);

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm("");
    setDateRange({ from: null, to: null });
    setIsDatePickerOpen(false);
    setIsFiltered(false);
  };

  // Clear date range
  const clearDateRange = () => {
    setDateRange({ from: null, to: null });
    setIsDatePickerOpen(false);
    if (!searchTerm) {
      setIsFiltered(false);
    }
  };

  // Check if any feedback data is available
  const hasNoData =
    !loading &&
    !error &&
    (!filteredFeedbacks || filteredFeedbacks.length === 0);

  return (
    <div className="min-h-screen bg-gray-50 pt-10">
      <div className="container mx-auto ">
        {/* Header Section with Title and Refresh */}
        <div className="bg-white shadow-sm rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-lg font-semibold text-gray-800 flex items-center">
              <MessageCircle className="mr-2 text-[#0AAC9E]" size={20} />
              User Feedback
            </h1>
          </div>

          {/* Filters Section */}
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search by name or feedback content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-0 focus:border-[#01DBC8]"
              />
              <Search
                className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={15}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Date Filter Button */}
            <div className="relative" ref={datePickerRef}>
              <button
                onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                className={`flex items-center justify-between px-3 py-2 border border-gray-200 rounded-lg min-w-40 ${
                  dateRange.from || dateRange.to
                    ? "bg-[#0AAC9E]/5 border-[#0AAC9E]/20 text-[#0AAC9E]"
                    : "text-gray-600"
                } ${isDatePickerOpen ? "ring-2 ring-[#0AAC9E]/20" : ""}`}
              >
                <div className="flex items-center">
                  <Calendar size={15} className="mr-2" />
                  <span className="text-sm">
                    {dateRange.from && dateRange.to
                      ? `${format(dateRange.from, "MM/dd").slice(
                          0,
                          5
                        )} - ${format(dateRange.to, "MM/dd").slice(0, 5)}`
                      : dateRange.from
                      ? `From ${format(dateRange.from, "MM/dd")}`
                      : dateRange.to
                      ? `Until ${format(dateRange.to, "MM/dd")}`
                      : "Date Filter"}
                  </span>
                </div>
                <div className="flex items-center ml-2">
                  {(dateRange.from || dateRange.to) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        clearDateRange();
                      }}
                      className="mr-1 p-0.5 hover:bg-gray-100 rounded-full"
                    >
                      <X size={14} />
                    </button>
                  )}
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${
                      isDatePickerOpen ? "transform rotate-180" : ""
                    }`}
                  />
                </div>
              </button>

              {/* Date Picker Dropdown */}
              {isDatePickerOpen && (
                <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 p-3 w-56">
                  <div className="flex flex-col space-y-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={
                          dateRange.from
                            ? format(dateRange.from, "yyyy-MM-dd")
                            : ""
                        }
                        onChange={(e) =>
                          setDateRange((prev) => ({
                            ...prev,
                            from: e.target.value
                              ? new Date(e.target.value)
                              : null,
                          }))
                        }
                        className="w-full border border-gray-200 rounded-md p-1.5 text-xs focus:ring-1 focus:ring-[#0AAC9E]/30 focus:border-[#0AAC9E]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={
                          dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : ""
                        }
                        onChange={(e) =>
                          setDateRange((prev) => ({
                            ...prev,
                            to: e.target.value
                              ? new Date(e.target.value)
                              : null,
                          }))
                        }
                        className="w-full border border-gray-200 rounded-md p-1.5 text-xs focus:ring-1 focus:ring-[#0AAC9E]/30 focus:border-[#0AAC9E]"
                      />
                    </div>
                  </div>
                  <div className="mt-3 flex justify-between space-x-2">
                    <button
                      onClick={clearDateRange}
                      className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      Clear
                    </button>
                    <button
                      onClick={() => setIsDatePickerOpen(false)}
                      className="px-2 py-1 text-xs bg-[#0AAC9E] text-white rounded-md hover:bg-[#0AAC9E]/90 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Active Filters */}
          {isFiltered && (
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-500 flex items-center">
                <Filter size={12} className="mr-1" /> Active filters:
              </span>

              {searchTerm && (
                <span className="text-xs bg-[#0AAC9E]/10 text-[#0AAC9E] px-2 py-0.5 rounded-full flex items-center">
                  Search:{" "}
                  {searchTerm.length > 15
                    ? searchTerm.substring(0, 15) + "..."
                    : searchTerm}
                  <button
                    onClick={() => setSearchTerm("")}
                    className="ml-1 hover:text-[#0AAC9E]/70"
                  >
                    <X size={10} />
                  </button>
                </span>
              )}

              {(dateRange.from || dateRange.to) && (
                <span className="text-xs bg-[#0AAC9E]/10 text-[#0AAC9E] px-2 py-0.5 rounded-full flex items-center">
                  Date Range
                  <button
                    onClick={clearDateRange}
                    className="ml-1 hover:text-[#0AAC9E]/70"
                  >
                    <X size={10} />
                  </button>
                </span>
              )}

              <button
                onClick={clearAllFilters}
                className="text-xs text-gray-500 hover:text-[#0AAC9E] ml-auto"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white shadow-sm rounded-lg flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#0AAC9E]"></div>
            <p className="mt-3 text-sm text-gray-600">
              Loading feedback data...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-white shadow-sm rounded-lg p-4">
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg flex items-center text-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2 text-red-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{error}</span>
            </div>
            <div className="mt-3 text-center">
              <button
                onClick={fetchFeedbacks}
                className="px-3 py-1.5 bg-[#0AAC9E] text-white rounded-md hover:bg-[#0AAC9E]/90 transition-colors inline-flex items-center text-xs"
              >
                <RefreshCw size={12} className="mr-1.5" />
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* No Data State */}
        {hasNoData && (
          <div className="bg-white shadow-sm rounded-lg p-10 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
              <MessageCircle className="text-gray-400" size={24} />
            </div>
            <h3 className="text-sm font-medium text-gray-800 mb-1">
              No Feedback Found
            </h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              {isFiltered
                ? "No feedback matches your search criteria. Please adjust your filters or clear them all."
                : "No user feedback available yet."}
            </p>

            {isFiltered && (
              <button
                onClick={clearAllFilters}
                className="mt-3 px-3 py-1.5 bg-[#0AAC9E] text-white rounded-md hover:bg-[#0AAC9E]/90 transition-colors text-xs"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Feedback List */}
        {!loading && !error && paginatedFeedbacks.length > 0 && (
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="border-b border-gray-100 px-4 py-3 flex justify-between items-center">
              <h2 className="text-sm font-medium text-gray-700">
                Feedback List
              </h2>
              <span className="text-xs text-gray-500">
                Showing{" "}
                <span className="font-medium text-[#0AAC9E]">
                  {paginatedFeedbacks.length}
                </span>{" "}
                of {filteredFeedbacks.length}
              </span>
            </div>

            <div className="divide-y divide-gray-100">
              {paginatedFeedbacks.map((user, userIndex) =>
                user &&
                user.feedbackResponses &&
                user.feedbackResponses.length > 0 ? (
                  <div key={userIndex}>
                    {user.feedbackResponses.map(
                      (feedback) =>
                        feedback && (
                          <FeedbackItem
                            key={
                              feedback.id ||
                              `${userIndex}-${feedback.createdDate}`
                            }
                            user={user}
                            feedback={feedback}
                          />
                        )
                    )}
                  </div>
                ) : null
              )}
            </div>

            {/* Pagination */}
            {filteredFeedbacks.length > itemsPerPage && (
              <Pagination
                totalItems={filteredFeedbacks.length}
                currentPage={page}
                onPageChange={setPage}
                itemsPerPage={itemsPerPage}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
