// Updated NewsManagement.jsx with new DELETE API endpoint
"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import Link from "next/link";
import { Filter, Plus, Download, Search, FileText, List } from "lucide-react";
import {
  newsAsync,
  deleteNewsAsync,
  exportNewsAsync,
  fetchNewsCategoriesAsync,
  resetDeleteStatus,
} from "@/redux/news/news";
import { toast } from "sonner";

import DeleteConfirmationModal from "@/components/deleteModal";
import Pagination from "@/components/ListPagination";
import LoadingSpinner from "@/components/loadingSpinner";
import NewsRow from "@/components/newsRow";
import TableHeader from "@/components/newsTableHeader";
import FilterPanel from "@/components/newsPageFilter";

export default function NewsManagement() {
  const [filterVisible, setFilterVisible] = useState(false);
  const [filters, setFilters] = useState({ OrderBy: "datedesc" });
  const [sortOrder, setSortOrder] = useState("datedesc");
  const [pagination, setPagination] = useState({
    Page: 1,
    ShowMore: { Take: 10 },
  });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });

  const dispatch = useDispatch();
  const newsData = useSelector((state) => state.news.data);
  const categories = useSelector((state) => state.news.categories);
  const loading = useSelector((state) => state.news.loading);
  const deleteSuccess = useSelector((state) => state.news.deleteSuccess);
  const error = useSelector((state) => state.news.error);

  const totalNewsCount = useMemo(
    () => newsData?.[0]?.totalNewsCount || 0,
    [newsData]
  );

  useEffect(() => {
    dispatch(fetchNewsCategoriesAsync());
  }, [dispatch]);

  useEffect(() => {
    if (deleteSuccess) {
      toast.success("News item deleted successfully!");
      dispatch(resetDeleteStatus());
    }
    if (error) {
      toast.error(error || "An error occurred");
    }
  }, [deleteSuccess, error, dispatch]);

  const handleSort = (newOrder) => {
    setSortOrder(newOrder);
    setFilters((prev) => ({ ...prev, OrderBy: newOrder }));
    setPagination((prev) => ({ ...prev, Page: 1 }));
  };

  useEffect(() => {
    const queryParams = {
      ...pagination,
      ...(filters.SearchInput && { SearchInput: filters.SearchInput }),
      ...(filters.NewsCategoryIds &&
        filters.NewsCategoryIds.length > 0 && {
          NewsCategoryIds: filters.NewsCategoryIds.map((id) => parseInt(id)),
        }),
      ...(filters.StartDate && { StartDate: filters.StartDate }),
      ...(filters.EndDate && { EndDate: filters.EndDate }),
      OrderBy: filters.OrderBy || "datedesc",
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

  const openDeleteModal = (id) => {
    setDeleteModal({ isOpen: true, id });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, id: null });
  };

  const confirmDelete = () => {
    // Updated to match new API: DELETE /api/News?Id={id}
    // Redux thunk indi həm obyekt, həm də sadəcə id qəbul edir
    dispatch(deleteNewsAsync(deleteModal.id));
    closeDeleteModal();
  };

  const handleExport = () => {
    dispatch(exportNewsAsync(filters))
      .unwrap()
      .then(() => {
        toast.success("News export started successfully");
      })
      .catch((error) => {
        toast.error(`Export failed: ${error}`);
      });
  };

  if (loading && !newsData) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pt-14 ">
      <div className="mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="space-y-1">
            <h1 className="text-lg font-bold text-gray-900">News Management</h1>
            <p className="text-[0.65rem] text-gray-400 font-normal">
              {totalNewsCount > 0
                ? `Managing ${totalNewsCount} news items`
                : "No news items yet"}
            </p>
          </div>

          <div className="flex items-center gap-2">
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
                className="w-60 pl-10 pr-4 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#01DBC8]/20 focus:border-[#01DBC8]"
              />
            </div>

            <button
              onClick={() => setFilterVisible(!filterVisible)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <Filter className="w-4 h-3" />
              Filter
            </button>

            <Link href="/admin/dashboard/newsCategory">
              <button className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                <List className="w-4 h-4" />
                Categories
              </button>
            </Link>

            <Link href="/admin/dashboard/news/add">
              <button className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-[#0AAC9E] rounded-lg hover:bg-[#127D74]">
                <Plus className="w-4 h-4" />
                Add News
              </button>
            </Link>

            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
            >
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
            categories={categories}
          />
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <TableHeader onSort={handleSort} currentSort={sortOrder} />

          <div className="divide-y divide-gray-100">
            {newsData?.[0]?.news?.map((newsItem, index) => (
              <NewsRow key={index} data={newsItem} onDelete={openDeleteModal} />
            ))}
          </div>

          {(!newsData?.[0]?.news || newsData[0].news.length === 0) && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-[#0AAC9E]" />
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">
                No news items found
              </h3>
              <p className="text-sm text-gray-500 max-w-sm text-center">
                {Object.keys(filters).length > 1
                  ? "No results found for your current filters. Try adjusting your search criteria."
                  : "Start by adding your first news item."}
              </p>
              <Link href="/admin/dashboard/news/add">
                <button className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-[#0AAC9E] rounded-lg hover:bg-[#127D74]">
                  <Plus className="w-4 h-4" />
                  Add First News
                </button>
              </Link>
            </div>
          )}

          {newsData?.[0]?.news?.length > 0 && (
            <Pagination
              totalItems={totalNewsCount}
              currentPage={pagination.Page}
              onPageChange={handlePageChange}
              itemsPerPage={pagination.ShowMore.Take}
            />
          )}
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        item="news item"
      />
    </div>
  );
}