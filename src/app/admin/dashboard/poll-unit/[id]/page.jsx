"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Trash2,
  ClipboardList,
  Vote,
  FormInput,
  AlertCircle,
  Box,
  Calendar,
  Users,
  BarChart3,
  FileDown,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import LoadingSpinner from "@/components/loadingSpinner";
import DeleteConfirmationModal from "@/components/deleteModal";
import { getToken } from "@/authtoken/auth.js";

const PollUnitDetail = ({ params }) => {
  const { id } = params;
  const [pollUnit, setPollUnit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [showResults, setShowResults] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [exporting, setExporting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchPollUnitDetails();
  }, []);

  const fetchPollUnitDetails = async () => {
    try {
      const response = await fetch(
        `https://demoadmin.databyte.app/api/PollUnit/${id}`
      );
      const data = await response.json();
      setPollUnit(data);
    } catch (error) {
      console.error("Error fetching poll unit details:", error);
      toast.error("Failed to load poll unit details");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);

      const response = await fetch(
        "https://demoadmin.databyte.app/api/PollUnit",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            accept: "*/*",
          },
          body: JSON.stringify({ id }),
        }
      );

      if (response.ok) {
        toast.success("Poll unit deleted successfully");
        router.push("/admin/dashboard/poll-unit");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete poll unit");
      }
    } catch (error) {
      console.error("Error deleting poll unit:", error);
      toast.error("Failed to delete poll unit");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const exportPollUnit = async () => {
    try {
      setExporting(true);

      const token = getToken();

      // Prepare the API endpoint with query parameters
      const endpoint = `https://demoadmin.databyte.app/api/PollUnit/export-poll-units?PollUnitId=${id}`;

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/octet-stream",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to export poll unit data");
      }

      // Get the filename from the Content-Disposition header or use a default name
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = "poll-unit-export.xlsx";

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      // Convert the response to a blob
      const blob = await response.blob();

      // Create a download link and trigger the download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();

      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Poll unit data exported successfully");
    } catch (error) {
      console.error("Error exporting poll unit data:", error);
      toast.error("Failed to export poll unit data");
    } finally {
      setExporting(false);
    }
  };

  const hasContent = {
    surveys: pollUnit?.surveys?.length > 0,
    votes: pollUnit?.voteQuestions?.length > 0,
    forms: pollUnit?.formFields?.length > 0,
  };

  const getResponseCount = () => {
    let count = 0;
    if (pollUnit?.surveys) {
      pollUnit.surveys.forEach((survey) => {
        count += survey.appUserSurveyResponses?.length || 0;
      });
    }
    if (pollUnit?.voteQuestions) {
      pollUnit.voteQuestions.forEach((vote) => {
        count += vote.appUserVoteResponses?.length || 0;
      });
    }
    if (pollUnit?.formFields) {
      pollUnit.formFields.forEach((form) => {
        count += form.appUserFormFieldResponses?.length || 0;
      });
    }
    return count;
  };

  const calculateVoteResults = (vote) => {
    const totalVotes = vote.appUserVoteResponses?.length || 0;
    return vote.options.map((option) => ({
      ...option,
      votes:
        vote.appUserVoteResponses?.filter(
          (response) => response.voteOptionId === option.id
        ).length || 0,
      percentage: totalVotes
        ? (
            ((vote.appUserVoteResponses?.filter(
              (response) => response.voteOptionId === option.id
            ).length || 0) /
              totalVotes) *
            100
          ).toFixed(1)
        : 0,
    }));
  };

  const calculateSurveyResults = (question, survey) => {
    const responses = survey.appUserSurveyResponses || [];
    const totalResponses = responses.length;

    return question.options.map((option) => {
      const optionCount = responses.filter((response) =>
        response.surveyAnswers.some(
          (answer) =>
            answer.questionId === question.id && answer.optionId === option.id
        )
      ).length;

      return {
        ...option,
        responses: optionCount,
        percentage: totalResponses
          ? ((optionCount / totalResponses) * 100).toFixed(1)
          : 0,
      };
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!pollUnit) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <div className="text-center bg-white p-8 rounded-xl shadow-sm border border-gray-200 max-w-md">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-700 text-lg font-medium mb-4">
            Poll Unit not found
          </p>
          <p className="text-gray-500 mb-6">
            This poll unit may have been deleted or doesn't exist.
          </p>
          <button
            onClick={() => router.push("/admin/dashboard/poll-unit")}
            className="text-[#0AAC9E] hover:text-[#09998c] flex items-center justify-center gap-2 mx-auto font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Return to Poll Units
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pt-14 pb-10">
      <div>
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-6">
          <div className="flex justify-between items-start">
            <button
              onClick={() => router.push("/admin/dashboard/poll-unit")}
              className="text-gray-500 hover:text-gray-700 flex items-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Poll Units</span>
            </button>
            <div className="flex gap-3">
              <button
                onClick={exportPollUnit}
                disabled={exporting}
                className="inline-flex items-center px-4 py-2 bg-[#0AAC9E] text-white text-sm rounded-lg hover:bg-[#09998c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {exporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-t-transparent border-solid border-white rounded-full animate-spin mr-1.5"></div>
                    Exporting...
                  </>
                ) : (
                  <>
                    <FileDown className="w-4 h-4 mr-1.5" />
                    Export
                  </>
                )}
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                disabled={deleting}
                className="inline-flex items-center px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4 mr-1.5" />
                Delete
              </button>
            </div>
          </div>

          <div className="mt-4">
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              {pollUnit.title}
            </h1>
            <p className="text-gray-600 text-sm">{pollUnit.description}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
            <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-3">
              <div className="bg-[#f0fdfb] p-2.5 rounded-lg">
                <Calendar className="w-5 h-5 text-[#0AAC9E]" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Created On</div>
                <div className="text-sm font-medium text-gray-800">
                  {formatDate(pollUnit.createdDate || new Date())}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-3">
              <div className="bg-blue-50 p-2.5 rounded-lg">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Responses</div>
                <div className="text-sm font-medium text-gray-800">
                  {getResponseCount()} total
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-3">
              <div className="bg-purple-50 p-2.5 rounded-lg">
                <BarChart3 className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Content Types</div>
                <div className="text-sm font-medium text-gray-800 flex gap-2">
                  {hasContent.surveys && (
                    <span className="inline-flex items-center gap-1 text-[#0AAC9E]">
                      <ClipboardList className="w-3.5 h-3.5" />
                      {pollUnit.surveys.length}
                    </span>
                  )}
                  {hasContent.votes && (
                    <span className="inline-flex items-center gap-1 text-blue-500">
                      <Vote className="w-3.5 h-3.5" />
                      {pollUnit.voteQuestions.length}
                    </span>
                  )}
                  {hasContent.forms && (
                    <span className="inline-flex items-center gap-1 text-purple-500">
                      <FormInput className="w-3.5 h-3.5" />
                      {pollUnit.formFields.length}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Tabs */}
          <div className="border-b border-gray-200 px-2">
            <div className="flex flex-wrap">
              <button
                onClick={() => {
                  setActiveTab("all");
                  setShowResults(false);
                }}
                className={`px-4 py-3 text-sm font-medium transition-colors relative rounded-t-lg ${
                  activeTab === "all" && !showResults
                    ? "text-[#0AAC9E] border-b-2 border-[#0AAC9E] bg-[#f0fdfb]"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Box className="w-4 h-4" />
                  Content
                </span>
              </button>
              <button
                onClick={() => {
                  setShowResults(true);
                  setActiveTab("all");
                }}
                className={`px-4 py-3 text-sm font-medium transition-colors relative rounded-t-lg ${
                  showResults
                    ? "text-[#0AAC9E] border-b-2 border-[#0AAC9E] bg-[#f0fdfb]"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4" />
                  Results ({getResponseCount()})
                </span>
              </button>
              {!showResults && hasContent.surveys && (
                <button
                  onClick={() => setActiveTab("surveys")}
                  className={`px-4 py-3 text-sm font-medium transition-colors relative rounded-t-lg ${
                    activeTab === "surveys"
                      ? "text-[#0AAC9E] border-b-2 border-[#0AAC9E] bg-[#f0fdfb]"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <ClipboardList className="w-4 h-4" />
                    Surveys
                  </span>
                </button>
              )}
              {!showResults && hasContent.votes && (
                <button
                  onClick={() => setActiveTab("votes")}
                  className={`px-4 py-3 text-sm font-medium transition-colors relative rounded-t-lg ${
                    activeTab === "votes"
                      ? "text-[#0AAC9E] border-b-2 border-[#0AAC9E] bg-[#f0fdfb]"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Vote className="w-4 h-4" />
                    Votes
                  </span>
                </button>
              )}
              {!showResults && hasContent.forms && (
                <button
                  onClick={() => setActiveTab("forms")}
                  className={`px-4 py-3 text-sm font-medium transition-colors relative rounded-t-lg ${
                    activeTab === "forms"
                      ? "text-[#0AAC9E] border-b-2 border-[#0AAC9E] bg-[#f0fdfb]"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <FormInput className="w-4 h-4" />
                    Forms
                  </span>
                </button>
              )}
            </div>
          </div>

          <div className="p-6">
            {/* Results View */}
            {showResults && (
              <div className="space-y-8">
                {/* Vote Results */}
                {hasContent.votes &&
                  pollUnit.voteQuestions.map((vote, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm"
                    >
                      <div className="flex gap-2 items-center mb-4">
                        <div className="bg-blue-50 p-1.5 rounded-md">
                          <Vote className="w-4 h-4 text-blue-500" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {vote.questionText}
                        </h3>
                      </div>

                      <div className="space-y-4">
                        {calculateVoteResults(vote).map((option, oIndex) => (
                          <div key={oIndex} className="space-y-1.5">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-700 font-medium">
                                {option.optionText}
                              </span>
                              <span className="text-gray-500">
                                {option.votes} votes ({option.percentage}%)
                              </span>
                            </div>
                            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                                style={{ width: `${option.percentage}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      {vote.appUserVoteResponses?.length > 0 && (
                        <div className="mt-6 border-t border-gray-100 pt-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-3">
                            Recent Responses
                          </h4>
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {vote.appUserVoteResponses?.map(
                              (response, rIndex) => (
                                <div
                                  key={rIndex}
                                  className="flex items-center justify-between text-sm bg-gray-50 p-3 rounded-lg"
                                >
                                  <div className="text-gray-700 font-medium">
                                    {response.isAnonymous
                                      ? "Anonymous"
                                      : `${response.firstName} ${response.lastName}`}
                                  </div>
                                  <div className="text-gray-500 text-xs">
                                    {formatDate(response.participatedOn)}
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                {/* Survey Results */}
                {hasContent.surveys &&
                  pollUnit.surveys.map((survey, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm"
                    >
                      <div className="flex gap-2 items-center mb-2">
                        <div className="bg-[#f0fdfb] p-1.5 rounded-md">
                          <ClipboardList className="w-4 h-4 text-[#0AAC9E]" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {survey.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2 mb-6">
                        <span className="text-xs px-2 py-0.5 bg-[#f0fdfb] text-[#0AAC9E] rounded-full">
                          {survey.appUserSurveyResponses?.length || 0} responses
                        </span>
                      </div>

                      {survey.questions.map((question, qIndex) => (
                        <div
                          key={qIndex}
                          className="mb-8 last:mb-0 bg-gray-50 p-4 rounded-lg"
                        >
                          <h4 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
                            <span className="text-xs bg-gray-200 text-gray-600 w-5 h-5 flex items-center justify-center rounded-full">
                              {qIndex + 1}
                            </span>
                            {question.questionText}
                            {question.allowMultipleSelection && (
                              <span className="ml-2 text-xs bg-[#f0fdfb] text-[#0AAC9E] px-2 py-0.5 rounded-full">
                                Multiple Selection
                              </span>
                            )}
                          </h4>

                          <div className="space-y-4">
                            {calculateSurveyResults(question, survey).map(
                              (option, oIndex) => (
                                <div key={oIndex} className="space-y-1.5">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-700 font-medium">
                                      {option.optionText}
                                    </span>
                                    <span className="text-gray-500">
                                      {option.responses} responses (
                                      {option.percentage}%)
                                    </span>
                                  </div>
                                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-[#0AAC9E] rounded-full transition-all duration-500"
                                      style={{ width: `${option.percentage}%` }}
                                    />
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      ))}

                      {survey.appUserSurveyResponses?.length > 0 && (
                        <div className="mt-6 border-t border-gray-100 pt-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-3">
                            Recent Responses
                          </h4>
                          <div className="space-y-3 max-h-96 overflow-y-auto">
                            {survey.appUserSurveyResponses?.map(
                              (response, rIndex) => (
                                <div
                                  key={rIndex}
                                  className="text-sm bg-gray-50 p-4 rounded-lg"
                                >
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="font-medium text-gray-700 flex items-center gap-2">
                                      <span className="w-6 h-6 bg-[#f0fdfb] text-[#0AAC9E] rounded-full flex items-center justify-center text-xs">
                                        {response.firstName?.charAt(0)}
                                        {response.lastName?.charAt(0)}
                                      </span>
                                      {response.firstName} {response.lastName}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {formatDate(response.participatedOn)}
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    {response.surveyAnswers.map(
                                      (answer, aIndex) => {
                                        const question = survey.questions.find(
                                          (q) => q.id === answer.questionId
                                        );
                                        const option = question?.options.find(
                                          (o) => o.id === answer.optionId
                                        );
                                        return (
                                          <div
                                            key={aIndex}
                                            className="flex text-sm bg-white p-2 rounded-md"
                                          >
                                            <span className="text-gray-600 min-w-[200px] text-xs">
                                              {question?.questionText}:
                                            </span>
                                            <span className="text-gray-900 font-medium text-xs">
                                              {option?.optionText}
                                            </span>
                                          </div>
                                        );
                                      }
                                    )}
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                {/* Form Results */}
                {hasContent.forms &&
                  pollUnit.formFields.map((form, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm"
                    >
                      <div className="flex gap-2 items-center mb-4">
                        <div className="bg-purple-50 p-1.5 rounded-md">
                          <FormInput className="w-4 h-4 text-purple-500" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {form.formName || `Form ${index + 1}`}
                        </h3>
                      </div>

                      <div className="space-y-4">
                        {form.appUserFormFieldResponses?.length > 0 ? (
                          form.appUserFormFieldResponses?.map(
                            (response, rIndex) => (
                              <div
                                key={rIndex}
                                className="bg-gray-50 p-4 rounded-lg"
                              >
                                <div className="flex items-center justify-between mb-3">
                                  <div className="font-medium text-gray-700 flex items-center gap-2">
                                    <span className="w-6 h-6 bg-purple-50 text-purple-500 rounded-full flex items-center justify-center text-xs">
                                      {response.firstName?.charAt(0)}
                                      {response.lastName?.charAt(0)}
                                    </span>
                                    {response.firstName} {response.lastName}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {formatDate(
                                      response.createdDate || new Date()
                                    )}
                                  </div>
                                </div>

                                <div className="space-y-2 bg-white p-3 rounded-md">
                                  {form.fieldNameWithTypes
                                    .filter(
                                      (field) =>
                                        field.id ===
                                        response.fieldNameWithTypeId
                                    )
                                    .map((field, fIndex) => (
                                      <div
                                        key={fIndex}
                                        className="flex items-start gap-2 text-sm"
                                      >
                                        <span className="text-gray-600 min-w-[150px] text-xs">
                                          {field.fieldName}:
                                        </span>
                                        <span className="text-gray-900 font-medium text-xs">
                                          {response.fieldValue}
                                        </span>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            )
                          )
                        ) : (
                          <div className="text-center py-6">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                              <FormInput className="w-6 h-6 text-gray-400" />
                            </div>
                            <p className="text-gray-500 text-sm">
                              No form responses yet
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                {/* No Results Message */}
                {getResponseCount() === 0 && (
                  <div className="text-center py-12 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BarChart3 className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-700 font-medium mb-2">
                      No responses yet
                    </p>
                    <p className="text-gray-500 text-sm max-w-md mx-auto">
                      When users respond to your poll unit, the results will
                      appear here.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Content View */}
            {!showResults && (
              <>
                {/* Surveys Content */}
                {(activeTab === "all" || activeTab === "surveys") &&
                  hasContent.surveys && (
                    <div className="space-y-6">
                      {pollUnit.surveys.map((survey, index) => (
                        <div
                          key={index}
                          className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm"
                        >
                          <div className="flex gap-2 items-center mb-4">
                            <div className="bg-[#f0fdfb] p-1.5 rounded-md">
                              <ClipboardList className="w-4 h-4 text-[#0AAC9E]" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">
                              {survey.title}
                            </h3>
                          </div>

                          <div className="space-y-4">
                            {survey.questions.map((question, qIndex) => (
                              <div
                                key={qIndex}
                                className="bg-gray-50 rounded-lg p-4"
                              >
                                <div className="flex items-center gap-2 mb-3">
                                  <span className="bg-[#f0fdfb] text-[#0AAC9E] w-6 h-6 flex items-center justify-center rounded-full text-sm">
                                    {qIndex + 1}
                                  </span>
                                  <h4 className="font-medium text-gray-800">
                                    {question.questionText}
                                  </h4>
                                </div>

                                <div className="space-y-2 pl-8">
                                  {question.options.map((option, oIndex) => (
                                    <div
                                      key={oIndex}
                                      className="flex items-center gap-2 text-gray-600 p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                                    >
                                      {question.allowMultipleSelection ? (
                                        <div className="w-4 h-4 border-2 border-[#0AAC9E] rounded flex items-center justify-center">
                                          <div className="w-2 h-2 bg-[#0AAC9E] rounded opacity-0"></div>
                                        </div>
                                      ) : (
                                        <div className="w-4 h-4 border-2 border-[#0AAC9E] rounded-full flex items-center justify-center">
                                          <div className="w-2 h-2 bg-[#0AAC9E] rounded-full opacity-0"></div>
                                        </div>
                                      )}
                                      {option.optionText}
                                    </div>
                                  ))}
                                </div>

                                <div className="mt-3 pl-8 flex gap-2 flex-wrap">
                                  {question.isRequired && (
                                    <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full">
                                      Required
                                    </span>
                                  )}
                                  {question.allowMultipleSelection && (
                                    <span className="text-xs bg-[#f0fdfb] text-[#0AAC9E] px-2 py-0.5 rounded-full">
                                      Multiple Selection
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                {/* Votes Content */}
                {(activeTab === "all" || activeTab === "votes") &&
                  hasContent.votes && (
                    <div className="space-y-6">
                      {pollUnit.voteQuestions.map((vote, index) => (
                        <div
                          key={index}
                          className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm"
                        >
                          <div className="flex gap-2 items-center mb-4">
                            <div className="bg-blue-50 p-1.5 rounded-md">
                              <Vote className="w-4 h-4 text-blue-500" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">
                              {vote.questionText}
                            </h3>
                          </div>

                          <div className="space-y-2">
                            {vote.options.map((option, oIndex) => (
                              <div
                                key={oIndex}
                                className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                              >
                                <div className="w-4 h-4 border-2 border-blue-500 rounded-full flex items-center justify-center">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full opacity-0"></div>
                                </div>
                                {option.optionText}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                {/* Forms Content */}
                {(activeTab === "all" || activeTab === "forms") &&
                  hasContent.forms && (
                    <div className="space-y-6">
                      {pollUnit.formFields.map((form, index) => (
                        <div
                          key={index}
                          className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm"
                        >
                          <div className="flex gap-2 items-center mb-4">
                            <div className="bg-purple-50 p-1.5 rounded-md">
                              <FormInput className="w-4 h-4 text-purple-500" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">
                              {form.formName || `Form ${index + 1}`}
                            </h3>
                          </div>

                          <div className="space-y-4">
                            {form.fieldNameWithTypes.map((field, fIndex) => (
                              <div
                                key={fIndex}
                                className="bg-gray-50 p-4 rounded-lg"
                              >
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h4 className="font-medium text-gray-800">
                                      {field.fieldName}
                                    </h4>
                                    {field.isRequired && (
                                      <span className="text-xs text-red-500 font-medium">
                                        Required
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">
                                    {field.fieldType === 1
                                      ? "Text"
                                      : field.fieldType === 2
                                      ? "Number"
                                      : field.fieldType === 3
                                      ? "Email"
                                      : field.fieldType === 4
                                      ? "Date"
                                      : field.fieldType === 5
                                      ? "DateTime"
                                      : field.fieldType === 6
                                      ? "TextArea"
                                      : "Other"}
                                  </span>
                                </div>
                                <div className="mt-2">
                                  {field.fieldType === 1 && (
                                    <div className="w-full h-9 bg-white border border-gray-200 rounded-lg opacity-50"></div>
                                  )}
                                  {field.fieldType === 2 && (
                                    <div className="w-full h-9 bg-white border border-gray-200 rounded-lg opacity-50"></div>
                                  )}
                                  {field.fieldType === 3 && (
                                    <div className="w-full h-9 bg-white border border-gray-200 rounded-lg opacity-50"></div>
                                  )}
                                  {field.fieldType === 4 && (
                                    <div className="w-full h-9 bg-white border border-gray-200 rounded-lg opacity-50"></div>
                                  )}
                                  {field.fieldType === 5 && (
                                    <div className="w-full h-9 bg-white border border-gray-200 rounded-lg opacity-50"></div>
                                  )}
                                  {field.fieldType === 6 && (
                                    <div className="w-full h-24 bg-white border border-gray-200 rounded-lg opacity-50"></div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                {/* No Content Message */}
                {!hasContent.surveys &&
                  !hasContent.votes &&
                  !hasContent.forms && (
                    <div className="text-center py-12 bg-white rounded-lg border border-gray-200 shadow-sm">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Box className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-700 font-medium mb-2">
                        No content available
                      </p>
                      <p className="text-gray-500 text-sm max-w-md mx-auto">
                        This poll unit doesn't have any surveys, votes, or forms
                        yet.
                      </p>
                    </div>
                  )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        item="Poll Unit"
      />
    </div>
  );
};

export default PollUnitDetail;
