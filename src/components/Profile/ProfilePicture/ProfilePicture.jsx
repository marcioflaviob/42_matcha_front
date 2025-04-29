import React, { useState, useEffect, useRef } from 'react';
import './ProfilePicture.css';
import ProfileCard from '../../HomePage/ProfileCard';
import { Galleria } from 'primereact/galleria';
        
const ProfilePicture = ({ userId, userInfo }) => {
  const [pictures, setPictures] = useState(null);

  useEffect(() => 
  {
    if(userInfo)
      setPictures(userInfo.pictures)
  }, [userId, userInfo]);

  if (!userInfo)
  {
    return (
      <div className="profile-card-container">

      </div>
    )
  }

  return (
    <div className="profile-card-container">
      <ProfileCard profile={userInfo} showButtons={false}/>
    </div>
  );
};

export default ProfilePicture;