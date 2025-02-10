"use client";
import { Bell } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import NotificationsDropdown from "./NotificationsDropdown";

export default function NotificationBell({
  notifications,
  unreadCount,
  onMarkAsRead,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const notificationRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={notificationRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center border border-gray-200 w-10 h-10 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <NotificationsDropdown
          notifications={notifications}
          onMarkAsRead={onMarkAsRead}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
