"use client";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setTargetPage } from "@/redux/course/courseSlice";
import { createCourse } from "@/api/course";

// Import styles
import "./targetGroups.scss";
import TargetComponentList from "../targetComponentList";

export default function TargetGroups() {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get all required data from Redux store
  const courseState = useSelector((state) => state.courseReducer);

  // Handle button clicks
  const handleBackClick = () => {
    dispatch(setTargetPage("courseContent"));
  };

  const validateCourseData = (data) => {
    // Basic validation
    if (!data.formData.Name?.trim()) {
      throw new Error("Course name is required");
    }
    if (!data.formData.Description?.trim()) {
      throw new Error("Course description is required");
    }
    if (!data.sections?.length) {
      throw new Error("At least one section is required");
    }

    // Add more specific validations as needed
    return true;
  };

  const handleSaveClick = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Log initial state for debugging
      console.group("Course Creation - Initial Data");
      console.log("Form Data:", courseState.formData);
      console.log("Succession Rates:", courseState.successionRates);
      console.log("Sections:", courseState.sections);
      console.groupEnd();

      // Validate data before submission
      validateCourseData(courseState);

      // Submit the course
      const result = await createCourse(courseState);

      // Log success
      console.log("Course created successfully:", result);

      // Show success message or redirect
      // You might want to add a success notification system here
      alert("Course created successfully!");

      // Optionally redirect to courses list or clear the form
      // router.push('/courses'); // If using Next.js router
    } catch (error) {
      console.error("Failed to create course:", error);

      // Set error message for display
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to create course"
      );

      // Show error to user
      alert(error.message || "Failed to create course. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const [targetButton, setTargetButton] = useState("Saved targets");

  return (
    <div className="targetGroups">
      <h3>Select target group</h3>

      <div className="targetButtons">
        <div
          className={`${
            targetButton === "Saved targets" ? "active" : null
          } targetButton`}
          onClick={() => {
            setTargetButton("Saved targets");
          }}
        >
          Saved targets
        </div>
        <div
          className={`${
            targetButton === "New target" ? "active" : null
          } targetButton`}
          onClick={() => {
            setTargetButton("New target");
          }}
        >
          New target
        </div>
      </div>

      {targetButton === "Saved targets" ? <TargetComponentList /> : null}

      {/* Error display */}
      {error && <div className="error-message">{error}</div>}

      {/* Main content */}
      <div className="content">{/* Add your target groups content here */}</div>

      {/* Bottom Navigation Buttons */}
      <div className="navigation-buttons">
        <button
          className="nav-button"
          onClick={handleBackClick}
          disabled={isLoading}
        >
          Back
        </button>
        <button
          className="nav-button save-button"
          onClick={handleSaveClick}
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Save"}
        </button>
      </div>

      <style jsx>{`
        .error-message {
          color: #dc2626;
          background-color: #fef2f2;
          padding: 1rem;
          margin: 1rem 0;
          border-radius: 0.5rem;
          border: 1px solid #fee2e2;
        }

        .navigation-buttons {
          margin-top: 2rem;
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }

        .nav-button {
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          font-weight: 500;
          transition: all 0.2s;
        }

        .nav-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .save-button {
          background-color: #2563eb;
          color: white;
        }

        .save-button:hover:not(:disabled) {
          background-color: #1d4ed8;
        }
      `}</style>
    </div>
  );
}
