"use client";
import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  Sector,
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
  Smartphone,
  Laptop,
  Filter,
} from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import StatCard from "../statCard";
import Pagination from "../reportPagination";
import NewsFilterBar from "../newsFilterBar";

// Colors
const COLORS = [
  "#7EC8E3",
  "#FFD580",
  "#FFB3B3",
  "#B5EAD7",
  "#C7CEEA",
  "#E2F0CB",
];

const CHART_COLORS = {
  views: "#6A98F0",
  likes: "#F4A259",
  saves: "#A362EF",
  categories: "#4BC0C0",
  activity: "#FF8B8B",
};

const ChartCard = ({ title, children, className = "" }) => (
  <div className={`bg-white rounded-lg p-6 shadow-sm ${className}`}>
    <h3 className="text-gray-900 font-semibold mb-6">{title}</h3>
    {children}
  </div>
);

const NoDataMessage = ({ message }) => (
  <div className="text-center py-8">
    <p className="text-gray-500">{message}</p>
  </div>
);

const LoadingSpinner = () => (
  <div className="flex justify-center py-4">
    <div className="w-8 h-8 border-2 border-[#0AAC9E] border-t-transparent rounded-full animate-spin" />
  </div>
);

const ActivityFilterBar = ({ filters, onFilterChange, onExport }) => {
  return (
    <div className="bg-white rounded-lg p-5 mb-6 shadow-sm">
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
              className="border rounded-lg px-3 py-2 text-sm outline-0 focus:ring-0 focus:border-[#01DBC8]"
              placeholderText="Start Date"
              dateFormat="yyyy-MM-dd"
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
              className="border rounded-lg px-3 py-2 text-sm outline-0 focus:ring-0 focus:border-[#01DBC8]"
              placeholderText="End Date"
              dateFormat="yyyy-MM-dd"
            />
          </div>
          <div className="relative">
            <select
              value={filters.analysisType || ""}
              onChange={(e) => onFilterChange("analysisType", e.target.value)}
              className="border rounded-lg pl-9 pr-3 py-2 text-sm outline-0 focus:ring-0 focus:border-[#01DBC8] cursor-pointer min-w-[180px]"
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
          className="flex items-center gap-2 bg-[#f9fefe] text-[#127D74] px-4 py-2 rounded-lg hover:bg-[#f2fdfc] transition-colors"
        >
          <Download className="w-4 h-4" />
          Export Activity
        </button>
      </div>
    </div>
  );
};

// 3. Custom Visualizations
const DeviceUsageChart = ({ data }) => {
  if (!data) return null;

  const deviceData = [
    { name: "Mobile", value: data.mobileViews || 0 },
    { name: "Desktop", value: data.desktopViews || 0 },
    { name: "Tablet", value: data.tabletViews || 0 },
  ];

  const getIcon = (name) => {
    switch (name) {
      case "Mobile":
        return <Smartphone className="w-6 h-6" />;
      case "Desktop":
        return <Laptop className="w-6 h-6" />;
      case "Tablet":
        return <Laptop className="w-6 h-6" />;
      default:
        return null;
    }
  };

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
    name,
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
      >
        {`${name}: ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart width={400} height={400}>
          <Pie
            data={deviceData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {deviceData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend
            formatter={(value) => (
              <span className="flex items-center gap-2">
                {getIcon(value)}
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

const ActiveTimeChart = ({ hourlyData, weeklyData }) => {
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="h-64">
        <p className="text-sm text-gray-500 mb-2">Hourly Activity</p>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={hourlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
            <XAxis dataKey="hour" tickFormatter={formatHour} />
            <YAxis />
            <Tooltip labelFormatter={formatHour} />
            <Bar dataKey="views" fill={CHART_COLORS.views} name="Views" />
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
            <Tooltip labelFormatter={(day) => dayNames[day]} />
            <Bar dataKey="views" fill={CHART_COLORS.activity} name="Views" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const CategoryDistributionChart = ({ data }) => {
  if (!data || data.length === 0) return null;

  // Format the data for better visualization
  const formattedData = data.map((category) => ({
    name: category.categoryName,
    value: category.totalNewsCount,
    totalView: category.totalView,
    uniqueView: category.uniqueView,
    interestLevel: category.interestLevel,
  }));

  const RADIAN = Math.PI / 180;
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
      name,
    } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? "start" : "end";

    const interest =
      payload.interestLevel === "High"
        ? "#48BB78"
        : payload.interestLevel === "Normal"
        ? "#4299E1"
        : "#F56565";

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
          fill={interest}
        />
        <path
          d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
          stroke={fill}
          fill="none"
        />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text
          x={ex + (cos >= 0 ? 1 : -1) * 12}
          y={ey}
          textAnchor={textAnchor}
          fill="#333"
        >
          {name}
        </text>
        <text
          x={ex + (cos >= 0 ? 1 : -1) * 12}
          y={ey}
          dy={18}
          textAnchor={textAnchor}
          fill="#999"
        >
          {`Views: ${payload.totalView}`}
        </text>
        <text
          x={ex + (cos >= 0 ? 1 : -1) * 12}
          y={ey}
          dy={36}
          textAnchor={textAnchor}
          fill="#999"
        >
          {`(${(percent * 100).toFixed(2)}% of total)`}
        </text>
      </g>
    );
  };

  const [activeIndex, setActiveIndex] = useState(0);
  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  return (
    <div className="h-96">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            data={formattedData}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={90}
            dataKey="value"
            onMouseEnter={onPieEnter}
          >
            {formattedData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

const EngagementComparisonChart = ({ viewsData, likesData, savesData }) => {
  if (!viewsData || !likesData || !savesData) return null;

  // Combine and format data for comparison
  const combinedData = viewsData.map((item) => {
    const likeItem = likesData.find((like) => like.id === item.id) || {};
    const saveItem = savesData.find((save) => save.id === item.id) || {};

    return {
      id: item.id,
      uniqueView: item.uniqueView || 0,
      uniqueLike: likeItem.uniqueLike || 0,
      uniqueSave: saveItem.uniqueSave || 0,
      engagementScore:
        (((likeItem.uniqueLike || 0) + (saveItem.uniqueSave || 0)) /
          (item.uniqueView || 1)) *
        100,
    };
  });

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={combinedData.slice(0, 10)}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
          <XAxis dataKey="id" />
          <YAxis yAxisId="left" orientation="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Legend />
          <Bar
            yAxisId="left"
            dataKey="uniqueView"
            fill={CHART_COLORS.views}
            name="Views"
          />
          <Bar
            yAxisId="left"
            dataKey="uniqueLike"
            fill={CHART_COLORS.likes}
            name="Likes"
          />
          <Bar
            yAxisId="left"
            dataKey="uniqueSave"
            fill={CHART_COLORS.saves}
            name="Saves"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="engagementScore"
            stroke="#FF7A00"
            name="Engagement %"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// 4. Main Component
const NewsAnalytics = () => {
  // State Management
  const [activeTab, setActiveTab] = useState("views"); // views, likes, saves, categories, activity
  const [viewsData, setViewsData] = useState(null);
  const [likesData, setLikesData] = useState(null);
  const [savesData, setSavesData] = useState(null);
  const [categoriesData, setCategoriesData] = useState(null);
  const [activityData, setActivityData] = useState(null);
  const [categoryOptions, setCategoryOptions] = useState([]);

  const [viewsLoading, setViewsLoading] = useState(true);
  const [likesLoading, setLikesLoading] = useState(true);
  const [savesLoading, setSavesLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);

  const [error, setError] = useState(null);

  const [viewsPage, setViewsPage] = useState(1);
  const [likesPage, setLikesPage] = useState(1);
  const [savesPage, setSavesPage] = useState(1);
  const [categoriesPage, setCategoriesPage] = useState(1);

  const [totalViewsCount, setTotalViewsCount] = useState(0);
  const [totalLikesCount, setTotalLikesCount] = useState(0);
  const [totalSavesCount, setTotalSavesCount] = useState(0);
  const [totalCategoriesCount, setTotalCategoriesCount] = useState(0);

  const [viewsFilters, setViewsFilters] = useState({ interestLevel: "" });
  const [likesFilters, setLikesFilters] = useState({ interestLevel: "" });
  const [savesFilters, setSavesFilters] = useState({ interestLevel: "" });
  const [categoriesFilters, setCategoriesFilters] = useState({
    interestLevel: "",
    newsCategory: "",
  });
  const [activityFilters, setActivityFilters] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
    endDate: new Date(),
    analysisType: "daily",
  });

  // API Calls
  const fetchViewsData = async (page, filters) => {
    try {
      setViewsLoading(true);

      const queryParams = new URLSearchParams({
        Page: page,
        "ShowMore.Take": 10,
        ...(filters.interestLevel && { InterestLevel: filters.interestLevel }),
      });

      const response = await fetch(
        `https://bravoadmin.uplms.org/api/News/getallnewsinterestanalysis/reporting?${queryParams}`,
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"), // Authorized request
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
    } catch (error) {
      console.error("Error fetching news views data:", error);
      setError(error.message);
    } finally {
      setViewsLoading(false);
    }
  };

  const fetchLikesData = async (page, filters) => {
    try {
      setLikesLoading(true);

      const queryParams = new URLSearchParams({
        Page: page,
        "ShowMore.Take": 10,
        ...(filters.interestLevel && { InterestLevel: filters.interestLevel }),
      });

      const response = await fetch(
        `https://bravoadmin.uplms.org/api/News/getallnewslikeinterestanalysis/reporting?${queryParams}`,
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
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
        ...(filters.interestLevel && { InterestLevel: filters.interestLevel }),
      });

      const response = await fetch(
        `https://bravoadmin.uplms.org/api/News/getallnewssaveinterestanalysis/reporting?${queryParams}`,
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
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
        ...(filters.interestLevel && { InterestLevel: filters.interestLevel }),
        ...(filters.newsCategory && { NewsCategory: filters.newsCategory }),
      });

      const response = await fetch(
        `https://bravoadmin.uplms.org/api/News/getallnewscategoryinterestanalysis/reporting?${queryParams}`,
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
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
            Authorization: "Bearer " + localStorage.getItem("token"),
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
            Authorization: "Bearer " + localStorage.getItem("token"),
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

  // Export functions
  const handleViewsExport = async () => {
    try {
      const response = await fetch(
        "https://bravoadmin.uplms.org/api/News/interest-analysis/excel",
        {
          method: "GET",
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
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
      const response = await fetch(
        "https://bravoadmin.uplms.org/api/News/export-news-like-analysis/reporting",
        {
          method: "GET",
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
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
      const response = await fetch(
        "https://bravoadmin.uplms.org/api/News/export-news-save-analysis/reporting",
        {
          method: "GET",
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
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
      const response = await fetch(
        "https://bravoadmin.uplms.org/api/News/activity-report/excel",
        {
          method: "GET",
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
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
    setViewsFilters((prev) => ({ ...prev, [key]: value }));
    setViewsPage(1);
  };

  const handleLikesFilterChange = (key, value) => {
    setLikesFilters((prev) => ({ ...prev, [key]: value }));
    setLikesPage(1);
  };

  const handleSavesFilterChange = (key, value) => {
    setSavesFilters((prev) => ({ ...prev, [key]: value }));
    setSavesPage(1);
  };

  const handleCategoriesFilterChange = (key, value) => {
    setCategoriesFilters((prev) => ({ ...prev, [key]: value }));
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
    if (!viewsData && !viewsLoading) fetchViewsData(1, {});
    if (!likesData && !likesLoading) fetchLikesData(1, {});
    if (!savesData && !savesLoading) fetchSavesData(1, {});
  }, [
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

  // Tab navigation
  const tabs = [
    { id: "views", label: "Views", icon: Eye },
    { id: "likes", label: "Likes", icon: ThumbsUp },
    { id: "saves", label: "Saves", icon: Bookmark },
    { id: "categories", label: "Categories", icon: Layers },
    { id: "activity", label: "Activity", icon: Clock },
  ];

  // Helper for simulating hourly and daily activity data
  const generateActivityData = () => {
    if (!activityData) return { hourly: [], weekly: [] };

    // This would normally come from the API, but we'll simulate it for now
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

  const { hourlyData, weeklyData } = generateActivityData();

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

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={Eye}
          value={getUniqueViews()}
          label="Unique Views"
          trend={3.2}
          color="#6A98F0"
        />
        <StatCard
          icon={ThumbsUp}
          value={getUniqueLikes()}
          label="Unique Likes"
          trend={5.7}
          color="#F4A259"
        />
        <StatCard
          icon={Bookmark}
          value={getUniqueSaves()}
          label="Unique Saves"
          trend={2.1}
          color="#A362EF"
        />
        <StatCard
          icon={BarChart2}
          value={`${getEngagementRate()}%`}
          label="Engagement Rate"
          trend={4.3}
          color="#48BB78"
        />
      </div>

      {/* Engagement Comparison Chart */}
      <ChartCard title="News Engagement Overview" className="mb-6">
        <EngagementComparisonChart
          viewsData={viewsData?.news}
          likesData={likesData?.news}
          savesData={savesData?.news}
        />
      </ChartCard>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
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
              />

              {viewsLoading ? (
                <LoadingSpinner />
              ) : !viewsData?.news || viewsData.news.length === 0 ? (
                <NoDataMessage
                  message={
                    viewsFilters.interestLevel
                      ? `No news found with interest level "${viewsFilters.interestLevel}"`
                      : "No news data available"
                  }
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        <th className="text-left font-medium text-gray-500 pb-4">
                          News ID
                        </th>
                        <th className="text-left font-medium text-gray-500 pb-4">
                          Total Views
                        </th>
                        <th className="text-left font-medium text-gray-500 pb-4">
                          Unique Views
                        </th>
                        <th className="text-left font-medium text-gray-500 pb-4">
                          Target Group
                        </th>
                        <th className="text-left font-medium text-gray-500 pb-4">
                          View %
                        </th>
                        <th className="text-left font-medium text-gray-500 pb-4">
                          Interest Level
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewsData.news.map((item) => (
                        <tr key={item.id} className="border-t">
                          <td className="py-4">{item.id}</td>
                          <td className="py-4">{item.totalView}</td>
                          <td className="py-4">{item.uniqueView}</td>
                          <td className="py-4">
                            {item.targetGroupEmployeeCount}
                          </td>
                          <td className="py-4">{item.uniqueViewPercentage}%</td>
                          <td className="py-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium
                                ${
                                  item.interestLevel === "Low"
                                    ? "bg-red-200 text-red-800"
                                    : item.interestLevel === "Normal"
                                    ? "bg-green-200 text-green-800"
                                    : "bg-blue-200 text-blue-800"
                                }`}
                            >
                              {item.interestLevel}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {totalViewsCount > 10 && (
                    <Pagination
                      currentPage={viewsPage}
                      totalPages={Math.max(1, Math.ceil(totalViewsCount / 10))}
                      onPageChange={setViewsPage}
                      disabled={viewsLoading}
                    />
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
              />

              {likesLoading ? (
                <LoadingSpinner />
              ) : !likesData?.news || likesData.news.length === 0 ? (
                <NoDataMessage
                  message={
                    likesFilters.interestLevel
                      ? `No news likes found with interest level "${likesFilters.interestLevel}"`
                      : "No news likes data available"
                  }
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        <th className="text-left font-medium text-gray-500 pb-4">
                          News ID
                        </th>
                        <th className="text-left font-medium text-gray-500 pb-4">
                          Total Views
                        </th>
                        <th className="text-left font-medium text-gray-500 pb-4">
                          Unique Likes
                        </th>
                        <th className="text-left font-medium text-gray-500 pb-4">
                          Target Group
                        </th>
                        <th className="text-left font-medium text-gray-500 pb-4">
                          Like %
                        </th>
                        <th className="text-left font-medium text-gray-500 pb-4">
                          Interest Level
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {likesData.news.map((item) => (
                        <tr key={item.id} className="border-t">
                          <td className="py-4">{item.id}</td>
                          <td className="py-4">{item.totalView}</td>
                          <td className="py-4">{item.uniqueLike}</td>
                          <td className="py-4">
                            {item.targetGroupEmployeeCount}
                          </td>
                          <td className="py-4">{item.uniqueLikePercentage}%</td>
                          <td className="py-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium
                                ${
                                  item.interestLevel === "Low"
                                    ? "bg-red-200 text-red-800"
                                    : item.interestLevel === "Normal"
                                    ? "bg-green-200 text-green-800"
                                    : "bg-blue-200 text-blue-800"
                                }`}
                            >
                              {item.interestLevel}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {totalLikesCount > 10 && (
                    <Pagination
                      currentPage={likesPage}
                      totalPages={Math.max(1, Math.ceil(totalLikesCount / 10))}
                      onPageChange={setLikesPage}
                      disabled={likesLoading}
                    />
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
              />

              {savesLoading ? (
                <LoadingSpinner />
              ) : !savesData?.news || savesData.news.length === 0 ? (
                <NoDataMessage
                  message={
                    savesFilters.interestLevel
                      ? `No news saves found with interest level "${savesFilters.interestLevel}"`
                      : "No news saves data available"
                  }
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        <th className="text-left font-medium text-gray-500 pb-4">
                          News ID
                        </th>
                        <th className="text-left font-medium text-gray-500 pb-4">
                          Total Views
                        </th>
                        <th className="text-left font-medium text-gray-500 pb-4">
                          Unique Saves
                        </th>
                        <th className="text-left font-medium text-gray-500 pb-4">
                          Target Group
                        </th>
                        <th className="text-left font-medium text-gray-500 pb-4">
                          Save %
                        </th>
                        <th className="text-left font-medium text-gray-500 pb-4">
                          Interest Level
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {savesData.news.map((item) => (
                        <tr key={item.id} className="border-t">
                          <td className="py-4">{item.id}</td>
                          <td className="py-4">{item.totalView}</td>
                          <td className="py-4">{item.uniqueSave}</td>
                          <td className="py-4">
                            {item.targetGroupEmployeeCount}
                          </td>
                          <td className="py-4">{item.uniqueSavePercentage}%</td>
                          <td className="py-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium
                                ${
                                  item.interestLevel === "Low"
                                    ? "bg-red-200 text-red-800"
                                    : item.interestLevel === "Normal"
                                    ? "bg-green-200 text-green-800"
                                    : "bg-blue-200 text-blue-800"
                                }`}
                            >
                              {item.interestLevel}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {totalSavesCount > 10 && (
                    <Pagination
                      currentPage={savesPage}
                      totalPages={Math.max(1, Math.ceil(totalSavesCount / 10))}
                      onPageChange={setSavesPage}
                      disabled={savesLoading}
                    />
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
                categoryOptions={categoryOptions}
                onExport={handleViewsExport}
              />

              {categoriesLoading ? (
                <LoadingSpinner />
              ) : !categoriesData?.newsCategories ||
                categoriesData.newsCategories.length === 0 ? (
                <NoDataMessage
                  message={
                    categoriesFilters.interestLevel
                      ? `No categories found with interest level "${categoriesFilters.interestLevel}"`
                      : "No categories data available"
                  }
                />
              ) : (
                <>
                  <div className="mb-6">
                    <CategoryDistributionChart
                      data={categoriesData.newsCategories}
                    />
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr>
                          <th className="text-left font-medium text-gray-500 pb-4">
                            Category Name
                          </th>
                          <th className="text-left font-medium text-gray-500 pb-4">
                            News Count
                          </th>
                          <th className="text-left font-medium text-gray-500 pb-4">
                            Total Views
                          </th>
                          <th className="text-left font-medium text-gray-500 pb-4">
                            Unique Views
                          </th>
                          <th className="text-left font-medium text-gray-500 pb-4">
                            % of Content
                          </th>
                          <th className="text-left font-medium text-gray-500 pb-4">
                            Interest Level
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {categoriesData.newsCategories.map((item) => (
                          <tr key={item.categoryId} className="border-t">
                            <td className="py-4 font-medium">
                              {item.categoryName}
                            </td>
                            <td className="py-4">{item.totalNewsCount}</td>
                            <td className="py-4">{item.totalView}</td>
                            <td className="py-4">{item.uniqueView}</td>
                            <td className="py-4">
                              {item.newsCountPercentage}%
                            </td>
                            <td className="py-4">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium
                                  ${
                                    item.interestLevel === "Low"
                                      ? "bg-red-200 text-red-800"
                                      : item.interestLevel === "Normal"
                                      ? "bg-green-200 text-green-800"
                                      : "bg-blue-200 text-blue-800"
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
                      <Pagination
                        currentPage={categoriesPage}
                        totalPages={Math.max(
                          1,
                          Math.ceil(totalCategoriesCount / 10)
                        )}
                        onPageChange={setCategoriesPage}
                        disabled={categoriesLoading}
                      />
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
                    />
                    <StatCard
                      icon={Calendar}
                      value={activityData.mostActiveDay || "Monday"}
                      label="Most Active Day"
                    />
                    <StatCard
                      icon={Smartphone}
                      value={activityData.mostUsedDevice || "Mobile"}
                      label="Most Used Device"
                    />
                  </div>

                  <ChartCard title="Device Usage">
                    <DeviceUsageChart data={activityData} />
                  </ChartCard>

                  <ChartCard title="Activity Patterns">
                    <ActiveTimeChart
                      hourlyData={hourlyData}
                      weeklyData={weeklyData}
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
