// components/faq/QuestionModal.jsx
import React from "react";
import { X } from "lucide-react";

const QuestionModal = ({
  questionFormData,
  setQuestionFormData,
  isEditingQuestion,
  createQuestion,
  updateQuestion,
  setShowQuestionModal,
  categories,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center px-6 py-4 border-b sticky top-0 bg-white z-10">
          <h3 className="text-lg font-medium">
            {isEditingQuestion ? "Edit Question" : "Add New Question"}
          </h3>
          <button
            onClick={() => setShowQuestionModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={questionFormData.faqCategoryId}
              onChange={(e) =>
                setQuestionFormData({
                  ...questionFormData,
                  faqCategoryId: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question
            </label>
            <input
              type="text"
              value={questionFormData.questionText}
              onChange={(e) =>
                setQuestionFormData({
                  ...questionFormData,
                  questionText: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Enter question text"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Answer
            </label>
            <textarea
              value={questionFormData.answerText}
              onChange={(e) =>
                setQuestionFormData({
                  ...questionFormData,
                  answerText: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 min-h-[150px]"
              placeholder="Enter answer text"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Order
            </label>
            <input
              type="number"
              value={questionFormData.order}
              onChange={(e) =>
                setQuestionFormData({
                  ...questionFormData,
                  order: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Enter display order"
              min="0"
            />
          </div>

          {isEditingQuestion && (
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={questionFormData.isActive}
                  onChange={(e) =>
                    setQuestionFormData({
                      ...questionFormData,
                      isActive: e.target.checked,
                    })
                  }
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Active</span>
              </label>
            </div>
          )}

          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={() => setShowQuestionModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={isEditingQuestion ? updateQuestion : createQuestion}
              className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700"
              disabled={
                !questionFormData.questionText ||
                !questionFormData.answerText ||
                !questionFormData.faqCategoryId
              }
            >
              {isEditingQuestion ? "Update" : "Create"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionModal;
