import { Filter, Download, CirclePlus } from "lucide-react";
import Link from "next/link";
import "./controlsButtons.scss";
import { useState } from "react";
import { getToken } from "@/authtoken/auth.js";

export default function ControlsButtons({
  count,
  text,
  link,
  buttonText,
  onFilterClick,
  activeFilters = {},
}) {
  const [exporting, setExporting] = useState(false);

  // Handle export function with proper parameters
  const handleExport = async () => {
    try {
      setExporting(true);

      // Build query parameters from active filters with proper parameter names
      const queryParams = new URLSearchParams();

      // Map the filter keys to API parameter names (camelCase to PascalCase)
      const parameterMap = {
        functionalAreaId: "FunctionalAreaId",
        departmentId: "DepartmentId",
        projectId: "ProjectId",
        divisionId: "DivisionId",
        subDivisionId: "SubDivisionId",
        positionGroupId: "PositionGroupId",
        positionId: "PositionId",
      };

      // Add all non-empty filters to query params with proper parameter names
      Object.entries(activeFilters).forEach(([key, value]) => {
        if (value) {
          const apiParamName = parameterMap[key] || key;
          queryParams.append(apiParamName, value);
        }
      });

      // Add ShowMore.Take parameter for pagination (default to 1000)
      queryParams.append("ShowMore.Take", "1000");

      // Get the token for authorization
      const token = getToken();

      // Create the API URL with query parameters
      const apiUrl = `https://bravoadmin.uplms.org/api/AdminApplicationUser/export-app-users?${queryParams.toString()}`;

      // Fetch the file
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(
          `Export failed: ${response.status} ${response.statusText}`
        );
      }

      // Get the file from response
      const blob = await response.blob();

      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;

      // Get filename from response headers or use default with timestamp
      const contentDisposition = response.headers.get("content-disposition");
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const fileName = contentDisposition
        ? contentDisposition.split("filename=")[1].replace(/"/g, "")
        : `users_export_${timestamp}.xlsx`;

      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();

      // Clean up
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export data. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="controls-header">
      <div className="stats">
        <h2>{count}</h2>
        <span>{text}</span>
      </div>
      <div className="actions">
        <button className="btn btn-secondary" onClick={onFilterClick}>
          <Filter size={16} />
          <span>Filter</span>
        </button>
        <Link href={link} className="btn btn-primary">
          <CirclePlus size={16} />
          <span>{buttonText}</span>
        </Link>
        <button
          className="btn btn-secondary"
          onClick={handleExport}
          disabled={exporting}
        >
          {exporting ? (
            <>
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Exporting...</span>
            </>
          ) : (
            <>
              <Download size={16} />
              <span>Export</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
