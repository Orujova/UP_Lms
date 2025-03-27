import React from "react";
import { Bell, BellOff } from "lucide-react";

const Settings = ({
  priority,
  scheduledDate,
  expiryDate,
  hasNotification,
  onInputChange,
}) => {
  return (
    <div className="bg-white rounded-lg p-5 border border-gray-200">
      <h2 className="text-base font-medium mb-4 pb-2 border-b border-gray-100">
        Publication Settings
      </h2>

      {/* Priority Selection */}
      <div className="mb-5">
        <label className="block text-xs font-medium text-gray-700 mb-1.5">
          Priority
        </label>
        <select
          name="Priority"
          value={priority}
          onChange={onInputChange}
          className="w-full border text-xs border-gray-300 rounded-md px-3 py-2 text-gray-700 bg-white focus:outline-none focus:border-[#01DBC8] focus:ring-[#01DBC8] transition"
        >
          <option value="LOW">Low</option>
          <option value="NORMAL">Normal</option>
          <option value="HIGH">High</option>
        </select>
      </div>

      {/* Dates Section */}
      <div className="space-y-5">
        {/* Schedule Date */}
        <div>
          <label className="block  font-medium text-xs text-gray-700 mb-1.5">
            Schedule Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="ScheduledDate"
            value={scheduledDate}
            onChange={onInputChange}
            className="w-full border text-xs border-gray-300 rounded-md px-3 py-2 text-gray-700 focus:outline-none  focus:border-[#01DBC8] focus:ring-[#01DBC8]  transition"
            required
          />
        </div>

        {/* Expiry Date */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Expiry Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="ExpiryDate"
            value={expiryDate}
            onChange={onInputChange}
            className="w-full border text-xs border-gray-300 rounded-md px-3 py-2 text-gray-700 focus:outline-none  focus:border-[#01DBC8] focus:ring-[#01DBC8]  transition"
            required
          />
        </div>
      </div>

      {/* Notification Toggle */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <label className="flex items-center justify-between cursor-pointer">
          <div className="flex items-center space-x-3">
            {hasNotification ? (
              <Bell size={16} className="text-[#0AAC9E]" />
            ) : (
              <BellOff size={16} className="text-gray-400" />
            )}
            <span className="text-sm font-medium text-gray-700">
              Send push notification
            </span>
          </div>

          <div className="relative">
            <input
              type="checkbox"
              name="HasNotification"
              checked={hasNotification}
              onChange={onInputChange}
              className="sr-only peer"
              id="notification-toggle"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0AAC9E]"></div>
          </div>
        </label>
        <p className="mt-1 text-xs text-gray-500 ml-7">
          Users will receive a notification when this announcement is published
        </p>
      </div>
    </div>
  );
};

export default Settings;
