// src/components/event/TargetGroupSelector.jsx
import React from "react";
import { Search, X } from "lucide-react";

const TargetGroupSelector = ({
  searchValue,
  targetGroups,
  showDropdown,
  handleSearchChange,
  handleToggleDropdown,
  handleSelect,
  selectedId,
  targetGroupRef,
  clearSelection,
}) => {
  return (
    <div
      className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-100"
      ref={targetGroupRef}
    >
      <h2 className="text-base font-medium text-gray-900 mb-4">Target Group</h2>
      <div className="relative">
        <input
          type="text"
          placeholder="Search target groups..."
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          onClick={() => handleToggleDropdown(true)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-[#01DBC8]"
        />
        <Search className="absolute right-3 top-2.5 text-gray-400" size={18} />

        {showDropdown && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
            {targetGroups
              .filter((group) =>
                group.name.toLowerCase().includes(searchValue.toLowerCase())
              )
              .map((group) => (
                <div
                  key={group.id}
                  className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleSelect(group)}
                >
                  <div className="font-medium">{group.name}</div>
                  <div className="text-xs text-gray-400 flex gap-2 mt-1">
                    <span className="flex items-center gap-1">
                      <span className="inline-block w-4 h-4 bg-gray-200 rounded-full text-center text-xs leading-4">
                        U
                      </span>
                      {group.userCount} Users
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="inline-block w-4 h-4 bg-gray-200 rounded-full text-center text-xs leading-4">
                        F
                      </span>
                      {group.filterGroupCount} Filters
                    </span>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
      {selectedId && (
        <div className="mt-2 bg-[#f9fefe] text-[#127D74] px-3 py-2 rounded-lg flex justify-between items-center">
          <span>Selected Target Group ID: {selectedId}</span>
          <button
            type="button"
            onClick={clearSelection}
            className="text-[#127D74] hover:text-[#1B4E4A]"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default TargetGroupSelector;
