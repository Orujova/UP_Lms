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
  Box
} from "lucide-react";
import { toast, Toaster } from "sonner";

const PollUnitDetail = ({ params }) => {
  const { id } = params;
  const [pollUnit, setPollUnit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [showResults, setShowResults] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchPollUnitDetails();
  }, []);

  const fetchPollUnitDetails = async () => {
    try {
      const response = await fetch(
        `https://bravoadmin.uplms.org/api/PollUnit/${id}`
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
    if (!confirm('Are you sure you want to delete this poll unit?')) {
      return;
    }
  
    try {
      setDeleting(true);
  
      const response = await fetch('https://bravoadmin.uplms.org/api/PollUnit', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'accept': '*/*',
        },
        body: JSON.stringify({ id }),
      });
  
      if (response.ok) {
        toast.success('Poll unit deleted successfully');
        router.push('/admin/dashboard/poll-unit');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete poll unit');
      }
    } catch (error) {
      console.error('Error deleting poll unit:', error);
      toast.error('Failed to delete poll unit');
    } finally {
      setDeleting(false);
    }
  };
  

  const hasContent = {
    surveys: pollUnit?.surveys?.length > 0,
    votes: pollUnit?.voteQuestions?.length > 0,
    forms: pollUnit?.formFields?.length > 0
  };

  const getResponseCount = () => {
    let count = 0;
    if (pollUnit?.surveys) {
      pollUnit.surveys.forEach(survey => {
        count += survey.appUserSurveyResponses?.length || 0;
      });
    }
    if (pollUnit?.voteQuestions) {
      pollUnit.voteQuestions.forEach(vote => {
        count += vote.appUserVoteResponses?.length || 0;
      });
    }
    if (pollUnit?.formFields) {
      pollUnit.formFields.forEach(form => {
        count += form.appUserFormFieldResponses?.length || 0;
      });
    }
    return count;
  };

  const calculateVoteResults = (vote) => {
    const totalVotes = vote.appUserVoteResponses?.length || 0;
    return vote.options.map(option => ({
      ...option,
      votes: vote.appUserVoteResponses?.filter(response => response.voteOptionId === option.id).length || 0,
      percentage: totalVotes ? ((vote.appUserVoteResponses?.filter(response => response.voteOptionId === option.id).length || 0) / totalVotes * 100).toFixed(1) : 0
    }));
  };

  const calculateSurveyResults = (question, survey) => {
    const responses = survey.appUserSurveyResponses || [];
    const totalResponses = responses.length;
    
    return question.options.map(option => {
      const optionCount = responses.filter(response => 
        response.surveyAnswers.some(answer => 
          answer.questionId === question.id && answer.optionId === option.id
        )
      ).length;

      return {
        ...option,
        responses: optionCount,
        percentage: totalResponses ? ((optionCount / totalResponses) * 100).toFixed(1) : 0
      };
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-t-emerald-500 border-b-emerald-700 rounded-full animate-spin"></div>
          <p className="mt-2 text-gray-600">Loading poll unit details...</p>
        </div>
      </div>
    );
  }

  if (!pollUnit) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-4">Poll Unit not found.</p>
          <button
            onClick={() => router.push("/admin/dashboard/poll-unit")}
            className="text-emerald-600 hover:text-emerald-700 flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Return to Poll Units
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-6">
          <div className="flex justify-between items-start">
            <button
              onClick={() => router.push("/admin/dashboard/poll-unit")}
              className="text-gray-500 hover:text-gray-700 flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-t-white border-r-white border-b-white border-l-transparent rounded-full animate-spin mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-5 h-5 mr-2" />
                  Delete
                </>
              )}
            </button>
          </div>
          
          <div className="mt-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{pollUnit.title}</h1>
            <p className="text-gray-600">{pollUnit.description}</p>
          </div>

          {/* Content Type Stats */}
          <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t">
            {hasContent.surveys && (
              <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-sm">
                <ClipboardList className="w-4 h-4" />
                {pollUnit.surveys.length} {pollUnit.surveys.length === 1 ? 'Survey' : 'Surveys'}
              </div>
            )}
            {hasContent.votes && (
              <div className="flex items-center gap-1 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm">
                <Vote className="w-4 h-4" />
                {pollUnit.voteQuestions.length} {pollUnit.voteQuestions.length === 1 ? 'Vote' : 'Votes'}
              </div>
            )}
            {hasContent.forms && (
              <div className="flex items-center gap-1 bg-purple-50 text-purple-600 px-3 py-1 rounded-full text-sm">
                <FormInput className="w-4 h-4" />
                {pollUnit.formFields.length} {pollUnit.formFields.length === 1 ? 'Form' : 'Forms'}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => {
                  setActiveTab('all');
                  setShowResults(false);
                }}
                className={`px-6 py-3 text-sm font-medium transition-colors relative ${
                  activeTab === 'all' && !showResults
                    ? 'text-emerald-600 border-b-2 border-emerald-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Content
              </button>
              <button
                onClick={() => {
                  setShowResults(true);
                  setActiveTab('all');
                }}
                className={`px-6 py-3 text-sm font-medium transition-colors relative ${
                  showResults
                    ? 'text-emerald-600 border-b-2 border-emerald-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Results ({getResponseCount()})
              </button>
              {!showResults && hasContent.surveys && (
                <button
                  onClick={() => setActiveTab('surveys')}
                  className={`px-6 py-3 text-sm font-medium transition-colors relative ${
                    activeTab === 'surveys'
                      ? 'text-emerald-600 border-b-2 border-emerald-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Surveys
                </button>
              )}
              {!showResults && hasContent.votes && (
                <button
                  onClick={() => setActiveTab('votes')}
                  className={`px-6 py-3 text-sm font-medium transition-colors relative ${
                    activeTab === 'votes'
                      ? 'text-emerald-600 border-b-2 border-emerald-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Votes
                </button>
              )}
              {!showResults && hasContent.forms && (
                <button
                  onClick={() => setActiveTab('forms')}
                  className={`px-6 py-3 text-sm font-medium transition-colors relative ${
                    activeTab === 'forms'
                      ? 'text-emerald-600 border-b-2 border-emerald-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Forms
                </button>
              )}
            </div>
          </div>

          <div className="p-6">
            {/* Results View */}
            {showResults && (
              <div className="space-y-8">
                {/* Vote Results */}
                {hasContent.votes && pollUnit.voteQuestions.map((vote, index) => (
                  <div key={index} className="bg-white rounded-lg p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{vote.questionText}</h3>
                    <div className="space-y-4">
                      {calculateVoteResults(vote).map((option, oIndex) => (
                        <div key={oIndex} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-700">{option.optionText}</span>
                            <span className="text-gray-500">{option.votes} votes ({option.percentage}%)</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                              style={{ width: `${option.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 border-t pt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Responses</h4>
                      <div className="space-y-2">
                        {vote.appUserVoteResponses?.map((response, rIndex) => (
                          <div key={rIndex} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                            <div className="text-gray-700">
                              {response.isAnonymous ? 'Anonymous' : `${response.firstName} ${response.lastName}`}
                            </div>
                            <div className="text-gray-500">
                              {formatDate(response.participatedOn)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Survey Results */}
                {hasContent.surveys && pollUnit.surveys.map((survey, index) => (
                  <div key={index} className="bg-white rounded-lg p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{survey.title}</h3>
                    <p className="text-sm text-gray-500 mb-6">
                      {survey.appUserSurveyResponses?.length || 0} responses
                    </p>
                    {survey.questions.map((question, qIndex) => (
                      <div key={qIndex} className="mb-8 last:mb-0">
                        <h4 className="font-medium text-gray-800 mb-4">
                          {question.questionText}
                          {question.allowMultipleSelection && (
                            <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                              Multiple Selection
                            </span>
                          )}
                        </h4>
                        <div className="space-y-4">
                          {calculateSurveyResults(question, survey).map((option, oIndex) => (
                            <div key={oIndex} className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-700">{option.optionText}</span>
                                <span className="text-gray-500">{option.responses} responses ({option.percentage}%)</span>
                              </div>
                              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                  style={{ width: `${option.percentage}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    <div className="mt-6 border-t pt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Responses</h4>
                      <div className="space-y-2">
                        {survey.appUserSurveyResponses?.map((response, rIndex) => (
                          <div key={rIndex} className="text-sm bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-medium text-gray-700">
                                {response.firstName} {response.lastName}
                              </div>
                            </div>
                            <div className="space-y-1">
                              {response.surveyAnswers.map((answer, aIndex) => {
                                const question = survey.questions.find(q => q.id === answer.questionId);
                                const option = question?.options.find(o => o.id === answer.optionId);
                                return (
                                  <div key={aIndex} className="flex text-sm">
                                    <span className="text-gray-600 min-w-[200px]">{question?.questionText}:</span>
                                    <span className="text-gray-900 font-medium">{option?.optionText}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Form Results */}
                {hasContent.forms && pollUnit.formFields.map((form, index) => (
                  <div key={index} className="bg-white rounded-lg p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{form.formName || `Form ${index + 1}`}</h3>
                    <div className="space-y-4">
                      {form.appUserFormFieldResponses?.map((response, rIndex) => (
                        <div key={rIndex} className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div className="font-medium text-gray-700">
                              {response.firstName} {response.lastName}
                            </div>
                          </div>
                          <div className="space-y-2">
                            {form.fieldNameWithTypes
                              .filter(field => field.id === response.fieldNameWithTypeId)
                              .map((field, fIndex) => (
                                <div key={fIndex} className="flex items-start gap-2 text-sm">
                                  <span className="text-gray-600 min-w-[150px]">{field.fieldName}:</span>
                                  <span className="text-gray-900">{response.fieldValue}</span>
                                </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* No Results Message */}
                {getResponseCount() === 0 && (
                  <div className="text-center py-12">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No responses yet.</p>
                  </div>
                )}
              </div>
            )}

            {/* Content View */}
            {!showResults && (
              <>
                {/* Surveys Content */}
                {(activeTab === 'all' || activeTab === 'surveys') && hasContent.surveys && (
                  <div className="space-y-6">
                    {pollUnit.surveys.map((survey, index) => (
                      <div key={index} className="bg-white rounded-lg p-6 border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">{survey.title}</h3>
                        <div className="space-y-6">
                          {survey.questions.map((question, qIndex) => (
                            <div key={qIndex} className="bg-gray-50 rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <span className="bg-emerald-100 text-emerald-600 w-6 h-6 flex items-center justify-center rounded-full text-sm">
                                  {qIndex + 1}
                                </span>
                                <h4 className="font-medium text-gray-800">{question.questionText}</h4>
                              </div>
                              <div className="space-y-2 pl-8">
                                {question.options.map((option, oIndex) => (
                                  <div key={oIndex} className="flex items-center gap-2 text-gray-600">
                                    {question.allowMultipleSelection ? (
                                      <div className="w-4 h-4 border-2 border-gray-300 rounded" />
                                    ) : (
                                      <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                                    )}
                                    {option.optionText}
                                  </div>
                                ))}
                              </div>
                              <div className="mt-3 pl-8 flex gap-4">
                                {question.isRequired && (
                                  <span className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-full">
                                    Required
                                  </span>
                                )}
                                {question.allowMultipleSelection && (
                                  <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full">
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
                {(activeTab === 'all' || activeTab === 'votes') && hasContent.votes && (
                  <div className="space-y-6">
                    {pollUnit.voteQuestions.map((vote, index) => (
                      <div key={index} className="bg-white rounded-lg p-6 border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">{vote.questionText}</h3>
                        <div className="space-y-2">
                          {vote.options.map((option, oIndex) => (
                            <div key={oIndex} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg text-gray-600">
                              <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                              {option.optionText}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Forms Content */}
                {(activeTab === 'all' || activeTab === 'forms') && hasContent.forms && (
                  <div className="space-y-6">
                    {pollUnit.formFields.map((form, index) => (
                      <div key={index} className="bg-white rounded-lg p-6 border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">{form.formName || `Form ${index + 1}`}</h3>
                        <div className="space-y-4">
                          {form.fieldNameWithTypes.map((field, fIndex) => (
                            <div key={fIndex} className="bg-gray-50 p-4 rounded-lg">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-medium text-gray-800">{field.fieldName}</h4>
                                  {field.isRequired && (
                                    <span className="text-xs text-red-500">Required</span>
                                  )}
                                </div>
                                <span className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded-full">
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
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* No Content Message */}
                {!hasContent.surveys && !hasContent.votes && !hasContent.forms && (
                  <div className="text-center py-12">
                    <Box className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No content available for this Poll Unit.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PollUnitDetail;