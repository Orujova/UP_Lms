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
} from "recharts";
import {
  BarChart2,
  Eye,
  Users,
  Target,
  Download,
  Megaphone,
  Newspaper,
} from "lucide-react";
import NewsAnalytics from "@/components/newsAnalytics";
import StatCard from "@/components/statCard";
import Pagination from "@/components/reportPagination";

import Lottie from "react-lottie-player";
import report from "../../../../animations/reports.json";

const COLORS = ["#7EC8E3", "#FFD580", "#FFB3B3"];
const CHART_COLORS = {
  totalViews: "#6A98F0",
  uniqueViews: "#F4A259",
};

const ITEMS_PER_PAGE = 10;

// Tab Component
const Tab = ({ active, label, icon: Icon, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-3 rounded-t-lg transition-colors ${
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
  <div className="bg-white rounded-lg p-6">
    <h3 className="text-gray-900 font-semibold mb-6">{title}</h3>
    {children}
  </div>
);

const FilterBar = ({ filters, onFilterChange, onExport }) => (
  <div className="bg-white rounded-lg p-4 mb-6 flex items-center justify-between">
    <div className="flex items-center gap-4">
      <select
        value={filters.interestLevel}
        onChange={(e) => onFilterChange("interestLevel", e.target.value)}
        className="border rounded-lg px-3 py-2 text-sm outline-0 focus:ring-0 focus:border-[#01DBC8] cursor-pointer"
      >
        <option value="">All Interest Levels</option>
        <option value="Low">Low</option>
        <option value="Normal">Normal</option>
        <option value="High">High</option>
      </select>
    </div>
    <button
      onClick={onExport}
      className="flex items-center gap-2 bg-[#f9fefe] text-[#127D74] px-4 py-2 rounded-lg hover:bg-[#f2fdfc] transition-colors"
    >
      <Download className="w-4 h-4" />
      Export
    </button>
  </div>
);

const NoDataMessage = ({ message }) => (
  <div className="text-center py-8">
    <p className="text-gray-500">{message}</p>
  </div>
);

const AnalyticsDashboard = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState("announcements");

  // Announcements data states
  const [overallData, setOverallData] = useState(null);
  const [tableData, setTableData] = useState({ announcements: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState({
    interestLevel: "",
  });

  // Fetch overall data for charts and statistics
  const fetchOverallData = async (filters) => {
    try {
      const queryParams = new URLSearchParams({
        ...(filters.interestLevel && { InterestLevel: filters.interestLevel }),
      });

      const response = await fetch(
        `https://bravoadmin.uplms.org/api/Announcement/getallannouncementinterestanalysis/reporting?${queryParams}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch overall data");
      }

      const jsonData = await response.json();
      if (jsonData && Array.isArray(jsonData) && jsonData.length > 0) {
        setOverallData(jsonData[0]);
      }
    } catch (error) {
      console.error("Error fetching overall data:", error);
    }
  };

  // Fetch paginated data for table
  const fetchTableData = async (page, filters) => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        Page: page,
        "ShowMore.Take": ITEMS_PER_PAGE,
        ...(filters.interestLevel && { InterestLevel: filters.interestLevel }),
      });

      const response = await fetch(
        `https://bravoadmin.uplms.org/api/Announcement/getallannouncementinterestanalysis/reporting?${queryParams}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch table data");
      }

      const jsonData = await response.json();

      if (!jsonData || !Array.isArray(jsonData) || jsonData.length === 0) {
        setTableData({ announcements: [] });
        setTotalCount(0);
        return;
      }

      const firstItem = jsonData[0];
      setTotalCount(firstItem.totalAnnouncementCount || 0);
      setTableData(firstItem);
    } catch (error) {
      console.error("Error fetching table data:", error);
      setError(error.message);
      setTableData({ announcements: [] });
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Effect for fetching both overall and table data
  useEffect(() => {
    if (activeTab === "announcements") {
      fetchOverallData(filters);
      fetchTableData(currentPage, filters);
    }
  }, [activeTab, currentPage, filters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleExport = async () => {
    try {
      const response = await fetch(
        "https://bravoadmin.uplms.org/api/Announcement/exportannouncementinterestanalysis/reporting",
        {
          method: "GET",
        }
      );

      if (!response.ok) throw new Error("Export failed");

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

  // Calculate statistics from overall data
  const totalViews =
    overallData?.announcements?.reduce(
      (sum, item) => sum + (item.totalView || 0),
      0
    ) || 0;

  const avgEngagement =
    overallData?.totalAnnouncementCount > 0
      ? (totalViews / overallData.totalAnnouncementCount).toFixed(2)
      : "0.00";

  const totalEmployees =
    overallData?.announcements?.reduce(
      (sum, item) => sum + (item.targetGroupEmployeeCount || 0),
      0
    ) || 0;

  const interestLevelData =
    overallData?.announcements?.reduce((acc, item) => {
      if (!item.interestLevel) return acc;
      const existing = acc.find((x) => x.name === item.interestLevel);
      if (existing) {
        existing.value++;
      } else {
        acc.push({ name: item.interestLevel, value: 1 });
      }
      return acc;
    }, []) || [];

  // Render loading state
  if (loading && !overallData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Lottie
          loop
          animationData={report}
          play
          style={{ width: 400, height: 400 }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pt-10">
      <div className="max-w-7xl mx-auto">
        {/* Header section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Analytics Dashboard
            </h1>
            <p className="text-gray-500 mt-1">
              Track and analyze your content performance
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex mb-6 border-b border-gray-200">
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
            {/* Filter bar */}
            <FilterBar
              filters={filters}
              onFilterChange={handleFilterChange}
              onExport={handleExport}
            />

            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard
                icon={BarChart2}
                value={overallData?.totalAnnouncementCount || 0}
                label="Total Announcements"
                trend={5.2}
              />
              <StatCard
                icon={Eye}
                value={totalViews}
                label="Total Views"
                trend={-2.1}
              />
              <StatCard
                icon={Users}
                value={avgEngagement}
                label="Avg. Engagement"
                trend={3.8}
              />
              <StatCard
                icon={Target}
                value={totalEmployees}
                label="Target Employees"
                trend={1.5}
              />
            </div>

            {/* Charts section */}
            {overallData && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                <ChartCard title="Interest Level Distribution">
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={interestLevelData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label
                        >
                          {interestLevelData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>

                <ChartCard title="Views by Announcement">
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={overallData.announcements}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                        <XAxis dataKey="id" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar
                          dataKey="totalView"
                          fill={CHART_COLORS.totalViews}
                          name="Total Views"
                        />
                        <Bar
                          dataKey="uniqueView"
                          fill={CHART_COLORS.uniqueViews}
                          name="Unique Views"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>
              </div>
            )}

            {/* Table section */}
            <div className="bg-white rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-gray-900 font-semibold">
                  Detailed Metrics
                </h3>
              </div>

              {loading && tableData && (
                <div className="flex justify-center py-4">
                  <div className="w-8 h-8 border-2 border-[#0AAC9E] border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {!loading &&
              (!tableData?.announcements ||
                tableData.announcements.length === 0) ? (
                <NoDataMessage
                  message={
                    filters.interestLevel
                      ? `No announcements found with interest level "${filters.interestLevel}"`
                      : "No announcement data available"
                  }
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
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
                      {tableData?.announcements?.map((item) => (
                        <tr key={item.id} className="border-t">
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

                  {totalCount > ITEMS_PER_PAGE && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={Math.max(
                        1,
                        Math.ceil(totalCount / ITEMS_PER_PAGE)
                      )}
                      onPageChange={setCurrentPage}
                      disabled={loading}
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
