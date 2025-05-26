"use client";

import { useState, useEffect } from "react";
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
} from "../components";
import { Lock, Plus, Save, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function CreatePrivacyPolicy() {
  const nav = useAppNavigation();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    isActive: true,
  });
  const [validationErrors, setValidationErrors] = useState({});

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

  // Format description for API submission
  const formatDescriptionForSubmission = (description) => {
    const currentDate = new Date();
    const formattedDate = `${currentDate
      .getDate()
      .toString()
      .padStart(2, "0")}-${(currentDate.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${currentDate.getFullYear().toString().slice(2)}`;

    return JSON.stringify({
      sections: description,
      last_updated: formattedDate,
    });
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
      // Create a copy of the form data to modify for submission
      const submissionData = {
        ...formData,
        description: formatDescriptionForSubmission(formData.description),
      };

      const response = await fetch(`${API_URL}Policy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        throw new Error("Failed to create policy");
      }

      setSuccess("Policy created successfully");
      toast.success("Policy created successfully");

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
    nav.toPrivacyPolicyList();
  };

  // Clear success message after timeout
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  return (
    <main className="min-h-screen bg-gray-50/50 pt-10">
      <PageHeader
        title="Create New Privacy Policy"
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
            title="Create New Privacy Policy"
            icon={<Plus className="text-[#0AAC9E]" size={18} />}
          />

          <div className="p-6">
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
                helpText="Enter your policy content with sections separated by line breaks. This will be automatically formatted when saved."
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
                  {submitting ? "Creating..." : "Create Policy"}
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </main>
  );
}
