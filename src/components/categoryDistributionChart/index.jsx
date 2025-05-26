"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  PieChart,
  Pie,
  Legend,
  ResponsiveContainer,
  Cell,
  Sector,
  Tooltip,
} from "recharts";
import { Loader, PieChart as PieChartIcon } from "lucide-react";

// Enhanced color palette with better accessibility and contrast

const COLORS = [
  "#7EC8E3",
  "#FFD580",
  "#FFB3B3",
  "#B5EAD7",
  "#C7CEEA",
  "#E2F0CB",
  "#C3B1E1",
  "#FFC8DD",
  "#A8E6CF",
  "#FDFFAB",
];

const LoadingOverlay = () => (
  <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10 rounded-lg">
    <div className="flex flex-col items-center">
      <div className="w-12 h-12 border-4 border-[#0AAC9E] border-t-transparent rounded-full animate-spin mb-2"></div>
      <span className="text-sm text-gray-600">Loading chart data...</span>
    </div>
  </div>
);

const NoDataDisplay = () => (
  <div className="h-96 flex flex-col items-center justify-center bg-gray-50 rounded-lg">
    <PieChartIcon className="w-12 h-12 text-gray-300 mb-3" />
    <p className="text-gray-500 font-medium">No category data available</p>
    <p className="text-sm text-gray-400 mt-1">
      Try adjusting filters or check back later
    </p>
  </div>
);

const CategoryDistributionChart = ({ data, loading = false }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [chartHeight, setChartHeight] = useState(400);

  // Process data with useMemo for performance optimization
  const formattedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data.map((category) => ({
      name: category.categoryName,
      value: category.totalNewsCount,
      totalView: category.totalView || 0,
      uniqueView: category.uniqueView || 0,
      interestLevel: category.interestLevel || "Unknown",
      percentage: parseFloat(category.newsCountPercentage?.toFixed(1)) || 0,
    }));
  }, [data]);

  // Resize chart height based on window size
  useEffect(() => {
    const handleResize = () => {
      setChartHeight(window.innerWidth < 768 ? 350 : 400);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  // Enhanced active shape renderer with improved readability
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

    // Determine interest level color with better contrast
    const interestColors = {
      High: "#059669", // Emerald 600
      Normal: "#2563EB", // Blue 600
      Low: "#DC2626", // Red 600
      Unknown: "#6B7280", // Gray 500
    };

    const interestColor =
      interestColors[payload.interestLevel] || interestColors.Unknown;

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={interestColor}
        />
        <path
          d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
          stroke={fill}
          fill="none"
          strokeWidth={2}
        />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text
          x={ex + (cos >= 0 ? 1 : -1) * 12}
          y={ey}
          textAnchor={textAnchor}
          fill="#333"
          className="text-base font-medium"
        >
          {payload.name}
        </text>
        <text
          x={ex + (cos >= 0 ? 1 : -1) * 12}
          y={ey}
          dy={22}
          textAnchor={textAnchor}
          fill="#666"
          className="text-sm"
        >
          {`${value} news items`}
        </text>
        <text
          x={ex + (cos >= 0 ? 1 : -1) * 12}
          y={ey}
          dy={44}
          textAnchor={textAnchor}
          fill="#666"
          className="text-sm"
        >
          {`${payload.uniqueView} unique views`}
        </text>
        <text
          x={ex + (cos >= 0 ? 1 : -1) * 12}
          y={ey}
          dy={66}
          textAnchor={textAnchor}
          fill="#666"
          className="text-sm font-medium"
          style={{ fill: interestColor }}
        >
          {`${(percent * 100).toFixed(1)}% of content (${
            payload.interestLevel
          })`}
        </text>
      </g>
    );
  };

  // Enhanced legend renderer with improved layout and clarity
  const renderCustomLegend = (props) => {
    const { payload } = props;

    return (
      <ul className="flex flex-wrap gap-4 justify-center mt-6 px-2">
        {payload.map((entry, index) => (
          <li
            key={`item-${index}`}
            className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-full transition-all duration-300 ${
              activeIndex === index
                ? "bg-gray-100 shadow-sm"
                : "hover:bg-gray-50"
            } cursor-pointer`}
            onMouseEnter={() => setActiveIndex(index)}
          >
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="font-medium">{entry.value}</span>
            <span className="text-gray-500">({entry.payload.percentage}%)</span>
          </li>
        ))}
      </ul>
    );
  };

  if (!data || data.length === 0) {
    return <NoDataDisplay />;
  }

  return (
    <div className="relative" style={{ height: `${chartHeight}px` }}>
      {loading && <LoadingOverlay />}

      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            data={formattedData}
            cx="50%"
            cy="45%"
            innerRadius={70}
            outerRadius={90}
            dataKey="value"
            onMouseEnter={onPieEnter}
            paddingAngle={3}
          >
            {formattedData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name, props) => [
              `${value} news items (${props.payload.percentage}%)`,
              props.payload.name,
            ]}
            contentStyle={{
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              border: "none",
              padding: "10px 14px",
            }}
          />
          <Legend content={renderCustomLegend} />
        </PieChart>
      </ResponsiveContainer>

      <div className="text-center mt-2 text-sm text-gray-500">
        Click or hover over each category to see detailed metrics
      </div>
    </div>
  );
};

export default CategoryDistributionChart;
