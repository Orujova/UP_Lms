import React from "react";
import { Plus } from "lucide-react";

const TabButtons = ({ activeTab, setActiveTab, handleAddNew, isEditing }) => {
  return (
    <div className="flex border-b">
      <button
        onClick={() => setActiveTab("list")}
        className={`
          px-6 py-3 
          border-b-2 
          font-medium 
          transition-colors 
          ${
            activeTab === "list"
              ? `border-[#127D74] text-[#127D74]`
              : "border-transparent text-gray-500 hover:text-gray-700"
          }
        `}
      >
        Position List
      </button>
      <button
        onClick={handleAddNew}
        className={`
          px-6 py-3 
          border-b-2 
          font-medium 
          flex items-center 
          transition-colors 
          ${
            activeTab === "form"
              ? `border-[#127D74] text-[#127D74]`
              : "border-transparent text-gray-500 hover:text-gray-700"
          }
        `}
      >
        <Plus size={16} className="mr-2" />
        {isEditing ? "Edit Position" : "New Position"}
      </button>
    </div>
  );
};

export default TabButtons;
