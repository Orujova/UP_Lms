// components/faq/CategoryModal.jsx
import React from "react";
import { X } from "lucide-react";

const CategoryModal = ({
  categoryFormData,
  setCategoryFormData,
  isEditingCategory,
  createCategory,
  updateCategory,
  setShowCategoryModal,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h3 className="text-lg font-medium">
            {isEditingCategory ? "Edit Category" : "Add New Category"}
          </h3>
          <button
            onClick={() => setShowCategoryModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category Name
            </label>
            <input
              type="text"
              value={categoryFormData.name}
              onChange={(e) =>
                setCategoryFormData({
                  ...categoryFormData,
                  name: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#01DBC8] focus:border-[#01DBC8]"
              placeholder="Enter category name"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Order
            </label>
            <input
              type="number"
              value={categoryFormData.order}
              onChange={(e) =>
                setCategoryFormData({
                  ...categoryFormData,
                  order: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#01DBC8] focus:border-[#01DBC8]"
              placeholder="Enter display order"
              min="0"
            />
          </div>

          {isEditingCategory && (
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={categoryFormData.isActive}
                  onChange={(e) =>
                    setCategoryFormData({
                      ...categoryFormData,
                      isActive: e.target.checked,
                    })
                  }
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Active</span>
              </label>
            </div>
          )}

          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={() => setShowCategoryModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={isEditingCategory ? updateCategory : createCategory}
              className="px-4 py-2 text-sm font-medium text-white bg-[#0AAC9E] rounded-md hover:bg-[#099b8e]"
              disabled={!categoryFormData.name}
            >
              {isEditingCategory ? "Update" : "Create"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryModal;
