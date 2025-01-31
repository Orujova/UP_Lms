'use client'

import { useEffect, useState } from 'react';
import ControlsButtons from "@/components/controlsButtons";
import UserList from "@/components/userList";
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { adminApplicationUserAsync } from '@/redux/adminApplicationUser/adminApplicationUser';
import Pagination from '@/components/pagination';

//style
import './users.scss';

export default function Page() {
  const dispatch = useDispatch();
  const adminApplicationUser = useSelector((state) => state.adminApplicationUser.data?.[0]) || [];
  const [currentPage, setCurrentPage] = useState(1);


  useEffect(() => {
    dispatch(adminApplicationUserAsync(currentPage));  // Fetch data based on the current page
  }, [dispatch, currentPage]);  // Trigger useEffect when currentPage changes

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);  // Update the current page
  };

  return (
    <div className="users">
      <ControlsButtons count={adminApplicationUser.totalAppUserCount} text={'Users in Total'} link={'/admin/dashboard/users/adduser/manualsetup'} buttonText={'Add User'}/>
      <UserList adminApplicationUser={adminApplicationUser}/>
      <Pagination currentPage={currentPage} totalPages={Math.ceil(adminApplicationUser.totalAppUserCount / 20)} onPageChange={handlePageChange} />
    </div>
  );
}
