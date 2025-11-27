"use client";

import { useEffect, useState, useRef } from "react";
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
  Download,
  ChevronDown,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import LoadingOverlay from "@/components/loadingSpinner";

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

const PriorityBadge = ({ priority }) => {
  const priorityColors = {
    HIGH: "bg-red-100 text-red-600",
    MEDIUM: "bg-yellow-100 text-yellow-600",
    LOW: "bg-blue-100 text-blue-600",
    medium: "bg-yellow-100 text-yellow-600",
    high: "bg-red-100 text-red-600",
    low: "bg-blue-100 text-blue-600",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${
        priorityColors[priority] || "bg-gray-100 text-gray-600"
      }`}
    >
      {priority.toUpperCase()}
    </span>
  );
};

const ImageSlider = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [displayedImage, setDisplayedImage] = useState(images[0]);

  const goToPrevious = () => {
    if (transitioning) return;
    setTransitioning(true);
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1;

    setTimeout(() => {
      setDisplayedImage(images[newIndex]);
      setCurrentIndex(newIndex);
      setTimeout(() => setTransitioning(false), 50);
    }, 200);
  };

  const goToNext = () => {
    if (transitioning) return;
    setTransitioning(true);
    const isLastSlide = currentIndex === images.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;

    setTimeout(() => {
      setDisplayedImage(images[newIndex]);
      setCurrentIndex(newIndex);
      setTimeout(() => setTransitioning(false), 50);
    }, 200);
  };

  const goToSlide = (slideIndex) => {
    if (transitioning || slideIndex === currentIndex) return;
    setTransitioning(true);

    setTimeout(() => {
      setDisplayedImage(images[slideIndex]);
      setCurrentIndex(slideIndex);
      setTimeout(() => setTransitioning(false), 50);
    }, 200);
  };

  if (!images || images.length === 0) return null;

  if (images.length === 1) {
    return (
      <div className="relative w-full h-[65vh]">
        <img
          src={images[0]}
          alt="News cover"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className="relative w-full h-[65vh] overflow-hidden">
      <div
        className={`absolute top-0 left-0 w-full h-full ${
          transitioning ? "opacity-50 scale-95" : "opacity-100 scale-100"
        } transition-all duration-300 ease-in-out`}
      >
        <img
          src={displayedImage}
          alt={`Slide ${currentIndex + 1}`}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="absolute top-1/2 left-6 -translate-y-1/2 z-10">
        <button
          onClick={goToPrevious}
          className="p-3 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors hover:scale-110 transform duration-200 shadow-md"
          aria-label="Previous slide"
          disabled={transitioning}
        >
          <ArrowLeft size={22} />
        </button>
      </div>

      <div className="absolute top-1/2 right-6 -translate-y-1/2 z-10">
        <button
          onClick={goToNext}
          className="p-3 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors hover:scale-110 transform duration-200 shadow-md"
          aria-label="Next slide"
          disabled={transitioning}
        >
          <ArrowRight size={22} />
        </button>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex space-x-3 bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full">
        {images.map((img, slideIndex) => (
          <button
            key={slideIndex}
            onClick={() => goToSlide(slideIndex)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              currentIndex === slideIndex
                ? "bg-white w-6"
                : "bg-white/60 hover:bg-white/80"
            }`}
            aria-label={`Go to slide ${slideIndex + 1}`}
            disabled={transitioning}
          />
        ))}
      </div>
    </div>
  );
};

const AttachmentCard = ({ fileName, fileSize, fileUrl }) => {
  const getFileIcon = (fileName) => {
    const extension = fileName.split(".").pop().toLowerCase();

    if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension)) {
      return "🖼️";
    } else if (["doc", "docx"].includes(extension)) {
      return "📄";
    } else if (["xls", "xlsx"].includes(extension)) {
      return "📊";
    } else if (["ppt", "pptx"].includes(extension)) {
      return "📑";
    } else if (extension === "pdf") {
      return "📕";
    } else {
      return "📎";
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <span className="text-xl">{getFileIcon(fileName)}</span>
          <div>
            <p className="text-sm font-medium text-gray-800 truncate max-w-xs">
              {fileName}
            </p>
            <p className="text-xs text-gray-500">{fileSize}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function NewsPage() {
  const [newsData, setNewsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAttachments, setShowAttachments] = useState(false);
  const [attachmentsHeight, setAttachmentsHeight] = useState(0);
  const attachmentsRef = useRef(null);

  useEffect(() => {
    if (attachmentsRef.current) {
      setAttachmentsHeight(
        showAttachments ? attachmentsRef.current.scrollHeight : 0
      );
    }
  }, [showAttachments]);

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

        // Updated API call using GET /api/News/id endpoint
        const queryParams = new URLSearchParams({
          Id: newsId,
          UserId: userId,
          Device: '1', // 1 for web, 2 for mobile
          Language: 'az',
        });

        const response = await fetch(
          `https://demoadmin.databyte.app/api/News/id?${queryParams.toString()}`,
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

  const processedImages =
    newsData.newsImages?.map(
      (img) =>
        `https://bravoadmin.uplms.org/uploads/${img.replace(
          "https://100.42.179.27:7198/",
          ""
        )}`
    ) || [];

  const attachments =
    newsData.newsAttachments?.map((attachment, index) => ({
      url: `https://bravoadmin.uplms.org/uploads/${attachment.replace(
        "https://100.42.179.27:7198/",
        ""
      )}`,
      fileName: newsData.fileName[index] || `Attachment ${index + 1}`,
      fileSize: newsData.fileSize[index] || "Unknown size",
    })) || [];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="relative">
        {processedImages.length > 0 ? (
          <ImageSlider images={processedImages} />
        ) : (
          <div className="w-full h-[65vh] bg-gradient-to-br from-[#127D74] to-[#1B4E4A] flex items-center justify-center">
            <p className="text-white text-xl font-medium">No image available</p>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/40 to-transparent" />

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
          <span className="px-6 py-2 bg-white/90 backdrop-blur-sm text-[#0AAC9E] rounded-full text-sm font-medium shadow-lg">
            {newsData.subTitle}
          </span>
        </div>
      </div>

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
              <div className="mb-7">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                    {newsData.title}
                  </h1>
                  <PriorityBadge priority={newsData.priority} />
                </div>

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
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-normal bg-[#E6F7F5] text-[##0AAC9E]"
                      >
                        {group}
                      </span>
                    ))}
                  </div>
                </div>
              )}

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

              {attachments.length > 0 && (
                <div className="mb-8">
                  <button
                    className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => setShowAttachments(!showAttachments)}
                    aria-expanded={showAttachments}
                    aria-controls="attachments-panel"
                  >
                    <span className="font-medium flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Attachments ({attachments.length})
                    </span>
                    <div
                      className={`transform transition-transform duration-300 ${
                        showAttachments ? "rotate-180" : "rotate-0"
                      }`}
                    >
                      <ChevronDown className="w-5 h-5" />
                    </div>
                  </button>

                  <div
                    id="attachments-panel"
                    ref={attachmentsRef}
                    className="overflow-hidden transition-all duration-300 ease-in-out"
                    style={{ maxHeight: attachmentsHeight }}
                    aria-hidden={!showAttachments}
                  >
                    <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {attachments.map((attachment, index) => (
                        <AttachmentCard
                          key={index}
                          fileName={attachment.fileName}
                          fileSize={attachment.fileSize}
                          fileUrl={attachment.url}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

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