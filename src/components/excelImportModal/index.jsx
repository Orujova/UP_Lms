"use client";
import React, { useState, useRef } from "react";
import {
  Upload,
  FileUp,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { getToken } from "@/authtoken/auth.js";
import { toast } from "sonner";

const ExcelImportModal = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // 'success', 'error', or null
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check if file is Excel
      if (
        selectedFile.type === "application/vnd.ms-excel" ||
        selectedFile.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      ) {
        setFile(selectedFile);
        setUploadStatus(null);
        setErrorMessage("");
      } else {
        setFile(null);
        setUploadStatus("error");
        setErrorMessage("Please select a valid Excel file (.xls or .xlsx)");
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (
        droppedFile.type === "application/vnd.ms-excel" ||
        droppedFile.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      ) {
        setFile(droppedFile);
        setUploadStatus(null);
        setErrorMessage("");
      } else {
        setFile(null);
        setUploadStatus("error");
        setErrorMessage("Please select a valid Excel file (.xls or .xlsx)");
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadStatus(null);

    try {
      // API config
      const token = getToken();
      const API_URL = "https://demoadmin.databyte.app/api/";

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_URL}Position/import-excel`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to import positions");
      }

      setUploadStatus("success");

      // Show success toast
      toast.success("Positions imported successfully!");

      setTimeout(() => {
        onSuccess && onSuccess();
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Import error:", error);
      setUploadStatus("error");
      setErrorMessage(error.message || "Failed to import Excel file");
      toast.error(error.message || "Failed to import Excel file");
    } finally {
      setIsUploading(false);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setUploadStatus(null);
    setErrorMessage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-700">
            Import Positions from Excel
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div
            className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer
              ${
                file
                  ? "border-[#01DBC8] bg-[#f2fdfc]"
                  : "border-gray-300 hover:border-gray-400"
              } 
              ${uploadStatus === "error" ? "border-red-400 bg-red-50" : ""}
            `}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
          >
            <input
              type="file"
              accept=".xls,.xlsx"
              className="hidden"
              onChange={handleFileChange}
              ref={fileInputRef}
            />

            {!file && uploadStatus !== "success" && (
              <>
                <Upload size={36} className="text-gray-400 mb-3" />
                <p className="text-sm text-gray-600 text-center mb-2">
                  Drag and drop your Excel file here or click to browse
                </p>
                <p className="text-xs text-gray-500 text-center">
                  Supports .xls or .xlsx files
                </p>
              </>
            )}

            {file && uploadStatus !== "success" && (
              <div className="flex flex-col items-center">
                <FileUp size={28} className="text-[#01DBC8] mb-2" />
                <p className="text-sm font-medium text-gray-800 mb-1">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    resetUpload();
                  }}
                  className="mt-3 text-xs text-red-500 hover:text-red-700 flex items-center"
                >
                  <X size={14} className="mr-1" />
                  Remove file
                </button>
              </div>
            )}

            {uploadStatus === "success" && (
              <div className="flex flex-col items-center">
                <CheckCircle size={40} className="text-green-500 mb-2" />
                <p className="text-sm font-medium text-green-800">
                  Excel file imported successfully!
                </p>
              </div>
            )}

            {uploadStatus === "error" && (
              <div className="flex flex-col items-center">
                <AlertCircle size={36} className="text-red-500 mb-2" />
                <p className="text-sm font-medium text-red-800 text-center">
                  {errorMessage}
                </p>
              </div>
            )}
          </div>

          {uploadStatus === "error" && (
            <p className="mt-2 text-xs text-red-600">
              Please try uploading a valid Excel file with the correct format
            </p>
          )}

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              onClick={handleUpload}
              disabled={!file || isUploading || uploadStatus === "success"}
              className={`px-4 py-2 text-sm text-white rounded-md focus:outline-none focus:ring-2 transition-colors flex items-center
                ${
                  !file || isUploading || uploadStatus === "success"
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#0AAC9E] hover:bg-[#099385]"
                }
              `}
            >
              {isUploading ? (
                <>
                  <Loader2 size={14} className="animate-spin mr-2" />
                  Uploading...
                </>
              ) : (
                "Import"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExcelImportModal;
