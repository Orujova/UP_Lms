// "use client";
// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { toast } from "sonner";
// import { getToken, removeToken, getParsedToken } from "@/authtoken/auth.js";

// import SearchBar from "./SearchBar";
// import AddButton from "./AddButton";
// import NotificationBell from "./NotificationBell";
// import UserProfile from "./UserProfile";

// export default function AdminHeader() {
//   const [userData, setUserData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [notifications, setNotifications] = useState([]);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const router = useRouter();
//   const token = getToken();

//   useEffect(() => {
//     const fetchUserData = async () => {
//       try {
//         const parsedToken = getParsedToken();
//         if (!token || !parsedToken?.UserID) {
//           throw new Error("Authorization token is missing or invalid.");
//         }

//         const response = await fetch(
//           `https://bravoadmin.uplms.org/api/AdminApplicationUser/${parsedToken.UserID}`,
//           {
//             headers: {
//               accept: "application/json",
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );
//         if (!response.ok) throw new Error("Failed to fetch user data");

//         const data = await response.json();
//         setUserData(data);
//       } catch (error) {
//         console.error("Error:", error);
//         setError("Failed to load user data.");
//         toast.error("Failed to load user data.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUserData();
//   }, []);

//   useEffect(() => {
//     const fetchNotifications = async () => {
//       try {
//         const userId = localStorage.getItem("userId");
//         if (!userId) return;

//         const response = await fetch(
//           `https://bravoadmin.uplms.org/api/Notification/getAllUserNotifications?UserId=${userId}`,
//           {
//             headers: {
//               accept: "application/json",
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );
//         const data = await response.json();

//         setNotifications(data[0].userNotifications || []);
//         setUnreadCount(data[0].unreadNotificationCount || 0);
//       } catch (error) {
//         console.error("Error fetching notifications:", error);
//       }
//     };

//     fetchNotifications();
//     const interval = setInterval(fetchNotifications, 30000);
//     return () => clearInterval(interval);
//   }, []);

//   const handleLogout = () => {
//     removeToken();
//     localStorage.removeItem("userId");
//     toast.success("Logged out successfully.");
//     router.push("/admin/login");
//   };

//   const markAsRead = async (notificationId) => {
//     try {
//       const response = await fetch(
//         "https://bravoadmin.uplms.org/api/Notification/updateReadStatus",
//         {
//           method: "PATCH",
//           headers: {
//             "Content-Type": "application/json",

//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify({
//             notificationId,
//             isRead: true,
//           }),
//         }
//       );

//       if (response.ok) {
//         setNotifications(
//           notifications.map((notif) =>
//             notif.id === notificationId ? { ...notif, isRead: true } : notif
//           )
//         );
//         setUnreadCount((prev) => Math.max(0, prev - 1));
//       }
//     } catch (error) {
//       console.error("Error marking notification as read:", error);
//     }
//   };

//   if (loading) return <div className="w-full h-16 bg-gray-100 animate-pulse" />;
//   if (error) return <div className="text-red-500 p-4">{error}</div>;

//   return (
//     <div className="fixed top-0 right-0 left-[20rem] z-50">
//       <div className="border-b bg-white shadow-sm px-[4.1667vw] pr-[6vw] py-[1.5rem]">
//         <div className="flex items-center justify-between">
//           <SearchBar />

//           <div className="flex items-center gap-4">
//             <AddButton />
//             <NotificationBell
//               notifications={notifications}
//               unreadCount={unreadCount}
//               onMarkAsRead={markAsRead}
//             />
//             <UserProfile userData={userData} onLogout={handleLogout} />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// AdminHeader.js
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

  return (
    <div className="fixed top-0 right-0 left-[20rem] z-50">
      <div className="border-b bg-white shadow-sm px-[4.1667vw] pr-[6vw] py-[1.5rem]">
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
