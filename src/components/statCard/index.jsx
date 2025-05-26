"use client";
import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

const StatCard = ({ icon: Icon, value, label, trend, description, color = "#01DBC8" }) => {
  const getColorClasses = (color) => {
    if (color === "#01DBC8" || color === "emerald") return "bg-emerald-50 text-emerald-500";
    if (color === "blue") return "bg-blue-50 text-blue-500";
    if (color === "orange") return "bg-orange-50 text-orange-500";
    if (color === "purple") return "bg-purple-50 text-purple-500";
    if (color === "green") return "bg-green-50 text-green-500";
    return "bg-emerald-50 text-emerald-500";
  };

  const trendBars = Array.from({ length: 4 }, (_, i) => (
    <div
      key={i}
      className="w-0.5 rounded-full bg-emerald-200"
      style={{ height: `${Math.random() * 10 + 4}px` }}
    />
  ));

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${getColorClasses(color)}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend !== undefined && trend !== null && (
          <div className={`flex items-center text-sm font-medium ${trend >= 0 ? "text-emerald-600" : "text-red-500"}`}>
            {trend >= 0 ? (
              <TrendingUp className="w-4 h-4 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 mr-1" />
            )}
            {trend >= 0 ? "+" : ""}{Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {typeof value === "string" ? value : value.toLocaleString()}
          </h3>
          <p className="text-gray-600 text-sm font-medium">{label}</p>
        </div>
        <div className="flex items-end gap-0.5 h-5">
          {trendBars}
        </div>
      </div>
      
      {description && (
        <p className="text-gray-500 text-xs mt-2">{description}</p>
      )}
    </div>
  );
};

export default StatCard;