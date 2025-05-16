"use client";
import React from "react";

const LoadingSpinner = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
      <div className="relative flex flex-col items-center">
        <div className="w-12 h-12 relative">
          <div className="absolute inset-0 border-4 border-[#f9fefe] rounded-full"></div>
          <div className="absolute inset-0 border-4 border-[#0AAC9E] rounded-full animate-spin border-t-transparent"></div>
        </div>
        <div className="mt-4 space-y-1 text-center">
          <h3 className="text-sm font-semibold text-gray-900">Loading...</h3>
          <p className="text-gray-400 text-[10px]">
            Please wait while we fetch your content...
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
