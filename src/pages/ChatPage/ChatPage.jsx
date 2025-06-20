import React, { useContext, useEffect, useState } from 'react';
import UserList from '../../components/ChatPage/UserList';
import Conversation from '../../components/ChatPage/Conversation';
import './ChatPage.css';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const ChatPage = () => {
	const { token } = useContext(AuthContext);
    const [selectedUser, setSelectedUser] = useState(null);
	const [users, setUsers] = useState(null);

	const fetchUsers = async () => {
		const response = await axios.get(import.meta.env.VITE_API_URL + '/matches', {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		fetchMessages(response.data);
		setUsers(response.data);
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