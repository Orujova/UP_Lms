"use client";
import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area,
  LineChart,
  Line,
} from "recharts";
import {
  BarChart2,
  Eye,
  Users,
  Target,
  Download,
  Megaphone,
  Newspaper,
  Calendar,
  Filter,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  User,
  Search,
  RefreshCw,
  Info,
  ExternalLink,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { useRouter } from "next/navigation";
import NewsAnalytics from "@/components/newsAnalytics";
import StatCard from "@/components/statCard";
import LoadingSpinner from "@/components/loadingSpinner";
import Pagination from "@/components/ListPagination";

// Soft color palette - even softer colors
const SOFT_COLORS = ["#A7F3D0", "#FDE68A", "#FECACA"]; // Very soft green, yellow, red
const CHART_COLORS = {
  totalViews: "#7DD3FC", // Very soft blue
  uniqueViews: "#86EFAC", // Very soft green
};

const ITEMS_PER_PAGE = 10;

// Tab Component
const Tab = ({ active, label, icon: Icon, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-5 py-2.5 rounded-t-lg transition-colors text-sm ${
      active
        ? "bg-white text-gray-900 font-medium border-t border-l border-r border-gray-200"
        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
    }`}
  >
    <Icon className="w-4 h-4" />
    {label}
  </button>
);

const ChartCard = ({ title, children }) => (
  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <h3 className="text-gray-900 font-semibold mb-5 text-sm flex items-center">
      {title}
      <span className="ml-2 text-gray-400 hover:text-gray-600 cursor-pointer">
        <Info className="w-4 h-4" />
      </span>
    </h3>
    {children}
  </div>
);

const FilterBar = ({
  filters,
  onFilterChange,
  onDateChange,
  onExport,
  onReset,
  creators = [],
}) => {
  return (
    <div className="bg-white rounded-xl p-5 mb-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold text-gray-900">
          Announcement Interest Analysis
        </h3>
        <button
          onClick={onExport}
          className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
        >
          <Download className="w-4 h-4" />
          Export to Excel
        </button>
      </div>

      {/* Filter Controls - Better Layout */}
      <div className="space-y-4">
        {/* First Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">
              Created Date Range
            </label>
            <div className="flex items-center gap-3">
              <input
                type="date"
                placeholder="mm/dd/yyyy"
                value={
                  filters.StartCreatedDate
                    ? filters.StartCreatedDate.split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  onDateChange("StartCreatedDate", e.target.value)
                }
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-0 focus:border-[#01DBC8]"
              />
              <span className="text-gray-400 text-xs font-medium">to</span>
              <input
                type="date"
                placeholder="mm/dd/yyyy"
                value={
                  filters.EndCreatedDate
                    ? filters.EndCreatedDate.split("T")[0]
                    : ""
                }
                onChange={(e) => onDateChange("EndCreatedDate", e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-0 focus:border-[#01DBC8]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">
              Created By
            </label>
            <select
              value={filters.CreatedBy || ""}
              onChange={(e) => onFilterChange("CreatedBy", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-0 focus:border-[#01DBC8]"
            >
              <option value="">All</option>
              {creators.map((creator, index) => (
                <option key={index} value={creator}>
                  {creator}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">
              Interest Level
            </label>
            <select
              value={filters.InterestLevel || ""}
              onChange={(e) => onFilterChange("InterestLevel", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-0 focus:border-[#01DBC8]"
            >
              <option value="">All Interest Levels</option>
              <option value="Low">Low</option>
              <option value="Normal">Normal</option>
              <option value="High">High</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">Actions</label>
            <div className="flex gap-3">
              <button
                onClick={onReset}
                className="flex items-center gap-2 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-xs border border-gray-300"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const NoDataMessage = ({ message, loading, isError }) => (
  <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
    {loading ? (
      <div>
        <LoadingSpinner />
      </div>
    ) : (
      <>
        {isError ? (
          <AlertTriangle className="w-12 h-12 text-orange-400 mx-auto mb-4" />
        ) : (
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        )}
        <p className="text-gray-500 mb-2 text-sm">{message}</p>
        {!isError && (
          <p className="text-xs text-gray-400">
            Try adjusting your filters or creating new announcements
          </p>
        )}
      </>
    )}
  </div>
);

const AnalyticsDashboard = () => {
  const router = useRouter();

  // Tab state
  const [activeTab, setActiveTab] = useState("announcements");

  // Announcements data states
  const [allData, setAllData] = useState(null); // All data for charts
  const [tableData, setTableData] = useState({ announcements: [] }); // Paginated data for table
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [creators, setCreators] = useState([]);
  const [filters, setFilters] = useState({
    InterestLevel: "",
    StartViewDate: "",
    EndViewDate: "",
    StartCreatedDate: "",
    EndCreatedDate: "",
    CreatedBy: "",
  });

  // Utility function to format date for API
  const formatDateForApi = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString();
  };

  // Utility to check if any filters are active
  const hasActiveFilters = () => {
    return Object.values(filters).some((val) => val !== "");
  };

  // Navigate to announcement detail page
  const navigateToDetail = (id) => {
    router.push(`/admin/dashboard/announcements/${id}`);
  };

  // Extract unique creators from data
  const extractCreators = (data) => {
    if (!data || !data.announcements || !Array.isArray(data.announcements))
      return [];

    const creatorSet = new Set();
    data.announcements.forEach((announcement) => {
      if (announcement.createdBy) {
        creatorSet.add(announcement.createdBy);
      }
    });

    return Array.from(creatorSet).sort();
  };

  // Fetch all data for charts (without pagination)
  const fetchAllData = async () => {
    try {
      const queryParams = new URLSearchParams();

      // Add filters without pagination
      if (filters.InterestLevel)
        queryParams.append("InterestLevel", filters.InterestLevel);
      if (filters.CreatedBy) queryParams.append("CreatedBy", filters.CreatedBy);

      if (filters.StartViewDate)
        queryParams.append(
          "StartViewDate",
          formatDateForApi(filters.StartViewDate)
        );
      if (filters.EndViewDate)
        queryParams.append(
          "EndViewDate",
          formatDateForApi(filters.EndViewDate)
        );
      if (filters.StartCreatedDate)
        queryParams.append(
          "StartCreatedDate",
          formatDateForApi(filters.StartCreatedDate)
        );
      if (filters.EndCreatedDate)
        queryParams.append(
          "EndCreatedDate",
          formatDateForApi(filters.EndCreatedDate)
        );

      // Fetch all data without pagination for charts
      const response = await fetch(
        `https://bravoadmin.uplms.org/api/Announcement/getallannouncementinterestanalysis/reporting?${queryParams}`,
        {
          method: "GET",
          headers: {
            Accept: "*/*",
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data && Array.isArray(data) && data.length > 0) {
        setAllData(data[0]);
        setTotalCount(data[0].totalAnnouncementCount || 0);

        // Extract unique creators for dropdown
        const uniqueCreators = extractCreators(data[0]);
        setCreators(uniqueCreators);
      } else {
        setAllData({ totalAnnouncementCount: 0, announcements: [] });
        setTotalCount(0);
      }
      setError(null);
    } catch (error) {
      console.error("Error fetching all data:", error);
      setError(error.message);
      setAllData({ totalAnnouncementCount: 0, announcements: [] });
      setTotalCount(0);
    }
  };

  // Fetch paginated data for table
  const fetchTableData = async (page = 1) => {
    try {
      setTableLoading(true);
      const queryParams = new URLSearchParams();

      // Add pagination
      queryParams.append("Page", page);
      queryParams.append("ShowMore.Take", ITEMS_PER_PAGE);

      // Add filters
      if (filters.InterestLevel)
        queryParams.append("InterestLevel", filters.InterestLevel);
      if (filters.CreatedBy) queryParams.append("CreatedBy", filters.CreatedBy);

      if (filters.StartViewDate)
        queryParams.append(
          "StartViewDate",
          formatDateForApi(filters.StartViewDate)
        );
      if (filters.EndViewDate)
        queryParams.append(
          "EndViewDate",
          formatDateForApi(filters.EndViewDate)
        );
      if (filters.StartCreatedDate)
        queryParams.append(
          "StartCreatedDate",
          formatDateForApi(filters.StartCreatedDate)
        );
      if (filters.EndCreatedDate)
        queryParams.append(
          "EndCreatedDate",
          formatDateForApi(filters.EndCreatedDate)
        );

      const response = await fetch(
        `https://bravoadmin.uplms.org/api/Announcement/getallannouncementinterestanalysis/reporting?${queryParams}`,
        {
          method: "GET",
          headers: {
            Accept: "*/*",
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data && Array.isArray(data) && data.length > 0) {
        setTableData(data[0]);
      } else {
        setTableData({ announcements: [] });
      }
    } catch (error) {
      console.error("Error fetching table data:", error);
      setTableData({ announcements: [] });
    } finally {
      setTableLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (activeTab === "announcements") {
      const fetchInitialData = async () => {
        setLoading(true);
        await Promise.all([fetchAllData(), fetchTableData(currentPage)]);
        setLoading(false);
      };
      fetchInitialData();
    }
  }, [activeTab, filters]);

  // Fetch table data when page changes
  useEffect(() => {
    if (activeTab === "announcements" && !loading) {
      fetchTableData(currentPage);
    }
  }, [currentPage]);

  const handleFilterChange = (key, value) => {
    if (key === "reset") {
      setFilters({
        InterestLevel: "",
        StartViewDate: "",
        EndViewDate: "",
        StartCreatedDate: "",
        EndCreatedDate: "",
        CreatedBy: "",
      });
    } else {
      setFilters((prev) => ({ ...prev, [key]: value }));
    }
    setCurrentPage(1);
  };

  const handleDateChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleReset = () => {
    handleFilterChange("reset", "");
  };

  const handleExport = async () => {
    try {
      const queryParams = new URLSearchParams();

      if (filters.InterestLevel)
        queryParams.append("InterestLevel", filters.InterestLevel);
      if (filters.CreatedBy) queryParams.append("CreatedBy", filters.CreatedBy);

      if (filters.StartViewDate)
        queryParams.append(
          "StartViewDate",
          formatDateForApi(filters.StartViewDate)
        );
      if (filters.EndViewDate)
        queryParams.append(
          "EndViewDate",
          formatDateForApi(filters.EndViewDate)
        );
      if (filters.StartCreatedDate)
        queryParams.append(
          "StartCreatedDate",
          formatDateForApi(filters.StartCreatedDate)
        );
      if (filters.EndCreatedDate)
        queryParams.append(
          "EndCreatedDate",
          formatDateForApi(filters.EndCreatedDate)
        );

      const response = await fetch(
        `https://bravoadmin.uplms.org/api/Announcement/exportannouncementinterestanalysis/reporting?${queryParams.toString()}`,
        {
          method: "GET",
          headers: {
            Accept: "*/*",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Export failed: ${response.status} ${response.statusText}`
        );
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Export failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "announcement-analysis.xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export error:", error);
      alert("Export failed: " + error.message);
    }
  };

  // Calculate statistics from all data (not paginated)
  const totalViews =
    allData?.announcements?.reduce(
      (sum, item) => sum + (item.totalView || 0),
      0
    ) || 0;

  const uniqueViews =
    allData?.announcements?.reduce(
      (sum, item) => sum + (item.uniqueView || 0),
      0
    ) || 0;

  const avgEngagement =
    allData?.announcements?.length > 0
      ? allData.announcements.reduce(
          (sum, item) => sum + (item.uniqueViewPercentage || 0),
          0
        ) / allData.announcements.length
      : 0;

  // Create interest level distribution from all data
  const interestLevelData =
    allData?.announcements?.reduce((acc, item) => {
      if (!item.interestLevel) return acc;
      const existing = acc.find((x) => x.name === item.interestLevel);
      if (existing) {
        existing.value++;
      } else {
        acc.push({ name: item.interestLevel, value: 1 });
      }
      return acc;
    }, []) || [];

  // Prepare view trends data from all data
  const viewTrendsData =
    allData?.announcements?.length > 0
      ? (() => {
          const groupedByDate = allData.announcements.reduce((acc, item) => {
            const createdDate = item.createdDate
              ? new Date(item.createdDate)
              : new Date();
            const dateKey = createdDate.toDateString();

            if (!acc[dateKey]) {
              acc[dateKey] = {
                date: createdDate,
                totalView: 0,
                uniqueView: 0,
                count: 0,
              };
            }

            acc[dateKey].totalView += item.totalView || 0;
            acc[dateKey].uniqueView += item.uniqueView || 0;
            acc[dateKey].count += 1;

            return acc;
          }, {});

          const sortedData = Object.values(groupedByDate)
            .sort((a, b) => a.date - b.date)
            .slice(0, 7);

          let cumulativeTotalViews = 0;
          let cumulativeUniqueViews = 0;

          return sortedData.map((item) => {
            cumulativeTotalViews += item.totalView;
            cumulativeUniqueViews += item.uniqueView;

            const formattedDate = `${item.date.toLocaleDateString("en-US", {
              month: "short",
            })} ${String(item.date.getDate()).padStart(2, "0")}`;

            return {
              date: formattedDate,
              totalView: cumulativeTotalViews,
              uniqueView: cumulativeUniqueViews,
              announcements: item.count,
            };
          });
        })()
      : [];

  // Render loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-14">
      <div>
        {/* Header section */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Analytics Dashboard
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Track and analyze content performance metrics
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex mb-5 border-b border-gray-200">
          <Tab
            active={activeTab === "announcements"}
            label="Announcements"
            icon={Megaphone}
            onClick={() => setActiveTab("announcements")}
          />
          <Tab
            active={activeTab === "news"}
            label="News"
            icon={Newspaper}
            onClick={() => setActiveTab("news")}
          />
        </div>

        {activeTab === "announcements" ? (
          <>
            {/* Error message */}
            {error && (
              <div className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded-lg mb-5 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="text-sm">
                  Error loading data: {error}. Please try again later or contact
                  support if the issue persists.
                </span>
              </div>
            )}

            {/* Filter bar */}
            <FilterBar
              filters={filters}
              onFilterChange={handleFilterChange}
              onDateChange={handleDateChange}
              onExport={handleExport}
              onReset={handleReset}
              creators={creators}
            />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
              <StatCard
                icon={Megaphone}
                value={allData?.totalAnnouncementCount || 0}
                label="Total Announcements"
                description="Published announcements"
                color="blue"
              />
              <StatCard
                icon={Eye}
                value={totalViews}
                label="Total Views"
                description="All announcement views"
                color="purple"
              />
              <StatCard
                icon={Users}
                value={uniqueViews}
                label="Unique Views"
                description="Individual user views"
                color="green"
              />
              <StatCard
                icon={Target}
                value={`${avgEngagement.toFixed(1)}%`}
                label="Engagement Rate"
                description="Average interaction rate"
                color="orange"
              />
            </div>

            {/* Charts section */}
            {error ? (
              <NoDataMessage
                message="Unable to load chart data. Please try again later."
                loading={false}
                isError={true}
              />
            ) : allData &&
              allData.announcements &&
              allData.announcements.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
                <ChartCard title="Interest Level Distribution">
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={interestLevelData}
                          cx="50%"
                          cy="50%"
                          outerRadius={70}
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {interestLevelData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={SOFT_COLORS[index % SOFT_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            fontSize: "12px",
                            backgroundColor: "#fff",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                          }}
                          formatter={(value, name) => [
                            `${value} announcements`,
                            name,
                          ]}
                        />
                        <Legend wrapperStyle={{ fontSize: "12px" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>

                <ChartCard title="View Trends">
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={viewTrendsData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 11, fill: "#666" }}
                        />
                        <YAxis tick={{ fontSize: 11, fill: "#666" }} />
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
                          dataKey="totalView"
                          stroke={CHART_COLORS.totalViews}
                          strokeWidth={2}
                          name="Total Views"
                          dot={{ r: 3 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="uniqueView"
                          stroke={CHART_COLORS.uniqueViews}
                          strokeWidth={2}
                          name="Unique Views"
                          dot={{ r: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>
              </div>
            ) : (
              <NoDataMessage
                message={
                  hasActiveFilters()
                    ? "No data found with the current filters"
                    : "No announcement data available"
                }
                loading={loading}
                isError={false}
              />
            )}

            {/* Table section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-gray-900">
                    Detailed Analytics
                  </h3>
                  <div className="text-xs text-gray-500">
                    Showing {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)}{" "}
                    of {totalCount} entries
                  </div>
                </div>
              </div>

              {tableLoading ? (
                <div className="py-8">
                  <LoadingSpinner />
                </div>
              ) : error ? (
                <NoDataMessage
                  message="Unable to load table data. Please try again later."
                  loading={false}
                  isError={true}
                />
              ) : !tableData?.announcements ||
                tableData.announcements.length === 0 ? (
                <NoDataMessage
                  message={
                    hasActiveFilters()
                      ? "No announcements found with the current filters"
                      : "No announcement data available"
                  }
                  loading={false}
                  isError={false}
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="text-left font-medium text-gray-600 py-3 px-4 text-xs">
                          ID
                        </th>
                        <th className="text-left font-medium text-gray-600 py-3 px-4 text-xs">
                          Title
                        </th>
                        <th className="text-left font-medium text-gray-600 py-3 px-4 text-xs">
                          Created By
                        </th>
                        <th className="text-center font-medium text-gray-600 py-3 px-4 text-xs">
                          Total View
                        </th>
                        <th className="text-center font-medium text-gray-600 py-3 px-4 text-xs">
                          Unique View
                        </th>
                        <th className="text-center font-medium text-gray-600 py-3 px-4 text-xs">
                          Target Group
                        </th>
                        <th className="text-center font-medium text-gray-600 py-3 px-4 text-xs">
                          View %
                        </th>
                        <th className="text-center font-medium text-gray-600 py-3 px-4 text-xs">
                          Interest Level
                        </th>
                        <th className="text-center font-medium text-gray-600 py-3 px-4 text-xs">
                          Created Date
                        </th>
                        <th className="text-center font-medium text-gray-600 py-3 px-4 text-xs">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.announcements.map((item, index) => (
                        <tr
                          key={item.id}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-3 px-4 text-xs text-gray-900">
                            {item.id}
                          </td>
                          <td className="py-3 px-4 text-xs font-medium text-gray-900 max-w-xs truncate">
                            <div className="truncate" title={item.title}>
                              {item.title || "—"}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-xs text-gray-600">
                            <div className="flex items-center">
                              <User className="w-3 h-3 mr-1.5 text-gray-400 flex-shrink-0" />
                              <span className="truncate">
                                {item.createdBy || "—"}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-xs text-center text-gray-900">
                            <span className="font-medium">
                              {(item.totalView || 0).toLocaleString()}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-xs text-center text-gray-900">
                            <span className="font-medium">
                              {(item.uniqueView || 0).toLocaleString()}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-xs text-center text-gray-900">
                            <span className="font-medium">
                              {(
                                item.targetGroupEmployeeCount || 0
                              ).toLocaleString()}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-xs text-center text-gray-900">
                            <span className="font-medium">
                              {(item.uniqueViewPercentage || 0).toFixed(1)}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-xs text-center">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium inline-block whitespace-nowrap
                              ${
                                item.interestLevel === "Low"
                                  ? "bg-red-100 text-red-700 border border-red-200"
                                  : item.interestLevel === "Normal"
                                  ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                                  : item.interestLevel === "High"
                                  ? "bg-green-100 text-green-700 border border-green-200"
                                  : "bg-gray-100 text-gray-700 border border-gray-200"
                              }`}
                            >
                              {item.interestLevel || "Unknown"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-xs text-center text-gray-600">
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {item.createdDate
                                  ? new Date(
                                      item.createdDate
                                    ).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })
                                  : "—"}
                              </span>
                              {item.createdDate && (
                                <span className="text-gray-400 text-xs">
                                  {new Date(
                                    item.createdDate
                                  ).toLocaleTimeString("en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-xs text-center">
                            <button
                              onClick={() => navigateToDetail(item.id)}
                              className="text-[#01DBC8] hover:text-[#01afa0] transition-colors p-1 rounded hover:bg-[#01DBC8]/10"
                              title="View Details"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {totalCount > ITEMS_PER_PAGE && (
                    <Pagination
                      totalItems={totalCount}
                      currentPage={currentPage}
                      onPageChange={setCurrentPage}
                      itemsPerPage={ITEMS_PER_PAGE}
                    />
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <NewsAnalytics />
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
