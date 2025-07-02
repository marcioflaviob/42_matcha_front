import React, { useContext, useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import './Conversation.css';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { displayAlert } from '../Notification/Notification';
import ConversationHeader from './ConversationHeader';
import { SocketContext } from '../../context/SocketContext';
import { UserContext } from '../../context/UserContext';
import { MapContext } from '../../context/MapContext';

const Conversation = ({ selectedUser, setSelectedUser }) => {
    const { token } = useContext(AuthContext);
    const [input, setInput] = useState('');
    const { setMapStatus, setFocusedDate, setFocusedUser } = useContext(MapContext);
    const { user, setMatches, matches } = useContext(UserContext);
    const { connected, channel } = useContext(SocketContext);
    const messageListRef = useRef(null);

    const scrollToBottom = () => {
        if (messageListRef.current) {
            messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
        }
    };

    const saveMessage = async (message, isSent) => {
        const receiverId = isSent ? message.receiver_id : message.sender_id;
        const updatedMatches = matches.map(user => {
            if (user.id == receiverId) {
                return {
                    ...user,
                    messages: [...user.messages, message],
                };
            }
            return user;
        });
        setMatches(updatedMatches);
        const updatedSelectedUser = updatedMatches.find(user => user.id === selectedUser.id);
        if (updatedSelectedUser && updatedSelectedUser !== selectedUser) {
            setSelectedUser(updatedSelectedUser);
        }
    }

    const sendMessage = async () => {
        const trimmedInput = input.trim();
        if (!trimmedInput) return;

        const optimisticMessage = {
            id: `temp-${Date.now()}`,
            content: trimmedInput,
            timestamp: new Date().toISOString(),
            sender_id: user.id,
            receiver_id: selectedUser.id,
            is_read: true,
            optimistic: true,
        };
        
        saveMessage(optimisticMessage, true);
        setInput('');

        try {
            const response = await axios.post(import.meta.env.VITE_API_URL + '/messages', {
                content: trimmedInput,
                timestamp: new Date(),
                receiver_id: selectedUser.id,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setMatches((prevMatches) =>
                prevMatches.map(u =>
                    u.id === selectedUser.id
                        ? {
                            ...u,
                            messages: u.messages.map(msg =>
                                msg.id === optimisticMessage.id ? response.data : msg
                            ),
                        }
                        : u
                )
            );

        } catch (error) {
            setMatches((prevMatches) =>
                prevMatches.map(u =>
                    u.id === selectedUser.id
                        ? {
                            ...u,
                            messages: u.messages.filter(msg => msg.id !== optimisticMessage.id),
                        }
                        : u
                )
            );
            displayAlert('error', error.response?.data?.message || 'Failed to send message');
        }
    };

    useEffect(() => {
        if (!user)
            return;
        const readMessages = async () => {
            if (selectedUser) {
                await axios.patch(import.meta.env.VITE_API_URL + '/messages/read/' + selectedUser.id, {}, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setMatches((prevUsers) => {
                    return prevUsers.map(user => {
                        if (user?.id === selectedUser.id) {
                            const updatedMessages = user?.messages?.map(msg => ({ ...msg, is_read: true }));
                            return { ...user, messages: updatedMessages };
                        }
                        return user;
                    });
                });
            }
        };
        readMessages();
    }, [selectedUser]);

    useEffect(() => {
        if (connected) {
            channel.bind('new-message', (message) => {
                if (message.sender_id == selectedUser?.id) {
                    message.is_read = true;
                }
                const isSent = message.date && message.sender_id == user.id;
                saveMessage(message, isSent);
            });
        }
        return () => {
            if (connected) {
                channel.unbind('new-message');
            }
        }
    }, [connected, channel, selectedUser]);

    const openMap = (date) => {
        setMapStatus("checking_date");
        setFocusedDate(date);
        setFocusedUser(selectedUser);
    }

    useEffect(() => {
        if (selectedUser && selectedUser.messages) {
            setTimeout(scrollToBottom, 0);
        }
    }, [selectedUser]);

    return (
        <div className="conversation">
            {selectedUser ? (
                <>
                    <ConversationHeader selectedUser={selectedUser} setSelectedUser={setSelectedUser} />

                    <div className="message-list" ref={messageListRef}>
                        <div className="message-list-content">
                            {selectedUser?.messages && selectedUser.messages.length > 0 ?
                                (selectedUser.messages.map((msg) => {
                                    if (msg.date) {
                                        return (
                                            <div key={msg.id} className={`message-date ${msg.sender_id === selectedUser.id ? 'received' : 'sent'} ${msg.date.status === "refused" ? "refused" : ""}`}>
                                                <div className={`message-date-title ${msg.date.status === "refused" ? "refused" : ""}`}>{(msg.date.status === 'refused' || !msg.date) ? "Date refused" : "Let's go on a date!"}</div>
                                                <div className={`message-date-info ${msg.date.status === "refused" ? "refused" : ""}`}>
                                                    {msg.date && `${msg.date.address} on ${new Date(msg.date.scheduled_date).toLocaleDateString()}`}
                                                </div>
                                                {!(msg.date?.status === 'refused' || !msg.date) && <Button text className="message-date-button" label="See details" onClick={() => openMap(msg.date)}></Button>}
                                            </div>
                                        )
                                    }
                                    return (
                                        <div key={msg.id} className={`message ${msg.sender_id === selectedUser.id ? 'received' : 'sent'}`}>
                                            <div className="message-content">{msg.content}</div>
                                            <div className="message-time">{new Intl.DateTimeFormat('en-US', { 
                                                    hour: '2-digit', 
                                                    minute: '2-digit', 
                                                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                                                }).format(new Date(msg.timestamp))}
                                            </div>
                                        </div> 
                                    )
                                }))
                                :
                                <div className="no-conversation">
                                    <div className="no-conversation-icon">
                                        <i className="pi pi-comments"></i>
                                    </div>
                                    <h3 className="no-conversation-title">Start the conversation!</h3>
                                    <p className="no-conversation-subtitle">
                                        Say hello to {selectedUser.first_name} and start building a connection.
                                    </p>
                                </div>
                            }
                        </div>
                    </div>

                    <div className="message-input">
                        <InputText 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    sendMessage();
                                }
                            }} 
                            placeholder={`Message ${selectedUser.first_name}...`}
                            maxLength={5000}
                        />
                        <Button 
                            icon="pi pi-send" 
                            onClick={sendMessage} 
                            disabled={!input.trim()}
                            aria-label="Send message"
                        />
                    </div>
                </>
            ) : (
                <div className="welcome-conversation">
                    <div className="no-conversation-icon">
                        <i className="pi pi-comment"></i>
                    </div>
                    <h3 className="no-conversation-title">Welcome to Chat</h3>
                    <p className="no-conversation-subtitle">
                        Select a conversation from the sidebar to start messaging.
                    </p>
                </div>
            )}
        </div>
    );
};

export default Conversation;