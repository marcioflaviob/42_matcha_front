import './NotificationButton.css';
import { Badge } from 'primereact/badge';
import { OverlayPanel } from 'primereact/overlaypanel';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { SocketContext } from '../../context/SocketContext';
import { displayAlert, displayNotification } from '../../components/Notification/Notification';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import axios from 'axios';

const NotificationButton = () => {
    const { channel, connected } = useContext(SocketContext);
    const { user, potentialMatches, setPotentialMatches } = useContext(UserContext);
    const [notifications, setNotifications] = useState(null);
    const { token } = useContext(AuthContext);
    const navigate = useNavigate();
    const overlayPanelRef = useRef(null);

    const unseenNotifications = () => notifications?.filter(notification => !notification.seen).length || null;

	const redirectUser = async (notification) => {
		if (notification.type == 'new-message') navigate('/chat?id=' + notification.concerned_user_id);
		if (notification.type == 'new-match') navigate('/chat?id=' + notification.concerned_user_id);
		if (notification.type == 'new-like')
		{
			const updatePotentialMatches = async () => {
				try {
					const prevMatches = potentialMatches || [];
					const existingIndex = prevMatches.findIndex(
						(match) => match.id === notification.concerned_user_id
					);

					if (existingIndex !== -1) {
						const updatedMatches = [...prevMatches];
						const existingMatch = updatedMatches[existingIndex];
						updatedMatches.splice(existingIndex, 1);
						setPotentialMatches([existingMatch, ...updatedMatches]);
					} else {
						const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/${notification.concerned_user_id}`, {}, {
							headers: {
								Authorization: `Bearer ${token}`,
							},
						});
						setPotentialMatches([response.data, ...prevMatches]);
					}
				} catch (error) {
					displayAlert('error', 'Error fetching user data');
					console.error('Error fetching user data:', error);
				}
			};
			
			updatePotentialMatches();
			setNotifications((prevNotifications) =>
				prevNotifications.filter((n) => n.id !== notification.id)
			);
		}
		if (notification.type == 'new-block') navigate('/');
		if (notification.type == 'new-profile-view') navigate('/profile/' + notification.user_id);
	}


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
    );
};

export default NotificationButton;