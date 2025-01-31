

import Sidebar, { Header } from '@/components/all-menus';
import UserSidebar from '@/components/userSidebar';

import './dashboard.scss'

export default function DashboardLayout({ children }) {
  return (
    <section className="dashboard">
      <UserSidebar />
      {/* <Sidebar/> */}
      <div className="pages">
        <Header />
        <div>{children}</div>
      </div>
    </section>
  );
}
