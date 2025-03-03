"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { getToken, getUserId } from "@/authtoken/auth.js";
import {
  Clock,
  Eye,
  ChevronLeft,
  Edit2,
  ThumbsUp,
  ChartBarStacked,
  ChevronRight,
  User,
  Users,
  Bookmark,
} from "lucide-react";

const PageTextComponent = dynamic(
  () => import("@/components/pageTextComponent"),
  { ssr: false }
);

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date
    .toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
    .replace(",", "");
};

const LoadingOverlay = () => (
  <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
    <div className="relative flex flex-col items-center">
      <div className="w-12 h-12 relative">
        <div className="absolute inset-0 border-4 border-[#f9fefe] rounded-full"></div>
        <div className="absolute inset-0 border-4 border-[#0AAC9E] rounded-full animate-spin border-t-transparent"></div>
      </div>
      <div className="mt-4 space-y-1 text-center">
        <h3 className="text-xs font-semibold text-gray-900">Loading...</h3>
        <p className="text-gray-400 text-[10px]">
          Please wait while we fetch your content...
        </p>
      </div>
    </div>
  </div>
);

const ErrorDisplay = ({ error }) => (
  <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
    <div className="bg-white shadow-2xl rounded-3xl p-12 max-w-lg w-full">
      <div className="bg-red-100 text-red-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
        <span className="text-2xl">⚠️</span>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">
        Unable to Load Article
      </h3>
      <p className="text-gray-600 mb-8">{error}</p>
      <Link
        href="/admin/dashboard/news"
        className="inline-flex items-center gap-3 text-emerald-600 hover:text-emerald-700 font-semibold transition-colors group"
      >
        <ChevronLeft className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" />
        Return to News Feed
      </Link>
    </div>
  </div>
);

// Priority Badge component
const PriorityBadge = ({ priority }) => {
  const priorityColors = {
    HIGH: "bg-red-100 text-red-600",
    MEDIUM: "bg-yellow-100 text-yellow-600",
    LOW: "bg-blue-100 text-blue-600",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${
        priorityColors[priority] || "bg-gray-100 text-gray-600"
      }`}
    >
      {priority}
    </span>
  );
};

export default function NewsPage() {
  const [newsData, setNewsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const pathname = usePathname();
  const newsId = pathname?.split("/").pop();
  const userId = getUserId();

  useEffect(() => {
    if (!newsId || !userId) return;

    const fetchNewsData = async () => {
      try {
        const token = getToken();
        if (!token) {
          throw new Error(
            "Authorization token is missing. Please log in again."
          );
        }

        const response = await fetch(
          `https://bravoadmin.uplms.org/api/News/${newsId}?userid=${userId}`,
          {
            headers: {
              accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch news data");
        }

        const data = await response.json();
        setNewsData(data);
      } catch (error) {
        console.error("Error fetching news data:", error);
        setError("Failed to load news data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchNewsData();
  }, [newsId, userId]);

  if (loading) return <LoadingOverlay />;
  if (error) return <ErrorDisplay error={error} />;

  let jsonObject;
  try {
    jsonObject = JSON.parse(newsData.description);
  } catch (e) {
    console.error("Failed to parse description:", e);
    jsonObject = null;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero Image Section */}
      <div className="h-[65vh] relative">
        {newsData.newsImages && newsData.newsImages.length > 0 ? (
          <img
            src={`https://bravoadmin.uplms.org/uploads/${newsData.newsImages[0].replace(
              "https://100.42.179.27:7198/",
              ""
            )}`}
            alt="News cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#127D74] to-[#1B4E4A] flex items-center justify-center">
            <p className="text-white text-xl font-medium">No image available</p>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/40 to-transparent" />

        {/* Floating Category Badge */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
          <span className="px-6 py-2 bg-white/90 backdrop-blur-sm text-[#0AAC9E] rounded-full text-sm font-medium shadow-lg">
            {newsData.subTitle}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <main className="-mt-32 relative z-10 pb-12">
        <div className="max-w-5xl mx-auto px-4">
          <article className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-white border-b border-gray-100">
              <div className="max-w-7xl mx-auto px-4 py-4">
                <div className="flex items-center gap-2 text-sm">
                  <Link
                    href="/admin/dashboard"
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Dashboard
                  </Link>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <Link
                    href="/admin/dashboard/news"
                    className="text-gray-500 hover:text-gray-700"
                  >
                    News
                  </Link>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <span className="text-[#0AAC9E] font-medium">
                    Article Details
                  </span>
                </div>
              </div>
            </div>
            <div className="p-7">
              {/* Title and Actions */}
              <div className="mb-7">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                    {newsData.title}
                  </h1>
                  <PriorityBadge priority={newsData.priority} />
                </div>

                {/* Category and Main Metadata */}
                <div className="mb-5">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="inline-flex items-center gap-2 text-sm text-gray-700 bg-gray-100 px-4 py-1 rounded-lg">
                      <ChartBarStacked className="w-4 h-4" />
                      {newsData.newsCategoryName || "Uncategorized"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between">
                  <div className="flex flex-wrap items-center gap-6">
                    <span className="inline-flex items-center gap-2 text-xs text-gray-500">
                      <Eye className="w-4 h-4" />
                      {newsData.view} views (Total: {newsData.totalView})
                    </span>
                    <span className="inline-flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="w-4 h-4" />
                      {formatDate(newsData.createdDate)}
                    </span>
                    <span className="inline-flex items-center gap-2 text-xs text-gray-500">
                      <User className="w-4 h-4" />
                      {newsData.createdBy}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-3 sm:mt-0">
                    <Link
                      href={`/admin/dashboard/news/edit/${newsData.id}`}
                      className="inline-flex items-center gap-2 text-xs bg-[#0AAC9E] text-white px-4 py-2 rounded-lg hover:bg-[#009688] transition-colors"
                    >
                      <Edit2 className="w-4 h-3" />
                      <span>Edit News</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Target Groups Section */}
              {newsData.targetGroups && newsData.targetGroups.length > 0 && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg flex gap-3 items-center">
                  <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Target Groups
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {newsData.targetGroups.map((group, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-normal bg-[#E6F7F5] text-[#0AAC9E]"
                      >
                        {group}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Engagement Section */}
              <div className="border-t border-b border-gray-100 py-3 mb-8">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-gray-500">
                    <ThumbsUp className="w-5 h-4" />
                    <span className="text-xs font-medium">
                      {newsData.likeCount} Likes
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <Bookmark className="w-5 h-4" />
                    <span className="text-xs font-medium">
                      {newsData.saveCount} Saves
                    </span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="prose prose-lg max-w-none">
                <div className="text-gray-700">
                  <PageTextComponent desc={jsonObject} readOnly={true} />
                </div>
              </div>
            </div>
          </article>
        </div>
      </main>
    </div>
  );
}
