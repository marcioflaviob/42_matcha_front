import React from 'react';
import { useParams } from 'react-router-dom';
import './Profile.css';
import ProfilePicture from '../../components/Profile/ProfilePicture/ProfilePicture';
import ProfileInfo from '../../components/Profile/ProfileInfo/ProfileInfo';
        
const Profile = () => {
  const { userId } = useParams();
  //This is how the profilePictures in the database will look like

	return (
		<div className='profile-container'>
			<ProfilePicture userId={userId}></ProfilePicture>
      <ProfileInfo userId={userId}></ProfileInfo>
		</div>
	);
}

export default Profile;