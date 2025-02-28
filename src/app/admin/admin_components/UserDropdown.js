"use client";
import Image from "next/image";
import { User, Settings, Mail, HelpCircle, LogOut } from "lucide-react";
import noPP from "@/images/noPP.png";
import Link from "next/link";

export default function UserDropdown({ userData, onLogout, onClose }) {
  return (
    <div className="absolute right-0 mt-2 w-[18rem] bg-white rounded-lg shadow-lg border overflow-hidden">
      <div className="p-2 border-b bg-gray-50">
        <div className="flex items-center gap-3">
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
          <div>
            <h4 className="text-xs font-medium">
              {userData?.firstName || "User"}
            </h4>
            <p className="text-[0.6rem] text-gray-500">{userData?.email}</p>
          </div>
        </div>
      </div>
      <div>
        <Link
          href={"/admin/dashboard/profile"}
          className="w-full px-4 py-2 text-left text-xs hover:bg-gray-50 flex items-center gap-3"
        >
          <User className="w-4 h-4 text-gray-500" />
          Profile
        </Link>

        <Link
          href={"/admin/dashboard/notification"}
          className="w-full px-4 py-2 text-left text-xs hover:bg-gray-50 flex items-center gap-3"
        >
          <Mail className="w-4 h-4 text-gray-500" />
          Messages
        </Link>
        <button className="w-full px-4 py-2 text-left text-xs hover:bg-gray-50 flex items-center gap-3">
          <Settings className="w-4 h-4 text-gray-500" />
          Settings
        </button>
        <button className="w-full px-4 py-2 text-left text-xs hover:bg-gray-50 flex items-center gap-3">
          <HelpCircle className="w-4 h-4 text-gray-500" />
          Help Center
        </button>
      </div>
      <div className="border-t py-2 hover:bg-red-50">
        <button
          onClick={onLogout}
          className="w-full px-4 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-3"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );
}
