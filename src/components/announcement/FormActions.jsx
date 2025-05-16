"use client";

import React from "react";

const FormActions = ({
  isSubmitting,
  onCancel,
  submitButtonText = "Create Announcement",
  loadingText = "Creating...",
}) => {
  return (
    <div className="flex justify-end gap-4">
      <button
        type="button"
        onClick={onCancel}
        disabled={isSubmitting}
        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
      >
        Cancel
      </button>

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-[#0AAC9E] text-white text-sm rounded-lg px-5 py-2 font-medium transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isSubmitting && (
          <svg
            className="animate-spin mr-2 h-4 w-4 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {isSubmitting ? loadingText : submitButtonText}
      </button>
    </div>
  );
};

export default FormActions;
