"use client";
import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import UserDropdown from "./UserDropdown";

export default function UserProfile({ userData, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className="flex items-center gap-3 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Image
          src={
            userData?.imageUrl
              ? `https://bravoadmin.uplms.org/uploads/${userData.imageUrl.replace(
                  "https://100.42.179.27:7198/",
                  ""
                )}`
              : "/api/placeholder/40/40"
          }
          width={40}
          height={40}
          className="rounded-lg"
          alt="User Profile"
        />
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {userData?.firstName || "User"}
          </span>
          <span className="text-xs text-gray-500">
            {userData?.roleId === 0 ? "Admin" : "User"}
          </span>
        </div>
      </div>

      {isOpen && (
        <UserDropdown
          userData={userData}
          onLogout={onLogout}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
