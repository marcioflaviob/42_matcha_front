import React, { useContext } from 'react';
import './CallDialog.css';
import { displayAlert } from '../../Notification/Notification';
import { UserContext } from '../../../context/UserContext';
import axios from 'axios';
import { AuthContext } from '../../../context/AuthContext';

const AwaitingCall = ({ isInvited, selectedUser, localVideoRef, setWaitingForAcceptance, setCallStarted, channel, handleHangUp }) => {
    const { token } = useContext(AuthContext);

    const handleCallClick = async () => {
        if (channel) {
            if (!isInvited) {
                await axios.post(`${import.meta.env.VITE_API_URL}/call/${selectedUser.id}`, {}, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    withCredentials: true,
                }).then(() => {
                    displayAlert('info', `Calling ${selectedUser.first_name}...`);
                }).catch((error) => {
                    console.error('Error making call:', error);
                    displayAlert('error', 'Error making call');
                });
            }
            setWaitingForAcceptance(true);
            setCallStarted(true);
        }
    };

    return (
        <div className="call-dialog">
            <h2>Call {selectedUser.first_name}?</h2>
            <div className="video-container preview">
                <div className="video-wrapper local">
                    <video 
                        ref={localVideoRef} 
                        autoPlay 
                        playsInline
                        muted
                        className="local-video"
                    />
                    <div className="video-label">You</div>
                </div>
            </div>
            <div className="call-buttons">
                <button className="call-button" onClick={handleCallClick}>
                    {isInvited ? 'Join' : 'Call'}
                </button>
                <button className="hangup-button" onClick={handleHangUp}>
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default AwaitingCall;