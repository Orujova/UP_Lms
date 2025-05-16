import React, { useState } from 'react';
import dynamic from 'next/dynamic';

const PageTextComponent = dynamic(() => import('@/components/pageTextComponent'), {
  ssr: false
});

const StyledPageModal = ({
  isVisible,
  onClose,
  pageTitle,
  setPageTitle,
  pageDescription,
  setPageDescription,
  onSave,
  isEditing = false,
  initialContent = null
}) => {
  const [editorContent, setEditorContent] = useState(initialContent);

  const handleEditorChange = (content) => {
    setEditorContent(content);
  };

  const handleSave = () => {
    onSave({
      title: pageTitle,
      description: pageDescription,
      content: editorContent
    });
  };

  const handleClose = () => {
    setEditorContent(null);
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] backdrop-blur-sm">
      <div
        className="bg-white rounded-xl shadow-2xl w-11/12 max-w-7xl h-[98vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="shrink-0 sticky top-0 bg-white px-6 py-3 border-b flex justify-between items-center z-50">
          <h3 className="text-xl font-semibold text-gray-800">
            {isEditing ? 'Edit Page Content' : 'Add Page Content'}
          </h3>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Top Fields Container */}
            <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Page Title</label>
                <input
                  type="text"
                  value={pageTitle}
                  onChange={(e) => setPageTitle(e.target.value)}
                  placeholder="Enter an engaging title for your page"
                  className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg 
                            focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 
                            transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brief Description</label>
                <textarea
                  value={pageDescription}
                  onChange={(e) => setPageDescription(e.target.value)}
                  placeholder="Provide a brief description of your page content"
                  className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg 
                            h-16 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 
                            transition-all duration-200 resize-none"
                />
              </div>
            </div>

            {/* Editor Container */}
            <div className="bg-white rounded-lg border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 px-4 pt-3 pb-2">
                Page Content
              </label>
              <div className="min-h-[calc(70vh-8rem)] bg-white">
                <PageTextComponent
                  onChange={handleEditorChange}
                  desc={isEditing ? JSON.parse(initialContent) : null}
                  readOnly={false}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 sticky bottom-0 bg-white border-t px-6 py-3 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 
                     hover:bg-gray-50 hover:border-gray-400 transition-all duration-200
                     text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg 
                     hover:bg-blue-700 hover:shadow-lg transition-all duration-200
                     text-sm font-medium"
            disabled={!pageTitle.trim() || !pageDescription.trim()}
          >
            {isEditing ? 'Save Changes' : 'Save Page'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StyledPageModal;