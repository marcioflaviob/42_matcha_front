import React, { useContext, useEffect, useState } from 'react';
import './EditProfile.css';
import EditProfileForm from '../../components/EditProfile/EditProfileForm/EditProfileForm';
import ProfileCard from '../../components/HomePage/ProfileCard';
import { UserContext } from '../../context/UserContext';
        
const EditProfile = () => {
	const { user } = useContext(UserContext);
	const [shadowUser, setShadowUser] = useState(user);

	useEffect(() => {
		if (user) {
			setShadowUser(prev => ({
				...prev,
				pictures: user.pictures || prev.pictures,
        	}));
		}
	}, [user]);

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