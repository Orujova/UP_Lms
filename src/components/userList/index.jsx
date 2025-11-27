"use client";
import { useEffect, useState } from "react";
import { ArrowUpDown } from "lucide-react";
import UserComponent from "../userComponent";

const BASE_IMAGE_URL = "https://demoadmin.databyte.app/uploads/";

const formatImageUrl = (imageUrl) => {
  if (!imageUrl) return "";

  const cleanPath = imageUrl.replace("https://100.42.179.27:7298/", "");

  return `${BASE_IMAGE_URL}${cleanPath}`;
};

export default function UserList({ adminApplicationUser }) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const tableBody = document.querySelector("#tableBody");

    const handleScroll = () => {
      if (tableBody?.scrollTop > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    tableBody?.addEventListener("scroll", handleScroll);
    return () => tableBody?.removeEventListener("scroll", handleScroll);
  }, []);

  const columns = [
    { key: "fullName", label: "Full name", sortable: true },
    { key: "contact", label: "Contact", sortable: false },
    { key: "department", label: "Department", sortable: true },
    { key: "position", label: "Position", sortable: true },
    { key: "action", label: "Action", sortable: false },
  ];

  // Get the total number of users for positioning dropdown
  const totalUsers = adminApplicationUser.appUsers?.length || 0;

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden relative flex flex-col h-full">
      <div
        className={`sticky top-0 z-8 grid grid-cols-[2fr_1fr_1fr_2fr_80px] gap-4 py-4 px-6 bg-white border-b border-gray-200 transition-shadow ${
          isScrolled ? "shadow-md" : ""
        }`}
      >
        {columns.map((column) => (
          <div
            key={column.key}
            className="flex items-center gap-2 text-gray-600 font-semibold text-xs select-none"
          >
            <span>{column.label}</span>
            {column.sortable && (
              <ArrowUpDown className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer transition-all hover:scale-110" />
            )}
          </div>
        ))}
      </div>

      <div
        id="tableBody"
        className="flex-1 overflow-y-auto overflow-x-hidden"
        style={{ paddingBottom: "16px" }}
      >
        {adminApplicationUser.appUsers?.map((user, index) => (
          <UserComponent
            key={user.id}
            img={formatImageUrl(user.imageUrl)}
            fullName={`${user.firstName} ${user.lastName}`}
            id={user.id}
            phone={user.phoneNumber}
            department={user.department?.name || "Not specified"}
            position={user.position?.name || "Not specified"}
            isActive={!user.isDeleted}
            index={index}
            totalItems={totalUsers}
          />
        ))}
        {/* Remove the gradient fade at bottom for better visibility */}
      </div>
    </div>
  );
}
