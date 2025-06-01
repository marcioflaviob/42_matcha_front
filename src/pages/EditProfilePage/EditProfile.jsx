import React, { useState } from 'react';
import './EditProfile.css';
import EditProfileForm from '../../components/EditProfile/EditProfileForm/EditProfileForm';
import ProfileCard from '../../components/HomePage/ProfileCard';
        
const EditProfile = () => {
  const [shadowUser, setShadowUser] = useState(null);

	return (
		<div className='edit-profile-container'>
			{/* Left Side - Edit Form */}
			<div className="edit-profile-form-section">
				<EditProfileForm shadowUser={shadowUser} setShadowUser={setShadowUser} />
			</div>

			{/* Right Side - Live Preview */}
			<div className="edit-profile-preview-section">
				{shadowUser && (
					<div className="edit-profile-preview-card">
						<ProfileCard profile={shadowUser} showButtons={false} />
					</div>
				)}
			</div>
		</div>
	);
}

export default EditProfile;