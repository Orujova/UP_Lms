"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  PageHeader,
  SectionHeader,
  Card,
  Button,
  FormInput,
  Checkbox,
  ErrorAlert,
  SuccessAlert,
  API_URL,
  useAppNavigation,
} from "../../components";
import { Lock, Edit, Save, ArrowLeft, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import LoadingSpinner from "@/components/loadingSpinner";

export default function EditPrivacyPolicy() {
  const params = useParams();
  const id = params.id;

  const nav = useAppNavigation();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    description: "",
    isActive: true,
  });
  const [validationErrors, setValidationErrors] = useState({});
  const isCreateMode = !id;

  const parseDescription = (description) => {
    if (!description) return "";

    try {
      if (
        typeof description === "string" &&
        (description.startsWith("{") || description.startsWith("["))
      ) {
        const parsedDesc = JSON.parse(description);

        if (parsedDesc && parsedDesc.sections) {
          return parsedDesc.sections.replace(/\\n/g, "\n");
        }

        // If it's another kind of JSON object, pretty print it
        return typeof parsedDesc === "string"
          ? parsedDesc
          : JSON.stringify(parsedDesc, null, 2);
      }

      // If it's not JSON or parsing fails, return the original
      return description;
    } catch (e) {
      console.error("Error parsing description:", e);

      if (typeof description === "string" && description.includes("\\n")) {
        return description.replace(/\\n/g, "\n");
      }
      return description;
    }
  };

  // Fetch policy details
  const fetchPolicy = async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}Policy/${id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch policy details");
      }

      const data = await response.json();
      const processedDescription = parseDescription(data.description);

      setFormData({
        id: data.id,
        title: data.title || "",
        description: processedDescription || "",
        isActive: data.isActive !== undefined ? data.isActive : true,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    // Clear validation error when field is edited
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: null,
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = "Title is required";
    }

    if (!formData.description.trim()) {
      errors.description = "Description is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const method = isCreateMode ? "POST" : "PUT";
      const response = await fetch(`${API_URL}Policy`, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to ${isCreateMode ? "create" : "update"} policy`
        );
      }

      setSuccess(`Policy ${isCreateMode ? "created" : "updated"} successfully`);
      toast.success(
        `Policy ${isCreateMode ? "created" : "updated"} successfully`
      );
      // Redirect after short delay to show success message
      setTimeout(() => {
        nav.toPrivacyPolicyList();
      }, 1500);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  // Navigation handlers
  const handleCancel = () => {
    if (isCreateMode) {
      nav.toPrivacyPolicyList();
    } else {
      nav.toPrivacyPolicy(id);
    }
  };

  // Load policy on mount
  useEffect(() => {
    fetchPolicy();
  }, [id]);

  // Clear success message after timeout
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50/50 pt-10">
        <PageHeader
          title={
            isCreateMode ? "Create New Privacy Policy" : "Edit Privacy Policy"
          }
          icon={
            isCreateMode ? (
              <Plus className="text-[#0AAC9E]" size={20} />
            ) : (
              <Edit className="text-[#0AAC9E]" size={20} />
            )
          }
          actions={
            <Link
              href="/admin/dashboard/privacy-policy"
              className="bg-white border border-gray-100 hover:bg-gray-50 text-gray-700 px-4 py-2 shadow-sm rounded-md text-sm font-medium flex items-center"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to List
            </Link>
          }
        />
        <div className="container ">
          <Card>
            <LoadingSpinner />
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50/50 pt-12">
      <PageHeader
        title={
          isCreateMode ? "Create New Privacy Policy" : "Edit Privacy Policy"
        }
        actions={
          <Link
            href="/admin/dashboard/privacy-policy"
            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 shadow-sm rounded-md text-sm font-medium flex items-center"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to List
          </Link>
        }
      />

      <div className="container ">
        {error && (
          <ErrorAlert message={error} onDismiss={() => setError(null)} />
        )}
        {success && (
          <SuccessAlert message={success} onDismiss={() => setSuccess(null)} />
        )}

        <Card>
          <SectionHeader
            title={
              isCreateMode ? "Create New Privacy Policy" : "Edit Privacy Policy"
            }
            icon={
              isCreateMode ? (
                <Plus className="text-[#0AAC9E]" size={18} />
              ) : (
                <Edit className="text-[#0AAC9E]" size={18} />
              )
            }
          />

          <div className="p-6">
            {!isCreateMode && (
              <div className="mb-4 px-4 py-3 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-600">
                <span className="font-medium">Policy ID:</span> {id}
              </div>
            )}

            {isCreateMode && (
              <div className="mb-6 p-4 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 flex items-start">
                <Lock className="mr-2 flex-shrink-0 mt-0.5" size={18} />
                <div>
                  <p className="font-medium mb-1">
                    Privacy Policy Best Practices
                  </p>
                  <ul className="text-sm list-disc pl-4 space-y-1">
                    <li>Be clear and specific about what data you collect</li>
                    <li>Explain how user data is stored and protected</li>
                    <li>
                      Detail how users can access, modify, or delete their data
                    </li>
                    <li>Describe your cookie and tracking policies</li>
                  </ul>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <FormInput
                id="title"
                name="title"
                label="Policy Title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Data Privacy Policy"
                required
                error={validationErrors.title}
              />

              <FormInput
                id="description"
                name="description"
                type="textarea"
                label="Policy Content"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter your policy details here..."
                rows={12}
                required
                error={validationErrors.description}
                helpText="Describe your organization's approach to user data and privacy."
              />

              <Checkbox
                id="isActive"
                name="isActive"
                label="Make this policy active and available to users"
                checked={formData.isActive}
                onChange={handleChange}
              />

              <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                <Button
                  variant="secondary"
                  type="button"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  icon={<Save size={16} />}
                  disabled={submitting}
                >
                  {submitting
                    ? isCreateMode
                      ? "Creating..."
                      : "Saving..."
                    : isCreateMode
                    ? "Create Policy"
                    : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </main>
  );
}
