"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import Link from "next/link";
import {
  Filter,
  Plus,
  Download,
  Search,
  Calendar,
  Tag,
  Eye,
  Clock,
  Edit2,
  Trash2,
  ChevronDown,
  X,
  FileText,
  ArrowUpDown,
  CalendarDays,
} from "lucide-react";
import { newsAsync, removeNews } from "@/redux/news/news";
import { getToken } from "@/authtoken/auth.js";
import { toast } from "sonner";

const TableHeader = () => (
  <div className="grid grid-cols-12 gap-6 px-6 py-4 bg-gray-50 border-b border-gray-200">
    <div className="col-span-4 flex items-center gap-2">
      <span className="text-sm font-medium text-gray-600">Title</span>
      <ArrowUpDown className="w-4 h-4 text-gray-400" />
    </div>
    <div className="col-span-2 flex items-center justify-center gap-2">
      <span className="text-sm font-medium text-gray-600">Category</span>
      <ArrowUpDown className="w-4 h-4 text-gray-400" />
    </div>
    <div className="col-span-2 flex items-center gap-2">
      <span className="text-sm font-medium text-gray-600">Date</span>
      <ArrowUpDown className="w-4 h-4 text-gray-400" />
    </div>
    <div className="col-span-2 flex items-center gap-2">
      <span className="text-sm font-medium text-gray-600">ID</span>
      <ArrowUpDown className="w-4 h-4 text-gray-400" />
    </div>
    <div className="col-span-1 flex items-center gap-2">
      <span className="text-sm font-medium text-gray-600">Views</span>
      <ArrowUpDown className="w-4 h-4 text-gray-400" />
    </div>
    <div className="col-span-1 flex justify-end">
      <span className="text-sm font-medium text-gray-600">Actions</span>
    </div>
  </div>
);

const NewsRow = React.memo(({ data, onDelete }) => {
  const { id, title, createdDate, newsCategoryName, view } = data;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date
      .toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
      .replace(",", "");
  };

  return (
    <div className="grid grid-cols-12 gap-6 px-6 py-5 hover:bg-gray-50 group border-b border-gray-100">
      <div className="col-span-4 flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-lg bg-[#f2fdfc] flex items-center justify-center flex-shrink-0">
          <FileText className="w-5 h-5 text-[#0AAC9E]" />
        </div>
        <div className="truncate">
          <h3 className="text-sm font-medium text-gray-900 truncate">
            {title}
          </h3>
        </div>
      </div>
      <div className="col-span-2 flex items-center justify-center">
        <span className="inline-flex px-2.5 py-1 rounded-full text-sm text-center font-medium bg-[#f9f9f9] text-[#127D74]">
          {newsCategoryName}
        </span>
      </div>
      <div className="col-span-2 flex items-center">
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <Clock className="w-4 h-4 text-gray-400" />
          {formatDate(createdDate)}
        </div>
      </div>
      <div className="col-span-2 flex items-center">
        <span className="text-sm text-gray-600">#{id}</span>
      </div>
      <div className="col-span-1 flex items-center gap-1.5">
        <Eye className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-600">{view}</span>
      </div>
      <div className="col-span-1 flex items-center justify-end gap-2">
        <Link href={`/admin/dashboard/news/${id}`}>
          <button className="p-2 text-gray-400 hover:text-[#0AAC9E] hover:bg-[#f2fdfc] rounded-lg transition-all">
            <Edit2 className="w-4 h-4" />
          </button>
        </Link>
        <button
          onClick={() => onDelete(id)}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
});

const FilterPanel = ({ filters, onFilterChange, onClose }) => {
  const handleChange = (field, value) => {
    const updatedFilters = { ...filters };

    if (field === "ViewRange") {
      if (!updatedFilters.ViewRange) {
        updatedFilters.ViewRange = {};
      }
      updatedFilters.ViewRange = {
        ...updatedFilters.ViewRange,
        ...value,
      };
      // Remove ViewRange if both values are empty
      if (!updatedFilters.ViewRange.Start && !updatedFilters.ViewRange.End) {
        delete updatedFilters.ViewRange;
      }
    } else {
      if (value && value.trim() !== "") {
        updatedFilters[field] = value;
      } else {
        delete updatedFilters[field];
      }
    }

    onFilterChange(updatedFilters);
  };

  const applyFilters = () => {
    let formattedFilters = {};

    if (filters.SearchInput) formattedFilters.SearchInput = filters.SearchInput;
    if (filters.NewsCategoryName)
      formattedFilters.NewsCategoryName = filters.NewsCategoryName;
    if (filters.StartDate) formattedFilters.StartDate = filters.StartDate;
    if (filters.EndDate) formattedFilters.EndDate = filters.EndDate;
    if (filters.OrderBy) formattedFilters.OrderBy = filters.OrderBy;

    if (filters.ViewRange?.Start || filters.ViewRange?.End) {
      formattedFilters.ViewRange = {
        Start: filters.ViewRange.Start
          ? parseInt(filters.ViewRange.Start)
          : null,
        End: filters.ViewRange.End ? parseInt(filters.ViewRange.End) : null,
      };
    }

    onFilterChange(formattedFilters);
    onClose();
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-6">
      <div className="p-6 border-b border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#f2fdfc] rounded-lg">
              <Filter className="w-5 h-5 text-[#0AAC9E]" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Filter Options
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={filters.SearchInput || ""}
                onChange={(e) => handleChange("SearchInput", e.target.value)}
                placeholder="Search by title..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#01DBC8]/20 focus:border-[#01DBC8]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={filters.NewsCategoryName || ""}
                onChange={(e) =>
                  handleChange("NewsCategoryName", e.target.value)
                }
                placeholder="Enter category..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#01DBC8]/20 focus:border-[#01DBC8]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={filters.StartDate || ""}
                onChange={(e) => handleChange("StartDate", e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#01DBC8]/20 focus:border-[#01DBC8]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={filters.EndDate || ""}
                onChange={(e) => handleChange("EndDate", e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#01DBC8]/20 focus:border-[#01DBC8]"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6 mt-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Views Range
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={filters.ViewRange?.Start || ""}
                onChange={(e) =>
                  handleChange("ViewRange", {
                    ...filters.ViewRange,
                    Start: e.target.value,
                  })
                }
                placeholder="Min"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#01DBC8]/20 focus:border-[#01DBC8]"
              />
              <span className="text-gray-500">to</span>
              <input
                type="number"
                value={filters.ViewRange?.End || ""}
                onChange={(e) =>
                  handleChange("ViewRange", {
                    ...filters.ViewRange,
                    End: e.target.value,
                  })
                }
                placeholder="Max"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#01DBC8]/20 focus:border-[#01DBC8]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Order By
            </label>
            <div className="relative">
              <select
                value={filters.OrderBy || ""}
                onChange={(e) => handleChange("OrderBy", e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border outline-none border-gray-200 rounded-lg text-sm appearance-none focus:ring-2 focus:ring-[#01DBC8]/20 focus:border-[#01DBC8]"
              >
                <option value="">Select Order</option>
                <option value="date">Date</option>
                <option value="views">Views</option>
                <option value="title">Title</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
        <button
          onClick={() => onFilterChange({})}
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          Clear Filters
        </button>
        <button
          onClick={applyFilters}
          className="px-4 py-2 text-sm font-medium text-white bg-[#0AAC9E] rounded-lg hover:bg-[#127D74]"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default function NewsManagement() {
  const [filterVisible, setFilterVisible] = useState(false);
  const [filters, setFilters] = useState({});
  const [pagination, setPagination] = useState({
    Page: 1,
    ShowMore: { Take: 10 },
  });

  const dispatch = useDispatch();
  const token = getToken();
  const newsData = useSelector((state) => state.news.data);
  const totalNewsCount = useMemo(
    () => newsData?.[0]?.totalNewsCount || 0,
    [newsData]
  );
  const totalPages = Math.ceil(totalNewsCount / pagination.ShowMore.Take);

  useEffect(() => {
    // Format filter parameters before dispatch
    const queryParams = {
      ...pagination,
      ...(filters.SearchInput && { SearchInput: filters.SearchInput }),
      ...(filters.NewsCategoryName && {
        NewsCategoryName: filters.NewsCategoryName,
      }),
      ...(filters.StartDate && { StartDate: filters.StartDate }),
      ...(filters.EndDate && { EndDate: filters.EndDate }),
      ...(filters.OrderBy && { OrderBy: filters.OrderBy }),
      ...((filters.ViewRange?.Start || filters.ViewRange?.End) && {
        ViewRange: {
          Start: filters.ViewRange?.Start
            ? parseInt(filters.ViewRange.Start)
            : null,
          End: filters.ViewRange?.End ? parseInt(filters.ViewRange.End) : null,
        },
      }),
    };

    dispatch(newsAsync(queryParams));
  }, [dispatch, pagination, filters]);

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, Page: newPage }));
  };

  const handlePerPageChange = (newPerPage) => {
    setPagination((prev) => ({
      ...prev,
      ShowMore: {
        ...prev.ShowMore,
        Take: parseInt(newPerPage),
      },
      Page: 1,
    }));
  };

  const deleteNews = async (id) => {
    if (!confirm("Are you sure you want to delete this news item?")) return;

    try {
      const formData = new FormData();
      formData.append("Id", id);

      const response = await fetch("https://bravoadmin.uplms.org/api/News", {
        method: "DELETE",
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to delete news item.");

      dispatch(removeNews(id));
      toast.success("News item deleted successfully!");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to delete news item. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-8">
      <div className="mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-gray-900">
              News Management
            </h1>
            <p className="text-sm text-gray-500">
              {totalNewsCount > 0
                ? `Managing ${totalNewsCount} news items`
                : "No news items yet"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={filters.SearchInput || ""}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    SearchInput: e.target.value,
                  }))
                }
                placeholder="Search news..."
                className="w-64 pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#01DBC8]/20 focus:border-[#01DBC8]"
              />
            </div>

            <button
              onClick={() => setFilterVisible(!filterVisible)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <Filter className="w-4 h-4" />
              Filter
            </button>

            <Link href="/admin/dashboard/news/add">
              <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#0AAC9E] rounded-lg hover:bg-[#127D74]">
                <Plus className="w-4 h-4" />
                Add News
              </button>
            </Link>

            <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {filterVisible && (
          <FilterPanel
            filters={filters}
            onFilterChange={setFilters}
            onClose={() => setFilterVisible(false)}
          />
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <TableHeader />

          <div className="divide-y divide-gray-100">
            {newsData?.[0]?.news?.map((newsItem, index) => (
              <NewsRow key={index} data={newsItem} onDelete={deleteNews} />
            ))}
          </div>

          {(!newsData?.[0]?.news || newsData[0].news.length === 0) && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-[#0AAC9E]" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No news items found
              </h3>
              <p className="text-sm text-gray-500 max-w-sm text-center">
                {Object.keys(filters).length > 0
                  ? "No results found for your current filters. Try adjusting your search criteria."
                  : "Start by adding your first news item."}
              </p>
              <Link href="/admin/dashboard/news/add">
                <button className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#0AAC9E] rounded-lg hover:bg-[#127D74]">
                  <Plus className="w-4 h-4" />
                  Add First News
                </button>
              </Link>
            </div>
          )}

          {newsData?.[0]?.news?.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-500">
                  <span className="font-medium">{totalNewsCount}</span> items
                  total
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.Page - 1)}
                  disabled={pagination.Page === 1}
                  className="inline-flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-md disabled:opacity-50"
                >
                  Previous
                </button>

                <div className="flex items-center">
                  <button
                    onClick={() => handlePageChange(1)}
                    className={`px-3 py-1 text-sm ${
                      pagination.Page === 1
                        ? "text-white bg-[#0AAC9E]"
                        : "text-gray-600 hover:bg-gray-100"
                    } rounded-md`}
                  >
                    1
                  </button>

                  {pagination.Page > 3 && (
                    <span className="px-2 text-gray-400">...</span>
                  )}

                  {Array.from(
                    { length: Math.min(3, totalPages - 2) },
                    (_, i) => {
                      const pageNum =
                        Math.min(
                          Math.max(pagination.Page - 1, 2),
                          totalPages - 3
                        ) + i;
                      if (pageNum <= 1 || pageNum >= totalPages) return null;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-1 text-sm ${
                            pagination.Page === pageNum
                              ? "text-white bg-[#0AAC9E]"
                              : "text-gray-600 hover:bg-gray-100"
                          } rounded-md`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                  )}

                  {pagination.Page < totalPages - 2 && (
                    <span className="px-2 text-gray-400">...</span>
                  )}

                  {totalPages > 1 && (
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      className={`px-3 py-1 text-sm ${
                        pagination.Page === totalPages
                          ? "text-white bg-[#0AAC9E]"
                          : "text-gray-600 hover:bg-gray-100"
                      } rounded-md`}
                    >
                      {totalPages}
                    </button>
                  )}
                </div>

                <button
                  onClick={() => handlePageChange(pagination.Page + 1)}
                  disabled={pagination.Page === totalPages}
                  className="inline-flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-md disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
