import './NotificationButton.css';
import { Badge } from 'primereact/badge';
import { OverlayPanel } from 'primereact/overlaypanel';
import React, { useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { SocketContext } from '../../context/SocketContext';
import { clearNotifications, displayAlert, displayCall, displayNotification } from '../../components/Notification/Notification';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import axios from 'axios';
import useFavicon from '../../../utils/useFavicon';

const NotificationButton = () => {
    const { channel, connected } = useContext(SocketContext);
    const { potentialMatches, setPotentialMatches, setMatches, matches, notifications, setNotifications } = useContext(UserContext);
    const { token } = useContext(AuthContext);
    const navigate = useNavigate();
    const overlayPanelRef = useRef(null);
    const unseenNotifications = () => notifications?.filter(notification => !notification.seen).length || null;
	const faviconUrl = unseenNotifications() ? '/favicon_notification.png' : '/favicon.png';
    useFavicon(faviconUrl);

	const redirectUser = async (notification) => {
		overlayPanelRef.current.hide();
		if (notification.type == 'new-message') navigate('/chat?id=' + notification.concerned_user_id);
		if (notification.type == 'new-match') navigate('/chat?id=' + notification.concerned_user_id);
		if (notification.type == 'new-date') navigate('/chat?id=' + notification.concerned_user_id);
		if (notification.type == 'new-like') {
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
						axios.get(`${import.meta.env.VITE_API_URL}/users/${notification.concerned_user_id}`, {
							headers: {
								Authorization: `Bearer ${token}`,
							},
						}).then((response) => {
							response.data.liked_me = true;
							setPotentialMatches([response.data, ...prevMatches]);
						}).catch((error) => {
							displayAlert('error', error.response?.data?.message || 'Error fetching user data');
						});
					}
					setNotifications((prevNotifications) =>
						prevNotifications.filter((n) => n.id !== notification.id)
					);
					navigate('/');
				} catch (error) {
					displayAlert('error', error.response?.data?.message || 'Error updating potential matches');
				}
			};
			
			updatePotentialMatches();
			setNotifications((prevNotifications) =>
				prevNotifications.filter((n) => n.id !== notification.id)
			);
		}
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
			displayAlert('error', error.response?.data?.message || 'Error marking notifications as seen');
		}
	};

	useEffect(() => {
		if (connected && channel) {
			channel.bind('new-notification', (data) => {
                if (data.type == 'new-call') {
					displayCall(data);
				} else if (data.type == 'stop-call') {
					clearNotifications();
				} else {
					setNotifications((prevNotifications) => {
						return [...prevNotifications, data];
					});
					displayNotification('info', data.title, data.message);
				}

				if (data.type == 'new-match') addUserToMatches(data.body);
				if (data.type == 'new-like') addLikedYouTag(data.concerned_user_id);
			});
		}

		return () => {
			if (connected && channel) {
				channel.unbind('new-notification');
			}
		}
	}, [connected, channel, potentialMatches, matches]);

	const addUserToMatches = (user) => {
		setMatches((prevMatches) => {
			const matchesArr = prevMatches || [];
			const existingIndex = matchesArr.findIndex((match) => match.id === user.id);
			if (existingIndex !== -1) {
				return matchesArr;
			}
			return [user, ...matchesArr];
		});
	}

	const addLikedYouTag = (id) => {
		if (!potentialMatches) return;
		setPotentialMatches((prevMatches) => {
			const existingIndex = prevMatches.findIndex((match) => match.id == id);
			if (existingIndex !== -1) {
				const updatedMatches = [...prevMatches];
				const existingMatch = updatedMatches[existingIndex];
				existingMatch.liked_me = true;
				updatedMatches.splice(existingIndex, 1);
				return [existingMatch, ...updatedMatches];
			}
			else
				return prevMatches;
		});
	}

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
                                    key={notification.id + '-' + notification.type} 
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