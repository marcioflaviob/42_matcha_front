import React, { useContext, useEffect, useState } from 'react';
import UserList from '../../components/ChatPage/UserList';
import Conversation from '../../components/ChatPage/Conversation';
import './ChatPage.css';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { displayAlert } from '../../components/Notification/Notification';

const ChatPage = () => {
	const { token } = useContext(AuthContext);
    const [selectedUser, setSelectedUser] = useState(null);
	const [searchParams] = useSearchParams();
	const [users, setUsers] = useState(null);

	const fetchUsers = async () => {
		const response = await axios.get(import.meta.env.VITE_API_URL + '/matches', {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		fetchMessages(response.data);
		setUsers(response.data);
		const chatUserId = searchParams.get('id');
		if (chatUserId) {
			const user = response.data.find(user => user.id == chatUserId);
			if (user) {
				setSelectedUser(user);
			} else {
				displayAlert('warn', 'User not found');
			}
		}
	};

	const fetchMessages = async (usersData) => {
		const usersWithMessages = usersData?.map(async (user) => {
			const response = await axios.get(import.meta.env.VITE_API_URL + '/messages/' + user.id, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			user.messages = response.data;
			return user;
		});
		const usersWithMessagesResolved = await Promise.all(usersWithMessages);
		setUsers(usersWithMessagesResolved);
	}

	useEffect(() => {
		const chatUserId = searchParams.get('id');
		if (chatUserId && users) {
			const user = users.find(user => user.id == chatUserId);
			if (user) {
				setSelectedUser(user);
			} else {
				displayAlert('warn', 'User not found');
			}
		}
	}, [searchParams, users]);

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
		users && users.length > 0 ? 
        <div className="chat-page">
            <UserList users={users} selectedUser={selectedUser} setSelectedUser={setSelectedUser} setUsers={setUsers} />
            <Conversation selectedUser={selectedUser} setSelectedUser={setSelectedUser} setUsers={setUsers} />
        </div>
		:
		<div className="chat-page no-matches">
			<img src={import.meta.env.VITE_BLOB_URL + '/' + 'sad_cat-wXhqHEgDRcBPGjsOb5copxfaDG1wrr.jpg'}
				alt="Sad Cat" style={{width:'300px'}} />
			<h2>You have no one to talk to</h2>
			<p>Try to find a match scrolling on our home page</p>
		</div>
    );
};

export default ChatPage;