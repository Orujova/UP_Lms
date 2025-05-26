"use client";
import React from "react";
import Link from "next/link";
import {
  Eye,
  Clock,
  Edit2,
  Trash2,
  FileText,
  SquareArrowOutUpRight,
} from "lucide-react";

import { useRouter } from "next/navigation";

const NewsRow = React.memo(({ data, onDelete }) => {
  const { id, title, createdDate, newsCategoryName, view } = data;
  const router = useRouter();
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

  return (
    <div className="grid grid-cols-12 px-5 py-4 justify-center hover:bg-gray-50 group border-b border-gray-100">
      <div className="col-span-4 flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-[#f9f9f9] flex items-center justify-center flex-shrink-0">
          <FileText className="w-4 h-4 text-[#808080]" />
        </div>
        <div className="overflow-hidden">
          <h3 className="text-xs font-medium text-gray-900 flex items-center cursor-pointer mb-2 truncate">
            {title}
          </h3>
        </div>
      </div>
      <div className="col-span-3 flex items-center justify-center">
        <span className="inline-flex px-2.5 py-1 rounded-full text-[0.7rem] text-center font-medium bg-[#f9f9f9] text-[#127D74] truncate max-w-full">
          {newsCategoryName}
        </span>
      </div>
      <div className="col-span-2 flex items-center">
        <div className="flex items-center gap-1.5 text-[0.7rem] text-gray-600">
          <Clock className="w-4 h-3 text-gray-400 flex-shrink-0" />
          {formatDate(createdDate)}
        </div>
      </div>
      <div className="col-span-1 flex items-center">
        <span className="text-[0.7rem] text-gray-600">#{id}</span>
      </div>
      <div className="col-span-1 flex items-center gap-1.5">
        <Eye className="w-4 h-3 text-gray-400 flex-shrink-0" />
        <span className="text-xs text-gray-600">{view}</span>
      </div>
      <div className="col-span-1 flex items-center justify-end gap-1">
        <button
          onClick={() => router.push(`/admin/dashboard/news/${id}`)}
          className="p-1 text-gray-400 hover:text-[#0AAC9E] hover:bg-[#f2fdfc] rounded-lg transition-all"
        >
          <SquareArrowOutUpRight className="w-4 h-3 cursor-pointer" />
        </button>
        <Link href={`/admin/dashboard/news/edit/${id}`}>
          <button className="p-1 text-gray-400 hover:text-[#0AAC9E] hover:bg-[#f2fdfc] rounded-lg transition-all">
            <Edit2 className="w-4 h-3" />
          </button>
        </Link>
        <button
          onClick={() => onDelete(id)}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
        >
          <Trash2 className="w-4 h-3" />
        </button>
      </div>
    </div>
  );
});

export default NewsRow;
