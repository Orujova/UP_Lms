'use client'

import AdminSidebar from "@/components/adminSidebar";
import AdminHeader from "../admin_components/admin_header";
import CoursesSidebar from "@/components/coursesSidebar";
import UserSidebar from "@/components/userSidebar";
import { usePathname } from "next/navigation";
import Providers from "@/redux/providers";
import { useEffect } from "react";
import { useDispatch } from 'react-redux';
import { newsAsync } from "@/redux/news/news";

//style
import './dashboard.scss'

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const isCoursesPage = pathname.startsWith('/admin/dashboard/courses') && pathname !== '/admin/dashboard/courses';
  const isUsersPage = pathname.startsWith('/admin/dashboard/users/adduser');




  return (
    <section className="dashboard">
      <Providers>
        {!isCoursesPage && !isUsersPage && <AdminSidebar />}
        {isCoursesPage && <CoursesSidebar />}
        {isUsersPage && <UserSidebar />}
        <div className="pages">
          <AdminHeader />
          <div>{children}</div>
        </div>
      </Providers>
    </section>
  );
}