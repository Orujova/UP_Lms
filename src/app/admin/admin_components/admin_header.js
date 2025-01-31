"use client";

import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { getToken, removeToken, getParsedToken } from "@/authtoken/auth.js";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Search, Bell, LogOut, Plus } from "lucide-react"; // Import Lucide icons

//image
import noPP from '@/images/noPP.png';

export default function AdminHeader() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null); // Reference for dropdown
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = getToken();
        const parsedToken = getParsedToken();
        if (!token || !parsedToken?.UserID) {
          throw new Error("Authorization token is missing or invalid. Please log in again.");
        }

        const response = await fetch(`https://bravoadmin.uplms.org/api/AdminApplicationUser/${parsedToken.UserID}`, {
          headers: {
            "accept": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();

        setUserData(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to load user data.");
        toast.error("Failed to load user data."); // Show error notification
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    removeToken(); // Clear the authentication token
    toast.success("Logged out successfully."); // Show success notification
    router.push("/admin/login"); // Redirect to the login page
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="fixed-header">
      <div className="top-0 w-fully border-b-2 px-5 py-3 flex items-center justify-between bg-white">
        {/* Search Section */}
        <div className="flex justify-start items-center gap-4">
          <Search className="w-6 h-6 text-black" />
          <input
            type="search"
            placeholder="Search anything here..."
            className="text-sm outline-0 placeholder-gray-500 focus:ring-0"
          />
        </div>

        {/* Action Section */}
        <div className="flex items-center justify-end gap-4">
          {/* Add Button */}
          <button className="flex items-center justify-center bg-mainGreen w-[36px] h-[36px] rounded-sm">
            <Plus className="w-5 h-5 text-white" />
          </button>

          {/* Notifications */}
          <div className="flex items-center justify-center border-2 border-gray-300 w-[36px] h-[36px] rounded-sm">
            <Bell className="w-5 h-5 text-gray-600" />
          </div>

          {/* User Section with Dropdown */}
          <div className="flex items-center gap-4 relative" ref={dropdownRef}>
            {userData?.email && (
              <>
                <Image
                  src={`https://bravoadmin.uplms.org/uploads/${userData?.imageUrl.replace(
                        "https://100.42.179.27:7198/",
                        ""
                      )}` || noPP}
                  width={44}
                  height={44}
                  className="rounded-full cursor-pointer"
                  alt="User Profile"
                  onClick={() => setDropdownOpen((prev) => !prev)} // Toggle dropdown
                />
                <div className="flex flex-col">
                  <h1 className="text-sm font-bold">{userData?.firstName || "User"}</h1>
                  <span className="text-xs font-bold text-gray-500">
                    {userData?.roleId === 0 ? "Admin" : "User"}
                  </span>
                </div>
              </>
            )}
            {/* Logout Dropdown */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg border z-50">
                <ul className="text-sm text-gray-700">
                  <li
                    className="px-4 py-2 flex items-center gap-2 hover:bg-gray-100 cursor-pointer"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 text-red-500" /> Logout
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
