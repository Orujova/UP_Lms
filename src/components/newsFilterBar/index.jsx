"use client";
import { Download, Filter, Layers } from "lucide-react";
const NewsFilterBar = ({
  filters,
  onFilterChange,
  categoryOptions = [],
  onExport,
}) => (
  <div className="bg-white rounded-lg p-5 mb-6 shadow-sm">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative">
          <select
            value={filters.interestLevel || ""}
            onChange={(e) => onFilterChange("interestLevel", e.target.value)}
            className="border rounded-lg pl-9 pr-3 py-2 text-sm outline-0 focus:ring-0 focus:border-[#01DBC8] cursor-pointer min-w-[180px]"
          >
            <option value="">All Interest Levels</option>
            <option value="Low">Low</option>
            <option value="Normal">Normal</option>
            <option value="High">High</option>
          </select>
          <Filter className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
        </div>

        {categoryOptions.length > 0 && (
          <div className="relative">
            <select
              value={filters.newsCategory || ""}
              onChange={(e) => onFilterChange("newsCategory", e.target.value)}
              className="border rounded-lg pl-9 pr-3 py-2 text-sm outline-0 focus:ring-0 focus:border-[#01DBC8] cursor-pointer min-w-[180px]"
            >
              <option value="">All Categories</option>
              {categoryOptions.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <Layers className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          </div>
        )}
      </div>
      <button
        onClick={onExport}
        className="flex items-center gap-2 bg-[#f9fefe] text-[#127D74] px-4 py-2 rounded-lg hover:bg-[#f2fdfc] transition-colors"
      >
        <Download className="w-4 h-4" />
        Export
      </button>
    </div>
  </div>
);

export default NewsFilterBar;
