// components/faq/QuestionTab.jsx
import React, { useState } from "react";
import { Plus, Edit, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import Pagination from "@/components/ListPagination";

const QuestionTab = ({
  questions,
  categories,
  handleEditQuestion,
  deleteQuestion,
  resetQuestionForm,
  setShowQuestionModal,
  pagination,
  onPageChange,
}) => {
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  // Toggle expanded question
  const toggleExpandQuestion = (id) => {
    if (expandedQuestion === id) {
      setExpandedQuestion(null);
    } else {
      setExpandedQuestion(id);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">FAQ Questions</h2>
        <button
          onClick={() => {
            resetQuestionForm();
            setShowQuestionModal(true);
          }}
          className="flex items-center gap-2 bg-[#0AAC9E] text-white px-4 py-2 rounded-md hover:bg-[#099b8e]"
          disabled={categories.length === 0}
        >
          <Plus size={16} />
          <span>Add Question</span>
        </button>
      </div>

      {questions.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">
            {categories.length === 0
              ? "Please create a category first before adding questions."
              : "No questions found. Create your first question."}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4 bg-white rounded-lg shadow overflow-hidden">
            {questions.map((question) => (
              <div key={question.id} className="border-b last:border-b-0">
                <div
                  className="px-6 py-4 flex justify-between items-center cursor-pointer"
                  onClick={() => toggleExpandQuestion(question.id)}
                >
                  <div className="flex-1">
                    <div className="flex items-center">
                      <span
                        className={`px-2 mr-2  inline-flex text-xs leading-5 font-medium rounded-full ${
                          question.isActive
                            ? "bg-[#f9f9f9] text-[#0AAC9E]"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {question.isActive ? "Active" : "Inactive"}
                      </span>
                      <span className="text-sm text-[#404040] mr-2">
                        {question.faqCategoryName}
                      </span>
                    </div>
                    <h3 className="text-base font-medium text-gray-900 mt-1">
                      {question.questionText}
                    </h3>
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditQuestion(question);
                      }}
                      className="text-gray-400 p-2  hover:text-[#0AAC9E] hover:bg-[#f2fdfc] mr-3"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteQuestion(question.id);
                      }}
                      className="text-gray-400 p-2 hover:text-red-600 hover:bg-red-50 mr-3"
                    >
                      <Trash2 size={14} />
                    </button>
                    {expandedQuestion === question.id ? (
                      <ChevronUp size={16} className="text-gray-500" />
                    ) : (
                      <ChevronDown size={16} className="text-gray-500" />
                    )}
                  </div>
                </div>

                {expandedQuestion === question.id && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <div className="mb-2 text-sm text-gray-500">
                      <span className="font-medium">Order:</span>{" "}
                      {question.order}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">
                        Answer:
                      </h4>
                      <p className="text-gray-600 whitespace-pre-wrap">
                        {question.answerText}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* New Pagination Component */}
            <Pagination
              totalItems={pagination.totalItems}
              currentPage={pagination.currentPage}
              onPageChange={onPageChange}
              itemsPerPage={pagination.pageSize}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default QuestionTab;
