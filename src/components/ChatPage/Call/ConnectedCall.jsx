import React from 'react';
import WebcamVideo from './WebcamVideo';

const ConnectedCall = ({ selectedUser, remoteStream, localStream, handleHangUp, connectionEstablished }) => {

    if(!connectionEstablished) {
        return (
            <h2>Connecting...</h2>
        );
    }

    return (
        <div className="call-dialog">
            <h2>Video Call with {selectedUser.first_name}</h2>
            <div className="video-container">
                <WebcamVideo stream={remoteStream} name={selectedUser.first_name} />
                <WebcamVideo stream={localStream} name={"You"} />
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