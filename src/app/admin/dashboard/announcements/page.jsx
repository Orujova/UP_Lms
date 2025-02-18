"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Edit,
  Trash2,
  Plus,
  Search,
  Calendar,
  Clock,
  AlertCircle,
  ChevronDown,
  Filter,
  ArrowLeft,
  ArrowRight,
  Grid,
  List,
  Bookmark,
  Tag,
  Eye,
  SquareArrowOutUpRight,
} from "lucide-react";

import Link from "next/link";
import { toast } from "sonner";
import DeleteConfirmationModal from "@/components/deleteModal";
const PAGE_SIZE = 12;

export default function AnnouncementsList() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sortBy, setSortBy] = useState("nameasc");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteAnnouncementId, setDeleteAnnouncementId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://bravoadmin.uplms.org/api/Announcement?Page=${currentPage}&ShowMore.Take=${PAGE_SIZE}&Search=${search}&OrderBy=${sortBy}`
        );
        const data = await response.json();
        setAnnouncements(data[0].announcements);
        setTotalCount(data[0].totalAnnouncementCount);
      } catch (error) {
        console.error("Error fetching announcements:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, [currentPage, search, sortBy]);

  const deleteAnnouncement = async (id) => {
    try {
      const response = await fetch(
        `https://bravoadmin.uplms.org/api/Announcement/${id}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        setAnnouncements((prev) =>
          prev.filter((announcement) => announcement.id !== id)
        );

        toast.success("Announcement deleted successfully");

        if (announcements.length === 1 && currentPage > 1) {
          setCurrentPage((prev) => prev - 1);
        }
      } else {
        throw new Error("Failed to delete announcement.");
      }
    } catch (error) {
      console.error("Error deleting announcement:", error);
      toast.error("Failed to delete announcement");
    } finally {
      setIsDeleteModalOpen(false);
      setDeleteAnnouncementId(null);
    }
  };

  // Create a function to handle delete button clicks
  const handleDeleteClick = (id) => {
    setDeleteAnnouncementId(id);
    setIsDeleteModalOpen(true);
  };

  const formatDate = (dateString) => {
    if (dateString === "0001-01-01T00:00:00") return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const sortOptions = [
    { value: "nameasc", label: "Title (A-Z)" },
    { value: "namedesc", label: "Title (Z-A)" },
    { value: "dateasc", label: "Date (Oldest)" },
    { value: "datedesc", label: "Date (Newest)" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-t-[#0AAC9E] border-b-[#0AAC9E] rounded-full animate-spin"></div>
          <p className="mt-2 text-sm text-gray-600">Loading announcements...</p>
        </div>
      </div>
    );
  }

  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {announcements.map((announcement) => (
        <div
          key={announcement.id}
          className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
        >
          <div className="relative h-40 bg-gray-100">
            {announcement.imageUrl ? (
              <img
                src={`https://bravoadmin.uplms.org/uploads/${announcement.imageUrl.replace(
                  "https://100.42.179.27:7198/",
                  ""
                )}`}
                alt={announcement.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <Bookmark className="w-8 h-8 text-gray-400" />
              </div>
            )}
            <div className="absolute inset-0 bg-black bg-opacity-40 p-4">
              <h2 className="text-white text-base font-medium truncate">
                {announcement.title}
              </h2>
              <div className="absolute bottom-3 right-3 flex space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(
                      `/admin/dashboard/announcements/edit/${announcement.id}`
                    );
                  }}
                  className="p-1.5 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                >
                  <Edit className="w-3.5 h-3.5 text-white" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(announcement.id);
                  }}
                  className="p-1.5 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            </div>
          </div>
          <div
            className="p-4 cursor-pointer"
            onClick={() =>
              router.push(`/admin/dashboard/announcements/${announcement.id}`)
            }
          >
            <p className="text-gray-600 text-xs line-clamp-2 mb-3">
              {announcement.shortDescription}
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-1 text-gray-500">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatDate(announcement.createdDate)}</span>
              </div>
              {announcement.scheduledDate !== "0001-01-01T00:00:00" && (
                <div className="flex items-center gap-1 text-gray-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatDate(announcement.scheduledDate)}</span>
                </div>
              )}{" "}
              <SquareArrowOutUpRight
                onClick={() =>
                  router.push(
                    `/admin/dashboard/announcements/${announcement.id}`
                  )
                }
                className="w-3.5 h-3.5 ml-2 font-medium text-gray-500 hover:text-gray-600 cursor-pointer"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const ListView = () => (
    <div className="space-y-3">
      {announcements.map((announcement) => (
        <div
          key={announcement.id}
          className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
        >
          <div className="p-4">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                  <h2
                    onClick={() =>
                      router.push(
                        `/admin/dashboard/announcements/${announcement.id}`
                      )
                    }
                    className="text-sm font-medium text-gray-900 hover:text-gray-600 cursor-pointer"
                  >
                    {announcement.title}
                  </h2>
                  <SquareArrowOutUpRight
                    onClick={() =>
                      router.push(
                        `/admin/dashboard/announcements/${announcement.id}`
                      )
                    }
                    className="w-3.5 h-3.5 ml-2 font-medium text-gray-900 hover:text-gray-600 cursor-pointer"
                  />
                </div>
                <p className="text-xs text-gray-600 mb-3 line-clamp-2 pl-4">
                  {announcement.shortDescription}
                </p>
                <div className="flex flex-wrap items-center gap-3 pl-4">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDate(announcement.createdDate)}</span>
                  </div>
                  {announcement.scheduledDate !== "0001-01-01T00:00:00" && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatDate(announcement.scheduledDate)}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    router.push(
                      `/admin/dashboard/announcements/edit/${announcement.id}`
                    )
                  }
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteClick(announcement.id)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-12">
      <div className=" mx-auto">
        {/* Top Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Announcements</p>
                <h3 className="text-lg font-bold text-gray-900">
                  {totalCount}
                </h3>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <Bookmark className="w-4 h-4 text-blue-500" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active This Month</p>
                <h3 className="text-lg font-bold text-gray-900">
                  {
                    announcements.filter(
                      (a) =>
                        new Date(a.createdDate).getMonth() ===
                        new Date().getMonth()
                    ).length
                  }
                </h3>
              </div>
              <div className="p-2 bg-green-50 rounded-lg">
                <Tag className="w-4 h-4 text-green-500" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Scheduled</p>
                <h3 className="text-lg font-bold text-gray-900">
                  {
                    announcements.filter(
                      (a) => a.scheduledDate !== "0001-01-01T00:00:00"
                    ).length
                  }
                </h3>
              </div>
              <div className="p-2 bg-purple-50 rounded-lg">
                <Eye className="w-4 h-4 text-purple-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Header and Controls */}
        <div className="bg-white rounded-xl shadow-sm mb-5">
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  Announcements
                </h1>
                <p className="text-xs text-gray-500 mt-1">
                  Manage and organize all announcements
                </p>
              </div>
              <Link href="/admin/dashboard/announcements/add">
                <button className="inline-flex items-center gap-2 px-6 py-2 text-xs font-medium text-white bg-[#0AAC9E] rounded-xl hover:bg-[#127D74] transition-all">
                  <Plus className="w-4 h-4" />
                  New Announcement
                </button>
              </Link>
            </div>
          </div>

          <div className="p-5">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search announcements..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 text-xs border-1 border-gray-200 rounded-xl focus:ring-1 focus:ring-[#01DBC8] "
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <button
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className="flex items-center gap-2 px-4 py-2 text-xs border border-gray-200 rounded-xl hover:border-gray-300"
                  >
                    <Filter className="w-4 h-3 text-gray-500" />
                    <span className="text-gray-700">Sort</span>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </button>
                  {isFilterOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-20">
                      {sortOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSortBy(option.value);
                            setIsFilterOpen(false);
                          }}
                          className="w-full px-3 py-2 text-xs text-left hover:bg-gray-50 text-gray-700"
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 border border-gray-200 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1 rounded-lg ${
                      viewMode === "grid"
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-1 rounded-lg ${
                      viewMode === "list"
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {announcements.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No announcements found
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Try adjusting your search criteria or create a new announcement
            </p>
            <Link href="/admin/dashboard/announcements/add">
              <button className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-[#0AAC9E] rounded-xl hover:bg-[#127D74] transition-all">
                <Plus className="w-5 h-5" />
                Create First Announcement
              </button>
            </Link>
          </div>
        ) : (
          <div className="mb-8">
            {viewMode === "grid" ? <GridView /> : <ListView />}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center">
            <div className="bg-white rounded-xl shadow-sm inline-flex items-center divide-x divide-gray-100">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`p-3 first:rounded-l-xl transition-colors ${
                  currentPage === 1
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              {Array.from({ length: totalPages }).map((_, index) => {
                // Show first page, last page, current page, and one page before and after current
                if (
                  index === 0 ||
                  index === totalPages - 1 ||
                  index === currentPage - 1 ||
                  Math.abs(index - (currentPage - 1)) <= 1
                ) {
                  return (
                    <button
                      key={index}
                      onClick={() => setCurrentPage(index + 1)}
                      className={`px-4 py-2 min-w-[40px] text-sm font-medium transition-colors ${
                        currentPage === index + 1
                          ? "bg-[#0AAC9E] text-white"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {index + 1}
                    </button>
                  );
                } else if (index === 1 || index === totalPages - 2) {
                  // Show ellipsis
                  return (
                    <span
                      key={index}
                      className="px-4 py-2 text-sm text-gray-400"
                    >
                      ...
                    </span>
                  );
                }
                return null;
              })}
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className={`p-3 last:rounded-r-xl transition-colors ${
                  currentPage === totalPages
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteAnnouncementId(null);
        }}
        onConfirm={() =>
          deleteAnnouncementId && deleteAnnouncement(deleteAnnouncementId)
        }
        item="announcement"
      />
    </div>
  );
}
