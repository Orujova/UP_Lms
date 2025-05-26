"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { adminApplicationUserAsync } from "@/redux/adminApplicationUser/adminApplicationUser";
import ControlsButtons from "@/components/controlsButtons";
import UserList from "@/components/userList";
import LoadingSpinner from "@/components/loadingSpinner";
import FilterPanel from "@/components/userPageFilter";
import Pagination from "@/components/pagination";
import "./users.scss";

export default function Page() {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Store active filters in state
  const [activeFilters, setActiveFilters] = useState({
    functionalAreaId: "",
    departmentId: "",
    projectId: "",
    divisionId: "",
    subDivisionId: "",
    positionGroupId: "",
    positionId: "",
  });

  // Store current page in state
  const [currentPage, setCurrentPage] = useState(1);

  // Get data from Redux store
  const adminApplicationUser =
    useSelector((state) => state.adminApplicationUser.data?.[0]) || [];

  // Calculate total pages
  const itemsPerPage = 10;
  const totalPages = Math.ceil(
    (adminApplicationUser.totalAppUserCount || 0) / itemsPerPage
  );

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Always include active filters when fetching data
        const params = {
          ...activeFilters,
          page: currentPage,
        };
        await dispatch(adminApplicationUserAsync(params));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [dispatch, currentPage, activeFilters]);

  const handlePageChange = (newPage) => {
    // Scroll to top smoothly when changing pages
    window.scrollTo({ top: 0, behavior: "smooth" });
    // Just update the page number, the useEffect will handle fetching with filters
    setCurrentPage(newPage);
  };

  const handleFilterClick = () => {
    setIsFilterOpen(true);
  };

  // Handler to receive applied filters from FilterPanel
  const handleFiltersApplied = (filters) => {
    // Convert PascalCase filter keys to camelCase
    const formattedFilters = {};

    Object.entries(filters).forEach(([key, value]) => {
      const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
      formattedFilters[camelKey] = value;
    });

    setActiveFilters(formattedFilters);
    setCurrentPage(1); // Reset to page 1 when filters change
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pt-12">
      {/* Pass activeFilters to ControlsButtons for export */}
      <ControlsButtons
        count={adminApplicationUser.totalAppUserCount}
        text="Users in Total"
        link="/admin/dashboard/users/adduser"
        buttonText={"Add User"}
        onFilterClick={handleFilterClick}
        activeFilters={activeFilters}
      />

      {/* Pass activeFilters and handler to FilterPanel */}
      <FilterPanel
        isOpen={isFilterOpen}
        setIsOpen={setIsFilterOpen}
        onFiltersApplied={handleFiltersApplied}
        activeFilters={activeFilters}
      />

      {/* Main Content */}
      <div className="content-section">
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <UserList
            adminApplicationUser={adminApplicationUser}
            isLoading={false}
          />
        )}
      </div>

      {/* Pagination - will maintain filters during page changes */}
      {totalPages > 1 && !isLoading && (
        <div className="pagination-section">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
