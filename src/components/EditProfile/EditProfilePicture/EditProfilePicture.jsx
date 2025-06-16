import React, { useEffect, useContext } from 'react';
import './EditProfilePicture.css';
import { UserContext } from '../../../context/UserContext';
import ProfileCard from '../../HomePage/ProfileCard';
import 'primeicons/primeicons.css';
        
const EditProfilePicture = ({ shadowUser, setShadowUser }) => {

  const { user } = useContext(UserContext);

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
    <div className="edit-profile-picture-container">
      <ProfileCard profile={shadowUser} showButtons={false} />
    </div>
  );
};

export default EditProfilePicture;