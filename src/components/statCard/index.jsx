"use client";
import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

const StatCard = ({
  icon: Icon,
  value,
  label,
  color = "blue",
  description,
  trend,
}) => {
  // Simplified color configurations
  const colorConfig = {
    blue: {
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    green: {
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    purple: {
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    orange: {
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
    },
    teal: {
      iconBg: "bg-teal-100",
      iconColor: "text-teal-600",
    },
  };

  const config = colorConfig[color] || colorConfig.blue;

  // Render trend indicator
  const renderTrend = () => {
    if (!trend && trend !== 0) return null;

    const trendValue = typeof trend === "number" ? trend : parseFloat(trend);
    const isPositive = trendValue > 0;
    const isNegative = trendValue < 0;

    if (trendValue === 0) return null;

    return (
      <div
        className={`flex items-center gap-1 text-xs ${
          isPositive ? "text-green-600" : "text-red-600"
        }`}
      >
        {isPositive ? (
          <TrendingUp className="w-3 h-3" />
        ) : (
          <TrendingDown className="w-3 h-3" />
        )}
        <span>
          {isPositive ? "+" : ""}
          {Math.abs(trendValue).toFixed(1)}%
        </span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-sm transition-shadow">
      {/* Top section with icon and trend */}
      <div className="flex items-center justify-between mb-3">
        <div className={`${config.iconBg} p-2 rounded-lg`}>
          <Icon className={`w-4 h-4 ${config.iconColor}`} />
        </div>
        {renderTrend()}
      </div>

      {/* Value */}
      <div className="mb-1">
        <p className="text-2xl font-bold text-gray-900">
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
      </div>

      {/* Label */}
      <div>
        <p className="text-sm font-medium text-gray-600">{label}</p>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
