"use client";
import React from "react";
import { Search, Loader2, Pencil, Trash2, Plus } from "lucide-react";
import Pagination from "@/components/ListPagination";

const PositionGroupList = ({
  positionGroups,
  isLoading,
  searchTerm,
  setSearchTerm,
  handleAddNew,
  handleEditPositionGroup,
  handleDeleteClick,
  currentPage,
  setCurrentPage,
  itemsPerPage,
  totalPositionGroups,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div className="relative flex-grow max-w-md">
          <input
            type="text"
            placeholder="Search position groups..."
            className="w-full pl-10 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#01DBC8]/20 focus:border-[#01DBC8] transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={14} className="text-gray-400" />
          </div>
        </div>

        <button
          onClick={handleAddNew}
          className="px-3 py-2 rounded-lg text-white text-xs font-medium flex items-center bg-[#0AAC9E] hover:bg-[#09998D] transition-colors shadow-sm"
        >
          <Plus size={14} className="mr-1" />
          Add New Position Group
        </button>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center py-6 bg-white border border-gray-200 rounded-lg">
          <Loader2 size={20} className="animate-spin text-[#0AAC9E]" />
          <span className="ml-2 text-xs text-gray-500">Loading...</span>
        </div>
      ) : positionGroups.length === 0 ? (
        <div className="py-4 text-center text-xs text-gray-500 bg-white border border-gray-200 rounded-lg">
          No position groups found
        </div>
      ) : (
        <>
          {/* Card Layout */}
          <div className="space-y-2 space">
            {positionGroups.map((group) => (
              <div
                key={group.id}
                className="bg-white border border-gray-200 rounded-lg px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gray-100 rounded-full h-8 w-8 flex items-center justify-center text-gray-500 text-xs font-medium">
                      {group.id}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-800">
                        {group.name || "N/A"}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Position Group ID: {group.id}
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleEditPositionGroup(group)}
                      className="p-1.5 rounded text-gray-400 hover:text-[#0AAC9E] hover:bg-gray-100 transition-colors"
                      title="Edit position group"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(group.id)}
                      className="p-1.5 rounded text-gray-400 hover:text-red-500 hover:bg-gray-100 transition-colors"
                      title="Delete position group"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {positionGroups.length > 0 && (
            <div>
              <Pagination
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={totalPositionGroups}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PositionGroupList;
