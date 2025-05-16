"use client";
import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import UserDropdown from "./UserDropdown";
import noPP from "@/images/noPP.png";

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
              : noPP
          }
          width={35}
          height={35}
          className="rounded-lg"
          alt="User Profile"
        />
        <div className="flex flex-col">
          <span className="text-xs font-medium">
            {userData?.firstName || "User"}
          </span>
          <span className="text-[0.6rem] text-gray-500">
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
