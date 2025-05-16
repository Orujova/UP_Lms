"use client";

import React from "react";
import { Bell } from "lucide-react";

const Settings = ({
  priority,
  scheduledDate,
  expiryDate,
  hasNotification,
  onInputChange,
}) => {
  return (
    <div className="bg-white rounded-lg p-5 border border-gray-200">
      <h2 className="text-base font-medium mb-4">Settings</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Priority
          </label>
          <select
            name="Priority"
            value={priority}
            onChange={onInputChange}
            className="mt-1 block w-full text-sm rounded-md border border-gray-300 px-3 py-2 focus:border-[#01DBC8] focus:ring-[#01DBC8]"
            required
          >
            <option value="LOW">Low</option>
            <option value="NORMAL">Normal</option>
            <option value="HIGH">High</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Schedule Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="ScheduledDate"
            value={scheduledDate}
            onChange={onInputChange}
            className="mt-1 block w-full text-sm rounded-md border border-gray-300 px-3 py-2 focus:border-[#01DBC8] focus:ring-[#01DBC8]"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Expiry Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="ExpiryDate"
            value={expiryDate}
            onChange={onInputChange}
            className="mt-1 block w-full text-sm rounded-md border border-gray-300 px-3 py-2 focus:border-[#01DBC8] focus:ring-[#01DBC8]"
            required
          />
        </div>
      </div>

      {/* Notification Toggle */}
      <div className="mt-6">
        <button
          type="button"
          className="flex items-center space-x-3 cursor-pointer bg-gray-50 hover:bg-gray-100 px-4 py-3 rounded-lg w-full transition-colors duration-200 border border-gray-200"
          onClick={() =>
            onInputChange({
              target: {
                name: "HasNotification",
                type: "checkbox",
                checked: !hasNotification,
              },
            })
          }
        >
          <div
            className={`relative w-12 h-6 flex items-center rounded-full p-1 transition duration-300 ease-in-out ${
              hasNotification ? "bg-[#0AAC9E]" : "bg-gray-300"
            }`}
          >
            <div
              className={`absolute bg-white w-5 h-5 rounded-full shadow-md transform transition duration-300 ease-in-out ${
                hasNotification ? "right-1" : "left-1"
              }`}
            ></div>
          </div>
          <span className="flex items-center gap-2 flex-1 text-left">
            <Bell
              size={18}
              className={hasNotification ? "text-[#0AAC9E]" : "text-gray-400"}
            />
            <span className="text-sm font-medium text-gray-700">
              Send push notification
            </span>
          </span>
          {hasNotification && (
            <span className="px-2 py-1 rounded-md bg-[#E6FAF8] text-[#0AAC9E] text-xs font-semibold">
              Enabled
            </span>
          )}
          <input
            type="checkbox"
            className="hidden"
            name="HasNotification"
            checked={hasNotification}
            onChange={onInputChange}
          />
        </button>
      </div>
    </div>
  );
};

export default Settings;
