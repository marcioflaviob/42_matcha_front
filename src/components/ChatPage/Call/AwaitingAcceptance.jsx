import React from 'react';
import './CallDialog.css'
import WebcamVideo from './WebcamVideo';

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
            <div className="call-buttons">
                <button className="hangup-button" onClick={handleHangUp}>
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default AwaitingAcceptance;