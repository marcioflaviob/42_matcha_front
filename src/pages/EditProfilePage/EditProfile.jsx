import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import './EditProfile.css';
import EditProfilePicture from '../../components/EditProfile/EditProfilePicture/EditProfilePicture';
import EditProfileInfo from '../../components/EditProfile/EditProfileInfo/EditProfileInfo';
        
const EditProfile = () => {
  const [shadowUser, setShadowUser] = useState(null);

	return (
		<div className='edit-profile-container'>
            <EditProfileInfo shadowUser={shadowUser} setShadowUser={setShadowUser} />
			<EditProfilePicture shadowUser={shadowUser} setShadowUser={setShadowUser} />
		</div>
	);
}

export default EditProfile;