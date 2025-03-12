// src/components/announcement/BasicInfo.jsx
"use client";

import React from "react";

const BasicInfo = ({ title, subtitle, onInputChange }) => {
  return (
    <div className="bg-white rounded-lg p-5 border border-gray-200">
      <h2 className="text-base font-medium mb-4">Basic Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="Title"
            value={title}
            onChange={onInputChange}
            className="mt-1 block w-full rounded-md border text-sm border-gray-300 px-3 py-2 focus:border-[#01DBC8] focus:ring-[#01DBC8]"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Subtitle
          </label>
          <input
            type="text"
            name="SubTitle"
            value={subtitle}
            onChange={onInputChange}
            className="mt-1 block w-full rounded-md border text-sm border-gray-300 px-3 py-2 focus:border-[#01DBC8] focus:ring-[#01DBC8]"
          />
        </div>
      </div>
    </div>
  );
};

export default BasicInfo;
