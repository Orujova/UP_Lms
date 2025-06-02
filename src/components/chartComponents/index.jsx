// "use client";
// import React from "react";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   PieChart,
//   Pie,
//   Cell,
//   LineChart,
//   Line,
//   ResponsiveContainer,
//   Legend
// } from "recharts";
// import { BarChart3, TrendingUp, Activity, PieChart as PieIcon, Info } from "lucide-react";

// // Soft color palette - same as announcement page
// const SOFT_COLORS = ["#A7F3D0", "#FDE68A", "#FECACA"]; // Very soft green, yellow, red
// const CHART_COLORS = {
//   totalViews: "#7DD3FC", // Very soft blue
//   uniqueViews: "#86EFAC", // Very soft green
// };

// // Simple Chart Card Wrapper
// export const ChartCard = ({ title, children, loading = false }) => (
//   <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
//     <h3 className="text-gray-900 font-semibold mb-5 text-sm flex items-center">
//       {title}
//       <span className="ml-2 text-gray-400 hover:text-gray-600 cursor-pointer">
//         <Info className="w-4 h-4" />
//       </span>
//     </h3>
//     {loading ? (
//       <div className="flex items-center justify-center h-56">
//         <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
//       </div>
//     ) : (
//       <div className="h-56">
//         {children}
//       </div>
//     )}
//   </div>
// );

// // Interest Level Distribution Pie Chart
// export const InterestLevelChart = ({ data, loading = false }) => {
//   if (loading || !data || data.length === 0) {
//     return (
//       <div className="flex items-center justify-center h-full">
//         <div className="text-center">
//           <PieIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
//           <div className="text-sm text-gray-400">No interest data available</div>
//         </div>
//       </div>
//     );
//   }

//   // Process data for interest levels
//   const interestCounts = data.reduce((acc, item) => {
//     if (!item.interestLevel) return acc;
//     const existing = acc.find((x) => x.name === item.interestLevel);
//     if (existing) {
//       existing.value++;
//     } else {
//       acc.push({ name: item.interestLevel, value: 1 });
//     }
//     return acc;
//   }, []);

//   return (
//     <ResponsiveContainer width="100%" height="100%">
//       <PieChart>
//         <Pie
//           data={interestCounts}
//           cx="50%"
//           cy="50%"
//           outerRadius={70}
//           dataKey="value"
//           nameKey="name"
//           label={({ name, percent }) =>
//             `${name}: ${(percent * 100).toFixed(0)}%`
//           }
//         >
//           {interestCounts.map((entry, index) => (
//             <Cell
//               key={`cell-${index}`}
//               fill={SOFT_COLORS[index % SOFT_COLORS.length]}
//             />
//           ))}
//         </Pie>
//         <Tooltip
//           contentStyle={{
//             fontSize: "12px",
//             backgroundColor: '#fff',
//             border: '1px solid #e5e7eb',
//             borderRadius: '8px'
//           }}
//           formatter={(value, name) => [
//             `${value} news articles`,
//             name,
//           ]}
//         />
//         <Legend wrapperStyle={{ fontSize: '12px' }} />
//       </PieChart>
//     </ResponsiveContainer>
//   );
// };

// // Views Trend Line Chart
// export const ViewsTrendChart = ({ data, loading = false }) => {
//   if (loading || !data || data.length === 0) {
//     return (
//       <div className="flex items-center justify-center h-full">
//         <div className="text-center">
//           <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
//           <div className="text-sm text-gray-400">No performance data available</div>
//         </div>
//       </div>
//     );
//   }

//   // Prepare view trends data - Group news by date and accumulate views
//   const viewTrendsData = (() => {
//     // Group news by creation date
//     const groupedByDate = data.reduce((acc, item) => {
//       const createdDate = item.createdDate ? new Date(item.createdDate) : new Date();
//       const dateKey = createdDate.toDateString();

//       if (!acc[dateKey]) {
//         acc[dateKey] = {
//           date: createdDate,
//           totalView: 0,
//           uniqueView: 0,
//           count: 0
//         };
//       }

//       acc[dateKey].totalView += item.totalView || 0;
//       acc[dateKey].uniqueView += item.uniqueView || 0;
//       acc[dateKey].count += 1;

//       return acc;
//     }, {});

//     // Convert to array and sort by date
//     const sortedData = Object.values(groupedByDate)
//       .sort((a, b) => a.date - b.date)
//       .slice(0, 7); // Show last 7 periods

//     // Create cumulative trend
//     let cumulativeTotalViews = 0;
//     let cumulativeUniqueViews = 0;

//     return sortedData.map((item) => {
//       cumulativeTotalViews += item.totalView;
//       cumulativeUniqueViews += item.uniqueView;

//       const formattedDate = `${item.date.toLocaleDateString('en-US', { month: 'short' })} ${String(item.date.getDate()).padStart(2, '0')}`;

//       return {
//         date: formattedDate,
//         totalView: cumulativeTotalViews,
//         uniqueView: cumulativeUniqueViews,
//         news: item.count
//       };
//     });
//   })();

//   return (
//     <ResponsiveContainer width="100%" height="100%">
//       <LineChart data={viewTrendsData}>
//         <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
//         <XAxis
//           dataKey="date"
//           tick={{ fontSize: 11, fill: '#666' }}
//         />
//         <YAxis tick={{ fontSize: 11, fill: '#666' }} />
//         <Tooltip
//           contentStyle={{
//             backgroundColor: '#fff',
//             border: '1px solid #e5e7eb',
//             borderRadius: '8px',
//             fontSize: '11px'
//           }}
//         />
//         <Legend wrapperStyle={{ fontSize: '11px' }} />
//         <Line
//           type="monotone"
//           dataKey="totalView"
//           stroke={CHART_COLORS.totalViews}
//           strokeWidth={2}
//           name="Total Views"
//           dot={{ r: 3 }}
//         />
//         <Line
//           type="monotone"
//           dataKey="uniqueView"
//           stroke={CHART_COLORS.uniqueViews}
//           strokeWidth={2}
//           name="Unique Views"
//           dot={{ r: 3 }}
//         />
//       </LineChart>
//     </ResponsiveContainer>
//   );
// };

// // Engagement Comparison Bar Chart
// export const EngagementChart = ({ viewsData, likesData, savesData, loading = false }) => {
//   if (loading || !viewsData || !likesData || !savesData) {
//     return (
//       <div className="flex items-center justify-center h-full">
//         <div className="text-center">
//           <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
//           <div className="text-sm text-gray-400">Loading engagement data...</div>
//         </div>
//       </div>
//     );
//   }

//   const totalViews = viewsData.reduce((sum, item) => sum + (item.uniqueView || 0), 0);
//   const totalLikes = likesData.reduce((sum, item) => sum + (item.uniqueLike || 0), 0);
//   const totalSaves = savesData.reduce((sum, item) => sum + (item.uniqueSave || 0), 0);

//   const chartData = [
//     {
//       name: 'Engagement Metrics',
//       Views: totalViews,
//       Likes: totalLikes,
//       Saves: totalSaves
//     }
//   ];

//   return (
//     <ResponsiveContainer width="100%" height="100%">
//       <BarChart data={chartData}>
//         <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
//         <XAxis
//           dataKey="name"
//           tick={{ fontSize: 11, fill: '#666' }}
//         />
//         <YAxis tick={{ fontSize: 11, fill: '#666' }} />
//         <Tooltip
//           contentStyle={{
//             backgroundColor: '#fff',
//             border: '1px solid #e5e7eb',
//             borderRadius: '8px',
//             fontSize: '11px'
//           }}
//         />
//         <Legend wrapperStyle={{ fontSize: '11px' }} />
//         <Bar
//           dataKey="Views"
//           fill="#86EFAC"
//           name="Total Views"
//         />
//         <Bar
//           dataKey="Likes"
//           fill="#7DD3FC"
//           name="Total Likes"
//         />
//         <Bar
//           dataKey="Saves"
//           fill="#DDD6FE"
//           name="Total Saves"
//         />
//       </BarChart>
//     </ResponsiveContainer>
//   );
// };

// // Performance Bar Chart
// export const PerformanceChart = ({ data, type = "views", loading = false }) => {
//   if (loading || !data || data.length === 0) {
//     return (
//       <div className="flex items-center justify-center h-full">
//         <div className="text-center">
//           <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
//           <div className="text-sm text-gray-400">No performance data available</div>
//         </div>
//       </div>
//     );
//   }

//   let chartData = [];
//   let fillColor = '#86EFAC';

//   switch (type) {
//     case "views":
//       chartData = data.slice(0, 6).map(item => ({
//         name: `#${item.id}`,
//         percentage: item.uniqueViewPercentage || 0
//       }));
//       fillColor = '#86EFAC';
//       break;
//     case "likes":
//       chartData = data.slice(0, 6).map(item => ({
//         name: `#${item.id}`,
//         percentage: item.uniqueLikePercentage || 0
//       }));
//       fillColor = '#7DD3FC';
//       break;
//     case "saves":
//       chartData = data.slice(0, 6).map(item => ({
//         name: `#${item.id}`,
//         percentage: item.uniqueSavePercentage || 0
//       }));
//       fillColor = '#DDD6FE';
//       break;
//     case "categories":
//       chartData = data.slice(0, 6).map(item => ({
//         name: item.categoryName,
//         percentage: item.newsCountPercentage || 0
//       }));
//       fillColor = '#FDE68A';
//       break;
//   }

//   return (
//     <ResponsiveContainer width="100%" height="100%">
//       <BarChart data={chartData}>
//         <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
//         <XAxis
//           dataKey="name"
//           tick={{ fontSize: 11, fill: '#666' }}
//         />
//         <YAxis tick={{ fontSize: 11, fill: '#666' }} />
//         <Tooltip
//           contentStyle={{
//             backgroundColor: '#fff',
//             border: '1px solid #e5e7eb',
//             borderRadius: '8px',
//             fontSize: '11px'
//           }}
//         />
//         <Bar
//           dataKey="percentage"
//           fill={fillColor}
//           name="Performance %"
//         />
//       </BarChart>
//     </ResponsiveContainer>
//   );
// };

// // Category Distribution Pie Chart
// export const CategoryChart = ({ data, loading = false }) => {
//   if (loading || !data || data.length === 0) {
//     return (
//       <div className="flex items-center justify-center h-full">
//         <div className="text-center">
//           <PieIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
//           <div className="text-sm text-gray-400">No category data available</div>
//         </div>
//       </div>
//     );
//   }

//   const chartData = data.map((category, index) => ({
//     name: category.categoryName,
//     value: category.totalNewsCount,
//     fill: SOFT_COLORS[index % SOFT_COLORS.length]
//   }));

//   return (
//     <ResponsiveContainer width="100%" height="100%">
//       <PieChart>
//         <Pie
//           data={chartData}
//           cx="50%"
//           cy="50%"
//           outerRadius={70}
//           dataKey="value"
//           nameKey="name"
//           label={({ name, percent }) =>
//             `${name}: ${(percent * 100).toFixed(0)}%`
//           }
//         >
//           {chartData.map((entry, index) => (
//             <Cell key={`cell-${index}`} fill={entry.fill} />
//           ))}
//         </Pie>
//         <Tooltip
//           contentStyle={{
//             fontSize: "12px",
//             backgroundColor: '#fff',
//             border: '1px solid #e5e7eb',
//             borderRadius: '8px'
//           }}
//           formatter={(value, name) => [
//             `${value} news articles`,
//             name,
//           ]}
//         />
//         <Legend wrapperStyle={{ fontSize: '12px' }} />
//       </PieChart>
//     </ResponsiveContainer>
//   );
// };

// // Combined Analytics Dashboard Chart
// export const AnalyticsDashboard = ({ viewsData, likesData, savesData, loading = false }) => {
//   if (loading || !viewsData) {
//     return (
//       <div className="flex items-center justify-center h-full">
//         <div className="text-center">
//           <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
//           <div className="text-sm text-gray-400">Loading dashboard data...</div>
//         </div>
//       </div>
//     );
//   }

//   // Combine top 6 news data
//   const combinedData = viewsData.slice(0, 6).map(item => {
//     const likeItem = likesData?.find(like => like.id === item.id);
//     const saveItem = savesData?.find(save => save.id === item.id);

//     return {
//       name: `#${item.id}`,
//       views: item.uniqueView || 0,
//       likes: likeItem?.uniqueLike || 0,
//       saves: saveItem?.uniqueSave || 0
//     };
//   });

//   return (
//     <ResponsiveContainer width="100%" height="100%">
//       <LineChart data={combinedData}>
//         <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
//         <XAxis
//           dataKey="name"
//           tick={{ fontSize: 11, fill: '#666' }}
//         />
//         <YAxis tick={{ fontSize: 11, fill: '#666' }} />
//         <Tooltip
//           contentStyle={{
//             backgroundColor: '#fff',
//             border: '1px solid #e5e7eb',
//             borderRadius: '8px',
//             fontSize: '11px'
//           }}
//         />
//         <Legend wrapperStyle={{ fontSize: '11px' }} />
//         <Line
//           type="monotone"
//           dataKey="views"
//           stroke="#86EFAC"
//           strokeWidth={2}
//           name="Views"
//           dot={{ r: 3 }}
//         />
//         <Line
//           type="monotone"
//           dataKey="likes"
//           stroke="#7DD3FC"
//           strokeWidth={2}
//           name="Likes"
//           dot={{ r: 3 }}
//         />
//         <Line
//           type="monotone"
//           dataKey="saves"
//           stroke="#DDD6FE"
//           strokeWidth={2}
//           name="Saves"
//           dot={{ r: 3 }}
//         />
//       </LineChart>
//     </ResponsiveContainer>
//   );
// };

// export default {
//   ChartCard,
//   InterestLevelChart,
//   ViewsTrendChart,
//   EngagementChart,
//   PerformanceChart,
//   CategoryChart,
//   AnalyticsDashboard
// };

"use client";
import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  Activity,
  PieChart as PieIcon,
  Info,
} from "lucide-react";

// Soft color palette - same as announcement page
const SOFT_COLORS = ["#A7F3D0", "#FDE68A", "#FECACA"]; // Very soft green, yellow, red

// Enhanced soft color palette for pie charts
const PIE_COLORS = [
  "#A7F3D0", // Very soft mint green
  "#FDE68A", // Very soft warm yellow
  "#FECACA", // Very soft coral pink
  "#C7D2FE", // Very soft lavender blue
  "#F3E8FF", // Very soft light purple
  "#ECFDF5", // Very soft pale green
  "#FEF3C7", // Very soft cream yellow
  "#FFE4E6", // Very soft blush pink
  "#E0F2FE", // Very soft sky blue
  "#F5F5F5", // Very soft neutral grey
];

const CHART_COLORS = {
  totalViews: "#86EFAC", // Soft mint green
  uniqueViews: "#A7F3D0", // Softer mint green
};

// Simple Chart Card Wrapper with React.memo
export const ChartCard = React.memo(({ title, children, loading = false }) => (
  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <h3 className="text-gray-900 font-semibold mb-5 text-sm flex items-center">
      {title}
      <span className="ml-2 text-gray-400 hover:text-gray-600 cursor-pointer">
        <Info className="w-4 h-4" />
      </span>
    </h3>
    {loading ? (
      <div className="flex items-center justify-center h-56">
        <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    ) : (
      <div className="h-56">{children}</div>
    )}
  </div>
));

// Interest Level Distribution Pie Chart with useMemo optimization
export const InterestLevelChart = React.memo(({ data, loading = false }) => {
  const interestCounts = useMemo(() => {
    if (!data || data.length === 0) return [];

    const counts = data.reduce((acc, item) => {
      if (!item.interestLevel) return acc;
      const existing = acc.find((x) => x.name === item.interestLevel);
      if (existing) {
        existing.value++;
      } else {
        acc.push({
          name: item.interestLevel,
          value: 1,
          fill:
            item.interestLevel === "High"
              ? "#A7F3D0"
              : item.interestLevel === "Normal"
              ? "#FDE68A"
              : item.interestLevel === "Low"
              ? "#FECACA"
              : "#C7D2FE",
        });
      }
      return acc;
    }, []);

    return counts.sort((a, b) => b.value - a.value);
  }, [data]);

  if (loading || interestCounts.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <PieIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <div className="text-sm text-gray-400">
            No interest data available
          </div>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const total = interestCounts.reduce((sum, item) => sum + item.value, 0);
      const percentage = ((data.value / total) * 100).toFixed(1);

      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.name} Interest</p>
          <p className="text-sm text-gray-600">
            {data.value} articles ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={interestCounts}
          cx="50%"
          cy="50%"
          innerRadius={35}
          outerRadius={80}
          paddingAngle={2}
          dataKey="value"
          nameKey="name"
          animationBegin={0}
          animationDuration={800}
        >
          {interestCounts.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.fill}
              stroke="#fff"
              strokeWidth={2}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
          formatter={(value, entry) => (
            <span style={{ color: entry.color }}>
              {value} ({entry.payload.value})
            </span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
});

// Views Trend Chart with performance optimization
export const ViewsTrendChart = React.memo(({ data, loading = false }) => {
  const trendData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Sort by performance and take top performers
    const topPerformers = data
      .sort((a, b) => (b.uniqueView || 0) - (a.uniqueView || 0))
      .slice(0, 6);

    return topPerformers.map((item) => ({
      name: item.title
        ? item.title.length > 15
          ? `${item.title.substring(0, 15)}...`
          : item.title
        : `News #${item.id}`,
      views: item.uniqueView || 0,
      totalViews: item.totalView || 0,
      engagement: item.uniqueViewPercentage || 0,
    }));
  }, [data]);

  if (loading || trendData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <div className="text-sm text-gray-400">
            No performance data available
          </div>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={trendData}
        margin={{ top: 5, right: 5, left: 5, bottom: 25 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 10, fill: "#666" }}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis tick={{ fontSize: 10, fill: "#666" }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            fontSize: "12px",
          }}
          formatter={(value, name) => [
            value.toLocaleString(),
            name === "views" ? "Unique Views" : "Total Views",
          ]}
        />
        <Bar
          dataKey="views"
          fill="#A7F3D0"
          radius={[4, 4, 0, 0]}
          name="views"
        />
      </BarChart>
    </ResponsiveContainer>
  );
});

// Engagement Chart with enhanced visualization
export const EngagementChart = React.memo(
  ({ viewsData, likesData, savesData, loading = false }) => {
    const engagementData = useMemo(() => {
      if (!viewsData || !likesData || !savesData) return [];

      const totalViews = viewsData.reduce(
        (sum, item) => sum + (item.uniqueView || 0),
        0
      );
      const totalLikes = likesData.reduce(
        (sum, item) => sum + (item.uniqueLike || 0),
        0
      );
      const totalSaves = savesData.reduce(
        (sum, item) => sum + (item.uniqueSave || 0),
        0
      );

      return [
        { name: "Views", value: totalViews, fill: "#A7F3D0" },
        { name: "Likes", value: totalLikes, fill: "#FDE68A" },
        { name: "Saves", value: totalSaves, fill: "#FECACA" },
      ];
    }, [viewsData, likesData, savesData]);

    if (
      loading ||
      engagementData.length === 0 ||
      engagementData.every((item) => item.value === 0)
    ) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <div className="text-sm text-gray-400">
              Loading engagement data...
            </div>
          </div>
        </div>
      );
    }

    const CustomTooltip = ({ active, payload }) => {
      if (active && payload && payload.length) {
        const data = payload[0];
        return (
          <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
            <p className="font-medium text-gray-900">{data.name}</p>
            <p className="text-sm text-gray-600">
              {data.value.toLocaleString()} interactions
            </p>
          </div>
        );
      }
      return null;
    };

    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={engagementData}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
            nameKey="name"
            animationBegin={0}
            animationDuration={1000}
          >
            {engagementData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.fill}
                stroke="#fff"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
            formatter={(value, entry) => (
              <span style={{ color: entry.color }}>
                {value} ({entry.payload.value.toLocaleString()})
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    );
  }
);

// Performance Bar Chart with data optimization
export const PerformanceChart = React.memo(
  ({ data, type = "views", loading = false }) => {
    const chartData = useMemo(() => {
      if (!data || data.length === 0) return [];

      let processedData = [];

      switch (type) {
        case "views":
          processedData = data
            .filter((item) => (item.uniqueViewPercentage || 0) > 0)
            .sort(
              (a, b) =>
                (b.uniqueViewPercentage || 0) - (a.uniqueViewPercentage || 0)
            )
            .slice(0, 8)
            .map((item) => ({
              name: item.title
                ? item.title.length > 12
                  ? `${item.title.substring(0, 12)}...`
                  : item.title
                : `#${item.id}`,
              percentage: Math.round(item.uniqueViewPercentage || 0),
              fill: "#A7F3D0",
            }));
          break;
        case "likes":
          processedData = data
            .filter((item) => (item.uniqueLikePercentage || 0) > 0)
            .sort(
              (a, b) =>
                (b.uniqueLikePercentage || 0) - (a.uniqueLikePercentage || 0)
            )
            .slice(0, 8)
            .map((item) => ({
              name: item.title
                ? item.title.length > 12
                  ? `${item.title.substring(0, 12)}...`
                  : item.title
                : `#${item.id}`,
              percentage: Math.round(item.uniqueLikePercentage || 0),
              fill: "#FDE68A",
            }));
          break;
        case "saves":
          processedData = data
            .filter((item) => (item.uniqueSavePercentage || 0) > 0)
            .sort(
              (a, b) =>
                (b.uniqueSavePercentage || 0) - (a.uniqueSavePercentage || 0)
            )
            .slice(0, 8)
            .map((item) => ({
              name: item.title
                ? item.title.length > 12
                  ? `${item.title.substring(0, 12)}...`
                  : item.title
                : `#${item.id}`,
              percentage: Math.round(item.uniqueSavePercentage || 0),
              fill: "#FECACA",
            }));
          break;
        case "categories":
          processedData = data
            .filter((item) => (item.newsCountPercentage || 0) > 0)
            .sort(
              (a, b) =>
                (b.newsCountPercentage || 0) - (a.newsCountPercentage || 0)
            )
            .slice(0, 8)
            .map((item) => ({
              name:
                item.categoryName.length > 12
                  ? `${item.categoryName.substring(0, 12)}...`
                  : item.categoryName,
              percentage: Math.round(item.newsCountPercentage || 0),
              fill: "#C7D2FE",
            }));
          break;
      }

      return processedData;
    }, [data, type]);

    if (loading || chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <div className="text-sm text-gray-400">
              No performance data available
            </div>
          </div>
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 5, left: 5, bottom: 25 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: "#666" }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#666" }}
            domain={[0, "dataMax + 5"]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            formatter={(value) => [`${value}%`, "Performance"]}
          />
          <Bar
            dataKey="percentage"
            fill="#86EFAC"
            radius={[4, 4, 0, 0]}
            name="Performance %"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }
);

// Category Chart with enhanced circular design
export const CategoryChart = React.memo(({ data, loading = false }) => {
  const categoryData = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data
      .filter((category) => (category.totalNewsCount || 0) > 0)
      .sort((a, b) => (b.totalNewsCount || 0) - (a.totalNewsCount || 0))
      .slice(0, 10) // Limit to top 10 categories for better visualization
      .map((category, index) => ({
        name:
          category.categoryName.length > 15
            ? `${category.categoryName.substring(0, 15)}...`
            : category.categoryName,
        value: category.totalNewsCount || 0,
        fill: PIE_COLORS[index % PIE_COLORS.length],
      }));
  }, [data]);

  if (loading || categoryData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <PieIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <div className="text-sm text-gray-400">
            No category data available
          </div>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const total = categoryData.reduce((sum, item) => sum + item.value, 0);
      const percentage = ((data.value / total) * 100).toFixed(1);

      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">
            {data.value} articles ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={categoryData}
          cx="50%"
          cy="50%"
          innerRadius={30}
          outerRadius={75}
          paddingAngle={1}
          dataKey="value"
          nameKey="name"
          animationBegin={0}
          animationDuration={1200}
        >
          {categoryData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.fill}
              stroke="#fff"
              strokeWidth={1}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{
            fontSize: "11px",
            paddingTop: "10px",
            maxHeight: "60px",
            overflowY: "auto",
          }}
          formatter={(value) => (
            <span style={{ fontSize: "11px" }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
});

// Analytics Dashboard with performance optimization
export const AnalyticsDashboard = React.memo(
  ({ viewsData, likesData, savesData, loading = false }) => {
    const dashboardData = useMemo(() => {
      if (!viewsData || loading) return [];

      // Get top 5 performing news articles
      const topNews = viewsData
        .sort((a, b) => (b.uniqueView || 0) - (a.uniqueView || 0))
        .slice(0, 5)
        .map((item) => {
          const likeItem = likesData?.find((like) => like.id === item.id);
          const saveItem = savesData?.find((save) => save.id === item.id);

          return {
            name: item.title
              ? item.title.length > 10
                ? `${item.title.substring(0, 10)}...`
                : item.title
              : `#${item.id}`,
            views: item.uniqueView || 0,
            likes: likeItem?.uniqueLike || 0,
            saves: saveItem?.uniqueSave || 0,
          };
        });

      return topNews;
    }, [viewsData, likesData, savesData, loading]);

    if (loading || dashboardData.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <div className="text-sm text-gray-400">
              Loading dashboard data...
            </div>
          </div>
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={dashboardData}
          margin={{ top: 5, right: 5, left: 5, bottom: 25 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: "#666" }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis tick={{ fontSize: 10, fill: "#666" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "11px",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "11px" }} />
          <Line
            type="monotone"
            dataKey="views"
            stroke="#86EFAC"
            strokeWidth={2}
            name="Views"
            dot={{ r: 3, fill: "#86EFAC" }}
          />
          <Line
            type="monotone"
            dataKey="likes"
            stroke="#FDE68A"
            strokeWidth={2}
            name="Likes"
            dot={{ r: 3, fill: "#FDE68A" }}
          />
          <Line
            type="monotone"
            dataKey="saves"
            stroke="#FECACA"
            strokeWidth={2}
            name="Saves"
            dot={{ r: 3, fill: "#FECACA" }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }
);

export default {
  ChartCard,
  InterestLevelChart,
  ViewsTrendChart,
  EngagementChart,
  PerformanceChart,
  CategoryChart,
  AnalyticsDashboard,
};
