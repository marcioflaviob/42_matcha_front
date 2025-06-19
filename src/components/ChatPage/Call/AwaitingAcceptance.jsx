import React from 'react';
import './CallDialog.css'
import WebcamVideo from './WebcamVideo';
import CallControls from './CallControls';

const AwaitingAcceptance = ({ selectedUser, stream, handleHangUp }) => {

    return (
        <div className="call-dialog">
            <h2>Calling {selectedUser.first_name}...</h2>
            <div className="video-container">
                <WebcamVideo stream={stream} name={"You"} mute={true} />
                <div className="waiting-overlay">
                    <div className="calling-status">Waiting for {selectedUser.first_name} to answer...</div>
                </div>
            </div>
            <CallControls
                showCallButton={false}
                onHangUp={handleHangUp}
                stream={stream}
            />
        </div>
    );
};

export default AwaitingAcceptance;