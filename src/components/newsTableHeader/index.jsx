"use client";

import { ArrowUpDown } from "lucide-react";

const TableHeader = ({ onSort, currentSort }) => {
  const handleSort = (field) => {
    let newOrder;

    switch (field) {
      case "title":
        newOrder = currentSort === "titleasc" ? "titledesc" : "titleasc";
        break;
      case "view":
        newOrder = currentSort === "viewasc" ? "viewdesc" : "viewasc";
        break;
      case "date":
        newOrder = currentSort === "dateasc" ? "datedesc" : "dateasc";
        break;
      default:
        newOrder = `${field}asc`;
    }

    onSort(newOrder);
  };

  const getSortIcon = (field) => {
    const isActive = currentSort?.toLowerCase().startsWith(field);
    const isAsc = currentSort?.toLowerCase().endsWith("asc");

    return (
      <ArrowUpDown
        className={`w-4 h-3 ${isActive ? "text-[#0AAC9E]" : "text-gray-400"} ${
          isActive && isAsc ? "transform rotate-180" : ""
        }`}
      />
    );
  };

  return (
    <div className="grid grid-cols-12 gap-6 px-6 py-4  bg-gray-50 border-b border-gray-200">
      <div
        className="col-span-4 flex items-center  gap-2 cursor-pointer hover:text-[#0AAC9E]"
        onClick={() => handleSort("title")}
      >
        <span className="text-xs font-medium  text-gray-600">Title</span>
        {getSortIcon("title")}
      </div>
      <div className="col-span-2 flex items-center justify-center gap-2">
        <span className="text-xs font-medium text-gray-600">Category</span>
      </div>
      <div
        className="col-span-2 flex items-center gap-2 cursor-pointer hover:text-[#0AAC9E]"
        onClick={() => handleSort("date")}
      >
        <span className="text-xs font-medium text-gray-600">Date</span>
        {getSortIcon("date")}
      </div>
      <div className="col-span-2 flex items-center gap-2">
        <span className="text-xs font-medium text-gray-600">ID</span>
      </div>
      <div
        className="col-span-1 flex items-center gap-2 cursor-pointer hover:text-[#0AAC9E]"
        onClick={() => handleSort("view")}
      >
        <span className="text-xs font-medium text-gray-600">Views</span>
        {getSortIcon("view")}
      </div>
      <div className="col-span-1 flex justify-end">
        <span className="text-xs font-medium text-gray-600">Actions</span>
      </div>
    </div>
  );
};

export default TableHeader;
