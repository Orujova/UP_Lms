"use client";
import { ChevronUp, ChevronDown } from "lucide-react";

const StatCard = ({ icon: Icon, value, label, trend, description }) => (
  <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-gray-500 text-sm mb-1">{label}</p>
        <h3 className="text-xl font-semibold text-gray-900">{value}</h3>
        {trend !== undefined && (
          <div className="flex items-center mt-2">
            {trend > 0 ? (
              <span className="text-sm text-teal-600 flex items-center">
                <ChevronUp className="w-4 h-4" />
                {trend}%
              </span>
            ) : (
              <span className="text-sm text-red-500 flex items-center">
                <ChevronDown className="w-4 h-4" />
                {Math.abs(trend)}%
              </span>
            )}
            <span className="text-xs text-gray-500 ml-1">
              vs. previous period
            </span>
          </div>
        )}
        {description && (
          <p className="text-xs text-gray-500 mt-2">{description}</p>
        )}
      </div>
      <div className="bg-[#f9fefe] p-3 rounded-lg">
        <Icon className="w-5 h-5 text-[#0AAC9E]" />
      </div>
    </div>
  </div>
);

export default StatCard;
