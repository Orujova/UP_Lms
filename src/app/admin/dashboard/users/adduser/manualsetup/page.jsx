'use client';

import React from 'react';
import UserProfilePicture from '@/components/userProfilePicture';
import AddUserFormComponent from '@/components/addUserFormComponent';

//style
import './addUser.scss';

export default function Page() {
  return (
    <div className="addUser">
      <UserProfilePicture />
      <AddUserFormComponent />
    </div>
  );
}