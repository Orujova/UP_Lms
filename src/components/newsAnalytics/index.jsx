"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import {
  BarChart2,
  Eye,
  Download,
  Bookmark,
  ThumbsUp,
  Clock,
  Calendar,
  PieChart as PieChartIcon,
  Layers,
  Filter,
  ExternalLink,
  AlertTriangle,
  Loader,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";
import "react-datepicker/dist/react-datepicker.css";

// Import components from component directory
import StatCard from "@/components/statCard";
import Pagination from "@/components/reportPagination";
import NewsFilterBar from "@/components/newsFilterBar";
import DeviceUsageChart from "@/components/deviceUsageChart";
import CategoryDistributionChart from "@/components/categoryDistributionChart";
import { getToken } from "@/authtoken/auth.js";

const token = getToken();

// Enhanced color scheme with better accessibility and consistency
const CHART_COLORS = {
  views: "#3B82F6", // Blue
  likes: "#F97316", // Orange
  saves: "#8B5CF6", // Violet
  categories: "#10B981", // Emerald
  activity: "#EC4899", // Pink
};

// Filter component for activity tab
const ActivityFilterBar = ({
  filters,
  onFilterChange,
  onExport,
  loading = false,
}) => {
  return (
    <div className="bg-white rounded-lg p-5 mb-6 shadow-sm border border-gray-100">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-gray-400" />
            <DatePicker
              selected={filters.startDate}
              onChange={(date) => onFilterChange("startDate", date)}
              selectsStart
              startDate={filters.startDate}
              endDate={filters.endDate}
              className="border rounded-lg px-3 py-2 text-sm outline-0 focus:ring-0 focus:border-[#0AAC9E] hover:border-[#0AAC9E]"
              placeholderText="Start Date"
              dateFormat="yyyy-MM-dd"
              disabled={loading}
            />
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-gray-400" />
            <DatePicker
              selected={filters.endDate}
              onChange={(date) => onFilterChange("endDate", date)}
              selectsEnd
              startDate={filters.startDate}
              endDate={filters.endDate}
              minDate={filters.startDate}
              className="border rounded-lg px-3 py-2 text-sm outline-0 focus:ring-0 focus:border-[#0AAC9E] hover:border-[#0AAC9E]"
              placeholderText="End Date"
              dateFormat="yyyy-MM-dd"
              disabled={loading}
            />
          </div>
          <div className="relative">
            <select
              value={filters.analysisType || ""}
              onChange={(e) => onFilterChange("analysisType", e.target.value)}
              className="border rounded-lg pl-9 pr-3 py-2 text-sm outline-0 focus:border-[#0AAC9E] hover:border-[#0AAC9E] cursor-pointer min-w-[180px]"
              disabled={loading}
            >
              <option value="">All Analysis Types</option>
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <Filter className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          </div>
        </div>
        <button
          onClick={onExport}
          className="flex items-center gap-2 bg-[#f0fdfc] text-[#0AAC9E] px-4 py-2 rounded-lg hover:bg-[#e0fbf9] transition-colors border border-[#0AAC9E20]"
          disabled={loading}
        >
          <Download className="w-4 h-4" />
          Export Activity
        </button>
      </div>
    </div>
  );
};

// Chart components
const ActiveTimeChart = ({ hourlyData, weeklyData, loading = false }) => {
  if (!hourlyData || !weeklyData) return null;

  const formatHour = (hour) => {
    return `${hour}:00`;
  };

  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10">
          <div className="w-12 h-12 border-4 border-[#0AAC9E] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <div className="h-64">
        <p className="text-sm text-gray-500 mb-2">Hourly Activity</p>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={hourlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
            <XAxis dataKey="hour" tickFormatter={formatHour} />
            <YAxis />
            <Tooltip
              labelFormatter={formatHour}
              contentStyle={{
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                border: "none",
              }}
            />
            <Bar
              dataKey="views"
              fill={CHART_COLORS.views}
              name="Views"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="h-64">
        <p className="text-sm text-gray-500 mb-2">Weekly Activity</p>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
            <XAxis dataKey="day" tickFormatter={(day) => dayNames[day]} />
            <YAxis />
            <Tooltip
              labelFormatter={(day) => dayNames[day]}
              contentStyle={{
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                border: "none",
              }}
            />
            <Bar
              dataKey="views"
              fill={CHART_COLORS.activity}
              name="Views"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Enhanced engagement comparison chart with area chart
const EngagementComparisonChart = ({
  viewsData,
  likesData,
  savesData,
  loading = false,
}) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (viewsData && likesData && savesData) {
      prepareChartData();
    }
  }, [viewsData, likesData, savesData]);

  const prepareChartData = () => {
    if (!viewsData || !likesData || !savesData) {
      setChartData([]);
      return;
    }

    // Combine and format data for comparison
    const combinedData = viewsData.map((item) => {
      const likeItem = likesData.find((like) => like.id === item.id) || {};
      const saveItem = savesData.find((save) => save.id === item.id) || {};

      return {
        id: item.id,
        title: item.title || `News #${item.id}`,
        uniqueView: item.uniqueView || 0,
        uniqueLike: likeItem.uniqueLike || 0,
        uniqueSave: saveItem.uniqueSave || 0,
        engagementScore:
          (((likeItem.uniqueLike || 0) + (saveItem.uniqueSave || 0)) /
            (item.uniqueView || 1)) *
          100,
      };
    });

    // Sort by engagement score for better visualization
    combinedData.sort((a, b) => b.engagementScore - a.engagementScore);
    setChartData(combinedData.slice(0, 5)); // Take top 5 for better visualization
  };

  if (!viewsData || !likesData || !savesData) {
    return (
      <div className="h-72 flex items-center justify-center bg-gray-50 rounded-lg">
        <p className="text-gray-500">Waiting for data...</p>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="h-72 flex items-center justify-center bg-gray-50 rounded-lg">
        <p className="text-gray-500">No engagement data available</p>
      </div>
    );
  }

  return (
    <div className="h-72 relative">
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10">
          <div className="w-12 h-12 border-4 border-[#0AAC9E] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
        >
          <defs>
            <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor={CHART_COLORS.views}
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor={CHART_COLORS.views}
                stopOpacity={0.1}
              />
            </linearGradient>
            <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor={CHART_COLORS.likes}
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor={CHART_COLORS.likes}
                stopOpacity={0.1}
              />
            </linearGradient>
            <linearGradient id="colorSaves" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor={CHART_COLORS.saves}
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor={CHART_COLORS.saves}
                stopOpacity={0.1}
              />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
          <XAxis
            dataKey="title"
            tick={{ fontSize: 11 }}
            angle={-35}
            textAnchor="end"
            height={80}
          />
          <YAxis yAxisId="left" orientation="left" />
          <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              borderRadius: "8px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              border: "none",
            }}
            formatter={(value, name) => [
              value,
              name === "engagementScore"
                ? "Engagement %"
                : name === "uniqueView"
                ? "Views"
                : name === "uniqueLike"
                ? "Likes"
                : "Saves",
            ]}
          />
          <Legend />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="uniqueView"
            name="Views"
            stroke={CHART_COLORS.views}
            fillOpacity={1}
            fill="url(#colorViews)"
            strokeWidth={2}
          />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="uniqueLike"
            name="Likes"
            stroke={CHART_COLORS.likes}
            fillOpacity={1}
            fill="url(#colorLikes)"
            strokeWidth={2}
          />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="uniqueSave"
            name="Saves"
            stroke={CHART_COLORS.saves}
            fillOpacity={1}
            fill="url(#colorSaves)"
            strokeWidth={2}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="engagementScore"
            stroke="#FF7A00"
            name="Engagement %"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// Common components
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-16">
    <div className="flex flex-col items-center">
      <div className="relative w-16 h-16 mb-3">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-[#0AAC9E] border-t-transparent rounded-full animate-spin"></div>
        <Loader className="absolute top-0 left-0 w-full h-full text-[#0AAC9E] animate-pulse" />
      </div>
      <p className="text-gray-500">Loading data...</p>
    </div>
  </div>
);

const ChartCard = ({ title, children, className = "", loading = false }) => (
  <div
    className={`bg-white rounded-lg p-6 shadow-sm border border-gray-100 ${className}`}
  >
    <h3 className="text-gray-900 font-semibold mb-6">{title}</h3>
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-10 rounded-lg">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-[#0AAC9E] border-t-transparent rounded-full animate-spin mb-2"></div>
            <span className="text-sm text-gray-600">Loading chart data...</span>
          </div>
        </div>
      )}
      {children}
    </div>
  </div>
);

const NoDataMessage = ({ message, isError = false }) => (
  <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100">
    {isError ? (
      <AlertTriangle className="w-12 h-12 text-orange-400 mx-auto mb-4" />
    ) : (
      <PieChartIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
    )}
    <p className="text-gray-600 font-medium mb-2">{message}</p>
    {!isError && (
      <p className="text-sm text-gray-400">
        Try adjusting your filters or check back later
      </p>
    )}
  </div>
);

// Main Component
const NewsAnalytics = () => {
  const router = useRouter();

  // State Management
  const [activeTab, setActiveTab] = useState("views");
  const [viewsData, setViewsData] = useState(null);
  const [likesData, setLikesData] = useState(null);
  const [savesData, setSavesData] = useState(null);
  const [categoriesData, setCategoriesData] = useState(null);
  const [activityData, setActivityData] = useState(null);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [creatorOptions, setCreatorOptions] = useState([]);

  const [viewsLoading, setViewsLoading] = useState(true);
  const [likesLoading, setLikesLoading] = useState(true);
  const [savesLoading, setSavesLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);

  const [error, setError] = useState(null);

  const [viewsPage, setViewsPage] = useState(1);
  const [likesPage, setLikesPage] = useState(1);
  const [savesPage, setSavesPage] = useState(1);
  const [categoriesPage, setCategoriesPage] = useState(1);

  const [totalViewsCount, setTotalViewsCount] = useState(0);
  const [totalLikesCount, setTotalLikesCount] = useState(0);
  const [totalSavesCount, setTotalSavesCount] = useState(0);
  const [totalCategoriesCount, setTotalCategoriesCount] = useState(0);

  const [viewsFilters, setViewsFilters] = useState({
    interestLevel: "",
    startViewDate: "",
    endViewDate: "",
    startCreatedDate: "",
    endCreatedDate: "",
    createdBy: "",
    newsCategory: [],
  });

  const [likesFilters, setLikesFilters] = useState({
    interestLevel: "",
    startViewDate: "",
    endViewDate: "",
    startCreatedDate: "",
    endCreatedDate: "",
    createdBy: "",
    newsCategory: [],
  });

  const [savesFilters, setSavesFilters] = useState({
    interestLevel: "",
    startViewDate: "",
    endViewDate: "",
    startCreatedDate: "",
    endCreatedDate: "",
    createdBy: "",
    newsCategory: [],
  });

  const [categoriesFilters, setCategoriesFilters] = useState({
    interestLevel: "",
    startViewDate: "",
    endViewDate: "",
    startCreatedDate: "",
    endCreatedDate: "",
    createdBy: "",
    newsCategory: [],
  });

  const [activityFilters, setActivityFilters] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
    endDate: new Date(),
    analysisType: "daily",
  });

  // Format date for API
  const formatDateForApi = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString();
  };

  // API Calls
  const fetchViewsData = async (page, filters) => {
    try {
      setViewsLoading(true);
      setChartLoading(true);

      const queryParams = new URLSearchParams({
        Page: page,
        "ShowMore.Take": 10,
      });

      // Add filters
      if (filters.interestLevel)
        queryParams.append("InterestLevel", filters.interestLevel);
      if (filters.createdBy) queryParams.append("CreatedBy", filters.createdBy);

      // Add date filters
      if (filters.startViewDate)
        queryParams.append(
          "StartViewDate",
          formatDateForApi(filters.startViewDate)
        );
      if (filters.endViewDate)
        queryParams.append(
          "EndViewDate",
          formatDateForApi(filters.endViewDate)
        );
      if (filters.startCreatedDate)
        queryParams.append(
          "StartCreatedDate",
          formatDateForApi(filters.startCreatedDate)
        );
      if (filters.endCreatedDate)
        queryParams.append(
          "EndCreatedDate",
          formatDateForApi(filters.endCreatedDate)
        );

      // Add category filters (multiple)
      if (
        filters.newsCategory &&
        Array.isArray(filters.newsCategory) &&
        filters.newsCategory.length > 0
      ) {
        filters.newsCategory.forEach((cat) =>
          queryParams.append("NewsCategory", cat)
        );
      }

      const response = await fetch(
        `https://bravoadmin.uplms.org/api/News/getallnewsinterestanalysis/reporting?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "*/*",
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch news views data: ${response.status}`);
      }

      const jsonData = await response.json();

      if (!jsonData || !Array.isArray(jsonData) || jsonData.length === 0) {
        setViewsData({ news: [] });
        setTotalViewsCount(0);
        return;
      }

      const firstItem = jsonData[0];
      setTotalViewsCount(firstItem.totalNewsCount || 0);
      setViewsData(firstItem);

      // Extract creator options if not already populated
      if (
        creatorOptions.length === 0 &&
        firstItem.news &&
        firstItem.news.length > 0
      ) {
        const creators = new Set();
        firstItem.news.forEach((item) => {
          if (item.createdBy) creators.add(item.createdBy);
        });
        setCreatorOptions(Array.from(creators).sort());
      }
    } catch (error) {
      console.error("Error fetching news views data:", error);
      setError(error.message);
    } finally {
      setViewsLoading(false);
      setTimeout(() => setChartLoading(false), 500); // Small delay for smoother transition
    }
  };

  const fetchLikesData = async (page, filters) => {
    try {
      setLikesLoading(true);

      const queryParams = new URLSearchParams({
        Page: page,
        "ShowMore.Take": 10,
      });

      // Add filters
      if (filters.interestLevel)
        queryParams.append("InterestLevel", filters.interestLevel);
      if (filters.createdBy) queryParams.append("CreatedBy", filters.createdBy);

      // Add date filters
      if (filters.startViewDate)
        queryParams.append(
          "StartViewDate",
          formatDateForApi(filters.startViewDate)
        );
      if (filters.endViewDate)
        queryParams.append(
          "EndViewDate",
          formatDateForApi(filters.endViewDate)
        );
      if (filters.startCreatedDate)
        queryParams.append(
          "StartCreatedDate",
          formatDateForApi(filters.startCreatedDate)
        );
      if (filters.endCreatedDate)
        queryParams.append(
          "EndCreatedDate",
          formatDateForApi(filters.endCreatedDate)
        );

      // Add category filters (multiple)
      if (
        filters.newsCategory &&
        Array.isArray(filters.newsCategory) &&
        filters.newsCategory.length > 0
      ) {
        filters.newsCategory.forEach((cat) =>
          queryParams.append("NewsCategory", cat)
        );
      }

      const response = await fetch(
        `https://bravoadmin.uplms.org/api/News/getallnewslikeinterestanalysis/reporting?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "*/*",
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch news likes data: ${response.status}`);
      }

      const jsonData = await response.json();

      if (!jsonData || !Array.isArray(jsonData) || jsonData.length === 0) {
        setLikesData({ news: [] });
        setTotalLikesCount(0);
        return;
      }

      const firstItem = jsonData[0];
      setTotalLikesCount(firstItem.totalNewsCount || 0);
      setLikesData(firstItem);
    } catch (error) {
      console.error("Error fetching news likes data:", error);
      setError(error.message);
    } finally {
      setLikesLoading(false);
    }
  };

  const fetchSavesData = async (page, filters) => {
    try {
      setSavesLoading(true);

      const queryParams = new URLSearchParams({
        Page: page,
        "ShowMore.Take": 10,
      });

      // Add filters
      if (filters.interestLevel)
        queryParams.append("InterestLevel", filters.interestLevel);
      if (filters.createdBy) queryParams.append("CreatedBy", filters.createdBy);

      // Add date filters
      if (filters.startViewDate)
        queryParams.append(
          "StartViewDate",
          formatDateForApi(filters.startViewDate)
        );
      if (filters.endViewDate)
        queryParams.append(
          "EndViewDate",
          formatDateForApi(filters.endViewDate)
        );
      if (filters.startCreatedDate)
        queryParams.append(
          "StartCreatedDate",
          formatDateForApi(filters.startCreatedDate)
        );
      if (filters.endCreatedDate)
        queryParams.append(
          "EndCreatedDate",
          formatDateForApi(filters.endCreatedDate)
        );

      // Add category filters (multiple)
      if (
        filters.newsCategory &&
        Array.isArray(filters.newsCategory) &&
        filters.newsCategory.length > 0
      ) {
        filters.newsCategory.forEach((cat) =>
          queryParams.append("NewsCategory", cat)
        );
      }

      const response = await fetch(
        `https://bravoadmin.uplms.org/api/News/getallnewssaveinterestanalysis/reporting?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "*/*",
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch news saves data: ${response.status}`);
      }

      const jsonData = await response.json();

      if (!jsonData || !Array.isArray(jsonData) || jsonData.length === 0) {
        setSavesData({ news: [] });
        setTotalSavesCount(0);
        return;
      }

      const firstItem = jsonData[0];
      setTotalSavesCount(firstItem.totalNewsCount || 0);
      setSavesData(firstItem);
    } catch (error) {
      console.error("Error fetching news saves data:", error);
      setError(error.message);
    } finally {
      setSavesLoading(false);
    }
  };

  const fetchCategoriesData = async (page, filters) => {
    try {
      setCategoriesLoading(true);

      const queryParams = new URLSearchParams({
        Page: page,
        "ShowMore.Take": 10,
      });

      // Add filters
      if (filters.interestLevel)
        queryParams.append("InterestLevel", filters.interestLevel);
      if (filters.createdBy) queryParams.append("CreatedBy", filters.createdBy);

      // Add date filters
      if (filters.startViewDate)
        queryParams.append(
          "StartViewDate",
          formatDateForApi(filters.startViewDate)
        );
      if (filters.endViewDate)
        queryParams.append(
          "EndViewDate",
          formatDateForApi(filters.endViewDate)
        );
      if (filters.startCreatedDate)
        queryParams.append(
          "StartCreatedDate",
          formatDateForApi(filters.startCreatedDate)
        );
      if (filters.endCreatedDate)
        queryParams.append(
          "EndCreatedDate",
          formatDateForApi(filters.endCreatedDate)
        );

      // Add category filters (multiple)
      if (
        filters.newsCategory &&
        Array.isArray(filters.newsCategory) &&
        filters.newsCategory.length > 0
      ) {
        filters.newsCategory.forEach((cat) =>
          queryParams.append("NewsCategory", cat)
        );
      }

      const response = await fetch(
        `https://bravoadmin.uplms.org/api/News/getallnewscategoryinterestanalysis/reporting?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "*/*",
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch categories data: ${response.status}`);
      }

      const jsonData = await response.json();

      if (!jsonData || !Array.isArray(jsonData) || jsonData.length === 0) {
        setCategoriesData({ newsCategories: [] });
        setTotalCategoriesCount(0);
        return;
      }

      const firstItem = jsonData[0];
      setTotalCategoriesCount(firstItem.totalNewsCategoryCount || 0);
      setCategoriesData(firstItem);
    } catch (error) {
      console.error("Error fetching categories data:", error);
      setError(error.message);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchActivityData = async (filters) => {
    try {
      setActivityLoading(true);

      const queryParams = new URLSearchParams({
        StartDate: filters.startDate.toISOString().split("T")[0],
        EndDate: filters.endDate.toISOString().split("T")[0],
        ...(filters.analysisType && { AnalysisType: filters.analysisType }),
      });

      const response = await fetch(
        `https://bravoadmin.uplms.org/api/News/getnewsactivityanalysis/reporting?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "*/*",
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch activity data: ${response.status}`);
      }

      const jsonData = await response.json();
      setActivityData(jsonData);
    } catch (error) {
      console.error("Error fetching activity data:", error);
      setError(error.message);
    } finally {
      setActivityLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(
        `https://bravoadmin.uplms.org/api/NewsCategory`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "*/*",
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status}`);
      }

      const categories = await response.json();

      setCategoryOptions(
        categories.map((cat) => ({
          id: cat.id,
          name: cat.categoryName,
        }))
      );
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Navigation to detail pages
  const navigateToNewsDetail = (id) => {
    router.push(`/admin/dashboard/news/${id}`);
  };

  // Export functions
  const handleViewsExport = async () => {
    try {
      // Build query parameters based on current filters
      const queryParams = new URLSearchParams();

      // Add all filters to export
      if (viewsFilters.interestLevel)
        queryParams.append("InterestLevel", viewsFilters.interestLevel);
      if (viewsFilters.createdBy)
        queryParams.append("CreatedBy", viewsFilters.createdBy);

      if (viewsFilters.startViewDate)
        queryParams.append(
          "StartViewDate",
          formatDateForApi(viewsFilters.startViewDate)
        );
      if (viewsFilters.endViewDate)
        queryParams.append(
          "EndViewDate",
          formatDateForApi(viewsFilters.endViewDate)
        );
      if (viewsFilters.startCreatedDate)
        queryParams.append(
          "StartCreatedDate",
          formatDateForApi(viewsFilters.startCreatedDate)
        );
      if (viewsFilters.endCreatedDate)
        queryParams.append(
          "EndCreatedDate",
          formatDateForApi(viewsFilters.endCreatedDate)
        );

      if (
        viewsFilters.newsCategory &&
        Array.isArray(viewsFilters.newsCategory) &&
        viewsFilters.newsCategory.length > 0
      ) {
        viewsFilters.newsCategory.forEach((cat) =>
          queryParams.append("NewsCategory", cat)
        );
      }

      const response = await fetch(
        `https://bravoadmin.uplms.org/api/News/interest-analysis/excel?${queryParams.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "*/*",
          },
        }
      );

      if (!response.ok) throw new Error("Export failed");
      await handleDownload(response, "news-views-analysis.xlsx");
    } catch (error) {
      console.error("Export error:", error);
      alert("Export failed: " + error.message);
    }
  };

  const handleLikesExport = async () => {
    try {
      // Build query parameters based on current filters
      const queryParams = new URLSearchParams();

      // Add all filters to export
      if (likesFilters.interestLevel)
        queryParams.append("InterestLevel", likesFilters.interestLevel);
      if (likesFilters.createdBy)
        queryParams.append("CreatedBy", likesFilters.createdBy);

      if (likesFilters.startViewDate)
        queryParams.append(
          "StartViewDate",
          formatDateForApi(likesFilters.startViewDate)
        );
      if (likesFilters.endViewDate)
        queryParams.append(
          "EndViewDate",
          formatDateForApi(likesFilters.endViewDate)
        );
      if (likesFilters.startCreatedDate)
        queryParams.append(
          "StartCreatedDate",
          formatDateForApi(likesFilters.startCreatedDate)
        );
      if (likesFilters.endCreatedDate)
        queryParams.append(
          "EndCreatedDate",
          formatDateForApi(likesFilters.endCreatedDate)
        );

      if (
        likesFilters.newsCategory &&
        Array.isArray(likesFilters.newsCategory) &&
        likesFilters.newsCategory.length > 0
      ) {
        likesFilters.newsCategory.forEach((cat) =>
          queryParams.append("NewsCategory", cat)
        );
      }

      const response = await fetch(
        `https://bravoadmin.uplms.org/api/News/export-news-like-analysis/reporting?${queryParams.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "*/*",
          },
        }
      );

      if (!response.ok) throw new Error("Export failed");
      await handleDownload(response, "news-likes-analysis.xlsx");
    } catch (error) {
      console.error("Export error:", error);
      alert("Export failed: " + error.message);
    }
  };

  const handleSavesExport = async () => {
    try {
      // Build query parameters based on current filters
      const queryParams = new URLSearchParams();

      // Add all filters to export
      if (savesFilters.interestLevel)
        queryParams.append("InterestLevel", savesFilters.interestLevel);
      if (savesFilters.createdBy)
        queryParams.append("CreatedBy", savesFilters.createdBy);

      if (savesFilters.startViewDate)
        queryParams.append(
          "StartViewDate",
          formatDateForApi(savesFilters.startViewDate)
        );
      if (savesFilters.endViewDate)
        queryParams.append(
          "EndViewDate",
          formatDateForApi(savesFilters.endViewDate)
        );
      if (savesFilters.startCreatedDate)
        queryParams.append(
          "StartCreatedDate",
          formatDateForApi(savesFilters.startCreatedDate)
        );
      if (savesFilters.endCreatedDate)
        queryParams.append(
          "EndCreatedDate",
          formatDateForApi(savesFilters.endCreatedDate)
        );

      if (
        savesFilters.newsCategory &&
        Array.isArray(savesFilters.newsCategory) &&
        savesFilters.newsCategory.length > 0
      ) {
        savesFilters.newsCategory.forEach((cat) =>
          queryParams.append("NewsCategory", cat)
        );
      }

      const response = await fetch(
        `https://bravoadmin.uplms.org/api/News/export-news-save-analysis/reporting?${queryParams.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "*/*",
          },
        }
      );

      if (!response.ok) throw new Error("Export failed");
      await handleDownload(response, "news-saves-analysis.xlsx");
    } catch (error) {
      console.error("Export error:", error);
      alert("Export failed: " + error.message);
    }
  };

  const handleActivityExport = async () => {
    try {
      // Build query parameters for activity export
      const queryParams = new URLSearchParams({
        StartDate: activityFilters.startDate.toISOString().split("T")[0],
        EndDate: activityFilters.endDate.toISOString().split("T")[0],
        ...(activityFilters.analysisType && {
          AnalysisType: activityFilters.analysisType,
        }),
      });

      const response = await fetch(
        `https://bravoadmin.uplms.org/api/News/activity-report/excel?${queryParams.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "*/*",
          },
        }
      );

      if (!response.ok) throw new Error("Export failed");
      await handleDownload(response, "news-activity-analysis.xlsx");
    } catch (error) {
      console.error("Export error:", error);
      alert("Export failed: " + error.message);
    }
  };

  const handleDownload = async (response, filename) => {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Export failed");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  // Filter change handlers
  const handleViewsFilterChange = (key, value) => {
    if (key === "reset") {
      setViewsFilters({
        interestLevel: "",
        startViewDate: "",
        endViewDate: "",
        startCreatedDate: "",
        endCreatedDate: "",
        createdBy: "",
        newsCategory: [],
      });
    } else {
      setViewsFilters((prev) => ({ ...prev, [key]: value }));
    }
    setViewsPage(1);
  };

  const handleLikesFilterChange = (key, value) => {
    if (key === "reset") {
      setLikesFilters({
        interestLevel: "",
        startViewDate: "",
        endViewDate: "",
        startCreatedDate: "",
        endCreatedDate: "",
        createdBy: "",
        newsCategory: [],
      });
    } else {
      setLikesFilters((prev) => ({ ...prev, [key]: value }));
    }
    setLikesPage(1);
  };

  const handleSavesFilterChange = (key, value) => {
    if (key === "reset") {
      setSavesFilters({
        interestLevel: "",
        startViewDate: "",
        endViewDate: "",
        startCreatedDate: "",
        endCreatedDate: "",
        createdBy: "",
        newsCategory: [],
      });
    } else {
      setSavesFilters((prev) => ({ ...prev, [key]: value }));
    }
    setSavesPage(1);
  };

  const handleCategoriesFilterChange = (key, value) => {
    if (key === "reset") {
      setCategoriesFilters({
        interestLevel: "",
        startViewDate: "",
        endViewDate: "",
        startCreatedDate: "",
        endCreatedDate: "",
        createdBy: "",
        newsCategory: [],
      });
    } else {
      setCategoriesFilters((prev) => ({ ...prev, [key]: value }));
    }
    setCategoriesPage(1);
  };

  const handleActivityFilterChange = (key, value) => {
    setActivityFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Effects
  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (activeTab === "views") {
      fetchViewsData(viewsPage, viewsFilters);
    } else if (activeTab === "likes") {
      fetchLikesData(likesPage, likesFilters);
    } else if (activeTab === "saves") {
      fetchSavesData(savesPage, savesFilters);
    } else if (activeTab === "categories") {
      fetchCategoriesData(categoriesPage, categoriesFilters);
    } else if (activeTab === "activity") {
      fetchActivityData(activityFilters);
    }
  }, [
    activeTab,
    viewsPage,
    viewsFilters,
    likesPage,
    likesFilters,
    savesPage,
    savesFilters,
    categoriesPage,
    categoriesFilters,
    activityFilters,
  ]);

  // For engagement comparison chart, we need all three datasets
  useEffect(() => {
    // Only fetch missing data if not already fetched or loading
    if (activeTab !== "views" && !viewsData && !viewsLoading) {
      fetchViewsData(1, {});
    }
    if (activeTab !== "likes" && !likesData && !likesLoading) {
      fetchLikesData(1, {});
    }
    if (activeTab !== "saves" && !savesData && !savesLoading) {
      fetchSavesData(1, {});
    }
  }, [
    activeTab,
    viewsData,
    likesData,
    savesData,
    viewsLoading,
    likesLoading,
    savesLoading,
  ]);

  // Calculate metrics
  const getTotalViews = () =>
    viewsData?.news?.reduce((sum, item) => sum + (item.totalView || 0), 0) || 0;
  const getUniqueViews = () =>
    viewsData?.news?.reduce((sum, item) => sum + (item.uniqueView || 0), 0) ||
    0;

  const getTotalLikes = () =>
    likesData?.news?.reduce((sum, item) => sum + (item.totalView || 0), 0) || 0;
  const getUniqueLikes = () =>
    likesData?.news?.reduce((sum, item) => sum + (item.uniqueLike || 0), 0) ||
    0;

  const getTotalSaves = () =>
    savesData?.news?.reduce((sum, item) => sum + (item.totalView || 0), 0) || 0;
  const getUniqueSaves = () =>
    savesData?.news?.reduce((sum, item) => sum + (item.uniqueSave || 0), 0) ||
    0;

  const getEngagementRate = () => {
    const views = getUniqueViews();
    if (!views) return 0;
    return (((getUniqueLikes() + getUniqueSaves()) / views) * 100).toFixed(2);
  };

  // Calculate trends based on view dates
  const calculateViewTrends = () => {
    if (!viewsData?.news || viewsData.news.length === 0) return 0;

    let currentWeekViews = 0;
    let previousWeekViews = 0;

    const now = new Date();
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(now.getDate() - 7);

    const twoWeeksAgo = new Date(oneWeekAgo);
    twoWeeksAgo.setDate(oneWeekAgo.getDate() - 7);

    viewsData.news.forEach((item) => {
      if (item.uniqueViewDates && Array.isArray(item.uniqueViewDates)) {
        item.uniqueViewDates.forEach((dateStr) => {
          const viewDate = new Date(dateStr);
          if (viewDate >= oneWeekAgo && viewDate <= now) {
            currentWeekViews++;
          } else if (viewDate >= twoWeeksAgo && viewDate < oneWeekAgo) {
            previousWeekViews++;
          }
        });
      }
    });

    if (previousWeekViews === 0) return currentWeekViews > 0 ? 100 : 0;

    const trendPercentage =
      ((currentWeekViews - previousWeekViews) / previousWeekViews) * 100;
    return parseFloat(trendPercentage.toFixed(1));
  };

  // Tab navigation
  const tabs = [
    { id: "views", label: "Views", icon: Eye },
    { id: "likes", label: "Likes", icon: ThumbsUp },
    { id: "saves", label: "Saves", icon: Bookmark },
    { id: "categories", label: "Categories", icon: Layers },
    { id: "activity", label: "Activity", icon: Clock },
  ];

  // Process activity data for charts
  const processActivityData = () => {
    if (!activityData) return { hourlyData: [], weeklyData: [] };

    // If the API returns actual data, use it
    if (
      activityData.hourlyActivity &&
      Array.isArray(activityData.hourlyActivity)
    ) {
      return {
        hourlyData: activityData.hourlyActivity.map((item) => ({
          hour: item.hour,
          views: item.viewCount,
        })),
        weeklyData: activityData.dailyActivity.map((item) => ({
          day: new Date(item.day).getDay(), // Convert to day of week (0-6)
          views: item.viewCount,
        })),
      };
    }

    // Fallback to simulation if needed
    const hourlyData = Array(24)
      .fill()
      .map((_, hour) => ({
        hour,
        views: Math.floor(Math.random() * 100) + 10,
      }));

    const weeklyData = Array(7)
      .fill()
      .map((_, day) => ({
        day,
        views: Math.floor(Math.random() * 500) + 50,
      }));

    return { hourlyData, weeklyData };
  };

  const { hourlyData, weeklyData } = processActivityData();

  // Render loading state
  const isLoading = () => {
    if (activeTab === "views") return viewsLoading && !viewsData;
    if (activeTab === "likes") return likesLoading && !likesData;
    if (activeTab === "saves") return savesLoading && !savesData;
    if (activeTab === "categories") return categoriesLoading && !categoriesData;
    if (activeTab === "activity") return activityLoading && !activityData;
    return false;
  };

  if (isLoading()) {
    return <LoadingSpinner />;
  }

  // Get first news item for StatCard trend calculation
  const firstNewsItem = viewsData?.news?.[0] || null;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={Eye}
          value={getUniqueViews()}
          label="Unique Views"
          color="#3B82F6"
          historicalData={firstNewsItem}
        />
        <StatCard
          icon={ThumbsUp}
          value={getUniqueLikes()}
          label="Unique Likes"
          color="#F97316"
          historicalData={firstNewsItem}
        />
        <StatCard
          icon={Bookmark}
          value={getUniqueSaves()}
          label="Unique Saves"
          color="#8B5CF6"
          historicalData={firstNewsItem}
        />
        <StatCard
          icon={BarChart2}
          value={`${getEngagementRate()}%`}
          label="Engagement Rate"
          color="#10B981"
          description="Percentage of views resulting in likes or saves"
          historicalData={firstNewsItem}
        />
      </div>

      {/* Engagement Comparison Chart */}
      <ChartCard
        title="News Engagement Overview"
        className="mb-6"
        loading={chartLoading}
      >
        <EngagementComparisonChart
          viewsData={viewsData?.news}
          likesData={likesData?.news}
          savesData={savesData?.news}
          loading={chartLoading}
        />
      </ChartCard>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
        <div className="flex overflow-x-auto border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 transition-colors text-sm font-medium
              ${
                activeTab === tab.id
                  ? "border-b-2 border-[#0AAC9E] text-[#0AAC9E]"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Views Tab */}
          {activeTab === "views" && (
            <>
              <NewsFilterBar
                filters={viewsFilters}
                onFilterChange={handleViewsFilterChange}
                onExport={handleViewsExport}
                loading={viewsLoading}
                categoryOptions={categoryOptions}
                creatorOptions={creatorOptions}
              />

              {viewsLoading ? (
                <LoadingSpinner />
              ) : !viewsData?.news || viewsData.news.length === 0 ? (
                <NoDataMessage
                  message={
                    Object.values(viewsFilters).some(
                      (val) => val !== "" && val.length !== 0
                    )
                      ? `No news found with the selected filters`
                      : "No news data available"
                  }
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left font-medium text-gray-500 py-3 px-4">
                          News ID
                        </th>
                        <th className="text-left font-medium text-gray-500 py-3 px-4">
                          Title
                        </th>
                        <th className="text-center font-medium text-gray-500 py-3 px-4">
                          Total Views
                        </th>
                        <th className="text-center font-medium text-gray-500 py-3 px-4">
                          Unique Views
                        </th>
                        <th className="text-center font-medium text-gray-500 py-3 px-4">
                          Target Group
                        </th>
                        <th className="text-center font-medium text-gray-500 py-3 px-4">
                          View %
                        </th>
                        <th className="text-center font-medium text-gray-500 py-3 px-4">
                          Interest Level
                        </th>
                        <th className="text-right font-medium text-gray-500 py-3 px-4">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewsData.news.map((item) => (
                        <tr
                          key={item.id}
                          className="border-t hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-3 px-4">{item.id}</td>
                          <td className="py-3 px-4 font-medium max-w-[200px] truncate">
                            {item.title || `News #${item.id}`}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {item.totalView || 0}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {item.uniqueView || 0}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {item.targetGroupEmployeeCount || 0}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {item.uniqueViewPercentage || 0}%
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-medium inline-block
                              ${
                                item.interestLevel === "Low"
                                  ? "bg-red-100 text-red-800"
                                  : item.interestLevel === "Normal"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {item.interestLevel || "Unknown"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => navigateToNewsDetail(item.id)}
                              className="text-blue-600 hover:text-blue-800 inline-flex items-center"
                            >
                              <ExternalLink className="w-4 h-4 mr-1" />
                              <span>Details</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {totalViewsCount > 10 && (
                    <div className="mt-6">
                      <Pagination
                        currentPage={viewsPage}
                        totalPages={Math.max(
                          1,
                          Math.ceil(totalViewsCount / 10)
                        )}
                        onPageChange={setViewsPage}
                        disabled={viewsLoading}
                      />
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Likes Tab */}
          {activeTab === "likes" && (
            <>
              <NewsFilterBar
                filters={likesFilters}
                onFilterChange={handleLikesFilterChange}
                onExport={handleLikesExport}
                loading={likesLoading}
                categoryOptions={categoryOptions}
                creatorOptions={creatorOptions}
              />

              {likesLoading ? (
                <LoadingSpinner />
              ) : !likesData?.news || likesData.news.length === 0 ? (
                <NoDataMessage
                  message={
                    Object.values(likesFilters).some(
                      (val) => val !== "" && val.length !== 0
                    )
                      ? `No news likes found with the selected filters`
                      : "No news likes data available"
                  }
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left font-medium text-gray-500 py-3 px-4">
                          News ID
                        </th>
                        <th className="text-left font-medium text-gray-500 py-3 px-4">
                          Title
                        </th>
                        <th className="text-center font-medium text-gray-500 py-3 px-4">
                          Total Views
                        </th>
                        <th className="text-center font-medium text-gray-500 py-3 px-4">
                          Likes
                        </th>
                        <th className="text-center font-medium text-gray-500 py-3 px-4">
                          Target Group
                        </th>
                        <th className="text-center font-medium text-gray-500 py-3 px-4">
                          Like %
                        </th>
                        <th className="text-center font-medium text-gray-500 py-3 px-4">
                          Interest Level
                        </th>
                        <th className="text-right font-medium text-gray-500 py-3 px-4">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {likesData.news.map((item) => (
                        <tr
                          key={item.id}
                          className="border-t hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-3 px-4">{item.id}</td>
                          <td className="py-3 px-4 font-medium max-w-[200px] truncate">
                            {item.title || `News #${item.id}`}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {item.totalView || 0}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {item.uniqueLike || 0}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {item.targetGroupEmployeeCount || 0}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {item.uniqueLikePercentage || 0}%
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-medium inline-block
                              ${
                                item.interestLevel === "Low"
                                  ? "bg-red-100 text-red-800"
                                  : item.interestLevel === "Normal"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {item.interestLevel || "Unknown"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => navigateToNewsDetail(item.id)}
                              className="text-blue-600 hover:text-blue-800 inline-flex items-center"
                            >
                              <ExternalLink className="w-4 h-4 mr-1" />
                              <span>Details</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {totalLikesCount > 10 && (
                    <div className="mt-6">
                      <Pagination
                        currentPage={likesPage}
                        totalPages={Math.max(
                          1,
                          Math.ceil(totalLikesCount / 10)
                        )}
                        onPageChange={setLikesPage}
                        disabled={likesLoading}
                      />
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Saves Tab */}
          {activeTab === "saves" && (
            <>
              <NewsFilterBar
                filters={savesFilters}
                onFilterChange={handleSavesFilterChange}
                onExport={handleSavesExport}
                loading={savesLoading}
                categoryOptions={categoryOptions}
                creatorOptions={creatorOptions}
              />

              {savesLoading ? (
                <LoadingSpinner />
              ) : !savesData?.news || savesData.news.length === 0 ? (
                <NoDataMessage
                  message={
                    Object.values(savesFilters).some(
                      (val) => val !== "" && val.length !== 0
                    )
                      ? `No news saves found with the selected filters`
                      : "No news saves data available"
                  }
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left font-medium text-gray-500 py-3 px-4">
                          News ID
                        </th>
                        <th className="text-left font-medium text-gray-500 py-3 px-4">
                          Title
                        </th>
                        <th className="text-center font-medium text-gray-500 py-3 px-4">
                          Total Views
                        </th>
                        <th className="text-center font-medium text-gray-500 py-3 px-4">
                          Saves
                        </th>
                        <th className="text-center font-medium text-gray-500 py-3 px-4">
                          Target Group
                        </th>
                        <th className="text-center font-medium text-gray-500 py-3 px-4">
                          Save %
                        </th>
                        <th className="text-center font-medium text-gray-500 py-3 px-4">
                          Interest Level
                        </th>
                        <th className="text-right font-medium text-gray-500 py-3 px-4">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {savesData.news.map((item) => (
                        <tr
                          key={item.id}
                          className="border-t hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-3 px-4">{item.id}</td>
                          <td className="py-3 px-4 font-medium max-w-[200px] truncate">
                            {item.title || `News #${item.id}`}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {item.totalView || 0}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {item.uniqueSave || 0}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {item.targetGroupEmployeeCount || 0}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {item.uniqueSavePercentage || 0}%
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-medium inline-block
                              ${
                                item.interestLevel === "Low"
                                  ? "bg-red-100 text-red-800"
                                  : item.interestLevel === "Normal"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {item.interestLevel || "Unknown"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => navigateToNewsDetail(item.id)}
                              className="text-blue-600 hover:text-blue-800 inline-flex items-center"
                            >
                              <ExternalLink className="w-4 h-4 mr-1" />
                              <span>Details</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {totalSavesCount > 10 && (
                    <div className="mt-6">
                      <Pagination
                        currentPage={savesPage}
                        totalPages={Math.max(
                          1,
                          Math.ceil(totalSavesCount / 10)
                        )}
                        onPageChange={setSavesPage}
                        disabled={savesLoading}
                      />
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Categories Tab */}
          {activeTab === "categories" && (
            <>
              <NewsFilterBar
                filters={categoriesFilters}
                onFilterChange={handleCategoriesFilterChange}
                onExport={handleViewsExport}
                loading={categoriesLoading}
                categoryOptions={categoryOptions}
                creatorOptions={creatorOptions}
              />

              {categoriesLoading ? (
                <LoadingSpinner />
              ) : !categoriesData?.newsCategories ||
                categoriesData.newsCategories.length === 0 ? (
                <NoDataMessage
                  message={
                    Object.values(categoriesFilters).some(
                      (val) => val !== "" && val.length !== 0
                    )
                      ? `No categories found with the selected filters`
                      : "No categories data available"
                  }
                />
              ) : (
                <>
                  <div className="mb-6">
                    <CategoryDistributionChart
                      data={categoriesData.newsCategories}
                      loading={categoriesLoading}
                    />
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="text-left font-medium text-gray-500 py-3 px-4">
                            Category Name
                          </th>
                          <th className="text-center font-medium text-gray-500 py-3 px-4">
                            News Count
                          </th>
                          <th className="text-center font-medium text-gray-500 py-3 px-4">
                            Total Views
                          </th>
                          <th className="text-center font-medium text-gray-500 py-3 px-4">
                            Unique Views
                          </th>
                          <th className="text-center font-medium text-gray-500 py-3 px-4">
                            % of Content
                          </th>
                          <th className="text-center font-medium text-gray-500 py-3 px-4">
                            Interest Level
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {categoriesData.newsCategories.map((item) => (
                          <tr
                            key={item.categoryId}
                            className="border-t hover:bg-gray-50 transition-colors"
                          >
                            <td className="py-3 px-4 font-medium">
                              {item.categoryName}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {item.totalNewsCount}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {item.totalView}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {item.uniqueView}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {item.newsCountPercentage}%
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span
                                className={`px-2.5 py-1 rounded-full text-xs font-medium inline-block
                                ${
                                  item.interestLevel === "Low"
                                    ? "bg-red-100 text-red-800"
                                    : item.interestLevel === "Normal"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-green-100 text-green-800"
                                }`}
                              >
                                {item.interestLevel}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {totalCategoriesCount > 10 && (
                      <div className="mt-6">
                        <Pagination
                          currentPage={categoriesPage}
                          totalPages={Math.max(
                            1,
                            Math.ceil(totalCategoriesCount / 10)
                          )}
                          onPageChange={setCategoriesPage}
                          disabled={categoriesLoading}
                        />
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          )}

          {/* Activity Tab */}
          {activeTab === "activity" && (
            <>
              <ActivityFilterBar
                filters={activityFilters}
                onFilterChange={handleActivityFilterChange}
                onExport={handleActivityExport}
                loading={activityLoading}
              />

              {activityLoading ? (
                <LoadingSpinner />
              ) : !activityData ? (
                <NoDataMessage message="No activity data available for the selected period" />
              ) : (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard
                      icon={Clock}
                      value={`${activityData.mostActiveHour || 0}:00`}
                      label="Most Active Hour"
                      color="#3B82F6"
                    />
                    <StatCard
                      icon={Calendar}
                      value={activityData.mostActiveDay || "Monday"}
                      label="Most Active Day"
                      color="#F97316"
                    />
                  </div>

                  <ChartCard title="Device Usage" loading={activityLoading}>
                    <DeviceUsageChart
                      data={activityData}
                      loading={activityLoading}
                    />
                  </ChartCard>

                  <ChartCard
                    title="Activity Patterns"
                    loading={activityLoading}
                  >
                    <ActiveTimeChart
                      hourlyData={hourlyData}
                      weeklyData={weeklyData}
                      loading={activityLoading}
                    />
                  </ChartCard>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsAnalytics;
