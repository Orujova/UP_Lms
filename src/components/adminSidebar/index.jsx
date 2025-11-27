// "use client";
// import React, { useState, useRef, useEffect } from "react";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import Image from "next/image";
// import {
//   LayoutDashboard,
//   BookOpen,
//   Target,
//   Users,
//   FileText,
//   Bell,
//   Settings,
//   Shield,
//   HelpCircle,
//   ChevronDown,
//   GraduationCap,
//   MessageSquare,
//   Newspaper,
//   Megaphone,
//   CalendarDays,
//   BarChart,
//   Briefcase,
//   LineChart,
//   Key,
//   Gem,
//   UserCog,
//   LogOut,
//   MessageCircleMore,
// } from "lucide-react";

// import logo from "@/images/logo.png";

// import "./adminSidebar.scss";

// const AdminSidebar = () => {
//   const pathname = usePathname();
//   const [openMenu, setOpenMenu] = useState("dashboard"); // Default open menu
//   const sidebarRef = useRef(null);

//   const toggleMenu = (menu) => {
//     if (openMenu === menu) {
//       setOpenMenu(null);
//     } else {
//       setOpenMenu(menu);
//     }
//   };

//   // When a menu opens, scroll it into view if needed
//   useEffect(() => {
//     if (openMenu && sidebarRef.current) {
//       const openMenuElement = document.getElementById(`menu-${openMenu}`);
//       if (openMenuElement) {
//         // This ensures the opened dropdown is in view
//         openMenuElement.scrollIntoView({
//           behavior: "smooth",
//           block: "nearest",
//         });
//       }
//     }
//   }, [openMenu]);

//   const NavLink = ({ href, icon: Icon, label, indent = false }) => {
//     const isActive = pathname.startsWith(href);

//     return (
//       <Link
//         href={href}
//         className={`flex items-center space-x-3 px-4 py-1.5 rounded-lg transition-colors ${
//           indent ? "ml-4 pl-3 " : ""
//         } ${
//           isActive ? " text-[#1B4E4A]" : "text-[#808080] hover:bg-gray-100/80"
//         }`}
//       >
//         <Icon
//           size={16}
//           className={isActive ? "text-[#1B4E4A]" : "text-gray-500"}
//         />
//         <span className={`text-xs ${isActive ? "font-bold" : ""}`}>
//           {label}
//         </span>
//       </Link>
//     );
//   };

//   const MenuDropdown = ({ id, title, icon: Icon, children }) => {
//     const isOpen = openMenu === id;
//     const contentRef = useRef(null);

//     return (
//       <div className="relative" id={`menu-${id}`}>
//         <div
//           className={`px-4 py-2 rounded-lg cursor-pointer flex items-center justify-between transition-all duration-200 ${
//             isOpen
//               ? "bg-[#f9fefe] text-[#0AAC9E]"
//               : "text-gray-700 hover:bg-gray-100/80"
//           }`}
//           onClick={() => toggleMenu(id)}
//         >
//           <div className="flex items-center space-x-3">
//             <Icon
//               size={18}
//               className={isOpen ? "text-[#0AAC9E]" : "text-gray-500"}
//             />
//             <span className={`text-xs ${isOpen ? "font-medium" : ""}`}>
//               {title}
//             </span>
//           </div>
//           <ChevronDown
//             size={16}
//             className={`transition-transform duration-300 ${
//               isOpen ? "rotate-180" : ""
//             } ${isOpen ? "text-[#0AAC9E]" : "text-gray-400"}`}
//           />
//         </div>
//         <div
//           ref={contentRef}
//           className={`overflow-hidden transition-all duration-300 ease-in-out ${
//             isOpen ? "max-h-96 opacity-100 my-1 pb-1" : "max-h-0 opacity-0"
//           }`}
//         >
//           <div className="py-1">{children}</div>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="w-72 bg-white h-screen border-r border-gray-200 flex flex-col sticky top-0 shadow-sm">
//       <div className="p-6 py-4 border-b border-gray-100">
//         <Link
//           href="/admin/dashboard"
//           className="flex items-center justify-center"
//         >
//           <Image
//             src={logo}
//             alt="Logo"
//             width={110}
//             height={80}
//             className="rounded"
//           />
//         </Link>
//       </div>

//       <div
//         ref={sidebarRef}
//         className="flex-1 sidebar-scroll overflow-y-auto px-2 py-4 flex flex-col justify-between"
//       >
//         {/* Main menu section */}
//         <div className="space-y-1">
//           {/* Dashboard */}
//           <MenuDropdown id="dashboard" title="Dashboard" icon={LayoutDashboard}>
//             <div className="space-y-1">
//               <NavLink
//                 href="/admin/dashboard/reports"
//                 icon={FileText}
//                 label="Reports"
//                 indent
//               />
//               <NavLink
//                 href="/admin/dashboard/insights"
//                 icon={LineChart}
//                 label="Insights"
//                 indent
//               />
//               <NavLink
//                 href="/admin/dashboard/users"
//                 icon={Users}
//                 label="Users"
//                 indent
//               />
//               <NavLink
//                 href="/admin/dashboard/targets"
//                 icon={Target}
//                 label="Target Groups"
//                 indent
//               />
//               <NavLink
//                 href="/admin/dashboard/faq"
//                 icon={HelpCircle}
//                 label="FAQ"
//                 indent
//               />
//             </div>
//           </MenuDropdown>

//           {/* Learning and Development */}
//           <MenuDropdown
//             id="learning"
//             title="Learning and Development"
//             icon={GraduationCap}
//           >
//             <div className="space-y-1">
//               <NavLink
//                 href="/admin/dashboard/courses"
//                 icon={BookOpen}
//                 label="Courses"
//                 indent
//               />
//               <NavLink
//                 href="/admin/dashboard/cluster"
//                 icon={BookOpen}
//                 label="Cluster"
//                 indent
//               />
//               <NavLink
//                 href="/admin/dashboard/trainings"
//                 icon={GraduationCap}
//                 label="Trainings"
//                 indent
//               />
//             </div>
//           </MenuDropdown>

//           {/* Communications */}
//           <MenuDropdown
//             id="communications"
//             title="Communications"
//             icon={MessageSquare}
//           >
//             <div className="space-y-1">
//               <NavLink
//                 href="/admin/dashboard/news"
//                 icon={Newspaper}
//                 label="News"
//                 indent
//               />
//               <NavLink
//                 href="/admin/dashboard/announcements"
//                 icon={Megaphone}
//                 label="Announcements"
//                 indent
//               />
//               <NavLink
//                 href="/admin/dashboard/events"
//                 icon={CalendarDays}
//                 label="Events"
//                 indent
//               />
//               <NavLink
//                 href="/admin/dashboard/poll-unit"
//                 icon={BarChart}
//                 label="Data Collection"
//                 indent
//               />
//               <NavLink
//                 href="/admin/dashboard/push-notification"
//                 icon={Bell}
//                 label="Push Notifications"
//                 indent
//               />
//               <NavLink
//                 href="/admin/dashboard/vacancies"
//                 icon={Briefcase}
//                 label="Internal Vacancies"
//                 indent
//               />
//             </div>
//           </MenuDropdown>
//         </div>

//         {/* Settings section at bottom */}
//         <div className="mt-auto pt-4 border-t border-gray-100">
//           <MenuDropdown id="settings" title="Settings" icon={Settings}>
//             <div className="space-y-1">
//               <NavLink
//                 href="/admin/dashboard/user-settings"
//                 icon={UserCog}
//                 label="User Settings"
//                 indent
//               />
//               <NavLink
//                 href="/admin/dashboard/feedbacks"
//                 icon={MessageCircleMore}
//                 label="Feedbacks"
//                 indent
//               />
//               <NavLink
//                 href="/admin/dashboard/terms-and-conditions"
//                 icon={FileText}
//                 label="Terms and Conditions"
//                 indent
//               />
//               <NavLink
//                 href="/admin/dashboard/privacy-policy"
//                 icon={Shield}
//                 label="Privacy Policy"
//                 indent
//               />
//               <NavLink
//                 href="/admin/dashboard/branding"
//                 icon={Gem}
//                 label="Branding"
//                 indent
//               />
//               <NavLink
//                 href="/admin/dashboard/access-management"
//                 icon={Key}
//                 label="Access Management"
//                 indent
//               />
//             </div>
//           </MenuDropdown>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminSidebar;
"use client";
import React, { useState, useRef, useEffect } from "react";
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
  Gem,
  UserCog,
  Layers,
  Library,
  MessageCircleMore,
} from "lucide-react";

import logo from "@/images/logo.png";

import "./adminSidebar.scss";

const AdminSidebar = () => {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState("dashboard");
  const sidebarRef = useRef(null);

  const toggleMenu = (menu) => {
    if (openMenu === menu) {
      setOpenMenu(null);
    } else {
      setOpenMenu(menu);
    }
  };

  useEffect(() => {
    if (openMenu && sidebarRef.current) {
      const openMenuElement = document.getElementById(`menu-${openMenu}`);
      if (openMenuElement) {
        openMenuElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    }
  }, [openMenu]);

  const NavLink = ({ href, icon: Icon, label, indent = false }) => {
    const isActive = pathname.startsWith(href);

    return (
      <Link
        href={href}
        className={`flex items-center space-x-3 px-4 py-1.5 rounded-lg transition-all duration-200 group ${
          indent ? "ml-4 pl-3" : ""
        } ${
          isActive
            ? "bg-[#6ccdc5] text-white shadow-md shadow-[#0AAC9E]/20"
            : "text-[#808080] hover:bg-gray-100/80 hover:text-gray-900"
        }`}
      >
        <Icon
          size={15}
          className={`${
            isActive ? "text-white" : "text-gray-500 group-hover:text-[#0AAC9E]"
          } transition-colors`}
          strokeWidth={isActive ? 2.5 : 2}
        />
        <span className={`text-xs ${isActive ? "font-bold" : ""}`}>
          {label}
        </span>
      </Link>
    );
  };

  const MenuDropdown = ({ id, title, icon: Icon, children }) => {
    const isOpen = openMenu === id;
    const contentRef = useRef(null);

    return (
      <div className="relative" id={`menu-${id}`}>
        <div
          className={`px-4 py-2 rounded-lg cursor-pointer flex items-center justify-between transition-all duration-200 group ${
            isOpen
              ? "bg-[#f0fffe] text-[#0AAC9E] border border-[#0AAC9E]/10"
              : "text-gray-700 hover:bg-gray-100/80 hover:border hover:border-gray-200/50"
          }`}
          onClick={() => toggleMenu(id)}
        >
          <div className="flex items-center space-x-3">
            <div
              className={`p-1.5 rounded-md transition-colors ${
                isOpen
                  ? "bg-[#0AAC9E]/10"
                  : "bg-transparent group-hover:bg-gray-100"
              }`}
            >
              <Icon
                size={14}
                className={`${
                  isOpen
                    ? "text-[#0AAC9E]"
                    : "text-gray-500 group-hover:text-[#0AAC9E]"
                } transition-colors`}
                strokeWidth={isOpen ? 2.5 : 2}
              />
            </div>
            <span className={`text-sm ${isOpen ? "font-medium" : ""}`}>
              {title}
            </span>
          </div>
          <ChevronDown
            size={15}
            className={`transition-all duration-300 ${
              isOpen ? "rotate-180 text-[#0AAC9E]" : "text-gray-400"
            } group-hover:text-[#0AAC9E]`}
            strokeWidth={2}
          />
        </div>
        <div
          ref={contentRef}
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? "max-h-96 opacity-100 my-1 pb-1" : "max-h-0 opacity-0"
          }`}
        >
          <div className="py-1">{children}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-72 bg-white h-screen border-r border-gray-200 flex flex-col sticky top-0 shadow-lg">
      <div className="p-6 py-4 border-b border-gray-100 bg-gradient-to-br from-[#0AAC9E]/5 via-white to-white">
        <Link
          href="/admin/dashboard"
          className="flex items-center justify-center group"
        >
          <Image
            src={logo}
            alt="Logo"
            width={110}
            height={80}
            className="rounded transition-all duration-300 group-hover:scale-105"
          />
        </Link>
      </div>

      <div
        ref={sidebarRef}
        className="flex-1 sidebar-scroll overflow-y-auto px-2 py-3 flex flex-col justify-between"
      >
        {/* Main menu section */}
        <div className="space-y-1">
          {/* Dashboard */}
          <MenuDropdown id="dashboard" title="Dashboard" icon={LayoutDashboard}>
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
            id="learning"
            title="Learning and Development"
            icon={GraduationCap}
          >
            <div className="space-y-1">
              <NavLink
                href="/admin/dashboard/courses"
                icon={Library}
                label="Courses"
                indent
              />
              <NavLink
                href="/admin/dashboard/cluster"
                icon={Layers}
                label="Cluster"
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
            id="communications"
            title="Communications"
            icon={MessageSquare}
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
              />
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
        </div>

        {/* Settings section at bottom */}
        <div className="mt-auto pt-3 border-t border-gray-100">
          <MenuDropdown id="settings" title="Settings" icon={Settings}>
            <div className="space-y-1">
              <NavLink
                href="/admin/dashboard/user-settings"
                icon={UserCog}
                label="User Settings"
                indent
              />
              <NavLink
                href="/admin/dashboard/feedbacks"
                icon={MessageCircleMore}
                label="Feedbacks"
                indent
              />
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
                href="/admin/dashboard/branding"
                icon={Gem}
                label="Branding"
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