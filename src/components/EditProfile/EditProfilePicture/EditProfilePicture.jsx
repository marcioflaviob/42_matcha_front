import React, { useEffect, useContext } from 'react';
import './EditProfilePicture.css';
import { UserContext } from '../../../context/UserContext';
import ProfileCard from '../../HomePage/ProfileCard';
import 'primeicons/primeicons.css';
        
const EditProfilePicture = ({ shadowUser, setShadowUser }) => {
  const { user } = useContext(UserContext);

  if (!user) return <></>;

  return (
    <div className="edit-profile-card">
      <ProfileCard profile={shadowUser} showButtons={false} />
    </div>
  );
};

export default EditProfilePicture;