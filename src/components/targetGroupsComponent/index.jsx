"use client";
import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  Users,
  Search,
  Filter,
  Phone,
  Building2,
  ChevronLeft,
  ChevronRight,
  Edit,
  Plus,
} from "lucide-react";
import { useRouter } from "next/navigation";

// User Card Component
const UserCard = ({ user }) => (
  <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200">
    <div className="flex items-start gap-3">
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-800 truncate text-sm mb-2">
          {user.firstName} {user.lastName}
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between  text-xs text-gray-600">
            <div className="flex items-center">
              <Phone className="w-4 h-3 mr-2 flex-shrink-0" />
              <span className="truncate text-[0.7rem] ">
                {user.phoneNumber || "N/A"}
              </span>
            </div>
            <div className="flex items-center">
              <Building2 className="w-4 h-3 mr-2 flex-shrink-0" />
              <span className="truncate text-[0.7rem]">
                {user.departmentName || "N/A"}
              </span>
            </div>
          </div>

          <div className="mt-2">
            <span className="inline-block px-3 py-2 text-[0.6rem] font-medium text-[#0AAC9E] bg-[#f9f9f9] rounded-full text-center">
              {user.positionName || "N/A"}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Users Grid with Pagination
const UsersGrid = ({ users = [] }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 8;
  const totalPages = Math.ceil(users.length / usersPerPage);

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const PaginationButton = ({ onClick, disabled, children }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center w-5 h-5 rounded-md 
        ${
          disabled
            ? "text-gray-300 cursor-not-allowed"
            : "text-gray-700 hover:bg-gray-100"
        }`}
    >
      {children}
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {currentUsers.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-2">
          <PaginationButton
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-3" />
          </PaginationButton>

          <div className="flex items-center gap-1">
            {[...Array(totalPages)].map((_, idx) => (
              <button
                key={idx + 1}
                onClick={() => paginate(idx + 1)}
                className={`w-5 h-5 rounded-md text-sm font-medium transition-colors
                  ${
                    currentPage === idx + 1
                      ? "bg-[#ecfcfb] text-[#0AAC9E]"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          <PaginationButton
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="w-4 h-3" />
          </PaginationButton>
        </div>
      )}
    </div>
  );
};

// Main Target Groups Component
export default function TargetGroupsComponent({ data = [] }) {
  const router = useRouter();
  const [expandedGroup, setExpandedGroup] = useState(null);
  const [userDetails, setUserDetails] = useState({});
  const [loading, setLoading] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState(data);

  useEffect(() => {
    setFilteredData(
      data.filter((group) =>
        group.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, data]);

  const handleToggle = async (groupId) => {
    if (expandedGroup === groupId) {
      setExpandedGroup(null);
    } else {
      setExpandedGroup(groupId);
      if (!userDetails[groupId]) {
        await fetchUserDetails(groupId);
      }
    }
  };

  const fetchUserDetails = async (groupId) => {
    setLoading((prev) => ({ ...prev, [groupId]: true }));
    try {
      const response = await fetch(
        `https://bravoadmin.uplms.org/api/TargetGroup/GetFilteredUsersByTargetGroupId?Page=1&TargetGroupId=${groupId}`,
        {
          method: "GET",
          headers: { accept: "*/*" },
        }
      );

      if (!response.ok)
        throw new Error(`Failed to fetch data. Status: ${response.status}`);
      const data = await response.json();
      setUserDetails((prev) => ({
        ...prev,
        [groupId]: data?.[0]?.appUsers || [],
      }));
    } catch (error) {
      console.error(
        `Failed to fetch user details for group ${groupId}:`,
        error
      );
      setUserDetails((prev) => ({
        ...prev,
        [groupId]: { error: true },
      }));
    } finally {
      setLoading((prev) => ({ ...prev, [groupId]: false }));
    }
  };

  const handleEdit = (groupId) => {
    router.push(`/admin/dashboard/targets/edit/${groupId}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-bold text-gray-900">Target Groups</h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search groups..."
                className="w-full pl-10 pr-7 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-[#01DBC8]/20 focus:border-[#01DBC8]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 text-xs font-medium text-gray-500">
        <div className="col-span-5">Group Name</div>
        <div className="col-span-4">Members</div>
        <div className="col-span-3 flex justify-end">Actions</div>
      </div>

      {/* Groups List */}
      <div className="divide-y divide-gray-200">
        {filteredData.length > 0 ? (
          filteredData.map((group) => (
            <div key={group.id || group.name}>
              <div className="grid grid-cols-12 gap-4 px-6 py-3 hover:bg-gray-50 transition-colors">
                <div className="col-span-5 font-medium text-gray-900 text-sm">
                  {group.name || "Unnamed Group"}
                </div>
                <div className="col-span-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-[#ecfcfb] rounded">
                      <Users className="w-4 h-3 text-[#0AAC9E]" />
                    </div>
                    <span className="text-xs text-gray-600">
                      {group.userCount || 0} members
                    </span>
                  </div>
                </div>
                <div className="col-span-3 flex justify-end gap-2">
                  <button
                    onClick={() => handleEdit(group.id)}
                    className="p-2 rounded-md hover:bg-[#ecfcfb] text-[#0AAC9E] transition-colors"
                    title="Edit Group"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleToggle(group.id)}
                    className={`p-2 rounded-md hover:bg-gray-100 transition-colors
                      ${expandedGroup === group.id ? "bg-gray-100" : ""}`}
                    title="View Members"
                  >
                    <ChevronDown
                      className={`w-5 h-5 text-gray-500 transition-transform duration-200
                        ${
                          expandedGroup === group.id
                            ? "transform rotate-180"
                            : ""
                        }`}
                    />
                  </button>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedGroup === group.id && (
                <div className="px-6 py-4 bg-gray-50">
                  {loading[group.id] ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
                    </div>
                  ) : userDetails[group.id]?.error ? (
                    <div className="text-center text-red-500 py-8">
                      Failed to load users. Please try again later.
                    </div>
                  ) : (
                    <UsersGrid users={userDetails[group.id] || []} />
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-8">
            No target groups found
          </div>
        )}
      </div>
    </div>
  );
}
