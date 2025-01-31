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
    dashboard: false,
    learning: false,
    communications: false,
    settings: false,
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
          indent ? "ml-4 pl-4 border-l border-gray-200" : ""
        } ${
          isActive
            ? "bg-emerald-50 text-emerald-600"
            : "text-gray-600 hover:bg-gray-100"
        }`}
      >
        <Icon
          size={20}
          className={isActive ? "text-emerald-600" : "text-gray-500"}
        />
        <span className={`text-sm ${isActive ? "font-medium" : ""}`}>
          {label}
        </span>
      </Link>
    );
  };

  const MenuDropdown = ({ title, icon: Icon, isOpen, onToggle, children }) => (
    <div>
      <div
        className={`px-4 py-2 rounded-lg cursor-pointer flex items-center justify-between ${
          isOpen
            ? "bg-emerald-50 text-emerald-600"
            : "text-gray-600 hover:bg-gray-100"
        }`}
        onClick={onToggle}
      >
        <div className="flex items-center space-x-3 ">
          <Icon
            size={20}
            className={isOpen ? "text-emerald-600" : "text-gray-500"}
          />
          <span className={`text-sm ${isOpen ? "font-medium" : ""}`}>
            {title}
          </span>
        </div>
        <ChevronDown
          size={16}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </div>
      {isOpen && children}
    </div>
  );

  return (
    <div className="w-64 bg-white h-screen border-r border-gray-200 flex flex-col sticky top-0 shadow-sm">
      <div className="p-6">
        <Link
          href="/admin/dashboard"
          className="flex items-center justify-center"
        >
          <Image
            src={logo}
            alt="Logo"
            width={100}
            height={80}
            className="rounded"
          />
          {/* <h1>
            {" "}
            |<span> LMS</span>
          </h1> */}
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

          {/* Data Collection */}
          {/* <MenuDropdown
            title="Data Collection"
            icon={ClipboardList}
            isOpen={openMenus.dataCollection}
            onToggle={() => toggleMenu("dataCollection")}
          >
            <div className="space-y-1">
              <NavLink
                href="/admin/dashboard/survey"
                icon={ClipboardList}
                label="Survey"
                indent
              />
              <NavLink
                href="/admin/dashboard/form"
                icon={FileText}
                label="Form"
                indent
              />
            
            </div>
          </MenuDropdown> */}

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
