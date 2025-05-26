"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  PieChart,
  Pie,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  Sector,
} from "recharts";
import {
  PieChart as PieChartIcon,
  Smartphone,
  Laptop,
  Tablet,
  Loader,
  AlertCircle,
} from "lucide-react";

// Enhanced colors with better contrast and accessibility
const COLORS = {
  Mobile: "#3B82F6", // Blue
  Desktop: "#F59E0B", // Amber
  Tablet: "#10B981", // Emerald
};

const DEVICE_ICONS = {
  Mobile: Smartphone,
  Desktop: Laptop,
  Tablet: Tablet,
};

const LoadingOverlay = () => (
  <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10 rounded-lg">
    <div className="flex flex-col items-center">
      <div className="w-12 h-12 border-4 border-[#0AAC9E] border-t-transparent rounded-full animate-spin mb-2"></div>
      <span className="text-sm text-gray-600">Loading device data...</span>
    </div>
  </div>
);

const NoDataDisplay = () => (
  <div className="h-64 flex flex-col items-center justify-center bg-gray-50 rounded-lg">
    <AlertCircle className="w-10 h-10 text-gray-300 mb-3" />
    <p className="text-gray-500 font-medium">No device usage data available</p>
    <p className="text-sm text-gray-400 mt-1">
      Try adjusting filters or check back later
    </p>
  </div>
);

const DeviceUsageChart = ({ data, loading = false }) => {
  const [activeIndex, setActiveIndex] = useState(null);

  // Process device data with useMemo for better performance
  const deviceData = useMemo(() => {
    if (!data) return [];

    // Calculate total views
    const totalViews =
      (data.mobileViews || 0) +
      (data.desktopViews || 0) +
      (data.tabletViews || 0);

    // Format data and calculate percentages
    const formatted = [
      {
        name: "Mobile",
        value: data.mobileViews || 0,
        percentage:
          totalViews === 0
            ? 0
            : (((data.mobileViews || 0) / totalViews) * 100).toFixed(1),
        color: COLORS.Mobile,
      },
      {
        name: "Desktop",
        value: data.desktopViews || 0,
        percentage:
          totalViews === 0
            ? 0
            : (((data.desktopViews || 0) / totalViews) * 100).toFixed(1),
        color: COLORS.Desktop,
      },
      {
        name: "Tablet",
        value: data.tabletViews || 0,
        percentage:
          totalViews === 0
            ? 0
            : (((data.tabletViews || 0) / totalViews) * 100).toFixed(1),
        color: COLORS.Tablet,
      },
    ].filter((item) => item.value > 0); // Only include devices with data

    return formatted;
  }, [data]);

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  // Enhanced active shape renderer
  const renderActiveShape = (props) => {
    const {
      cx,
      cy,
      midAngle,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
      fill,
      payload,
      percent,
      value,
    } = props;

    const RADIAN = Math.PI / 180;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? "start" : "end";

    // Get the correct icon for this device
    const IconComponent = DEVICE_ICONS[payload.name] || PieChartIcon;

    return (
      <g>
        {/* Inner pie segment */}
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />

        {/* Outer ring highlight */}
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />

        {/* Connecting line */}
        <path
          d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
          stroke={fill}
          fill="none"
          strokeWidth={2}
        />

        {/* Endpoint marker */}
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />

        {/* Device type with icon */}
        <foreignObject
          x={ex + (cos >= 0 ? 1 : -1) * 12 - (cos >= 0 ? 0 : 80)}
          y={ey - 12}
          width={80}
          height={24}
        >
          <div className="flex items-center gap-2" style={{ color: fill }}>
            <IconComponent className="w-5 h-5" />
            <span className="text-sm font-medium">{payload.name}</span>
          </div>
        </foreignObject>

        {/* View count */}
        <text
          x={ex + (cos >= 0 ? 1 : -1) * 12}
          y={ey}
          dy={24}
          textAnchor={textAnchor}
          fill="#666"
          className="text-sm"
        >
          {`${value.toLocaleString()} views`}
        </text>

        {/* Percentage */}
        <text
          x={ex + (cos >= 0 ? 1 : -1) * 12}
          y={ey}
          dy={46}
          textAnchor={textAnchor}
          fill="#666"
          className="text-sm font-medium"
        >
          {`${(percent * 100).toFixed(1)}%`}
        </text>
      </g>
    );
  };

  // Enhanced legend
  const renderCustomLegend = (props) => {
    const { payload } = props;

    return (
      <ul className="flex flex-wrap justify-center gap-5 mt-4">
        {payload.map((entry, index) => {
          const IconComponent = DEVICE_ICONS[entry.value] || PieChartIcon;

          return (
            <li
              key={`item-${index}`}
              className={`flex items-center gap-2 py-1.5 px-3 rounded-full cursor-pointer transition-all duration-300 
                ${
                  activeIndex === index
                    ? "bg-gray-100 shadow-sm"
                    : "hover:bg-gray-50"
                }`}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={onPieLeave}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <div className="flex items-center gap-1.5">
                <IconComponent className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium">{entry.value}</span>
                <span className="text-xs text-gray-500">
                  ({entry.payload.percentage}%)
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    );
  };

  // Enhanced tooltip
  const renderTooltip = (props) => {
    const { active, payload } = props;

    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const IconComponent = DEVICE_ICONS[data.name] || PieChartIcon;

      return (
        <div className="bg-white p-3 rounded-lg shadow-md border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <IconComponent className="w-4 h-4" style={{ color: data.color }} />
            <span className="font-medium">{data.name}</span>
          </div>
          <p className="text-sm text-gray-600">{`${data.value.toLocaleString()} views (${
            data.percentage
          }%)`}</p>
        </div>
      );
    }

    return null;
  };

  if (!data) {
    return <NoDataDisplay />;
  }

  if (deviceData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
        <p className="text-gray-500">No device usage recorded yet</p>
      </div>
    );
  }

  return (
    <div className="h-64 relative">
      {loading && <LoadingOverlay />}

      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            data={deviceData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            dataKey="value"
            onMouseEnter={onPieEnter}
            onMouseLeave={onPieLeave}
            paddingAngle={4}
          >
            {deviceData.map((entry) => (
              <Cell key={`cell-${entry.name}`} fill={COLORS[entry.name]} />
            ))}
          </Pie>
          <Tooltip content={renderTooltip} />
          <Legend
            content={renderCustomLegend}
            verticalAlign="bottom"
            height={36}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DeviceUsageChart;
