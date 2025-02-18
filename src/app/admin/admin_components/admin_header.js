"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSelector, useDispatch } from "react-redux";
import { removeToken, getParsedToken } from "@/authtoken/auth.js";
import { fetchUser } from "@/redux/user/userSlice";
import {
  fetchNotificationsData,
  markNotificationAsRead,
} from "@/redux/notification/notification";

import SearchBar from "./SearchBar";
import AddButton from "./AddButton";
import NotificationBell from "./NotificationBell";
import UserProfile from "./UserProfile";

export default function AdminHeader() {
  const router = useRouter();
  const dispatch = useDispatch();

  const {
    data: userData,
    status: userStatus,
    error: userError,
  } = useSelector((state) => state.user);

  const {
    data: notifications,
    unreadCount,
    status: notificationStatus,
    error: notificationError,
  } = useSelector((state) => state.notification);

  useEffect(() => {
    const parsedToken = getParsedToken();
    if (!parsedToken?.UserID) {
      toast.error("Authorization token is missing or invalid.");
      return;
    }

    dispatch(fetchUser(parsedToken.UserID));
    dispatch(fetchNotificationsData(parsedToken.UserID));
  }, [dispatch]);

  const handleLogout = () => {
    removeToken();
    localStorage.removeItem("userId");
    toast.success("Logged out successfully.");
    router.push("/admin/login");
  };

  const handleMarkAsRead = (notificationId) => {
    dispatch(markNotificationAsRead({ notificationId, isRead: true }));
  };

  if (userStatus === "loading" || notificationStatus === "loading") {
    return <div className="w-full h-16 bg-gray-100 animate-pulse" />;
  }
  if (userError || notificationError) {
    return (
      <div className="text-red-500 p-4">{userError || notificationError}</div>
    );
  }
  // pr-24
  return (
    <div className="fixed top-0 right-0 left-72 z-50">
      <div className="border-b bg-white shadow-sm px-12 py-4">
        <div className="flex items-center justify-between">
          <SearchBar />

          <div className="flex items-center gap-4">
            <AddButton />
            <NotificationBell
              notifications={notifications}
              unreadCount={unreadCount}
              onMarkAsRead={handleMarkAsRead}
            />
            <UserProfile userData={userData} onLogout={handleLogout} />
          </div>
        </div>
      </div>
    </div>
  );
}
