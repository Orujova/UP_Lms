"use client";
import React from "react";

const MainTabButtons = ({
  activeMainTab,
  setActiveMainTab,
  name1,
  name2,
  text1,
  text2,
}) => {
  return (
    <div className="flex border-b border-gray-200 mb-6">
      <button
        onClick={() => setActiveMainTab(text1)}
        className={`
          px-6 py-3 
          border-b-2 
          font-medium 
          transition-colors 
          ${
            activeMainTab === text1
              ? `border-[#0AAC9E] text-[#0AAC9E]`
              : "border-transparent text-gray-500 hover:text-gray-700"
          }
        `}
      >
        {name1}
      </button>
      <button
        onClick={() => setActiveMainTab(text2)}
        className={`
          px-6 py-3 
          border-b-2 
          font-medium 
          transition-colors 
          ${
            activeMainTab === text2
              ? `border-[#0AAC9E] text-[#0AAC9E]`
              : "border-transparent text-gray-500 hover:text-gray-700"
          }
        `}
      >
        {name2}
      </button>
    </div>
  );
};

export default MainTabButtons;
