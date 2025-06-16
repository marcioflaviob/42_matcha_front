import React, { useEffect, useContext } from 'react';
import './EditProfilePicture.css';
import { UserContext } from '../../../context/UserContext';
import ProfileCard from '../../HomePage/ProfileCard';
import 'primeicons/primeicons.css';
        
const EditProfilePicture = ({ shadowUser, setShadowUser }) => {

  const { user } = useContext(UserContext);

  useEffect(() => {
    // Only set shadowUser if it's not already set (initial load)
    if (user && !shadowUser)
      setShadowUser(user);
  }, [user, shadowUser, setShadowUser]);

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