"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
const Pagination = ({ currentPage, totalPages, onPageChange, disabled }) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const showPages = pages.filter((page) => {
    if (page === 1 || page === totalPages) return true;
    if (page >= currentPage - 1 && page <= currentPage + 1) return true;
    return false;
  });

  return (
    <div className="flex items-center justify-between mt-4">
      <div className="text-sm text-gray-500">
        {disabled
          ? "No pages available"
          : `Page ${currentPage} of ${totalPages}`}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={disabled || currentPage === 1}
          className={`p-2 rounded-lg ${
            disabled || currentPage === 1
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-gray-100"
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex gap-1">
          {showPages.map((page, index) => {
            // Add ellipsis
            if (index > 0 && page - showPages[index - 1] > 1) {
              return (
                <span key={`ellipsis-${page}`} className="px-2 py-1">
                  ...
                </span>
              );
            }

            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                disabled={disabled}
                className={`w-8 h-8 flex items-center justify-center rounded-lg
                  ${
                    currentPage === page
                      ? "bg-[#f2fdfc] text-[#0AAC9E]"
                      : "hover:bg-gray-100"
                  }
                  ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {page}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={disabled || currentPage === totalPages}
          className={`p-2 rounded-lg ${
            disabled || currentPage === totalPages
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-gray-100"
          }`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
