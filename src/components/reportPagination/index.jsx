"use client";
import React from "react";

import {
  ChevronRight,
  ChevronLeft ,
} from "lucide-react";



// Enhanced Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange, disabled, totalItems, itemsPerPage }) => {
  const handlePrevious = () => {
    if (!disabled && currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (!disabled && currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  if (totalPages <= 1) {
    return <div className="h-8"></div>;
  }

  const startItem = ((currentPage - 1) * itemsPerPage) + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex items-center justify-between mt-6 p-4 bg-gray-50 rounded-lg" aria-label="Pagination navigation">
      <div className="text-xs text-gray-600">
        Showing {startItem} to {endItem} of {totalItems} entries
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handlePrevious}
          disabled={disabled || currentPage === 1}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-3 h-3" />
          
        </button>
        
        <span className="px-3 py-1.5 text-xs text-gray-700 bg-white rounded-lg border">
          {currentPage} of {totalPages}
        </span>
        
        <button
          onClick={handleNext}
          disabled={disabled || currentPage === totalPages}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default Pagination