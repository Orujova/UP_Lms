import React from 'react';
import Image from 'next/image';

//style
import './userProfilePicture.scss';

//image
import img from '@/images/addUserProfile.svg';

export default function UserProfilePicture() {
  return (
    <div className="userProfilePicture">
      <p className="title">Profile Picture</p>
      <div>
        <Image src={img} alt="profile" />
        <div className="buttons">
          <div className="button add">Change picture</div>
          <div className="button remove">Remove</div>
        </div>
      </div>
    </div>
  );
}