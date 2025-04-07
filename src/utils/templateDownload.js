import { toast } from "sonner";

/**
 * Download template from public/templates folder
 * @param {string} fileName - Name of the template file to download
 */
export const downloadTemplate = (fileName = "UserCreate") => {
  try {
    // Construct full path to the template
    const templatePath = `/templates/${fileName}`;

    // Create a temporary link element
    const link = document.createElement("a");
    link.href = templatePath;

    // Set download attribute with a clean filename
    link.download = fileName.replace(/[^a-z0-9.]/gi, "_");

    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Show success toast
    toast.success("Template downloaded successfully");
  } catch (error) {
    // Log and toast any download errors
    console.error("Template download error:", error);
    toast.error("Failed to download template");
  }
};

/**
 * Validate file for bulk upload
 * @param {File} file - File to validate
 * @returns {Object} Validation result
 */
export const validateBulkUploadFile = (file) => {
  // Supported file types
  const supportedTypes = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    "application/vnd.ms-excel", // .xls
    "text/csv", // .csv
  ];

  // Validation checks
  if (!file) {
    return {
      isValid: false,
      error: "No file selected",
    };
  }

  // Check file type
  if (!supportedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: "Invalid file type. Supported formats: .xlsx, .xls, .csv",
    };
  }

  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: "File size exceeds 10MB limit",
    };
  }

  // All checks passed
  return {
    isValid: true,
  };
};
