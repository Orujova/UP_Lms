"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { newsAsync } from "@/redux/news/news";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getToken, removeToken, getParsedToken } from "@/authtoken/auth.js";
import { removeNews } from "@/redux/news/news"; // Replace with your actual action

const FilterIcon = React.memo(() => (
  <svg
    width="21"
    height="18"
    viewBox="0 0 21 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M17.4641 1.74991e-06C17.4491 2.58438e-06 17.4342 3.41884e-06 17.4192 3.41884e-06L3.72344 1.74991e-06C3.24042 -2.67411e-05 2.81038 -5.17759e-05 2.47148 0.0297994C2.14766 0.0583219 1.68052 0.126268 1.29871 0.435119C0.831439 0.813104 0.571237 1.38325 0.595281 1.97644C0.614929 2.46115 0.874732 2.84751 1.06895 3.10295C1.27223 3.3703 1.55899 3.68425 1.8811 4.0369L7.15897 9.8159C7.19446 9.85476 7.22167 9.88456 7.24501 9.91055C7.25613 9.92295 7.2653 9.93328 7.27292 9.94198C7.27316 9.95344 7.27336 9.96712 7.2735 9.98363C7.2738 10.0182 7.27381 10.0582 7.27381 10.1104V14.9281C7.27381 14.9372 7.27367 14.9481 7.27352 14.9606C7.272 15.082 7.26853 15.359 7.36721 15.6181C7.44973 15.8348 7.58395 16.0291 7.75868 16.1846C7.96761 16.3706 8.23141 16.4703 8.34703 16.514C8.359 16.5186 8.36938 16.5225 8.37795 16.5258L11.5049 17.7512C11.5138 17.7547 11.5228 17.7582 11.5319 17.7618C11.6766 17.8186 11.8422 17.8836 11.9893 17.9266C12.1483 17.973 12.4194 18.037 12.7343 17.9729C13.1164 17.8951 13.4516 17.6728 13.6672 17.3542C13.8449 17.0915 13.8849 16.8212 13.8999 16.6593C13.9138 16.5095 13.9138 16.3347 13.9137 16.1819C13.9137 16.1724 13.9137 16.1629 13.9137 16.1535V10.1104C13.9137 10.0582 13.9137 10.0182 13.914 9.98363C13.9141 9.96712 13.9143 9.95344 13.9146 9.94198C13.9222 9.93328 13.9314 9.92295 13.9425 9.91055C13.9658 9.88456 13.993 9.85476 14.0285 9.8159L19.2765 4.06967C19.2865 4.0587 19.2965 4.04778 19.3064 4.03689C19.6285 3.68425 19.9153 3.37029 20.1185 3.10295C20.3128 2.84751 20.5726 2.46114 20.5922 1.97644C20.6163 1.38325 20.3561 0.813104 19.8888 0.435119C19.507 0.126268 19.0398 0.0583219 18.716 0.0297994C18.3771 -5.17759e-05 17.9471 -2.67411e-05 17.4641 1.74991e-06ZM18.3987 2.01253C18.2569 2.18558 18.0528 2.41006 17.7551 2.73608L12.5072 8.48231C12.4978 8.4926 12.488 8.50325 12.4779 8.51426C12.3708 8.63083 12.227 8.78739 12.12 8.97425C12.0275 9.13592 11.9597 9.30997 11.9186 9.49088C11.8711 9.69998 11.8717 9.91061 11.8721 10.0674C11.8722 10.0822 11.8722 10.0966 11.8722 10.1104V15.7411L9.31527 14.7391V10.1104C9.31527 10.0966 9.31531 10.0822 9.31535 10.0674C9.31581 9.91061 9.31643 9.69998 9.26893 9.49088C9.22784 9.30997 9.15996 9.13592 9.06746 8.97425C8.96054 8.78739 8.81671 8.63082 8.70964 8.51425C8.69953 8.50325 8.68974 8.4926 8.68035 8.48231L3.43241 2.73608C3.13466 2.41006 2.93056 2.18558 2.78876 2.01253C3.01496 2.00067 3.3218 2 3.76834 2H17.4192C17.8657 2 18.1725 2.00067 18.3987 2.01253ZM12.579 16.0117L12.5774 16.0113L12.579 16.0117Z"
      fill="#7A7A7A"
    />
  </svg>
));

const NewsItem = React.memo(({ data, onDelete }) => {
  const { id, title, createdDate, newsCategoryName, view } = data;

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

  return (
    <div className="flex border-b-1 py-3 text-12 font-medium w-full">
      <h1 className="basis-3/16 ellipsis-1-line">{title}</h1>
      <span className="basis-3/16">#{id}</span>
      <span className="basis-3/16 flex gap-1">
        <svg
          width="17"
          height="19"
          viewBox="0 0 20 19"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M14 11C13.4477 11 13 10.5523 13 10C13 9.44771 13.4477 9 14 9C14.5523 9 15 9.44771 15 10C15 10.5523 14.5523 11 14 11Z"
            fill="black"
          />
          <path
            d="M9 10C9 10.5523 9.44771 11 10 11C10.5523 11 11 10.5523 11 10C11 9.44771 10.5523 9 10 9C9.44771 9 9 9.44771 9 10Z"
            fill="black"
          />
          <path
            d="M6 11C5.44771 11 5 10.5523 5 10C5 9.44771 5.44771 9 6 9C6.55229 9 7 9.44771 7 10C7 10.5523 6.55229 11 6 11Z"
            fill="black"
          />
          <path
            d="M13 14C13 14.5523 13.4477 15 14 15C14.5523 15 15 14.5523 15 14C15 13.4477 14.5523 13 14 13C13.4477 13 13 13.4477 13 14Z"
            fill="black"
          />
          <path
            d="M10 15C9.44771 15 9 14.5523 9 14C9 13.4477 9.44771 13 10 13C10.5523 13 11 13.4477 11 14C11 14.5523 10.5523 15 10 15Z"
            fill="black"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M14 1C14 0.447715 14.4477 0 15 0C15.5523 0 16 0.447715 16 1H18C19.1046 1 20 1.89543 20 3V17C20 18.1046 19.1046 19 18 19H2C0.89543 19 0 18.1046 0 17V3C0 1.89543 0.895432 1 2 1H4C4 0.447715 4.44772 0 5 0C5.55228 0 6 0.447715 6 1H14ZM18 5V3H2V5H18ZM18 7V17H7.8284L2 11.1716V7H18ZM2 14L4.99997 17H2V14Z"
            fill="black"
          />
        </svg>
        {formatDate(createdDate)}
      </span>
      <span className="basis-3/16">{newsCategoryName}</span>
      <span className="basis-3/16">
        <svg
          width="17"
          height="14"
          viewBox="0 0 20 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M18.3696 8.98941C17.5226 4.92242 13.9822 2.03269 9.99965 2.03269C6.01835 2.03269 2.4779 4.92242 1.62973 8.98941C1.59614 9.15079 1.49981 9.29222 1.36194 9.38258C1.22407 9.47294 1.05595 9.50483 0.894569 9.47124C0.733187 9.43764 0.591759 9.34132 0.501398 9.20345C0.411037 9.06558 0.379148 8.89746 0.412743 8.73608C1.37764 4.11027 5.41358 0.790863 9.99965 0.790863C14.5857 0.790863 18.6217 4.11027 19.5866 8.73608C19.6202 8.89746 19.5883 9.06558 19.4979 9.20345C19.4075 9.34132 19.2661 9.43764 19.1047 9.47124C18.9434 9.50483 18.7752 9.47294 18.6374 9.38258C18.4995 9.29222 18.4032 9.15079 18.3696 8.98941ZM10.0121 4.51635C8.85933 4.51635 7.75381 4.97427 6.9387 5.78938C6.1236 6.60448 5.66567 7.71001 5.66567 8.86274C5.66567 10.0155 6.1236 11.121 6.9387 11.9361C7.75381 12.7512 8.85933 13.2091 10.0121 13.2091C11.1648 13.2091 12.2703 12.7512 13.0854 11.9361C13.9005 11.121 14.3585 10.0155 14.3585 8.86274C14.3585 7.71001 13.9005 6.60448 13.0854 5.78938C12.2703 4.97427 11.1648 4.51635 10.0121 4.51635Z"
            fill="#484848"
          />
        </svg>
        {view}
      </span>

      <Link href={`/admin/dashboard/news/${id}`} className="basis-1/16">
        <svg
          width="17"
          height="21"
          viewBox="0 0 20 21"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M13.3132 8.48529L11.899 7.07108L3.25094 15.7191L2.57111 17.8132L4.66515 17.1334L13.3132 8.48529ZM5.73966 18.8873L1.32311 20.3211C0.546181 20.5733 -0.189034 19.8381 0.0631929 19.0612L1.49702 14.6446L11.899 4.24265L16.1416 8.48529L5.73966 18.8873Z"
            fill="black"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M17.5559 1.41422C16.7749 0.633168 15.5085 0.633168 14.7275 1.41422L13.3133 2.82843L17.5559 7.07107L18.9701 5.65686C19.7512 4.87581 19.7512 3.60948 18.9701 2.82843L17.5559 1.41422Z"
            fill="black"
          />
        </svg>
      </Link>
      <span className="ml-2">
        <Trash2
          className="cursor-pointer text-red-500 hover:text-red-700"
          size={18}
          onClick={() => onDelete(id)}
        />
      </span>
    </div>
  );
});

export default function News() {
  const [filterStyle, setFilterStyle] = useState(false);
  const dispatch = useDispatch();
  const token = getToken(); // Replace with your token retrieval logic
  const newsData = useSelector((state) => state.news.data);

  useEffect(() => {
    dispatch(newsAsync());
  }, [dispatch]);

  const changeFilterStyle = () => {
    setFilterStyle((prevState) => !prevState);
  };


  const totalNewsCount = useMemo(
    () => newsData?.[0]?.totalNewsCount || 0,
    [newsData]
  );

  const deleteNews = async (id) => {
    if (!confirm("Are you sure you want to delete this news item?")) {
      return;
    }
  
    try {
      const formData = new FormData();
      formData.append("Id", id);
  
      const response = await fetch("https://bravoadmin.uplms.org/api/News", {
        method: "DELETE",
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        throw new Error(errorData.message || "Failed to delete news item.");
      }
  
      // Update Redux store
      dispatch(removeNews(id));
      toast.success("News item deleted successfully!");
    } catch (error) {
      console.error("Error deleting news item:", error);
      toast.error("Failed to delete news item. Please try again.");
    }
  };
  

  return (
    <main>
      <div className="w-full flex justify-between items-center mt-10">
        <h1 className="text-24 font-semibold text-mainGray2">
          {totalNewsCount > 0 ? `${totalNewsCount} News in Total` : null}
        </h1>
        <div className="flex items-center justify-end gap-4 text-12 font-medium">
          <div className="flex justify-center gap-2 cursor-pointer">
            <FilterIcon />
            <span className="text-mainGray2" onClick={changeFilterStyle}>
              Filter
            </span>
          </div>
          <Link
            href="/admin/dashboard/news/add"
            className="px-6 py-2 bg-mainGreen rounded-sm text-white cursor-pointer"
          >
            Add News
          </Link>
          <span className="px-6 py-2 border-2 rounded-sm cursor-pointer">
            Export
          </span>
        </div>
      </div>

      {/* Filter */}
      <div
        className={`${
          filterStyle ? "flex" : "hidden"
        } items-center justify-between w-full mt-10`}
      >
        <div className="flex justify-start items-center gap-5 basis-3/4">
          <div className="flex flex-col items-start justify-start gap-2 basis-1/3">
            <span className="font-semibold text-14">Title</span>
            <input
              type="text"
              className="border-2 rounded-md h-[50px] p-2 w-full text-xs font-semibold text-mainGray2"
            />
          </div>
          <div className="flex flex-col items-start justify-start gap-2 basis-1/3">
            <span className="font-semibold text-14">Category</span>
            <select className="border-2 rounded-md h-[50px] w-full p-2 text-xs font-semibold text-mainGray2">
              <option value="" disabled hidden>
                Select
              </option>
              <option value="">Category</option>
              <option value="">Category</option>
            </select>
          </div>
          <div className="flex flex-col items-start justify-start gap-2 basis-1/3">
            <span className="font-semibold text-14">Date</span>
            <input
              type="date"
              className="border-2 rounded-md h-[50px] w-full p-2 text-xs font-semibold text-mainGray2"
            />
          </div>
        </div>
        <span className="basis-1/4 flex justify-end items-center">
          <span onClick={changeFilterStyle} className="cursor-pointer">
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10.2432 11.6568C10.6337 12.0474 11.2669 12.0474 11.6574 11.6568C12.0479 11.2663 12.0479 10.6331 11.6574 10.2426L7.41475 5.99999L11.6574 1.75736C12.0479 1.36684 12.0479 0.73367 11.6574 0.343146C11.2669 -0.0473785 10.6337 -0.0473785 10.2432 0.343146L6.00054 4.58578L1.75789 0.343125C1.36736 -0.0473993 0.7342 -0.0473991 0.343676 0.343125C-0.0468488 0.73365 -0.0468492 1.36681 0.343675 1.75734L4.58633 5.99999L0.343675 10.2426C-0.04685 10.6332 -0.0468497 11.2663 0.343675 11.6569C0.734199 12.0474 1.36736 12.0474 1.75789 11.6569L6.00054 7.4142L10.2432 11.6568Z"
                fill="#13121B"
              />
            </svg>
          </span>
        </span>
      </div>

      {/* News List */}
      <div className="w-full flex flex-col gap-3 mt-10">
        <nav className="flex justify-start border-b-1 pb-4 w-full">
          {["Title", "ID", "Created date", "Category", "Views"].map(
            (header) => (
              <div
                key={header}
                className="basis-3/16 flex justify-start items-center text-14 font-semibold text-mainGray2 gap-2"
              >
                {header}
                <svg
                  width="17"
                  height="14"
                  viewBox="0 0 22 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M0 1C0 0.447715 0.447715 0 1 0H21C21.5523 0 22 0.447715 22 1C22 1.55228 21.5523 2 21 2H1C0.447715 2 0 1.55228 0 1ZM3 7C3 6.44772 3.44772 6 4 6H18C18.5523 6 19 6.44772 19 7C19 7.55228 18.5523 8 18 8H4C3.44772 8 3 7.55228 3 7ZM7 13C7 12.4477 7.44772 12 8 12H14C14.5523 12 15 12.4477 15 13C15 13.5523 14.5523 14 14 14H8C7.44772 14 7 13.5523 7 13Z"
                    fill="#878787"
                  />
                </svg>
              </div>
            )
          )}
        </nav>
        {newsData?.[0]?.news?.map((newsItem, index) => (
          <NewsItem key={index} data={newsItem} onDelete={deleteNews} />
        ))}
      </div>
    </main>
  );
}
