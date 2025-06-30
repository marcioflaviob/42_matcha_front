import React, { useContext, useEffect } from 'react';
import { Avatar } from 'primereact/avatar';
import './UserList.css';
import { Badge } from 'primereact/badge';
import { SocketContext } from '../../context/SocketContext';
import { Skeleton } from 'primereact/skeleton';

const UserList = ({ users, selectedUser, setSelectedUser, setUsers }) => {
    const { connected, channel } = useContext(SocketContext);

    useEffect(() => {
        if (connected) {
            channel.bind('status-change', (data) => {
                const updatedUsers = users.map(user => {
                    if (user.id == data.sender_id) {
                        return { ...user, online: data.status == 'online' };
                    }
                    return user;
                });
                setUsers(updatedUsers);
            });
        }
    }, [connected, channel]);

    if (!users) {
        return (
            <div className="user-list">
                <div className="user-list-header">
                    Conversations
                </div>
                <div className="user-list-content">
                    {[1, 2, 3].map(index => (
                        <div key={index} className="user-item">
                            <Skeleton shape="circle" size="3rem" />
                            <div className="user-list-info">
                                <div style={{ marginBottom: '0.5rem' }}>
                                    <Skeleton width="8rem" height="1rem" />
                                </div>
                                <Skeleton width="5rem" height="0.8rem" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="user-list">
            <div className="user-list-header">
                Conversations
            </div>
            <div className="user-list-content">
                {users.map(user => {
                    const profilePicture = user.pictures.find(picture => picture.is_profile)?.url || '';
                    const unreadMessagesCount = user.messages?.filter(msg => !msg.is_read && msg.sender_id == user.id).length || null;
                    
                    return (
                        <div
                            key={user.id}
                            className={`user-item ${selectedUser?.id === user.id ? 'selected' : ''}`}
                            onClick={() => setSelectedUser(user)}
                        >
                            <Avatar image={import.meta.env.VITE_BLOB_URL + '/' + profilePicture} shape="circle" size='large' />
                            <div className="user-list-info">
                                <span className="user-name">{user.first_name}</span>
                                <span className={`user-status ${user.online ? 'online' : 'offline'}`}>
                                    {user.online ? 'Online' : 'Offline'}
                                </span>
                            </div>
                            {unreadMessagesCount && (
                                <div className="user-notification-badge">
                                    <Badge severity='danger' value={unreadMessagesCount} />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default UserList;