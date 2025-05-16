"use client";
import { useRouter } from "next/navigation";
import NotificationItem from "./NotificationItem";
import "./notification.scss";
export default function NotificationsDropdown({
  notifications,
  onMarkAsRead,
  onClose,
}) {
  const router = useRouter();

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border overflow-hidden">
      <div className="p-3 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-xs">Notifications</h3>
          <button className="text-[0.65rem] text-[#01DBC8] hover:underline">
            Mark all as read
          </button>
        </div>
      </div>

      {/* Custom Scrollbar Container */}
      <div
        className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 
                    scrollbar-track-gray-50 hover:scrollbar-thumb-gray-300 
                    scrollbar-thumb-rounded-full scrollbar-track-rounded-full
                    px-2"
      >
        {/* Add padding to inner content for better spacing */}
        <div className="space-y-1 py-2">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={onMarkAsRead}
            />
          ))}
        </div>
      </div>

      <div className="p-2 text-center border-t bg-white">
        <button
          onClick={() => {
            onClose();
            router.push("/admin/dashboard/notification");
          }}
          className="text-xs text-[#01DBC8] hover:underline"
        >
          View all notifications
        </button>
      </div>
    </div>
  );
}
