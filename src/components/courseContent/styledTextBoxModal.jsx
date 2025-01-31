import React from 'react';

const StyledTextBoxModal = ({
  isVisible,
  onClose,
  textBoxContent,
  setTextBoxContent,
  onSave,
  isEditing = false
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-11/12 max-w-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-800">
            {isEditing ? 'Edit Text Content' : 'Add Text Content'}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4">
            <textarea
              maxLength="255"
              value={textBoxContent}
              onChange={(e) => setTextBoxContent(e.target.value)}
              placeholder="Enter up to 255 characters"
              className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg 
                        h-40 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 
                        transition-all duration-200"
            />
            <div className="text-sm text-gray-500 text-right">
              {textBoxContent.length}/255 characters
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            disabled={textBoxContent.trim().length === 0}
          >
            {isEditing ? 'Save Changes' : 'Add Content'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StyledTextBoxModal;