"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { getToken, getCookie } from "@/authtoken/auth.js";

//style
import "./innerNews.scss";

const PageTextComponent = dynamic(
  () => import("@/components/pageTextComponent"),
  { ssr: false }
);

export default function Page() {
  const [newsData, setNewsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const pathname = usePathname();

  const newsId = pathname?.split("/").pop();
  const userId = getCookie("userId") || localStorage.getItem("userId"); // Fetch userId dynamically

  function formatDate(dateString) {
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
  }

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

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  let jsonObject;
  try {
    jsonObject = JSON.parse(newsData.description);
  } catch (e) {
    console.error("Failed to parse description:", e);
    jsonObject = null;
  }

  return (
    <div className="innerNews">
      <div className="edit">
        <p className="id">#{newsData.id}</p>
        <Link
          className="button"
          href={`/admin/dashboard/news/edit/${newsData.id}`}
        >
          Edit
        </Link>
      </div>

      {newsData.newsImages && newsData.newsImages.length > 0 ? (
        <img
          src={`https://bravoadmin.uplms.org/uploads/${newsData.newsImages[0].replace(
            "https://100.42.179.27:7198/",
            ""
          )}`}
          alt="banner"
          width={800}
          height={400}
          priority
        />
      ) : (
        <p>No photo</p>
      )}

      <div className="view">
        <h2>{newsData.subTitle}</h2>
        <div>
          <p>{newsData.view} views</p>
          <p>•</p>
          <p>{formatDate(newsData.createdDate)}</p>
        </div>
      </div>

      <div className="info">
        <h3>{newsData.title}</h3>
        <div>
          <PageTextComponent desc={jsonObject} readOnly={true} />
        </div>
      </div>
    </div>
  );
}
