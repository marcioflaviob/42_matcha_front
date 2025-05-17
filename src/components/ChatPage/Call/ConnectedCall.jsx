import React from 'react';

const ConnectedCall = ({ selectedUser, remoteVideoRef, localVideoRef, connectionEstablished, handleHangUp }) => {
    return (
        <div className="call-dialog">
            <h2>Video Call with {selectedUser.first_name}</h2>
            <div className="video-container">
                <div className="video-wrapper remote">
                    <video 
                        ref={remoteVideoRef} 
                        autoPlay 
                        playsInline
                        className="remote-video" 
                    />
                    <div className="video-label">
                        {connectionEstablished ? selectedUser.first_name : 'Connecting...'}
                    </div>
                </div>
                <div className="video-wrapper local">
                    <video 
                        ref={localVideoRef} 
                        autoPlay 
                        muted 
                        playsInline
                        className="local-video small" 
                    />
                    <div className="video-label">You</div>
                </div>
            </div>
            <div className="call-buttons">
                <button className="hangup-button" onClick={handleHangUp}>
                    Hang Up
                </button>
            </div>
        </div>
    );
};

export default ConnectedCall;