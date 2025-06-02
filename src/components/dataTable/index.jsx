"use client";
import React from "react";
import { 
  ExternalLink, 
  Eye, 
  ThumbsUp, 
  Bookmark, 
  User, 
  Calendar, 
  Layers
} from "lucide-react";

// Loading Component
const TableLoading = ({ message }) => (
  <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100">
    <div className="flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mr-3"></div>
      <span className="text-gray-500 text-sm">{message}</span>
    </div>
  </div>
);

// Empty Component
const TableEmpty = ({ icon: Icon, title, message }) => (
  <div className="bg-white rounded-xl p-16 shadow-sm border border-gray-100">
    <div className="text-center">
      <Icon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <h3 className="text-base font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  </div>
);

// Simple Pagination Component - Announcement page tarzında
const SimplePagination = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage = 10 }) => {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
      <div className="text-xs text-gray-500">
        Showing {startItem} to {endItem} of {totalItems} entries
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        
        <span className="text-xs text-gray-600 px-2">
          Page {currentPage} of {totalPages}
        </span>
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
};

// Interest Level Badge Component
const InterestBadge = ({ level }) => {
  const config = {
    High: { bg: 'bg-green-100', text: 'text-green-700' },
    Normal: { bg: 'bg-orange-100', text: 'text-orange-700' },
    Low: { bg: 'bg-red-100', text: 'text-red-700' }
  };
  
  const { bg, text } = config[level] || { bg: 'bg-gray-100', text: 'text-gray-700' };
  
  return (
    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
      {level || "Unknown"}
    </span>
  );
};

// Views Table Component
export const ViewsTable = ({ 
  data, 
  loading = false, 
  onRowClick, 
  currentPage = 1, 
  totalPages = 1, 
  onPageChange,
  totalItems = 0
}) => {
  if (loading) return <TableLoading message="Loading views data..." />;
  if (!data || data.length === 0) {
    return <TableEmpty icon={Eye} title="No Views Data" message="No views data found with current filters." />;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Table Header */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">Detailed Analytics</h3>
          <div className="text-xs text-gray-500">
            Showing {Math.min(currentPage * 10, totalItems)} of {totalItems} entries
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left font-medium text-gray-600 py-3 px-4 text-xs">ID</th>
              <th className="text-left font-medium text-gray-600 py-3 px-4 text-xs">Title</th>
              <th className="text-left font-medium text-gray-600 py-3 px-4 text-xs">Created By</th>
              <th className="text-center font-medium text-gray-600 py-3 px-4 text-xs">Total View</th>
              <th className="text-center font-medium text-gray-600 py-3 px-4 text-xs">Unique View</th>
              <th className="text-center font-medium text-gray-600 py-3 px-4 text-xs">Target Group</th>
              <th className="text-center font-medium text-gray-600 py-3 px-4 text-xs">View %</th>
              <th className="text-center font-medium text-gray-600 py-3 px-4 text-xs">Interest Level</th>
              <th className="text-center font-medium text-gray-600 py-3 px-4 text-xs">Created Date</th>
              <th className="text-center font-medium text-gray-600 py-3 px-4 text-xs">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr
                key={item.id}
                className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onRowClick && onRowClick(item.id)}
              >
                <td className="py-3 px-4 text-xs text-gray-900">{item.id}</td>
                <td className="py-3 px-4 text-xs font-medium text-gray-900">
                  <div className="max-w-xs truncate">
                    {item.title || `News #${item.id}`}
                  </div>
                </td>
                <td className="py-3 px-4 text-xs text-gray-600">
                  <div className="flex items-center">
                    <User className="w-3 h-3 mr-1.5 text-gray-400" />
                    {item.createdBy || "—"}
                  </div>
                </td>
                <td className="py-3 px-4 text-xs text-center text-gray-900">
                  {item.totalView || 0}
                </td>
                <td className="py-3 px-4 text-xs text-center text-gray-900">
                  {item.uniqueView || 0}
                </td>
                <td className="py-3 px-4 text-xs text-center text-gray-900">
                  {item.targetGroupEmployeeCount || 0}
                </td>
                <td className="py-3 px-4 text-xs text-center text-gray-900">
                  {(item.uniqueViewPercentage || 0).toFixed(1)}%
                </td>
                <td className="py-3 px-4 text-xs text-center">
                  <InterestBadge level={item.interestLevel} />
                </td>
                <td className="py-3 px-4 text-xs text-center text-gray-600">
                  {item.createdDate ? new Date(item.createdDate).toLocaleDateString() : "—"}
                </td>
                <td className="py-3 px-4 text-xs text-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRowClick && onRowClick(item.id);
                    }}
                    className="text-teal-600 hover:text-teal-700 transition-colors"
                    title="View Details"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <SimplePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        totalItems={totalItems}
      />
    </div>
  );
};

// Likes Table Component
export const LikesTable = ({ 
  data, 
  loading = false, 
  onRowClick, 
  currentPage = 1, 
  totalPages = 1, 
  onPageChange,
  totalItems = 0
}) => {
  if (loading) return <TableLoading message="Loading likes data..." />;
  if (!data || data.length === 0) {
    return <TableEmpty icon={ThumbsUp} title="No Likes Data" message="No likes data found with current filters." />;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Table Header */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">Detailed Analytics</h3>
          <div className="text-xs text-gray-500">
            Showing {Math.min(currentPage * 10, totalItems)} of {totalItems} entries
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left font-medium text-gray-600 py-3 px-4 text-xs">News ID</th>
              <th className="text-center font-medium text-gray-600 py-3 px-4 text-xs">Total Views</th>
              <th className="text-center font-medium text-gray-600 py-3 px-4 text-xs">Unique Likes</th>
              <th className="text-center font-medium text-gray-600 py-3 px-4 text-xs">Target Group</th>
              <th className="text-center font-medium text-gray-600 py-3 px-4 text-xs">Like Rate %</th>
              <th className="text-center font-medium text-gray-600 py-3 px-4 text-xs">Interest Level</th>
              <th className="text-center font-medium text-gray-600 py-3 px-4 text-xs">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr
                key={item.id}
                className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onRowClick && onRowClick(item.id)}
              >
                <td className="py-3 px-4 text-xs font-medium text-gray-900">
                  News #{item.id}
                </td>
                <td className="py-3 px-4 text-xs text-center text-gray-600">
                  {item.totalView || 0}
                </td>
                <td className="py-3 px-4 text-xs text-center text-gray-900">
                  {item.uniqueLike || 0}
                </td>
                <td className="py-3 px-4 text-xs text-center text-gray-600">
                  {item.targetGroupEmployeeCount || 0}
                </td>
                <td className="py-3 px-4 text-xs text-center text-gray-900">
                  {(item.uniqueLikePercentage || 0).toFixed(1)}%
                </td>
                <td className="py-3 px-4 text-xs text-center">
                  <InterestBadge level={item.interestLevel} />
                </td>
                <td className="py-3 px-4 text-xs text-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRowClick && onRowClick(item.id);
                    }}
                    className="text-teal-600 hover:text-teal-700 transition-colors"
                    title="View Details"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <SimplePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        totalItems={totalItems}
      />
    </div>
  );
};

// Saves Table Component
export const SavesTable = ({ 
  data, 
  loading = false, 
  onRowClick, 
  currentPage = 1, 
  totalPages = 1, 
  onPageChange,
  totalItems = 0
}) => {
  if (loading) return <TableLoading message="Loading saves data..." />;
  if (!data || data.length === 0) {
    return <TableEmpty icon={Bookmark} title="No Saves Data" message="No saves data found with current filters." />;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Table Header */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">Detailed Analytics</h3>
          <div className="text-xs text-gray-500">
            Showing {Math.min(currentPage * 10, totalItems)} of {totalItems} entries
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left font-medium text-gray-600 py-3 px-4 text-xs">News ID</th>
              <th className="text-center font-medium text-gray-600 py-3 px-4 text-xs">Total Views</th>
              <th className="text-center font-medium text-gray-600 py-3 px-4 text-xs">Unique Saves</th>
              <th className="text-center font-medium text-gray-600 py-3 px-4 text-xs">Target Group</th>
              <th className="text-center font-medium text-gray-600 py-3 px-4 text-xs">Save Rate %</th>
              <th className="text-center font-medium text-gray-600 py-3 px-4 text-xs">Interest Level</th>
              <th className="text-center font-medium text-gray-600 py-3 px-4 text-xs">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr
                key={item.id}
                className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onRowClick && onRowClick(item.id)}
              >
                <td className="py-3 px-4 text-xs font-medium text-gray-900">
                  News #{item.id}
                </td>
                <td className="py-3 px-4 text-xs text-center text-gray-600">
                  {item.totalView || 0}
                </td>
                <td className="py-3 px-4 text-xs text-center text-gray-900">
                  {item.uniqueSave || 0}
                </td>
                <td className="py-3 px-4 text-xs text-center text-gray-600">
                  {item.targetGroupEmployeeCount || 0}
                </td>
                <td className="py-3 px-4 text-xs text-center text-gray-900">
                  {(item.uniqueSavePercentage || 0).toFixed(1)}%
                </td>
                <td className="py-3 px-4 text-xs text-center">
                  <InterestBadge level={item.interestLevel} />
                </td>
                <td className="py-3 px-4 text-xs text-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRowClick && onRowClick(item.id);
                    }}
                    className="text-teal-600 hover:text-teal-700 transition-colors"
                    title="View Details"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <SimplePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        totalItems={totalItems}
      />
    </div>
  );
};

// Categories Table Component
export const CategoriesTable = ({ data, loading = false }) => {
  if (loading) return <TableLoading message="Loading categories data..." />;
  if (!data || data.length === 0) {
    return <TableEmpty icon={Layers} title="No Categories Data" message="No categories data found with current filters." />;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Table Header */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Categories Analysis</h3>
            <p className="text-xs text-gray-500 mt-1">News breakdown by categories</p>
          </div>
          <div className="text-xs text-gray-500">
            {data.length} categories
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left font-medium text-gray-600 py-3 px-4 text-xs">Category</th>
              <th className="text-center font-medium text-gray-600 py-3 px-4 text-xs">News Count</th>
              <th className="text-center font-medium text-gray-600 py-3 px-4 text-xs">Total Views</th>
              <th className="text-center font-medium text-gray-600 py-3 px-4 text-xs">Unique Views</th>
              <th className="text-center font-medium text-gray-600 py-3 px-4 text-xs">Percentage</th>
              <th className="text-center font-medium text-gray-600 py-3 px-4 text-xs">Interest Level</th>
            </tr>
          </thead>
          <tbody>
            {data.map((category, index) => (
              <tr 
                key={category.categoryId} 
                className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                }`}
              >
                <td className="py-3 px-4 text-xs font-medium text-gray-900">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-teal-500 rounded-full mr-3"></div>
                    {category.categoryName}
                  </div>
                </td>
                <td className="py-3 px-4 text-xs text-center text-gray-900">
                  {category.totalNewsCount}
                </td>
                <td className="py-3 px-4 text-xs text-center text-gray-900">
                  {category.totalView || 0}
                </td>
                <td className="py-3 px-4 text-xs text-center text-gray-900">
                  {category.uniqueView || 0}
                </td>
                <td className="py-3 px-4 text-xs text-center text-gray-900">
                  {(category.newsCountPercentage || 0).toFixed(1)}%
                </td>
                <td className="py-3 px-4 text-xs text-center">
                  <InterestBadge level={category.interestLevel} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default { ViewsTable, LikesTable, SavesTable, CategoriesTable };