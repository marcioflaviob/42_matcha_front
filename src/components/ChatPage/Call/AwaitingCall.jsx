import React, { useContext } from 'react';
import './CallDialog.css';
import { displayAlert } from '../../Notification/Notification';
import axios from 'axios';
import { AuthContext } from '../../../context/AuthContext';
import WebcamVideo from './WebcamVideo';

const AwaitingCall = ({ isInvited, selectedUser, stream, setCallStarted, channel, handleHangUp }) => {
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
            setCallStarted(true);
        }
    };

    return (
        <div className="call-dialog">
            <h2>Call {selectedUser.first_name}?</h2>

            <WebcamVideo stream={stream} name={"You"} />

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