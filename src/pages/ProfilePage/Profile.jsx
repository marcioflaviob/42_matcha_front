import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import './Profile.css';
import ProfilePicture from '../../components/Profile/ProfilePicture/ProfilePicture';
import ProfileInfo from '../../components/Profile/ProfileInfo/ProfileInfo';
import { displayAlert } from '../../components/Notification/Notification';
import axios from 'axios';
import { UserContext } from '../../../context/UserContext';
        
const Profile = () => {
	const { userId } = useParams();
	const {user} = useContext(UserContext);
	const [currentUser, setCurrentUser] = useState(null);

	const fetchData = async () => {
		try {
			const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/${userId}`);
			setCurrentUser(response.data);
		} catch (err) {
			displayAlert('error', 'Error fetching information'); // Handle errors
		}
	};

	const sendViewNotification = async () => {
		try {
			await axios.post(`${import.meta.env.VITE_API_URL}/seen/${selectedUser.id}`, {}, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
		} catch (err) {
			console.error('Error sending profile view notification:', err);
		}
	}

	useEffect(async() => {
		await fetchData();
		if (userId != user.id) {
			await sendViewNotification();
		}
	}, [userId]);

	if (!currentUser) {
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