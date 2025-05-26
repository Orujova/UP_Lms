"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  Calendar,
  Mail,
  User,
  FileText,
  ChevronDown,
  ChevronUp,
  Laptop,
  BookOpen,
  Languages,
  Shield,
} from "lucide-react";
import {
  fetchVacancyByIdAsync,
  fetchVacancyApplicationsAsync,
} from "@/redux/vacancy/vacancy";
import { toast } from "sonner";

// Components
import LoadingSpinner from "@/components/loadingSpinner";

// Enum mappings based on the backend enums
// Computer skill names enum mapping
const computerSkillNames = {
  0: "MS Word",
  1: "MS Excel",
  2: "MS PowerPoint",
  3: "MS Outlook",
};

// Proficiency levels enum mapping
const proficiencyLevels = {
  0: "Basic",
  1: "Intermediate",
  2: "Advanced",
  3: "Native",
};

// Military service status enum mapping
const militaryStatusNames = {
  0: "Not Applicable",
  1: "Completed",
  2: "Pending",
  3: "Not Eligible",
};

const VacancyApplicationsPage = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { id } = useParams();

  const {
    currentVacancy,
    applications = [], // Set default empty array to avoid filter error
    loading,
    error,
  } = useSelector((state) => state.vacancy);

  const [searchQuery, setSearchQuery] = useState("");
  const [expandedApplicationId, setExpandedApplicationId] = useState(null);

  // Fetch vacancy details and applications on component mount
  useEffect(() => {
    if (id) {
      dispatch(fetchVacancyByIdAsync(parseInt(id)));
      dispatch(fetchVacancyApplicationsAsync(parseInt(id)));
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
      month: "short",
      day: "numeric",
    });
  };

  // Get proficiency badge color
  const getProficiencyColor = (level) => {
    switch (level) {
      case 0:
        return "bg-blue-50 text-blue-600";
      case 1:
        return "bg-green-50 text-green-600";
      case 2:
        return "bg-purple-50 text-purple-600";
      case 3:
        return "bg-amber-50 text-amber-600";
      default:
        return "bg-gray-50 text-gray-600";
    }
  };

  // Get military status badge color
  const getMilitaryStatusColor = (status) => {
    switch (status) {
      case 0:
        return "bg-gray-50 text-gray-600";
      case 1:
        return "bg-green-50 text-green-600";
      case 2:
        return "bg-amber-50 text-amber-600";
      case 3:
        return "bg-red-50 text-red-600";
      default:
        return "bg-gray-50 text-gray-600";
    }
  };

  // Filter applications based on search query
  const filteredApplications =
    applications?.filter((application) => {
      if (!searchQuery.trim()) return true;

      const query = searchQuery.toLowerCase();
      return (
        application?.userName?.toLowerCase().includes(query) ||
        application?.email?.toLowerCase().includes(query)
      );
    }) || [];

  // Toggle expanded application details
  const toggleApplicationDetails = (applicationId) => {
    if (expandedApplicationId === applicationId) {
      setExpandedApplicationId(null);
    } else {
      setExpandedApplicationId(applicationId);
    }
  };

  if (loading && !currentVacancy) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pt-14">
      <div>
        {/* Header with back button */}
        <div className="mb-6">
          <Link href={`/admin/dashboard/vacancies/${id}`}>
            <button className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#0AAC9E] transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Vacancy Details
            </button>
          </Link>
        </div>

        {/* Applications Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Applications for {currentVacancy?.title || "Vacancy"}
              </h1>
              <p className="text-sm text-gray-500">
                {filteredApplications.length}{" "}
                {filteredApplications.length === 1
                  ? "application"
                  : "applications"}{" "}
                found
              </p>
            </div>
          </div>
        </div>

        {/* Search & Filter Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#01DBC8] focus:border-[#01DBC8] sm:text-sm"
              placeholder="Search by applicant name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Applications List */}
        {loading && !applications.length ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : filteredApplications.length > 0 ? (
          <div className="space-y-4">
            {filteredApplications.map((application) => (
              <div
                key={application.userId}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Application Summary */}
                <div
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleApplicationDetails(application.userId)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#f0fbfa] text-[#0AAC9E] rounded-full flex items-center justify-center">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {application.userName || "Unknown Applicant"}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500">
                          <Mail className="w-3.5 h-3.5 mr-1.5" />
                          {application.email || "No email provided"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-xs text-gray-500">Applied on</div>
                        <div className="text-sm font-medium">
                          {formatDate(application.appliedAt)}
                        </div>
                      </div>

                      <button
                        className="p-1.5 rounded-full hover:bg-gray-100"
                        aria-label="Toggle details"
                      >
                        {expandedApplicationId === application.userId ? (
                          <ChevronUp className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Application Details */}
                {expandedApplicationId === application.userId && (
                  <div className="border-t border-gray-100 px-6 py-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Left Column - Application Details */}
                      {application.answers &&
                        application.answers.length > 0 && (
                          <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              Application Details
                            </h4>

                            {application.answers[0]
                              ?.currentPositionDuration && (
                              <div>
                                <div className="text-xs text-gray-500 mb-1">
                                  Current Position Duration
                                </div>
                                <div className="text-sm">
                                  {
                                    application.answers[0]
                                      .currentPositionDuration
                                  }
                                </div>
                              </div>
                            )}

                            {application.answers[0]?.biggestSuccess && (
                              <div>
                                <div className="text-xs text-gray-500 mb-1">
                                  Biggest Success
                                </div>
                                <div className="text-sm">
                                  {application.answers[0].biggestSuccess}
                                </div>
                              </div>
                            )}

                            {application.answers[0]?.reasonForLeaving && (
                              <div>
                                <div className="text-xs text-gray-500 mb-1">
                                  Reason for Leaving
                                </div>
                                <div className="text-sm">
                                  {application.answers[0].reasonForLeaving}
                                </div>
                              </div>
                            )}

                            {application.answers[0]?.motivationForApplying && (
                              <div>
                                <div className="text-xs text-gray-500 mb-1">
                                  Motivation for Applying
                                </div>
                                <div className="text-sm">
                                  {application.answers[0].motivationForApplying}
                                </div>
                              </div>
                            )}

                            {application.answers[0]?.whyHire && (
                              <div>
                                <div className="text-xs text-gray-500 mb-1">
                                  Why We Should Hire
                                </div>
                                <div className="text-sm">
                                  {application.answers[0].whyHire}
                                </div>
                              </div>
                            )}

                            {application.answers[0]?.contributionToTeam && (
                              <div>
                                <div className="text-xs text-gray-500 mb-1">
                                  Contribution to Team
                                </div>
                                <div className="text-sm">
                                  {application.answers[0].contributionToTeam}
                                </div>
                              </div>
                            )}

                            {/* Military Status Section */}
                            {application.answers[0]?.militaryStatus !==
                              undefined && (
                              <div>
                                <div className="text-xs text-gray-500 mb-1">
                                  Military Status
                                </div>
                                <div className="inline-flex items-center">
                                  <span
                                    className={`text-xs px-2 py-0.5 rounded-full ${getMilitaryStatusColor(
                                      application.answers[0].militaryStatus
                                    )}`}
                                  >
                                    <Shield className="w-3 h-3 inline mr-1" />
                                    {militaryStatusNames[
                                      application.answers[0].militaryStatus
                                    ] || "Unknown"}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                      {/* Right Column - Education, Language and Computer Skills */}
                      <div className="space-y-6">
                        {/* Education Section */}
                        {application.answers &&
                          application.answers[0]?.educations &&
                          application.answers[0].educations.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                <BookOpen className="w-4 h-4" />
                                Education
                              </h4>
                              <div className="space-y-3">
                                {application.answers[0].educations.map(
                                  (education, index) => (
                                    <div
                                      key={index}
                                      className="border border-gray-200 rounded-lg p-3"
                                    >
                                      <div className="font-medium">
                                        {education.institutionName}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        {education.specialty} •{" "}
                                        {education.degree}
                                      </div>
                                      <div className="text-xs text-gray-400 mt-1">
                                        {formatDate(education.startDate)} -{" "}
                                        {education.endDate &&
                                        education.endDate !==
                                          "0001-01-01T00:00:00"
                                          ? formatDate(education.endDate)
                                          : "Present"}
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                        {/* Language Skills */}
                        {application.answers &&
                          application.answers[0]?.languageSkills &&
                          application.answers[0].languageSkills.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                <Languages className="w-4 h-4" />
                                Language Skills
                              </h4>
                              <div className="space-y-2">
                                {application.answers[0].languageSkills.map(
                                  (language, index) => (
                                    <div
                                      key={index}
                                      className="flex flex-wrap items-center justify-between gap-2 p-2 border border-gray-100 rounded-lg"
                                    >
                                      <div className="text-sm font-medium">
                                        {language.language}
                                      </div>
                                      <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">
                                          Reading:{" "}
                                          {proficiencyLevels[
                                            language.reading
                                          ] || language.reading}
                                        </span>
                                        <span className="text-xs px-2 py-0.5 bg-green-50 text-green-600 rounded-full">
                                          Writing:{" "}
                                          {proficiencyLevels[
                                            language.writing
                                          ] || language.writing}
                                        </span>
                                        <span className="text-xs px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full">
                                          Understanding:{" "}
                                          {proficiencyLevels[
                                            language.understanding
                                          ] || language.understanding}
                                        </span>
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                        {/* Computer Skills */}
                        {application.answers &&
                          application.answers[0]?.computerSkills &&
                          application.answers[0].computerSkills.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                <Laptop className="w-4 h-4" />
                                Computer Skills
                              </h4>
                              <div className="space-y-2">
                                {application.answers[0].computerSkills.map(
                                  (skill, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center justify-between p-2 border border-gray-100 rounded-lg"
                                    >
                                      <div className="text-sm font-medium">
                                        {computerSkillNames[skill.skillName] ||
                                          `Skill ${skill.skillName}`}
                                      </div>
                                      <div>
                                        <span
                                          className={`text-xs px-2 py-0.5 rounded-full ${getProficiencyColor(
                                            skill.proficiency
                                          )}`}
                                        >
                                          {proficiencyLevels[
                                            skill.proficiency
                                          ] || `Level ${skill.proficiency}`}
                                        </span>
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end mt-6">
                      <a
                        href={`mailto:${application.email}`}
                        className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-[#0AAC9E] bg-white border border-[#0AAC9E] rounded-lg hover:bg-[#f0fbfa] transition-colors"
                      >
                        <Mail className="w-4 h-4" />
                        Contact Applicant
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default VacancyApplicationsPage;
