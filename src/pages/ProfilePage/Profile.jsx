import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import './Profile.css';
import ProfilePicture from '../../components/Profile/ProfilePicture/ProfilePicture';
import ProfileInfo from '../../components/Profile/ProfileInfo/ProfileInfo';
import { displayAlert } from '../../components/Notification/Notification';
import axios from 'axios';
import { UserContext } from '../../context/UserContext';
import { AuthContext } from '../../context/AuthContext';
        
const Profile = () => {
	const { userId } = useParams();
	const {user} = useContext(UserContext);
	const [currentUser, setCurrentUser] = useState(null);
	const { token } = useContext(AuthContext);

	const fetchData = async () => {
		try {
			const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/${userId}`);
			setCurrentUser(response.data);
		} catch (error) {
			displayAlert('error', error.response?.data?.message || 'Error fetching user data');
		}
	};

	const sendViewNotification = async () => {
		try {
			await axios.post(`${import.meta.env.VITE_API_URL}/seen/${userId}`, {}, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
		} catch (error) {
			console.error('Error sending profile view notification:', error);
		}
	}

	useEffect(() => {
		const syncFunction = async () => {
			await fetchData();
			if (user && userId != user?.id) {
				await sendViewNotification();
			}
		};
		syncFunction();
	}, [userId, user]);

	return (
		<div className='profile-container'>
			<ProfilePicture userId={userId} userInfo={currentUser} />
			<ProfileInfo userId={userId} userInfo={currentUser} />
		</div>
	);
}

export default Profile;