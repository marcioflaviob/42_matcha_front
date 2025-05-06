import React, { useState, useEffect, useRef, useContext } from 'react';
import './EditProfilePicture.css';
import { UserContext } from '../../../context/UserContext';
import ProfileCard from '../../HomePage/ProfileCard';
import 'primeicons/primeicons.css';
        
const EditProfilePicture = ({ userId, shadowUser, setShadowUser }) => {

  const { user } = useContext(UserContext);
  // const { state, getLatestState } = useEditProfileContext();

  useEffect(() => {
    if (user)
      setShadowUser(user);
  }, [user]);

  if (!user)
  {
    return (
      <div className="ProfilePicture-div">

      </div>
    )
  }

  return (
    <div className="edit-profile-card">
      <ProfileCard profile={shadowUser} showButtons={false} />
    </div>
  );
};

export default EditProfilePicture;