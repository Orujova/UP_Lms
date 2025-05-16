import React, { useState, useRef } from 'react';
import Image from 'next/image';

const StyledUploadModal = ({ 
    isVisible, 
    onClose, 
    uploadIcon,
    pdfIcon,
    excelIcon,
    pptxIcon,
    isEditing = false,
    initialFile = null
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState(initialFile);
    const fileInputRef = useRef(null);

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const processFile = (file) => {
        if (file) {
            const fileType = file.name.split('.').pop().toLowerCase();
            let icon;
            
            if (fileType === 'pdf') {
                icon = pdfIcon;
            } else if (['xls', 'xlsx'].includes(fileType)) {
                icon = excelIcon;
            } else if (['ppt', 'pptx'].includes(fileType)) {
                icon = pptxIcon;
            } else {
                icon = uploadIcon;
            }

            setSelectedFile({
                file,
                icon,
                name: file.name,
                type: fileType
            });
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        processFile(file);
    };

    const handleFileSelect = (e) => {
        e.preventDefault(); // Add this
        const file = e.target.files[0];
        if (file) {
            processFile(file);
        }
    };

    const handleBrowseClick = (e) => {
        e.preventDefault(); // Add this
        e.stopPropagation(); // Add this
        fileInputRef.current?.click();
    };

    const handleSave = (e) => {
        e?.preventDefault();
        if (selectedFile) {
            onClose({
                file: selectedFile.file,
                fileName: selectedFile.name,
                fileType: selectedFile.type,
                icon: selectedFile.icon,
            });
        }
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] backdrop-blur-sm">
            <div 
                className="bg-white rounded-xl shadow-2xl w-11/12 max-w-lg"
                onClick={e => e.stopPropagation()}
            >
                <div className="px-6 py-4 border-b flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-gray-800">
                        {isEditing ? 'Replace File' : 'Upload File'}
                    </h3>
                    <button 
                        type="button"
                        onClick={() => onClose(null)}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        ✕
                    </button>
                </div>

                <div className="p-8">
                    <div 
                        className={`
                            border-2 border-dashed rounded-lg 
                            ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'} 
                            ${selectedFile ? 'bg-gray-50' : ''}
                            transition-colors duration-200
                        `}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                    >
                        <div className="text-center p-8 space-y-4">
                            {selectedFile ? (
                                <div className="space-y-4">
                                    <div className="w-16 h-16 mx-auto relative">
                                        <Image 
                                            src={selectedFile.icon} 
                                            alt={selectedFile.type}
                                            layout="fill"
                                            objectFit="contain"
                                        />
                                    </div>
                                    <div className="text-sm font-medium text-gray-900">
                                        {selectedFile.name}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setSelectedFile(null);
                                        }}
                                        className="text-sm text-red-600 hover:text-red-700"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="w-16 h-16 mx-auto relative">
                                        <Image 
                                            src={uploadIcon} 
                                            alt="Upload"
                                            layout="fill"
                                            objectFit="contain"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-gray-600">
                                            {isDragging ? 'Drop your file here' : 'Drag and drop your file here, or'}
                                        </p>
                                        {!isDragging && (
                                            <button
                                                type="button"
                                                onClick={handleBrowseClick}
                                                className="px-6 py-2 bg-blue-600 text-white rounded-lg 
                                                        hover:bg-blue-700 hover:shadow-lg transition-all duration-200
                                                        text-sm font-medium"
                                            >
                                                Browse Files
                                            </button>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                        onChange={handleFileSelect}
                        onClick={(e) => e.stopPropagation()} // Add this
                    />

                    <div className="mt-4 text-center">
                        <p className="text-sm text-gray-500">
                            Supported formats: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX
                        </p>
                    </div>
                </div>

                <div className="px-6 py-4 border-t flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => onClose(null)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 
                                hover:bg-gray-50 hover:border-gray-400 transition-all duration-200
                                text-sm font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={!selectedFile}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg 
                                hover:bg-blue-700 hover:shadow-lg transition-all duration-200
                                text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isEditing ? 'Replace File' : 'Upload File'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StyledUploadModal;