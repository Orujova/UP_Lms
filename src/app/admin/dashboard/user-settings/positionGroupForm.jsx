"use client";
import React from "react";
import { Building2, Save, RefreshCw, ArrowLeft, Loader2 } from "lucide-react";

const PositionGroupForm = ({
  name,
  setName,
  isLoading,
  isEditing,
  positionGroupId,
  handleSubmit,
  resetForm,
  setActiveTab,
}) => {
  // Form submission
  const onSubmit = (e) => {
    e.preventDefault();

    if (!name) {
      return alert("Please enter a position group name");
    }

    const positionGroupData = {
      name: name,
    };

    // Add id for editing
    if (isEditing && positionGroupId) {
      positionGroupData.id = positionGroupId;
    }

    handleSubmit(positionGroupData);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center text-gray-700 mb-4">
          <Building2 size={16} className="mr-2" />
          <h2 className="text-base font-medium">Position Group Information</h2>
        </div>

        <div className="mb-4">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-500 mb-1"
          >
            Position Group Name
          </label>
          <div className="relative">
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-0 focus:border-[#01DBC8]"
              placeholder="Enter position group name"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Building2 size={16} className="text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={() => {
            resetForm();
            setActiveTab("list");
          }}
          className="px-4 py-2 flex items-center text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to List
        </button>

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={resetForm}
            className="px-4 py-1 flex items-center text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
            disabled={isLoading}
          >
            <RefreshCw size={14} className="mr-2" />
            Reset
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-1 text-sm flex items-center text-white rounded-md focus:outline-none focus:ring-2 transition-colors disabled:opacity-70 bg-[#0AAC9E]"
          >
            {isLoading ? (
              <>
                <Loader2 size={14} className="animate-spin mr-2" />
                {isEditing ? "Updating..." : "Saving..."}
              </>
            ) : (
              <>
                <Save size={14} className="mr-2" />
                {isEditing ? "Update Position Group" : "Save Position Group"}
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default PositionGroupForm;
