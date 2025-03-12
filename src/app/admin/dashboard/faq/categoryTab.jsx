// components/faq/CategoryTab.jsx
import React from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import Pagination from "@/components/ListPagination";

const CategoryTab = ({
  categories,
  handleEditCategory,
  deleteCategory,
  resetCategoryForm,
  setShowCategoryModal,
  pagination,
  onPageChange,
}) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">FAQ Categories</h2>
        <button
          onClick={() => {
            resetCategoryForm();
            setShowCategoryModal(true);
          }}
          className="flex items-center gap-2 bg-[#0AAC9E] text-white px-4 py-2 rounded-md hover:bg-[#099b8e]"
        >
          <Plus size={16} />
          <span>Add Category</span>
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">
            No categories found. Create your first category.
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {category.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {category.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {category.order}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          category.isActive
                            ? "bg-[#f9f9f9] text-[#0AAC9E]"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {category.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium">
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="text-gray-400 p-2  hover:text-[#0AAC9E] hover:bg-[#f2fdfc] mr-3"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => deleteCategory(category.id)}
                        className="text-gray-400 p-2 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* New Pagination Component */}
            <Pagination
              totalItems={pagination.totalItems}
              currentPage={pagination.currentPage}
              onPageChange={onPageChange}
              itemsPerPage={pagination.pageSize}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default CategoryTab;
