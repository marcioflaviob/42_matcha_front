import React from 'react';
import { useParams } from 'react-router-dom';
import './EditProfile.css';
import EditProfilePicture from '../../components/EditProfile/EditProfilePicture/EditProfilePicture';
import EditProfileInfo from '../../components/EditProfile/EditProfileInfo/EditProfileInfo';
        
const EditProfile = () => {
  const { userId } = useParams();
  //This is how the profilePictures in the database will look like

	return (
		<div className='profile-container'>
			<EditProfilePicture userId={userId}></EditProfilePicture>
            <EditProfileInfo userId={userId}></EditProfileInfo>
		</div>
	);
}

export default EditProfile;