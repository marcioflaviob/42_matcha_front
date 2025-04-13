import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './Profile.css';
import ProfilePicture from '../../components/Profile/ProfilePicture/ProfilePicture';
import ProfileInfo from '../../components/Profile/ProfileInfo/ProfileInfo';
import { displayAlert } from '../../components/Notification/Notification';
import axios from 'axios';
        
const Profile = () => {
	const { userId } = useParams();
	const [currentUser, setCurrentUser] = useState(null);

	const fetchData = async () => {
		try {
			const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/${userId}`);
			setCurrentUser(response.data);
		} catch (err) {
			displayAlert('error', 'Error fetching information'); // Handle errors
		}
	};

	useEffect(() =>
	{
		fetchData();
	}, []);

	if (!currentUser) 
	{
		return(
			<div></div>
	)};

	return (
		<div className='profile-container'>
			<ProfilePicture userId={userId} userInfo={currentUser}></ProfilePicture>
			<ProfileInfo userId={userId} userInfo={currentUser}></ProfileInfo>
		</div>
	);
}

export default Profile;