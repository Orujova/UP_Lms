// src/components/announcement/Description.jsx
"use client";

import React from "react";

const Description = ({ shortDescription, fullDescription, onInputChange }) => {
  return (
    <div className="bg-white rounded-lg p-5 border border-gray-200">
      <h2 className="text-base font-medium mb-4">Description</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Short Description <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="ShortDescription"
            value={shortDescription}
            onChange={onInputChange}
            className="mt-1 block w-full rounded-md text-sm border border-gray-300 px-3 py-2 focus:border-[#01DBC8] focus:ring-[#01DBC8]"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Full Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="Description"
            value={fullDescription}
            onChange={onInputChange}
            rows={4}
            className="mt-1 block w-full rounded-md border text-sm border-gray-300 px-3 py-2 outline-0 focus:border-[#01DBC8] focus:ring-[#01DBC8]"
            required
          />
        </div>
      </div>
    </div>
  );
};

export default Description;
