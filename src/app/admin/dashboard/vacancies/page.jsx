// @/app/admin/dashboard/vacancies/page.jsx
"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { Plus, Briefcase } from "lucide-react";
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

    // Initial vacancies fetch
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
    const paginationParams = {
      page: currentPage,
      offset: itemsPerPage,
      ...filters,
    };

    dispatch(fetchVacanciesAsync(paginationParams));
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Re-fetch when page changes
  useEffect(() => {
    fetchVacancies();
  }, [currentPage]);

  // Handle filter application
  const handleFilterApply = (filterData) => {
    setFilters(filterData);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Re-fetch when filters change
  useEffect(() => {
    fetchVacancies();
  }, [filters]);

  return (
    <div className="min-h-screen bg-gray-50/50 pt-14 px-4 sm:px-6 lg:px-8 pb-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
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
            <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#0AAC9E] rounded-lg hover:bg-[#127D74]">
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
          <LoadingSpinner />
        ) : vacancies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vacancies.map((vacancy) => (
              <VacancyCard key={vacancy.id} vacancy={vacancy} />
            ))}
          </div>
        ) : (
          ""
        )}

        {/* Pagination */}
        {vacancies.length > 0 && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
};

export default VacanciesPage;
