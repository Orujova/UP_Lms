"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  PageHeader,
  SectionHeader,
  Card,
  Button,
  StatusBadge,
  PolicyCard,
  LoadingSpinner,
  EmptyState,
  ErrorAlert,
  SuccessAlert,
  Pagination,
  ConfirmDialog,
  API_URL,
  useAppNavigation,
} from "./components";
import { FileCheck, Plus, Eye, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function PrivacyPolicyList() {
  const router = useRouter();
  const nav = useAppNavigation();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    policyId: null,
  });

  // Parse description from JSON if needed
  const parseDescription = (description) => {
    if (!description) return "";

    try {
      // Check if the description is a JSON string
      if (
        typeof description === "string" &&
        (description.startsWith("{") || description.startsWith("["))
      ) {
        const parsedDesc = JSON.parse(description);

        // Handle the specific format in your database
        if (parsedDesc.sections) {
          return (
            parsedDesc.sections
              .split("\n")
              .slice(0, 5)
              .join(" ")
              .substring(0, 5000) + "..."
          );
        }

        return typeof parsedDesc === "string"
          ? parsedDesc
          : JSON.stringify(parsedDesc);
      }

      return description;
    } catch (e) {
      console.error("Error parsing description:", e);
      return description; // Return original if parsing fails
    }
  };

  // Fetch policies from API
  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}Policy?Page=${page}&ShowMore.Take=${perPage}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch policies");
      }

      const data = await response.json();

      // Process each policy to handle description properly
      const processedPolicies = (data[0].policies || []).map((policy) => ({
        ...policy,
        parsedDescription: parseDescription(policy.description),
      }));

      setPolicies(processedPolicies);
      setTotalItems(data[0].totalPolicyCount || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete policy
  const handleDeletePolicy = async (id) => {
    try {
      const response = await fetch(`${API_URL}Policy`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete policy");
      }

      setSuccess("Policy successfully deleted");
      toast.success("Policy successfully deleted");
      fetchPolicies();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleteDialog({ open: false, policyId: null });
    }
  };

  // Confirm delete dialog
  const openDeleteDialog = (id) => {
    setDeleteDialog({ open: true, policyId: id });
  };

  // Navigation handlers
  const handleCreateNew = () => {
    nav.toCreatePrivacyPolicy();
  };

  // Load policies on mount and when pagination changes
  useEffect(() => {
    fetchPolicies();
  }, [page, perPage]);

  // Clear alerts after 5 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  return (
    <main className="min-h-screen bg-gray-50/50 pt-10">
      <PageHeader
        title="Privacy Policy Manager"
        subtitle="Manage your organization's privacy policies and terms of service"
        actions={
          <Button
            variant="primary"
            onClick={handleCreateNew}
            icon={<Plus size={16} />}
          >
            Create New Policy
          </Button>
        }
      />

      <div className="container mx-auto ">
        {error && (
          <ErrorAlert message={error} onDismiss={() => setError(null)} />
        )}
        {success && (
          <SuccessAlert message={success} onDismiss={() => setSuccess(null)} />
        )}

        <Card>
          <SectionHeader
            title="All Privacy Policies"
            icon={<FileCheck className="text-[#0AAC9E]" size={16} />}
          />

          {loading ? (
            <LoadingSpinner />
          ) : policies.length === 0 ? (
            <EmptyState
              message="No privacy policies found"
              icon={<FileCheck className="w-16 h-16 text-gray-300" />}
              action={
                <Button
                  variant="primary"
                  onClick={handleCreateNew}
                  icon={<Plus size={16} />}
                >
                  Create Your First Policy
                </Button>
              }
            />
          ) : (
            <div>
              {policies.map((policy) => (
                <div
                  key={policy.id}
                  className="p-5 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex justify-between flex-wrap gap-4">
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center mb-2">
                        <h3 className="text-sm mr-3 font-medium text-gray-900 truncate">
                          {policy.title}
                        </h3>
                        <StatusBadge
                          active={policy.isActive}
                          className="ml-3"
                        />
                      </div>
                      <p className="text-gray-500 text-xs line-clamp-2 mb-2">
                        {policy.parsedDescription}
                      </p>
                      <div className="flex items-center text-xs text-gray-400">
                        <span>
                          Last updated:{" "}
                          {new Date(
                            policy.updatedAt || Date.now()
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex ">
                      <Link
                        href={`/admin/dashboard/privacy-policy/${policy.id}`}
                        className="text-gray-400  hover:text-[#0AAC9E]  rounded-lg transition-all  text-sm px-1 font-medium flex items-center"
                      >
                        <Eye size={16} className="mr-2" />
                      </Link>
                      <Link
                        href={`/admin/dashboard/privacy-policy/edit/${policy.id}`}
                        className="text-gray-400  hover:text-[#0AAC9E]  rounded-lg transition-all  text-sm px-1 font-medium flex items-center"
                      >
                        <Edit size={16} className="mr-2" />
                      </Link>
                      <button
                        onClick={() => openDeleteDialog(policy.id)}
                        className="text-gray-400 hover:text-red-600  rounded-lg transition-all px-1   text-sm font-medium flex items-center"
                      >
                        <Trash2 size={16} className="mr-2" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && policies.length > 0 && (
            <Pagination
              totalItems={totalItems}
              currentPage={page}
              onPageChange={setPage}
              itemsPerPage={perPage}
            />
          )}
        </Card>
      </div>

      <ConfirmDialog
        isOpen={deleteDialog.open}
        title="Delete Policy"
        message="Are you sure you want to delete this policy? This action cannot be undone."
        onConfirm={() => handleDeletePolicy(deleteDialog.policyId)}
        onCancel={() => setDeleteDialog({ open: false, policyId: null })}
      />
    </main>
  );
}
