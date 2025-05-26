"use client";
import React from "react";
import Link from "next/link";
import { Calendar, Briefcase, Users, DollarSign, Edit } from "lucide-react";

const VacancyCard = ({ vacancy }) => {
  // Format date to a readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Check if submission date is in the past
  const isSubmissionClosed = () => {
    if (!vacancy.lastSubmissionDate) return false;

    const submissionDate = new Date(vacancy.lastSubmissionDate);
    const today = new Date();

    return submissionDate < today;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            {vacancy.title}
          </h3>
          <span
            className={`px-3 py-1 text-xs font-medium rounded-full ${
              isSubmissionClosed()
                ? "bg-red-50 text-red-600"
                : "bg-green-50 text-green-600"
            }`}
          >
            {isSubmissionClosed() ? "Closed" : "Active"}
          </span>
        </div>

        <div className="flex flex-col space-y-3 mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <Briefcase className="w-4 h-4 mr-2 text-gray-400" />
            <span>
              {vacancy.department?.name || "Department not specified"}
            </span>
          </div>

          <div className="flex items-center text-sm text-gray-500">
            <Users className="w-4 h-4 mr-2 text-gray-400" />
            <span>
              Line Manager:{" "}
              {vacancy.lineManager
                ? `${vacancy.lineManager.firstName} ${vacancy.lineManager.lastName}`
                : "Not specified"}
            </span>
          </div>

          <div className="flex items-center text-sm text-gray-500">
            <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
            <span>Salary: {vacancy.salaryRange || "Not specified"}</span>
          </div>

          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
            <span>
              Last submission date: {formatDate(vacancy.lastSubmissionDate)}
            </span>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Link href={`/admin/dashboard/vacancies/edit/${vacancy.id}`}>
            <button className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Edit className="w-4 h-4" />
              <span className="sr-only">Edit</span>
            </button>
          </Link>
          <Link href={`/admin/dashboard/vacancies/${vacancy.id}`}>
            <button className="px-4 py-2 text-xs font-medium text-white bg-[#0AAC9E] rounded-lg hover:bg-[#127D74] transition-colors">
              View Details
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VacancyCard;
