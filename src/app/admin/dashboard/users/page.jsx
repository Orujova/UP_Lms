"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { adminApplicationUserAsync } from "@/redux/adminApplicationUser/adminApplicationUser";
import ControlsButtons from "@/components/controlsButtons";
import UserList from "@/components/userList";
import Pagination from "@/components/pagination";
import "./users.scss";

export default function Page() {
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

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
        await dispatch(adminApplicationUserAsync(currentPage));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [dispatch, currentPage]);

  const handlePageChange = (newPage) => {
    // Scroll to top smoothly when changing pages
    window.scrollTo({ top: 0, behavior: "smooth" });
    setCurrentPage(newPage);
  };

  return (
    <div className="users-page">
      {/* Header Section */}
      <ControlsButtons
        count={adminApplicationUser.totalAppUserCount}
        text="Users in Total"
        link="/admin/dashboard/users/adduser/manualsetup"
        buttonText={"Add User"}
      />

      {/* Main Content */}
      <div className="content-section">
        <UserList
          adminApplicationUser={adminApplicationUser}
          isLoading={isLoading}
        />
      </div>

      {/* Pagination Section */}
      {totalPages > 1 && (
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
