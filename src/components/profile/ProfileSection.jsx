"use client";
import React, { useState, useEffect, useRef } from "react";

// ProfileSection component - Enhanced card with hover effect
const ProfileSection = ({ title, icon: Icon, children, className = "" }) => (
  <div
    className={`bg-white rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg ${className}`}
  >
    <div className="flex items-center mb-5">
      {Icon && (
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#ecfcfb] text-[#0AAC9E] mr-3">
          <Icon className="w-5 h-5" />
        </div>
      )}
      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
    </div>
    <div className="space-y-1">{children}</div>
  </div>
);

export default ProfileSection;
