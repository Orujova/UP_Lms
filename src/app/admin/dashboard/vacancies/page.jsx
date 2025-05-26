"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { Plus } from "lucide-react";
import {
  fetchVacanciesAsync,
  fetchDepartmentsAsync,
  fetchLineManagersAsync,
} from "@/redux/vacancy/vacancy";
import { toast } from "sonner";

// Components
import VacancyCard from "@/components/vacancy/VacancyCard";
import FilterPanel from "@/components/vacancy/FilterPanel";
import LoadingSpinner from "@/components/loadingSpinner";
import Pagination from "@/components/vacancy/Pagination";

const VacanciesPage = () => {
  const dispatch = useDispatch();
  const { vacancies, totalCount, departments, lineManagers, loading, error } =
    useSelector((state) => state.vacancy);

  const [filters, setFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Number of vacancies per page

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // Fetch initial data
  useEffect(() => {
    dispatch(fetchDepartmentsAsync());
    dispatch(fetchLineManagersAsync());
    fetchVacancies();
  }, [dispatch]);

  // Handle error notifications
  useEffect(() => {
    if (error) {
      toast.error(error || "An error occurred");
    }
  }, [error]);

  // Fetch vacancies with pagination and filters
  const fetchVacancies = () => {
    // Combine current filters with pagination parameters
    const paginationParams = {
      ...filters,
      Page: currentPage,
      Offset: itemsPerPage,
    };

    console.log("Fetching vacancies with params:", paginationParams);
    dispatch(fetchVacanciesAsync(paginationParams));
  };

  // Handle page change
  const handlePageChange = (page) => {
    console.log("Changing to page:", page);
    setCurrentPage(page);
  };

  // Re-fetch when page changes
  useEffect(() => {
    fetchVacancies();
  }, [currentPage]);

  // Handle filter application
  const handleFilterApply = (filterData) => {
    console.log("Received filter data:", filterData);

    // Extract page from filterData if it exists
    const { Page, ...otherFilters } = filterData;

    // Update current page if provided in filter data
    if (Page) {
      setCurrentPage(Page);
    } else {
      setCurrentPage(1); // Reset to first page by default on filter change
    }

    setFilters(otherFilters);
  };

  // Re-fetch when filters change
  useEffect(() => {
    fetchVacancies();
  }, [filters]);

  return (
    <div className="min-h-screen bg-gray-50/50 pt-14">
      <div>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-gray-900">
              Vacancy Management
            </h1>
            <p className="text-sm text-gray-500">
              {totalCount > 0
                ? `${totalCount} ${
                    totalCount === 1 ? "vacancy" : "vacancies"
                  } found`
                : "No vacancies yet"}
            </p>
          </div>

          <Link href="/admin/dashboard/vacancies/add">
            <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#0AAC9E] rounded-lg hover:bg-[#127D74] transition-colors shadow-sm">
              <Plus className="w-5 h-5" />
              Add New Vacancy
            </button>
          </Link>
        </div>

        {/* Filter Panel */}
        <FilterPanel
          departments={departments}
          lineManagers={lineManagers}
          onFilter={handleFilterApply}
        />

        {/* Vacancies Grid */}
        {loading && !vacancies.length ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : vacancies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vacancies.map((vacancy) => (
              <VacancyCard key={vacancy.id} vacancy={vacancy} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <p className="text-gray-500">
              No vacancies found matching your criteria.
            </p>
          </div>
        )}

        {/* Pagination */}
        {vacancies.length > 0 && totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default VacanciesPage;
