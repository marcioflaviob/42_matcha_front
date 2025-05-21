import './NotificationButton.css';
import { Badge } from 'primereact/badge';
import { OverlayPanel } from 'primereact/overlaypanel';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { SocketContext } from '../../context/SocketContext';
import { clearNotifications, displayAlert, displayCall, displayNotification } from '../../components/Notification/Notification';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import axios from 'axios';
import { Button } from 'primereact/button';

const NotificationButton = ({setShowMap, setShowDateId, setDateBool, updatedNotifications, setUpdatedNotifications, allUnansweredDates, setAllUnansweredDates}) => {
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

	const fetchUnansweredDates = async () => {
		try {
			const response = await axios.get(`${import.meta.env.VITE_API_URL}/dates/unanswered`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			const allUnanswered = response.data;
			setAllUnansweredDates(allUnanswered);
			if (notifications && Array.isArray(notifications)) {
				let dateIndex = 0;
				const newNotifs = notifications.map((notif) => {
					if (notif.type === "new-date" && dateIndex < allUnanswered.length) {
						const updatedNotif = { ...notif, dateId: allUnanswered[dateIndex].id };
						dateIndex++;
						return updatedNotif;
					}
					return notif;
				});
				setUpdatedNotifications(newNotifs);
			}
		} catch (error) {
			console.error('Error fetching unanswered dates');
			displayAlert('error', 'Error fetching unanswered dates');
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
				console.log(response.data);
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
			});
		}

		return () => {
			if (connected && channel) {
				channel.unbind('new-notification');
			}
		}
	}, [connected, channel]);

	useEffect(() => {
		fetchUnansweredDates();
	}, [notifications]);

	useEffect(() => {
		const refreshUnansweredDates = async (dateId) => {
			try {
				const response = await axios.post(`${import.meta.env.VITE_API_URL}/notifications/dates/unanswered/${dateId}`, {}, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});
				if (!response.data.notification)
				{
					await fetchUnansweredDates();
				}
				else
				{
					setUpdatedNotifications((prevNotifications) => {
						const index = prevNotifications.findIndex(n => n.dateId == response.data.notification.id);
						
						const updatedNotification = {
							...response.data.notification,
							dateId: response.data.date.id,
						};
	
						if (index !== -1) {
							const updated = [...prevNotifications];
							updated[index] = updatedNotification;
							return updated;
						} else {
							return [...prevNotifications, updatedNotification];
						}
					});
				}
			} catch (error) {
				console.error('Error fetching unanswered dates');
				displayAlert('error', 'Error fetching unanswered dates');
			}
		}
		const fetchAll = async () => {
			allUnansweredDates.forEach(date => refreshUnansweredDates(date.id));
		};
		console.log("all ", allUnansweredDates);
		if (!(updatedNotifications?.length > 0))
			fetchAll();
	}, [updatedNotifications]);

	const handleShowDate = async (dateId) => {
		setShowDateId(dateId);
		setShowMap(true);
		setDateBool(true);
		overlayPanelRef.current.hide();
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
                    {updatedNotifications?.length > 0 ? (
                        <ul>
                            {updatedNotifications.map(notification => (
                                <li 
                                    key={notification.id} 
                                    className={'read'}
                                    onClick={() => redirectUser(notification)}>
                                    <div className="notification-title">{notification.title}</div>
                                    <div className="notification-message">{notification.message}</div>
									{notification?.type == "new-date" && (
										<div style={{ display: 'flex', marginTop: '1rem' }}>
											<Button 
												label="Show date" 
												icon="pi pi-check" 
												className="p-button-success"
												onClick={() => {handleShowDate(notification.dateId)}} 
												size="small"
											/>
										</div>
									)}
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