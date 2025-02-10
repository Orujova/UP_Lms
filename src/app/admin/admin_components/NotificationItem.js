"use client";

import { Bell } from "lucide-react";

export default function NotificationItem({ notification, onMarkAsRead }) {
  return (
    <div
      className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
        !notification.isRead ? "bg-[#ecfcfb]" : ""
      }`}
      onClick={() => onMarkAsRead(notification.id)}
    >
      <div className="flex items-start gap-3">
        <div className="mt-1.5 shrink-0">
          <Bell
            className={`w-4 h-4 ${
              !notification.isRead ? "text-[#0AAC9E]" : "text-gray-400"
            }`}
          />
        </div>
        <div className="flex-grow">
          <h4 className="text-sm font-semibold">{notification.title}</h4>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {notification.content}
          </p>
          <span className="text-xs text-gray-400 mt-2 block">
            {new Date(notification.creationDate).toLocaleString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
            })}
          </span>
        </div>
      </div>
    </div>
  );
}
