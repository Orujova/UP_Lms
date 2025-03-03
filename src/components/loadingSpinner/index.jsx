"use client";
import React from "react";

const LoadingSpinner = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-t-[#0AAC9E] border-b-[#0AAC9E] rounded-full animate-spin"></div>
        <p className="mt-2 text-gray-600">Loading FAQ data...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
