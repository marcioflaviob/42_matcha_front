import React, { useContext, useEffect, useRef, useState } from 'react';
import './Header.css';
import PropTypes from 'prop-types';
import { UserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import logoMatcha from '/logo_matcha.png';
import { Badge } from 'primereact/badge';
import { Button } from 'primereact/button';
import { OverlayPanel } from 'primereact/overlaypanel';
import axios from 'axios';
import { displayAlert, displayNotification } from '../components/Notification/Notification';
import { SocketContext } from '../context/SocketContext';

const Header = ({ potentialMatches, setPotentialMatches }) => {
	const { user } = useContext(UserContext);
	const { token } = useContext(AuthContext);
	const { logout } = useContext(AuthContext);
	const { channel, connected } = useContext(SocketContext);
	const profilePicture = user?.pictures?.find(picture => picture.is_profile);
	const navigate = useNavigate();
	const overlayPanelRef = useRef(null);
	const [notifications, setNotifications] = useState(null);

	const unseenNotifications = () => notifications?.filter(notification => !notification.seen).length || null;

	const redirectUser = async (notification) => {
		if (notification.type == 'new-message') navigate('/chat');
		if (notification.type == 'new-match') navigate('/chat');
		if (notification.type == 'new-like')
		{
			try {
				const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/${notification.concerned_user_id}`, {}, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});
				setPotentialMatches((prevMatches) => {
					const existingIndex = prevMatches?.findIndex(
						(match) => match.id === response.data.id
					);

					if (existingIndex !== -1) {
						const updatedMatches = [...prevMatches];
						updatedMatches.splice(existingIndex, 1);
						return [response.data, ...updatedMatches];
					} else {
						return [response.data, ...(prevMatches || [])];
					}
				});
				setNotifications((prevNotifications) =>
					prevNotifications.filter((n) => n.id !== notification.id)
				);
			}
			catch (error) {
				displayAlert('error', 'Error liking match');
				console.error('Error liking match:', error);
			}
		}
		if (notification.type == 'new-block') navigate('/');
		if (notification.type == 'new-profile-view') navigate('/profile/' + notification.user_id);
	}

	const handleLogout = async () => {
		logout();
		navigate('/');
	};

	const toggleNotifications = async (e) => {
		overlayPanelRef.current.toggle(e);

		if (!unseenNotifications()) return;

		setNotifications(notifications.map(notification => ({ ...notification, seen: true })));


		try {
			await axios.patch(`${import.meta.env.VITE_API_URL}/notifications/`, {}, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
		} catch (error) {
			console.error('Error marking notifications as read:', error);
			displayAlert('error', 'Error marking notifications as read');
		}
	};

	useEffect(() => {
		const fetchNotifications = async () => {
			try {
				const response = await axios.get(`${import.meta.env.VITE_API_URL}/notifications`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});
				setNotifications(response.data);
			} catch (error) {
				console.error('Error fetching notifications:', error);
				displayAlert('error', 'Error fetching notifications');
			}
		};

		if (user) {
			fetchNotifications();
		}
	}, [user]);

	useEffect(() => {
		if (connected && channel) {
			channel.bind('new-notification', (data) => {
				setNotifications((prevNotifications) => {
					return [...prevNotifications, data];
				});
				displayNotification('info', data.title, data.message);
			});
		}


		return () => {
			if (connected && channel) {
				channel.unbind('new-notification');
			}
		}
	}, [connected, channel]);

	return (
		<div className="header">
			<div className="header-left">
				<img 
					src={logoMatcha} 
					alt="Matcha Logo" 
					className="logo" 
					onClick={() => navigate('/')} />
			</div>
			<div className="header-right">
				{user ? (
					<div className="user-nav">
						<Button className='nav-button chat-button' label='Chat' onClick={() => navigate('/chat')} />
						
						<div className="notification-container">
							<i className="pi pi-bell p-overlay-badge nav-button notification-button" onClick={toggleNotifications}>
								{ unseenNotifications() > 0 &&
									<Badge size='normal' value={unseenNotifications()} className='notification-badge' />
								}
							</i>
							
							<OverlayPanel className='notification-dropdown' ref={overlayPanelRef}>
									<h3>Notifications</h3>
									{notifications?.length > 0 ? (
										<ul>
											{notifications.map(notification => (
												<li 
													key={notification.id} 
													className={'read'}
													onClick={() => redirectUser(notification)}>
													<div className="notification-title">{notification.title}</div>
													<div className="notification-message">{notification.message}</div>
												</li>
											))}
										</ul>
									) : (
										<p>No notifications</p>
									)}
							</OverlayPanel>
						</div>
						
						<div className="user-profile">
							<div 
								className="user-avatar"
								onClick={() => navigate('/profile/' + user.id)}>
								{profilePicture ? (
									<img 
										src={import.meta.env.VITE_BLOB_URL + '/' + profilePicture.url} 
										alt={`${user.first_name}'s avatar`}/>
								) : (
									<div className="avatar-placeholder">
										{user?.first_name?.charAt(0)}
									</div>
								)}
							</div>
							<div className="user-dropdown">
								<span className="user-name">Hi, {user.first_name}</span>
								<button 
									className="logout-button"
									onClick={handleLogout}>
									Log out
								</button>
							</div>
						</div>
					</div>
				) : (
					<Button className='login-button' onClick={() => navigate('/login')} label='Login' />
				)}
			</div>
		</div>
	);
};

Header.propTypes = {
    potentialMatches: PropTypes.arrayOf(PropTypes.object), // Array of objects
    setPotentialMatches: PropTypes.func.isRequired, // Function
};

export default Header;
