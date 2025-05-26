"use client";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  const renderPageNumbers = () => {
    const pages = [];
    const showEllipsis = totalPages > 7;

    if (showEllipsis) {
      if (currentPage <= 4) {
        // Show first 5 pages + ellipsis + last page
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        // Show first page + ellipsis + last 5 pages
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show first page + ellipsis + current-1, current, current+1 + ellipsis + last page
        pages.push(1);
        pages.push("...");
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push("...");
        pages.push(totalPages);
      }
    } else {
      // Show all pages if total is 7 or less
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  return (
    <div className="flex justify-center items-center py-4 select-none">
      <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl shadow transition-all duration-300 hover:shadow-md sm:gap-2 sm:p-1.5">
        {/* Jump to First */}
        <button
          className="hidden sm:flex items-center justify-center w-9 h-9 rounded-lg bg-transparent text-gray-400 border border-transparent cursor-pointer transition-all duration-200 hover:bg-gray-100 hover:text-gray-600 disabled:text-gray-300 disabled:cursor-not-allowed disabled:hover:bg-transparent active:scale-95 sm:w-8 sm:h-8"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          title="First page"
        >
          <ChevronsLeft size={16} />
        </button>

        {/* Previous */}
        <button
          className="flex items-center justify-center w-9 h-9 rounded-lg bg-transparent text-gray-500 border border-transparent cursor-pointer transition-all duration-200 hover:bg-gray-100 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed disabled:hover:bg-transparent active:scale-95 sm:w-8 sm:h-8"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          title="Previous page"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1 mx-1">
          {renderPageNumbers().map((page, index) =>
            page === "..." ? (
              <span
                key={`ellipsis-${index}`}
                className="flex items-center justify-center w-9 h-9 text-gray-500 text-xs tracking-wider sm:w-8 sm:h-8"
              >
                •••
              </span>
            ) : (
              <button
                key={page}
                className={`min-w-[34px] h-7 rounded-lg border-none text-xs font-medium cursor-pointer transition-all duration-200 
                ${
                  currentPage === page
                    ? "bg-[#01dbc8] text-white font-semibold hover:bg-[#00c4b3]"
                    : "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
                onClick={() => onPageChange(page)}
                disabled={currentPage === page}
              >
                {page}
              </button>
            )
          )}
        </div>

        {/* Next */}
        <button
          className="flex items-center justify-center w-9 h-9 rounded-lg bg-transparent text-gray-500 border border-transparent cursor-pointer transition-all duration-200 hover:bg-gray-100 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed disabled:hover:bg-transparent active:scale-95 sm:w-8 sm:h-8"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          title="Next page"
        >
          <ChevronRight size={16} />
        </button>

        {/* Jump to Last */}
        <button
          className="hidden sm:flex items-center justify-center w-9 h-9 rounded-lg bg-transparent text-gray-400 border border-transparent cursor-pointer transition-all duration-200 hover:bg-gray-100 hover:text-gray-600 disabled:text-gray-300 disabled:cursor-not-allowed disabled:hover:bg-transparent active:scale-95 sm:w-8 sm:h-8"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          title="Last page"
        >
          <ChevronsRight size={16} />
        </button>
      </div>
    </div>
  );
}
