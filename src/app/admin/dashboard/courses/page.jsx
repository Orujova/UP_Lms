"use client";

import { useEffect } from "react";
import ControlsButtons from "@/components/controlsButtons";
import CourseComponent from "@/components/courseComponent";
import { useDispatch } from "react-redux";
import { courseAsync } from "@/redux/course/course";
import { useSelector } from "react-redux";

//style
import "./courses.scss";

export default function Page() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(courseAsync());
  }, [dispatch]);

  const coursesData = useSelector((state) => state.course.data);

  return (
    <div className="courses">
      <ControlsButtons
        count={"32"}
        text={"Courses in Total"}
        link="/admin/dashboard/courses/add"
        buttonText={"Add Course"}
      />
      <CourseComponent />
    </div>
  );
}
