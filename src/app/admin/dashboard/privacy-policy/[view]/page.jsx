"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  PageHeader,
  SectionHeader,
  Card,
  Button,
  StatusBadge,
  LoadingSpinner,
  ErrorAlert,
  API_URL,
  useAppNavigation,
} from "../components/page";
import {
  Lock,
  FileCheck,
  Edit,
  ArrowLeft,
  Calendar,
  Clock,
  Eye,
} from "lucide-react";

export default function ViewPrivacyPolicy() {
  const params = useParams();
  const id = params.view;
  const router = useRouter();
  const nav = useAppNavigation();

  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formattedDescription, setFormattedDescription] = useState("");

  const parseDescription = (description) => {
    if (!description) return "";

    try {
      // Check if the description is a JSON string
      if (
        typeof description === "string" &&
        (description.startsWith("{") || description.startsWith("["))
      ) {
        const parsedDesc = JSON.parse(description);

        // If it's an object with a "sections" field that contains formatted text
        if (parsedDesc && parsedDesc.sections) {
          // Replace \n with actual line breaks for display
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
      // If JSON parsing fails, try to make it display better by replacing escape sequences
      if (typeof description === "string" && description.includes("\\n")) {
        return description.replace(/\\n/g, "\n");
      }
      return description; // Return original if parsing fails
    }
  };

  // Fetch policy details
  const fetchPolicy = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}Policy/${id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch policy details");
      }

      const data = await response.json();
      const processedDescription = parseDescription(data.description);
      setFormattedDescription(processedDescription);
      setPolicy(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Navigation handlers
  const handleBack = () => {
    nav.toPrivacyPolicyList();
  };

  const handleEdit = () => {
    nav.toEditPrivacyPolicy(id);
  };

  // Load policy on mount
  useEffect(() => {
    if (id) {
      fetchPolicy();
    }
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50/50 pt-12">
        <PageHeader
          title="View Privacy Policy"
          actions={
            <Link
              href="/admin/dashboard/privacy-policy"
              className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 shadow-sm rounded-md text-sm font-medium flex items-center transition duration-150 ease-in-out"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to List
            </Link>
          }
        />
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="shadow-md">
            <div className="flex justify-center items-center p-10">
              <LoadingSpinner />
            </div>
          </Card>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50/50 pt-12">
        <PageHeader
          title="View Privacy Policy"
          icon={<Lock className="text-[#0AAC9E]" size={20} />}
          actions={
            <Link
              href="/admin/dashboard/privacy-policy"
              className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 shadow-sm rounded-md text-sm font-medium flex items-center transition duration-150 ease-in-out"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to List
            </Link>
          }
        />
        <div className="container ">
          <ErrorAlert message={error} />
          <Card className="p-6 text-center shadow-md">
            <p className="text-gray-600 mb-4">Unable to load policy details</p>
            <Button
              variant="primary"
              onClick={handleBack}
              className="bg-[#0AAC9E] hover:bg-[#078f83] transition duration-150 ease-in-out"
            >
              Return to Policy List
            </Button>
          </Card>
        </div>
      </main>
    );
  }

  if (!policy) {
    return (
      <main className="min-h-screen bg-gray-50/50 pt-12">
        <PageHeader
          title="View Privacy Policy"
          icon={<Lock className="text-[#0AAC9E]" size={20} />}
          actions={
            <Link
              href="/admin/dashboard/privacy-policy"
              className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 shadow-sm rounded-md text-sm font-medium flex items-center transition duration-150 ease-in-out"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to List
            </Link>
          }
        />
        <div className="container ">
          <Card className="p-6 text-center shadow-md">
            <p className="text-gray-600 mb-4">Policy not found</p>
            <Button
              variant="primary"
              onClick={handleBack}
              className="bg-[#0AAC9E] hover:bg-[#078f83] transition duration-150 ease-in-out"
            >
              Return to Policy List
            </Button>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50/50 pt-12">
      <PageHeader
        title="View Privacy Policy"
        icon={<Lock className="text-[#0AAC9E]" size={20} />}
        actions={
          <div className="flex space-x-3">
            <Link
              href="/admin/dashboard/privacy-policy"
              className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 shadow-sm rounded-md text-sm font-medium flex items-center transition duration-150 ease-in-out"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to List
            </Link>
            <Link
              href={`/admin/dashboard/privacy-policy/edit/${id}`}
              className="bg-[#0AAC9E] hover:bg-[#078f83] text-white px-4 py-2 shadow-sm rounded-md text-sm font-medium flex items-center transition duration-150 ease-in-out"
            >
              <Edit size={16} className="mr-2" />
              Edit Policy
            </Link>
          </div>
        }
      />

      <div className="container ">
        <Card className="shadow-md">
          <div className="p-6">
            <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
              <h1 className="text-2xl font-bold text-gray-900">
                {policy.title}
              </h1>
              <StatusBadge
                active={policy.isActive}
                size="medium"
                className={
                  policy.isActive
                    ? "bg-[#f9f9f9] text-[#0AAC9E] border border-[#C0F6F1]"
                    : "bg-gray-100 text-gray-800 border border-gray-200"
                }
              />
            </div>

            <div className="mb-8 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 flex flex-wrap gap-6 shadow-sm">
              <div className="flex items-center text-sm text-gray-600">
                <div className="p-1.5  rounded-md mr-2">
                  <Calendar size={16} className="text-[#808080]" />
                </div>
                <div>
                  <span className="font-medium">Created:</span>{" "}
                  {new Date(
                    policy.createdAt || Date.now()
                  ).toLocaleDateString()}
                </div>
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <div className="p-1.5  rounded-md mr-2">
                  <Clock size={16} className="text-[#808080]" />
                </div>
                <div>
                  <span className="font-medium">Last modified:</span>{" "}
                  {new Date(
                    policy.updatedAt || Date.now()
                  ).toLocaleDateString()}
                </div>
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <div className="p-1.5  rounded-md mr-2">
                  <FileCheck size={16} className="text-[#808080]" />
                </div>
                <div>
                  <span className="font-medium">Policy ID:</span> {policy.id}
                </div>
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <div className="p-1.5  rounded-md mr-2">
                  <Eye size={16} className="text-[#808080]" />
                </div>
                <div>
                  <span className="font-medium">Status:</span>{" "}
                  {policy.isActive ? "Active" : "Inactive"}
                </div>
              </div>
            </div>

            <div className="prose prose-slate max-w-none">
              <h2 className="text-lg font-medium mb-4 flex items-center">
                <Lock size={16} className="text-[#808080] mr-2" />
                Policy Content
              </h2>
              <div className="whitespace-pre-wrap bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow transition duration-150 ease-in-out">
                {formattedDescription || "No content available"}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between items-center">
              <p className="text-sm text-gray-500">
                {policy.isActive
                  ? "This policy is currently active and visible to users."
                  : "This policy is currently inactive and hidden from users."}
              </p>
              <Link
                href={`/admin/dashboard/privacy-policy/edit/${id}`}
                className="bg-[#0AAC9E] hover:bg-[#078f83] text-white px-4 py-2 shadow-sm rounded-md text-sm font-medium flex items-center transition duration-150 ease-in-out"
              >
                <Edit size={16} className="mr-2" />
                Edit Policy
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
