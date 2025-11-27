"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Search,
  Plus,
  ClipboardList,
  Vote,
  FormInput,
  AlertCircle,
  Calendar,
  Eye,
  SortAsc,
  SquareArrowOutUpRight,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import LoadingSpinner from "@/components/loadingSpinner";

const PAGE_SIZE = 8;

const PollUnitsList = () => {
  const [pollUnits, setPollUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedUnit, setExpandedUnit] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [exporting, setExporting] = useState(false);
  const router = useRouter();

  const FILTER_OPTIONS = [
    { value: "all", label: "All Types" },
    { value: "surveys", label: "Surveys" },
    { value: "votes", label: "Votes" },
    { value: "forms", label: "Forms" },
  ];

  useEffect(() => {
    fetchPollUnits();
  }, [currentPage, searchTerm, filter]);

  const fetchPollUnits = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://demoadmin.databyte.app/api/PollUnit?Page=${currentPage}&ShowMore.Take=${PAGE_SIZE}&Search=${searchTerm}&Type=${
          filter === "all" ? "" : filter
        }`
      );
      const data = await response.json();
      setPollUnits(data[0].pollUnits);
      setTotalCount(data[0].totalCount || data[0].pollUnits.length);
    } catch (error) {
      console.error("Error fetching poll units:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const response = await fetch(
        "https://demoadmin.databyte.app/api/PollUnit/export-poll-units",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `poll-units-export-${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error exporting poll units:", error);
      alert("Failed to export poll units. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const getContentCount = (unit) => ({
    surveys: unit.surveys.length,
    votes: unit.voteQuestions.length,
    forms: unit.formFields.length,
  });

  const getTotalContentCount = () => {
    return pollUnits.reduce(
      (totals, unit) => {
        const counts = getContentCount(unit);
        return {
          surveys: totals.surveys + counts.surveys,
          votes: totals.votes + counts.votes,
          forms: totals.forms + counts.forms,
        };
      },
      { surveys: 0, votes: 0, forms: 0 }
    );
  };

  const filteredUnits = pollUnits.filter((unit) => {
    if (filter === "all") return true;
    const counts = getContentCount(unit);
    return counts[filter] > 0;
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  const totalCounts = getTotalContentCount();
  const totalUnits = totalCount;
  const newThisWeek = pollUnits.filter(
    (unit) =>
      new Date(unit.createdDate || Date.now()) >
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length;

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-gray-50/50 pt-14">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        <h1 className="text-base font-bold text-gray-900">
          Poll Units Management
        </h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <div className="bg-white rounded-xl justify-center shadow-sm p-3 md:p-5">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="bg-gray-50 p-2.5 rounded-lg">
                <ClipboardList className="w-4 h-4 text-gray-500" />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-base font-semibold text-gray-900">
                  {totalUnits}
                </span>
                <p className="text-xs text-gray-500">Total Units</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-3 md:p-5">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="bg-gray-50 p-2.5 rounded-lg">
                <Calendar className="w-4 h-4 text-gray-500" />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-base font-semibold text-gray-900">
                  {newThisWeek}
                </span>
                <p className="text-xs text-gray-500">New This Week</p>
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
                  placeholder="Search poll units..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-9 pr-4 py-2 w-full rounded-lg border border-gray-200 focus:outline-none focus:border-[#01DBC8] focus:ring-2 focus:ring-[#01DBC8]/20 text-xs transition-all"
                />
              </div>

              {/* Filter Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:border-[#01DBC8] text-gray-700 hover:text-[#01DBC8] transition-all text-xs whitespace-nowrap"
                >
                  <SortAsc className="w-4 h-4" />
                  <span>Filter by</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {showFilterDropdown && (
                  <div className="absolute top-full mt-1 right-0 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10 min-w-[180px]">
                    {FILTER_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setFilter(option.value);
                          setCurrentPage(1);
                          setShowFilterDropdown(false);
                        }}
                        className={`w-full px-3 py-1.5 text-left hover:bg-gray-50 text-xs ${
                          filter === option.value
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

            <div className="flex gap-2">
              <button
                onClick={handleExport}
                disabled={exporting}
                className="bg-white border border-[#0AAC9E] text-[#0AAC9E] hover:bg-[#f0fdfb] px-3 py-2 rounded-lg
                       flex items-center justify-center gap-1.5 text-xs font-medium transition-all"
              >
                <Download className="w-4 h-4" />
                {exporting ? "Exporting..." : "Export"}
              </button>

              <button
                onClick={() => router.push("/admin/dashboard/poll-unit/add")}
                className="bg-[#0AAC9E] hover:bg-[#127D74] text-white px-3 py-2 rounded-lg
                       flex items-center justify-center gap-1.5 text-xs font-medium transition-all
                       hover:shadow-lg hover:shadow-[#0AAC9E]/20"
              >
                <Plus className="w-4 h-4" />
                Create New Unit
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {filteredUnits.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 md:p-10 text-center">
            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-base font-medium text-gray-900 mb-1">
              No poll units found
            </p>
            <p className="text-sm text-gray-500">
              Try adjusting your search or create a new poll unit
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {filteredUnits.map((unit) => {
              const counts = getContentCount(unit);
              const hasContent =
                counts.surveys > 0 || counts.votes > 0 || counts.forms > 0;

              return (
                <div
                  key={unit.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="p-4 md:p-5">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <h2
                          className="text-sm font-medium flex items-center text-gray-900 hover:text-[#0AAC9E] cursor-pointer mb-1.5 truncate"
                          onClick={() =>
                            router.push(`/admin/dashboard/poll-unit/${unit.id}`)
                          }
                        >
                          {unit.title}
                          <SquareArrowOutUpRight className="w-3.5 h-3.5 ml-2 cursor-pointer" />
                        </h2>
                        <p className="text-xs text-gray-500 mb-2.5 line-clamp-2">
                          {unit.description}
                        </p>

                        {hasContent ? (
                          <div className="flex flex-wrap gap-2 mb-2">
                            {counts.surveys > 0 && (
                              <span className="flex items-center gap-1 bg-[#f0fdfb] text-[#0AAC9E] px-2 py-0.5 rounded-full text-xs">
                                <ClipboardList className="w-3.5 h-3.5" />
                                {counts.surveys} Survey
                                {counts.surveys !== 1 && "s"}
                              </span>
                            )}
                            {counts.votes > 0 && (
                              <span className="flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-xs">
                                <Vote className="w-3.5 h-3.5" />
                                {counts.votes} Vote{counts.votes !== 1 && "s"}
                              </span>
                            )}
                            {counts.forms > 0 && (
                              <span className="flex items-center gap-1 bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full text-xs">
                                <FormInput className="w-3.5 h-3.5" />
                                {counts.forms} Form{counts.forms !== 1 && "s"}
                              </span>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 mb-2">
                            No content added yet
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() =>
                            setExpandedUnit(
                              expandedUnit === unit.id ? null : unit.id
                            )
                          }
                          className="p-1.5 text-gray-400 hover:text-[#0AAC9E] hover:bg-[#f0fdfb] rounded-md transition-all"
                          title={
                            expandedUnit === unit.id ? "Show less" : "Show more"
                          }
                        >
                          {expandedUnit === unit.id ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {expandedUnit === unit.id && hasContent && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        {counts.surveys > 0 && (
                          <div className="mb-2">
                            <div className="flex items-center gap-1.5 text-xs text-[#0AAC9E] font-medium mb-1">
                              <ClipboardList className="w-4 h-4" />
                              Surveys:
                            </div>
                            <p className="text-xs text-gray-600 pl-5">
                              {unit.surveys.map((s) => s.title).join(", ")}
                            </p>
                          </div>
                        )}
                        {counts.votes > 0 && (
                          <div className="mb-2">
                            <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium mb-1">
                              <Vote className="w-4 h-4" />
                              Vote Questions:
                            </div>
                            <p className="text-sm text-gray-600 pl-6">
                              {unit.voteQuestions.length} question
                              {unit.voteQuestions.length !== 1 && "s"}
                            </p>
                          </div>
                        )}
                        {counts.forms > 0 && (
                          <div className="mb-2">
                            <div className="flex items-center gap-1.5 text-xs text-purple-600 font-medium mb-1">
                              <FormInput className="w-4 h-4" />
                              Form Fields:
                            </div>
                            <p className="text-sm text-gray-600 pl-6">
                              {unit.formFields.length} field
                              {unit.formFields.length !== 1 && "s"}
                            </p>
                          </div>
                        )}
                        <button
                          onClick={() =>
                            router.push(`/admin/dashboard/poll-unit/${unit.id}`)
                          }
                          className="mt-2 text-xs text-[#0AAC9E] hover:text-[#127D74] flex items-center gap-1"
                        >
                          View full details
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
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
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
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
    </div>
  );
};

export default PollUnitsList;
