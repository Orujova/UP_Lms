import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  BookOpen,
  Target,
  Users,
  FileText,
  Bell,
  Settings,
  Shield,
  HelpCircle,
  ChevronDown,
  GraduationCap,
  MessageSquare,
  Newspaper,
  Megaphone,
  CalendarDays,
  BarChart,
  Briefcase,
  LineChart,
  Key,
} from "lucide-react";

import logo from "@/images/logo.png";

import "./adminSidebar.scss";

const AdminSidebar = () => {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState({
    dashboard: true,
    learning: true,
    communications: true,
    settings: true,
  });

  const toggleMenu = (menu) => {
    setOpenMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  const NavLink = ({ href, icon: Icon, label, indent = false }) => {
    const isActive = pathname === href;
    return (
      <Link
        href={href}
        className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
          indent ? "ml-4 pl-4 " : ""
        } ${
          isActive ? " text-[#127D74]" : "text-[#808080] hover:bg-gray-100/80"
        }`}
      >
        <Icon
          size={20}
          className={isActive ? "text-[#127D74]" : "text-gray-500"}
        />
        <span className={`text-sm ${isActive ? "font-medium" : ""}`}>
          {label}
        </span>
      </Link>
    );
  };

  const MenuDropdown = ({ title, icon: Icon, isOpen, onToggle, children }) => (
    <div className="relative">
      <div
        className={`px-4 py-3 rounded-lg cursor-pointer flex items-center justify-between transition-all duration-200 ${
          isOpen
            ? "bg-[#01DBC8]/10 text-[#127D74]"
            : "text-gray-700 hover:bg-gray-100/80"
        }`}
        onClick={onToggle}
      >
        <div className="flex items-center space-x-3">
          <Icon
            size={20}
            className={isOpen ? "text-[#127D74]" : "text-gray-500"}
          />
          <span className={`text-sm ${isOpen ? "font-medium" : ""}`}>
            {title}
          </span>
        </div>
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          } ${isOpen ? "text-[#127D74]" : "text-gray-400"}`}
        />
      </div>
      {isOpen && <div className="mt-1">{children}</div>}
    </div>
  );

  return (
    <div className="w-80 bg-white h-screen border-r border-gray-200 flex flex-col sticky top-0 shadow-sm">
      <div className="p-6 py-6">
        {/* <div className="p-6 border-b border-gray-200/80 py-3"> */}
        <Link
          href="/admin/dashboard"
          className="flex items-center justify-center"
        >
          <Image
            src={logo}
            alt="Logo"
            width={140}
            height={90}
            className="rounded"
          />
        </Link>
      </div>

      <div className="flex-1 sidebar-scroll overflow-y-auto px-3">
        <div className="space-y-4">
          {/* Dashboard */}
          <MenuDropdown
            title="Dashboard"
            icon={LayoutDashboard}
            isOpen={openMenus.dashboard}
            onToggle={() => toggleMenu("dashboard")}
          >
            <div className="space-y-1">
              <NavLink
                href="/admin/dashboard/reports"
                icon={FileText}
                label="Reports"
                indent
              />
              <NavLink
                href="/admin/dashboard/insights"
                icon={LineChart}
                label="Insights"
                indent
              />
              <NavLink
                href="/admin/dashboard/users"
                icon={Users}
                label="Users"
                indent
              />
              <NavLink
                href="/admin/dashboard/targets"
                icon={Target}
                label="Target Groups"
                indent
              />
              <NavLink
                href="/admin/dashboard/faq"
                icon={HelpCircle}
                label="FAQ"
                indent
              />
            </div>
          </MenuDropdown>

          {/* Learning and Development */}
          <MenuDropdown
            title="Learning and Development"
            icon={GraduationCap}
            isOpen={openMenus.learning}
            onToggle={() => toggleMenu("learning")}
          >
            <div className="space-y-1">
              <NavLink
                href="/admin/dashboard/courses"
                icon={BookOpen}
                label="Courses"
                indent
              />
              <NavLink
                href="/admin/dashboard/trainings"
                icon={GraduationCap}
                label="Trainings"
                indent
              />
            </div>
          </MenuDropdown>

          {/* Communications */}
          <MenuDropdown
            title="Communications"
            icon={MessageSquare}
            isOpen={openMenus.communications}
            onToggle={() => toggleMenu("communications")}
          >
            <div className="space-y-1">
              <NavLink
                href="/admin/dashboard/news"
                icon={Newspaper}
                label="News"
                indent
              />
              <NavLink
                href="/admin/dashboard/announcements"
                icon={Megaphone}
                label="Announcements"
                indent
              />
              <NavLink
                href="/admin/dashboard/events"
                icon={CalendarDays}
                label="Events"
                indent
              />{" "}
              <NavLink
                href="/admin/dashboard/poll-unit"
                icon={BarChart}
                label="Data Collection"
                indent
              />
              <NavLink
                href="/admin/dashboard/push-notification"
                icon={Bell}
                label="Push Notifications"
                indent
              />
              <NavLink
                href="/admin/dashboard/vacancies"
                icon={Briefcase}
                label="Internal Vacancies"
                indent
              />
            </div>
          </MenuDropdown>

          {/* Settings */}
          <MenuDropdown
            title="Settings"
            icon={Settings}
            isOpen={openMenus.settings}
            onToggle={() => toggleMenu("settings")}
          >
            <div className="space-y-1">
              <NavLink
                href="/admin/dashboard/terms-and-conditions"
                icon={FileText}
                label="Terms and Conditions"
                indent
              />
              <NavLink
                href="/admin/dashboard/privacy-policy"
                icon={Shield}
                label="Privacy Policy"
                indent
              />
              <NavLink
                href="/admin/dashboard/role-management"
                icon={Users}
                label="Role Management"
                indent
              />
              <NavLink
                href="/admin/dashboard/access-management"
                icon={Key}
                label="Access Management"
                indent
              />
            </div>
          </MenuDropdown>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
