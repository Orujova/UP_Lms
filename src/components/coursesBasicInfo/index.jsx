"use client";

import React, { useEffect } from "react";
import InputComponent from "@/components/inputComponent";
import TextAreaComponent from "../textAreaComponent";
import SelectComponent from "../selectComponent";
import VerifyComponent from "../verifyComponent";
import CoverImage from "@/components/coverImage";
import { useDispatch, useSelector } from "react-redux";
import { courseCategoryAsync } from "@/redux/courseCategory/courseCategory";
import {
  setFormData,
  setImagePreview,
  setCoverImage,
  setTargetPage,
  setTarget,
} from "@/redux/course/courseSlice";

//style
import "./coursesBasicInfo.scss";

//image
import courseCover from "@/images/coursesCover.svg";

export default function CoursesBasicInfo() {
  const dispatch = useDispatch();

  // Access Redux state
  const formData = useSelector((state) => state.courseReducer.formData);
  const imagePreview =
    useSelector((state) => state.courseReducer.formData.imagePreview) ||
    courseCover;
  const courseCategory =
    useSelector((state) => state.courseCategory.data) || [];

  useEffect(() => {
    // Fetch course categories when the component mounts
    dispatch(courseCategoryAsync());
  }, [dispatch]);

  // Update form data in Redux
  const handleChange = (e) => {
    const { name, value } = e.target;
    dispatch(setFormData({ [name]: value }));
  };

  // Handle image upload and update Redux state
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        dispatch(setImagePreview(reader.result)); // Update image preview
      };
      reader.readAsDataURL(file);
      dispatch(setCoverImage(file)); // Store file in Redux
    }
  };

  // Submit form and navigate to the next page
  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(setTargetPage("courseContent")); // Update the current page in Redux
    dispatch(setTarget()); // Update target progress based on current page
  };

  return (
    <form className="coursesBasicInfo" onSubmit={handleSubmit}>
      {/* Cover Image component with image preview and upload handler */}
      <CoverImage
        src={imagePreview}
        alt="course cover"
        onImageUpload={handleImageUpload}
      />
      <div className="form">
        <InputComponent
          text="Course name"
          required
          className="col6"
          name="courseName"
          value={formData.courseName}
          onChange={handleChange}
        />
        <SelectComponent
          text="Category"
          required
          className="col6"
          name="category"
          value={formData.category}
          onChange={handleChange}
          options={courseCategory}
        />
        <TextAreaComponent
          text="Description"
          required
          className="col12"
          name="description"
          value={formData.description}
          onChange={handleChange}
        />
        <SelectComponent
          text="Tag"
          className="col6"
          name="tag"
          value={formData.tag}
          onChange={handleChange}
        />
        <div className="duration">8 hrs 40 mins</div>
        <VerifyComponent
          text="Verified Certificate"
          checked={formData.verifiedCertificate}
          onChange={(e) =>
            handleChange({
              target: { name: "verifiedCertificate", value: e.target.checked },
            })
          }
        />
      </div>
      <div className="buttons">
        <button type="submit" className="next">
          Next
        </button>
        <button type="button" className="cancel">
          Cancel
        </button>
      </div>
    </form>
  );
}
