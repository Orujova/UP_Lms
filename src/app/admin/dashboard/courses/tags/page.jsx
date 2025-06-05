// src/app/admin/dashboard/courses/tags/page.jsx

"use client";

import React from "react";

import CourseTagManagement from "@/components/course/TagManagement";

export default function TagsPage() {
  return (
    <div className="space-y-6">
   
      
      {/* Tag Management Component */}
      <CourseTagManagement />
    </div>
  );
}