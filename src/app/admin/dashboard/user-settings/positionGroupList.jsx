"use client";
import React from "react";
import { Search, Loader2, Pencil, Trash2, Plus } from "lucide-react";
import Pagination from "./pagination";

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
  const filteredPositionGroups = positionGroups.filter(
    (group) =>
      group.name && group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="mb-4 flex flex-wrap justify-between items-center gap-2">
        <div className="relative">
          <input
            type="text"
            placeholder="Search position groups..."
            className="w-96 pl-10 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#01DBC8]/20 focus:border-[#01DBC8]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
        </div>

        <button
          onClick={handleAddNew}
          className="px-3 py-2 rounded-md text-white text-sm flex items-center bg-[#0AAC9E]"
        >
          <Plus size={15} className="mr-1" />
          Add New Position Group
        </button>
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan="3" className="px-6 py-4 text-center">
                  <Loader2
                    size={24}
                    className="animate-spin mx-auto"
                    style={{ color: "#0AAC9E" }}
                  />
                </td>
              </tr>
            ) : filteredPositionGroups.length === 0 ? (
              <tr>
                <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                  No position groups found
                </td>
              </tr>
            ) : (
              filteredPositionGroups.map((group) => (
                <tr key={group.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                    {group.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-gray-700">
                    {group.name || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium">
                    <button
                      onClick={() => handleEditPositionGroup(group)}
                      className="text-gray-400 p-2 hover:text-[#0AAC9E] hover:bg-[#f2fdfc] rounded-lg transition-all mr-3"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(group.id)}
                      className="text-gray-400 p-2 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <Pagination
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          totalItems={totalPositionGroups}
        />
      </div>
    </div>
  );
};

export default PositionGroupList;
