// @/app/admin/dashboard/vacancies/[id]/page.jsx
"use client";

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  DollarSign,
  Users,
  Edit,
  Trash,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  fetchVacancyByIdAsync,
  deleteVacancyAsync,
} from "@/redux/vacancy/vacancy";
import { toast } from "sonner";

// Components
import LoadingSpinner from "@/components/loadingSpinner";
import DeleteConfirmationModal from "@/components/deleteModal";

const VacancyDetail = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { id } = useParams();

  const { currentVacancy, loading, error } = useSelector(
    (state) => state.vacancy
  );

  // Delete modal state
  const [deleteModal, setDeleteModal] = React.useState({
    isOpen: false,
    id: null,
  });

  // Fetch vacancy details on component mount
  useEffect(() => {
    if (id) {
      dispatch(fetchVacancyByIdAsync(parseInt(id)));
    }
  }, [dispatch, id]);

  // Handle toast notifications for errors
  useEffect(() => {
    if (error) {
      toast.error(error || "An error occurred");
    }
  }, [error]);

  // Format date to a readable format
  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";

    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Open delete modal
  const openDeleteModal = () => {
    setDeleteModal({ isOpen: true, id: parseInt(id) });
  };

  // Close delete modal
  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, id: null });
  };

  // Confirm delete
  const confirmDelete = async () => {
    try {
      await dispatch(deleteVacancyAsync(deleteModal.id)).unwrap();
      toast.success("Vacancy deleted successfully!");
      closeDeleteModal();
      router.push("/admin/dashboard/vacancies");
    } catch (err) {
      toast.error(err.message || "Error deleting vacancy");
    }
  };

  if (loading || !currentVacancy) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pt-14 px-4 sm:px-6 lg:px-8 pb-10">
      <div className="max-w-5xl mx-auto">
        {/* Header with back button */}
        <div className="mb-6">
          <Link href="/admin/dashboard/vacancies">
            <button className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#0AAC9E]">
              <ArrowLeft className="w-4 h-4" />
              Back to Vacancies
            </button>
          </Link>
        </div>

        {/* Vacancy Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {currentVacancy.title}
              </h1>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center text-gray-500">
                  <Briefcase className="w-4 h-4 mr-2 text-gray-400" />
                  <span>
                    {currentVacancy.department?.name ||
                      "Department not specified"}
                  </span>
                </div>

                <div className="flex items-center text-gray-500">
                  <Users className="w-4 h-4 mr-2 text-gray-400" />
                  <span>
                    Line Manager:{" "}
                    {currentVacancy.lineManager
                      ? `${currentVacancy.lineManager.firstName} ${currentVacancy.lineManager.lastName}`
                      : "Not specified"}
                  </span>
                </div>

                <div className="flex items-center text-gray-500">
                  <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                  <span>
                    Salary: {currentVacancy.salaryRange || "Not specified"}
                  </span>
                </div>

                <div className="flex items-center text-gray-500">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  <span>
                    Last submission date:{" "}
                    {formatDate(currentVacancy.lastSubmissionDate)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Link
                href={`/admin/dashboard/vacancies/edit/${currentVacancy.id}`}
              >
                <button className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-[#0AAC9E] rounded-lg hover:bg-[#127D74]">
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
              </Link>

              <button
                onClick={openDeleteModal}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-red-500 rounded-lg hover:bg-red-600"
              >
                <Trash className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Job Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Job Details</h2>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Job Description
              </h3>
              <div className="text-sm text-gray-600 prose max-w-none">
                {currentVacancy.jobDescription ||
                  "No job description provided."}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Responsibilities
              </h3>
              <div className="text-sm text-gray-600 prose max-w-none">
                {currentVacancy.jobResponsibilities ||
                  "No responsibilities listed."}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Requirements
              </h3>
              <div className="text-sm text-gray-600 prose max-w-none">
                {currentVacancy.jobRequirements || "No requirements specified."}
              </div>
            </div>
          </div>
        </div>

        {/* Application Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              Application Status
            </h2>
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <span className="text-sm font-medium text-gray-900">
                  Vacancy is active and accepting applications
                </span>
              </div>

              <Link
                href={
                  "/admin/dashboard/vacancies/applications/" + currentVacancy.id
                }
              >
                <button className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                  View Applications
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        item="vacancy"
      />
    </div>
  );
};

export default VacancyDetail;
