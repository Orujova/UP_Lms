"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  ClipboardList, 
  Vote, 
  FormInput,
  Plus,
  Save,
  X,
  AlertCircle
} from "lucide-react";
import { toast, Toaster } from "sonner";

export default function CreatePollUnit() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [pollUnitData, setPollUnitData] = useState({
    title: "",
    description: "",
    surveys: [],
    voteQuestions: [],
    formFields: []
  });

  const [activeTab, setActiveTab] = useState("main");
  const [currentSurvey, setCurrentSurvey] = useState({
    title: "",
    questions: [
      {
        questionText: "",
        isRequired: true,
        allowMultipleSelection: false,
        options: [{ optionText: "Option 1" }]
      }
    ]
  });

  const [currentVote, setCurrentVote] = useState({
    questionText: "",
    options: [{ optionText: "Option 1" }, { optionText: "Option 2" }]
  });

  const [currentForm, setCurrentForm] = useState({
    formName: "",
    fieldNameWithTypes: [
      {
        fieldName: "",
        fieldType: 1, // Text by default
        isRequired: false
      }
    ]
  });

  // Handler for main poll unit data
  const handlePollUnitDataChange = (e) => {
    setPollUnitData({
      ...pollUnitData,
      [e.target.name]: e.target.value
    });
  };

  // Survey handlers
  const addQuestionToSurvey = () => {
    setCurrentSurvey({
      ...currentSurvey,
      questions: [
        ...currentSurvey.questions,
        {
          questionText: "",
          isRequired: true,
          allowMultipleSelection: false,
          options: [{ optionText: "Option 1" }]
        }
      ]
    });
  };

  const updateSurveyQuestion = (index, field, value) => {
    const updatedQuestions = [...currentSurvey.questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value
    };
    setCurrentSurvey({
      ...currentSurvey,
      questions: updatedQuestions
    });
  };

  const addOptionToSurveyQuestion = (questionIndex) => {
    const updatedQuestions = [...currentSurvey.questions];
    updatedQuestions[questionIndex].options.push({
      optionText: `Option ${updatedQuestions[questionIndex].options.length + 1}`
    });
    setCurrentSurvey({
      ...currentSurvey,
      questions: updatedQuestions
    });
  };

  const saveSurvey = () => {
    if (!currentSurvey.title) {
      toast.error("Please enter a survey title");
      return;
    }
    
    // Check if any questions are empty
    if (currentSurvey.questions.some(q => !q.questionText || q.options.some(o => !o.optionText))) {
      toast.error("Please fill in all questions and options");
      return;
    }

    setPollUnitData({
      ...pollUnitData,
      surveys: [currentSurvey], // Only keep the current survey
      voteQuestions: [], // Clear other types
      formFields: [] // Clear other types
    });
    toast.success("Survey saved successfully");
  };

  // Vote handlers
  const addOptionToVote = () => {
    setCurrentVote({
      ...currentVote,
      options: [...currentVote.options, { optionText: `Option ${currentVote.options.length + 1}` }]
    });
  };

  const saveVote = () => {
    if (!currentVote.questionText) {
      toast.error("Please enter a vote question");
      return;
    }

    if (currentVote.options.some(o => !o.optionText)) {
      toast.error("Please fill in all options");
      return;
    }

    setPollUnitData({
      ...pollUnitData,
      voteQuestions: [currentVote], // Only keep the current vote
      surveys: [], // Clear other types
      formFields: [] // Clear other types
    });
    toast.success("Vote saved successfully");
  };

  // Form handlers
  const addFieldToForm = () => {
    setCurrentForm({
      ...currentForm,
      fieldNameWithTypes: [
        ...currentForm.fieldNameWithTypes,
        {
          fieldName: "",
          fieldType: 1,
          isRequired: false
        }
      ]
    });
  };

  const saveForm = () => {
    if (!currentForm.formName) {
      toast.error("Please enter a form name");
      return;
    }

    if (currentForm.fieldNameWithTypes.some(f => !f.fieldName)) {
      toast.error("Please fill in all field names");
      return;
    }

    setPollUnitData({
      ...pollUnitData,
      formFields: [currentForm], // Only keep the current form
      surveys: [], // Clear other types
      voteQuestions: [] // Clear other types
    });
    toast.success("Form saved successfully");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!pollUnitData.title || !pollUnitData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!pollUnitData.surveys.length && !pollUnitData.voteQuestions.length && !pollUnitData.formFields.length) {
      toast.error("Please add at least one survey, vote, or form");
      return;
    }

    try {
      setSaving(true);
      const response = await fetch('https://bravoadmin.uplms.org/api/PollUnit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pollUnitData)
      });

      if (response.ok) {
        toast.success("Poll unit created successfully");
        router.push('/admin/dashboard/poll-unit');
      } else {
        throw new Error('Failed to create poll unit');
      }
    } catch (error) {
      console.error('Error creating poll unit:', error);
      toast.error("Failed to create poll unit");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <button
              onClick={() => router.push("/admin/dashboard/poll-unit")}
              className="text-gray-500 hover:text-gray-700 flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <h1 className="text-2xl font-semibold mt-2">Create Poll Unit</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Main Content */}
          <div className="space-y-6">
            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("main")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "main"
                      ? "bg-emerald-50 text-emerald-600"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Basic Info
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("surveys")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "surveys"
                      ? "bg-emerald-50 text-emerald-600"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <ClipboardList className="w-4 h-4" />
                  Survey {pollUnitData.surveys.length ? "(1)" : ""}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("voting")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "voting"
                      ? "bg-emerald-50 text-emerald-600"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Vote className="w-4 h-4" />
                  Vote {pollUnitData.voteQuestions.length ? "(1)" : ""}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("forms")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "forms"
                      ? "bg-emerald-50 text-emerald-600"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <FormInput className="w-4 h-4" />
                  Form {pollUnitData.formFields.length ? "(1)" : ""}
                </button>
              </div>
            </div>

            {/* Content Sections */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {/* Main Info Section */}
              {activeTab === "main" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={pollUnitData.title}
                      onChange={handlePollUnitDataChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Enter poll unit title"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={pollUnitData.description}
                      onChange={handlePollUnitDataChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Enter poll unit description"
                      rows={4}
                      required
                    />
                  </div>
                </div>
              )}

              {/* Surveys Section */}
              {activeTab === "surveys" && (
                <div className="space-y-6">
                  {pollUnitData.surveys.length > 0 ? (
                    <div className="bg-emerald-50 text-emerald-600 px-4 py-3 rounded-lg flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      Survey has been added. You can modify it or create a new one.
                    </div>
                  ) : null}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Survey Title
                    </label>
                    <input
                      type="text"
                      value={currentSurvey.title}
                      onChange={(e) => setCurrentSurvey({ ...currentSurvey, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Enter survey title"
                    />
                  </div>

                  {currentSurvey.questions.map((question, qIndex) => (
                    <div key={qIndex} className="bg-gray-50 rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-700">Question {qIndex + 1}</h3>
                        {qIndex > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              const updatedQuestions = currentSurvey.questions.filter((_, i) => i !== qIndex);
                              setCurrentSurvey({
                                ...currentSurvey,
                                questions: updatedQuestions
                              });
                            }}
                            className="text-red-500 hover:text-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <input
                        type="text"
                        value={question.questionText}
                        onChange={(e) => updateSurveyQuestion(qIndex, 'questionText', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="Enter your question"
                      />

                      <div className="space-y-2">
                        {question.options.map((option, oIndex) => (
                          <div key={oIndex} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={option.optionText}
                              onChange={(e) => {
                                const updatedQuestions = [...currentSurvey.questions];
                                updatedQuestions[qIndex].options[oIndex].optionText = e.target.value;
                                setCurrentSurvey({
                                  ...currentSurvey,
                                  questions: updatedQuestions
                                });
                              }}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                              placeholder={`Option ${oIndex + 1}`}
                            />
                            {question.options.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updatedQuestions = [...currentSurvey.questions];
                                  updatedQuestions[qIndex].options = question.options.filter(
                                    (_, idx) => idx !== oIndex
                                  );
                                  setCurrentSurvey({
                                    ...currentSurvey,
                                    questions: updatedQuestions
                                  });
                                }}
                                className="text-gray-400 hover:text-red-500"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addOptionToSurveyQuestion(qIndex)}
                          className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                        >
                          <Plus className="w-4 h-4" />
                          Add Option
                        </button>
                      </div>

                      <div className="flex items-center gap-4 pt-2">
                        <label className="flex items-center gap-2 text-sm text-gray-600">
                          <input
                            type="checkbox"
                            checked={question.isRequired}
                            onChange={(e) => updateSurveyQuestion(qIndex, 'isRequired', e.target.checked)}
                            className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          Required
                        </label>
                        <label className="flex items-center gap-2 text-sm text-gray-600">
                          <input
                            type="checkbox"
                            checked={question.allowMultipleSelection}
                            onChange={(e) => updateSurveyQuestion(qIndex, 'allowMultipleSelection', e.target.checked)}
                            className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          Multiple Selection
                        </label>
                      </div>
                    </div>
                  ))}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={addQuestionToSurvey}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      <Plus className="w-4 h-4" />
                      Add Question
                    </button>
                    <button
                      type="button"
                      onClick={saveSurvey}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                    >
                      <Save className="w-4 h-4" />
                      Save Survey
                    </button>
                  </div>
                </div>
              )}

              {/* Voting Section */}
              {activeTab === "voting" && (
                <div className="space-y-6">
                  {pollUnitData.voteQuestions.length > 0 ? (
                    <div className="bg-emerald-50 text-emerald-600 px-4 py-3 rounded-lg flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      Vote question has been added. You can modify it or create a new one.
                    </div>
                  ) : null}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vote Question
                    </label>
                    <input
                      type="text"
                      value={currentVote.questionText}
                      onChange={(e) => setCurrentVote({ ...currentVote, questionText: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Enter your voting question"
                    />
                  </div>

                  <div className="space-y-2">
                    {currentVote.options.map((option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={option.optionText}
                          onChange={(e) => {
                            const updatedOptions = [...currentVote.options];
                            updatedOptions[index].optionText = e.target.value;
                            setCurrentVote({
                              ...currentVote,
                              options: updatedOptions
                            });
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder={`Option ${index + 1}`}
                        />
                        {currentVote.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentVote({
                                ...currentVote,
                                options: currentVote.options.filter((_, i) => i !== index)
                              });
                            }}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={addOptionToVote}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      <Plus className="w-4 h-4" />
                      Add Option
                    </button>
                    <button
                      type="button"
                      onClick={saveVote}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                    >
                      <Save className="w-4 h-4" />
                      Save Vote
                    </button>
                  </div>
                </div>
              )}

              {/* Forms Section */}
              {activeTab === "forms" && (
                <div className="space-y-6">
                  {pollUnitData.formFields.length > 0 ? (
                    <div className="bg-emerald-50 text-emerald-600 px-4 py-3 rounded-lg flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      Form has been added. You can modify it or create a new one.
                    </div>
                  ) : null}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Form Name
                    </label>
                    <input
                      type="text"
                      value={currentForm.formName}
                      onChange={(e) => setCurrentForm({ ...currentForm, formName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Enter form name"
                    />
                  </div>

                  {currentForm.fieldNameWithTypes.map((field, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-700">Field {index + 1}</h3>
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentForm({
                                ...currentForm,
                                fieldNameWithTypes: currentForm.fieldNameWithTypes.filter((_, i) => i !== index)
                              });
                            }}
                            className="text-red-500 hover:text-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Field Name
                          </label>
                          <input
                            type="text"
                            value={field.fieldName}
                            onChange={(e) => {
                              const updatedFields = [...currentForm.fieldNameWithTypes];
                              updatedFields[index] = {
                                ...field,
                                fieldName: e.target.value
                              };
                              setCurrentForm({
                                ...currentForm,
                                fieldNameWithTypes: updatedFields
                              });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder="Enter field name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Field Type
                          </label>
                          <select
                            value={field.fieldType}
                            onChange={(e) => {
                              const updatedFields = [...currentForm.fieldNameWithTypes];
                              updatedFields[index] = {
                                ...field,
                                fieldType: parseInt(e.target.value)
                              };
                              setCurrentForm({
                                ...currentForm,
                                fieldNameWithTypes: updatedFields
                              });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          >
                            <option value={1}>Text</option>
                            <option value={2}>Number</option>
                            <option value={3}>Email</option>
                            <option value={4}>Date</option>
                            <option value={5}>DateTime</option>
                            <option value={6}>TextArea</option>
                          </select>
                        </div>
                      </div>

                      <label className="flex items-center gap-2 text-sm text-gray-600">
                        <input
                          type="checkbox"
                          checked={field.isRequired}
                          onChange={(e) => {
                            const updatedFields = [...currentForm.fieldNameWithTypes];
                            updatedFields[index] = {
                              ...field,
                              isRequired: e.target.checked
                            };
                            setCurrentForm({
                              ...currentForm,
                              fieldNameWithTypes: updatedFields
                            });
                          }}
                          className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        Required Field
                      </label>
                    </div>
                  ))}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={addFieldToForm}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      <Plus className="w-4 h-4" />
                      Add Field
                    </button>
                    <button
                      type="button"
                      onClick={saveForm}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                    >
                      <Save className="w-4 h-4" />
                      Save Form
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.push('/admin/dashboard/poll-unit')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !pollUnitData.title || !pollUnitData.description || 
                (!pollUnitData.surveys.length && !pollUnitData.voteQuestions.length && !pollUnitData.formFields.length)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-t-white border-r-white border-b-white border-l-transparent rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Create Poll Unit
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}