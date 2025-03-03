"use client";
import React from "react";

const Pagination = ({
  totalItems,
  currentPage,
  onPageChange,
  itemsPerPage = 10,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  // Generate page numbers with improved logic - always show first and last
  const generatePageNumbers = () => {
    // If total pages are 7 or less, show all pages
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pageNumbers = [];

    // Always add the first page
    pageNumbers.push(1);

    // Logic for middle pages based on current position
    if (currentPage <= 4) {
      // Near the beginning
      pageNumbers.push(2, 3, 4, 5);
      pageNumbers.push("...");
    } else if (currentPage >= totalPages - 3) {
      // Near the end
      pageNumbers.push("...");
      for (let i = totalPages - 4; i < totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // In the middle
      pageNumbers.push("...");
      pageNumbers.push(currentPage - 1, currentPage, currentPage + 1);
      pageNumbers.push("...");
    }

    // Always add the last page if not already included
    if (pageNumbers[pageNumbers.length - 1] !== totalPages) {
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  const renderPageButton = (pageNum, index) => {
    // Handle ellipsis
    if (pageNum === "...") {
      return (
        <span key={`ellipsis-${index}`} className="px-2 text-gray-500">
          ...
        </span>
      );
    }

    return (
      <button
        key={pageNum}
        onClick={() => onPageChange(pageNum)}
        className={`
          w-6 h-6 flex items-center justify-center 
          rounded-md text-xs transition-colors 
          ${
            currentPage === pageNum
              ? "bg-[#0AAC9E] text-white"
              : "text-gray-600 hover:bg-gray-100"
          }
        `}
      >
        {pageNum}
      </button>
    );
  };

  return (
    <div className="flex items-center justify-between w-full px-6 py-3 bg-white border-t border-gray-200">
      <div className="text-xs text-gray-500">{totalItems} items total</div>
      <div className="flex items-center space-x-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`
            px-3 py-1 text-xs rounded-md transition-colors 
            ${
              currentPage === 1
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-600 hover:bg-gray-100"
            }
          `}
        >
          Previous
        </button>

        {/* Page Numbers */}
        {generatePageNumbers().map((pageNum, index) =>
          renderPageButton(pageNum, index)
        )}

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`
            px-3 py-1 text-xs rounded-md transition-colors 
            ${
              currentPage === totalPages
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-600 hover:bg-gray-100"
            }
          `}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
