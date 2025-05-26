"use client";
import React, { useRef, useEffect } from "react";
import { Building2, Save, RefreshCw, X, Loader2 } from "lucide-react";

const PositionGroupFormModal = ({
  isOpen,
  onClose,
  name,
  setName,
  isLoading,
  isEditing,
  positionGroupId,
  handleSubmit,
  resetForm,
}) => {
  const modalRef = useRef(null);
  const inputRef = useRef(null);

  // Close modal if clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        if (!isLoading) {
          // Prevent closing while loading
          onClose();
        }
      }
    }

    function handleEscapeKey(event) {
      if (event.key === "Escape" && !isLoading) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscapeKey);

      // Focus the input field when modal opens
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen, onClose, isLoading]);

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

  if (!isOpen) return null;

  return (
    // Modal backdrop with fixed positioning
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      {/* Modal content */}
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden flex flex-col"
        style={{ maxHeight: "calc(100vh - 2rem)" }}
      >
        {/* Modal header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Building2 size={18} className="mr-2 text-[#0AAC9E]" />
            {isEditing ? "Edit Position Group" : "Add New Position Group"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
            disabled={isLoading}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal body with improved layout */}
        <div className="p-6 overflow-y-auto">
          <form onSubmit={onSubmit}>
            <div className="mb-6">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Position Group Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 size={18} className="text-gray-400" />
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#01DBC8] focus:border-[#01DBC8]"
                  placeholder="Enter position group name"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Modal footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
          <button
            type="button"
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 flex items-center text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none transition-colors"
              disabled={isLoading}
            >
              <RefreshCw size={14} className="mr-2" />
              Reset
            </button>

            <button
              onClick={onSubmit}
              disabled={isLoading}
              className="px-4 py-2 text-sm flex items-center text-white rounded-md focus:outline-none transition-colors disabled:opacity-70 bg-[#0AAC9E] hover:bg-[#088F83]"
            >
              {isLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin mr-2" />
                  {isEditing ? "Updating..." : "Saving..."}
                </>
              ) : (
                <>
                  <Save size={14} className="mr-2" />
                  {isEditing ? "Update Group" : "Save Group"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PositionGroupFormModal;
