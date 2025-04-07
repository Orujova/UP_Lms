"use client";
import React from "react";
import { Trophy } from "lucide-react";
const Placeholder = () => (
  <div className="bg-white rounded-lg shadow-sm p-6">
    <div className="flex items-center mb-6">
      <div className="w-10 h-10 rounded-full bg-[#ecfcfb] flex items-center justify-center mr-3">
        <Trophy className="text-[#0AAC9E] w-5 h-5" />
      </div>
      <h2 className="text-lg font-semibold text-gray-800">My Content</h2>
    </div>
    <div className="space-y-4">
      <p className="text-gray-500 text-center py-8">
        section will be implemented here
      </p>
    </div>
  </div>
);

export default Placeholder;
