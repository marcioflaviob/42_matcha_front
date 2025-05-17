import React from 'react';
import './CallDialog.css'

const AwaitingAcceptance = ({ selectedUser, localVideoRef, handleHangUp }) => {
    return (
        <div className="call-dialog">
            <h2>Calling {selectedUser.first_name}...</h2>
            <div className="video-container">
                <div className="video-wrapper local">
                    <video 
                        ref={localVideoRef} 
                        autoPlay 
                        muted 
                        playsInline
                        className="local-video" 
                    />
                    <div className="video-label">You</div>
                </div>
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