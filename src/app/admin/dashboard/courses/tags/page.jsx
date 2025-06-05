// src/app/admin/dashboard/courses/tags/page.jsx

"use client";

import React from "react";
import SectionTitle from "@/components/sectionTitle";
import CourseTagManagement from "@/components/course/TagManagement";

export default function TagsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <SectionTitle 
        title="Kurs Tag-ları" 
        description="Kursları təşkil etmək və süzmək üçün tag-ları idarə edin"
      />
      
      {/* Tag Management Component */}
      <CourseTagManagement />
    </div>
  );
}