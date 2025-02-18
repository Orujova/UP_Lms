"use client";
import React, { useState, useEffect } from "react";
import {
  Bell,
  Check,
  Loader2,
  CheckCircle,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { getToken } from "@/authtoken/auth.js";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const itemsPerPage = 5;
  const token = getToken();

  useEffect(() => {
    fetchNotifications();
  }, [page, filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userId");
      if (!userId) throw new Error("User ID not found");

      const response = await fetch(
        `https://bravoadmin.uplms.org/api/Notification/getAllUserNotifications?UserId=${userId}&Page=${page}&ShowMore.Take=${itemsPerPage}`,
        {
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch notifications");

      const data = await response.json();

      let filteredNotifications = data[0].userNotifications || [];
      if (filter === "read") {
        filteredNotifications = filteredNotifications.filter((n) => n.isRead);
      } else if (filter === "unread") {
        filteredNotifications = filteredNotifications.filter((n) => !n.isRead);
      }

      setNotifications(filteredNotifications);

      setTotalPages(
        Math.ceil((data[0].totalUserNotificationCount || 0) / itemsPerPage)
      );
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(
        "https://bravoadmin.uplms.org/api/Notification/updateReadStatus",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            notificationId,
            isRead: true,
          }),
        }
      );

      if (response.ok) {
        setNotifications(
          notifications.map((notif) =>
            notif.id === notificationId ? { ...notif, isRead: true } : notif
          )
        );
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      setLoading(true);
      for (const notification of notifications.filter((n) => !n.isRead)) {
        await markAsRead(notification.id);
      }
      await fetchNotifications();
    } catch (error) {
      console.error("Error marking all as read:", error);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className=" mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-[#01DBC8]" />
            <h1 className="text-lg font-semibold">Notifications</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:border-gray-300 focus:outline-none focus:border-[#01DBC8] transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span className="text-xs">
                  {filter === "all"
                    ? "All notifications"
                    : filter === "unread"
                    ? "Unread"
                    : "Read"}
                </span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {isFilterOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                  <button
                    onClick={() => {
                      setFilter("all");
                      setIsFilterOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs hover:bg-gray-50"
                  >
                    All notifications
                  </button>
                  <button
                    onClick={() => {
                      setFilter("unread");
                      setIsFilterOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs hover:bg-gray-50"
                  >
                    Unread
                  </button>
                  <button
                    onClick={() => {
                      setFilter("read");
                      setIsFilterOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs hover:bg-gray-50"
                  >
                    Read
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-4 py-2 text-xs text-[#01DBC8] hover:bg-[#01DBC8]/5 rounded-lg transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              Mark all as read
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              No notifications found
            </div>
          ) : (
            <>
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors ${
                    !notification.isRead ? "bg-blue-50/50" : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 text-base">
                        {notification.title}
                      </h3>
                      <p className="mt-1 text-gray-600 text-xs">
                        {notification.content}
                      </p>
                      <div className="mt-2 flex items-center gap-4">
                        <span className="text-[0.6rem] text-gray-300">
                          {new Date(notification.creationDate).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="flex items-center gap-1 px-2 py-1 text-xs text-[#01DBC8] hover:bg-[#01DBC8]/5 rounded-full"
                      >
                        <Check className="w-4 h-3" />
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Pagination */}
          {!loading && notifications.length > 0 && (
            <div className="flex items-center justify-between px-4 py-2 border-t bg-gray-50">
              <div className="text-[0.65rem] text-gray-500">
                Showing {notifications.length} of {totalPages * itemsPerPage}{" "}
                notifications
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-xs font-medium">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
