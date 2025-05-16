import React from 'react';

const StyledUrlModal = ({
  isVisible,
  onClose,
  url,
  setUrl,
  onSave,
  isEditing = false
}) => {
  const isValidUrl = url.startsWith('http://') || url.startsWith('https://');

  if (!isVisible) return null;


  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-11/12 max-w-xl">
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-800">
            {isEditing ? 'Edit Web URL' : 'Add Web URL'}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg 
                          focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 
                          transition-all duration-200"
              />
              {url && !isValidUrl && (
                <p className="mt-2 text-sm text-red-600">
                  Please enter a valid URL starting with http:// or https://
                </p>
              )}
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
            disabled={!isValidUrl || !url.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {isEditing ? 'Save Changes' : 'Add URL'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StyledUrlModal;