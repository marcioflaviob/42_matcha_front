import React, { useContext, useEffect, useState } from 'react';
import UserList from '../../components/ChatPage/UserList';
import Conversation from '../../components/ChatPage/Conversation';
import './ChatPage.css';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import sadCat from '/sad-cat.jpg';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';

const ChatPage = () => {
	const { token } = useContext(AuthContext);
	const [searchParams] = useSearchParams();
    const [selectedUser, setSelectedUser] = useState(null);
	const navigate = useNavigate();
	const { matches, setMatches } = useContext(UserContext);
    const [isFetched, setIsFetched] = useState(false);

	const fetchMessages = async () => {
		setIsFetched(true);
		const usersWithMessages = matches?.map(async (user) => {
			const response = await axios.get(import.meta.env.VITE_API_URL + '/messages/' + user.id, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			return {
				...user,
				messages: response.data
			};
		});
		const usersWithMessagesResolved = await Promise.all(usersWithMessages);
		setMatches(usersWithMessagesResolved);
		setSelectedUser(usersWithMessagesResolved.find(user => user.id == selectedUser?.id || null));
	}

    useEffect(() => {
		if (matches && !isFetched)
			fetchMessages();
    }, [matches]);


	useEffect(() => {
		if (matches && matches.length > 0) {
			const userIdFromUrl = searchParams.get('id');
			if (userIdFromUrl) {
				const user = matches.find(user => user.id == userIdFromUrl);
				if (user && user.id != selectedUser?.id) setSelectedUser(user);
			} else {
				setSelectedUser(null);
				navigate('/chat');
			}
		}
	}, [searchParams, matches]);

	if (matches && matches.length == 0) {
		return (
			<div className="chat-page no-matches">
				<img src={sadCat}
					alt="Sad Cat" style={{width:'300px'}} />
				<h2>You have no one to talk to</h2>
				<p>Try to find a match scrolling on our home page</p>
			</div>
		);
	}

    return (
        <div className="chat-page">
            <UserList 
				selectedUser={selectedUser}
				setSelectedUser={setSelectedUser}
			/>
            <Conversation selectedUser={selectedUser} setSelectedUser={setSelectedUser}/>
        </div>
    );
};

export default ChatPage;