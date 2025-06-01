import React, { useContext } from 'react';
import './CallDialog.css';
import './AwaitingCall.css';
import { displayAlert } from '../../Notification/Notification';
import axios from 'axios';
import { AuthContext } from '../../../context/AuthContext';
import WebcamVideo from './WebcamVideo';
import CallControls from './CallControls';

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
                }).catch((error) => {
                    console.error('Error making call:', error);
                    displayAlert('error', 'Error making call');
                });
            }
            setCallStarted(true);
        }
    };

    return (
        <div className="call-dialog-awaiting">
            <h2>Call {selectedUser.first_name}?</h2>

            <WebcamVideo stream={stream} name={"You"} mute={true} />

            <CallControls
                showCallButton={true}
                callButtonText={isInvited ? 'Join' : 'Call'}
                onCall={handleCallClick}
                onHangUp={handleHangUp}
                stream={stream}
            />
        </div>
    );
};

export default AwaitingCall;