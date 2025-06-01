import React from 'react';
import WebcamVideo from './WebcamVideo';
import CallControls from './CallControls';

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
                <WebcamVideo stream={remoteStream} name={selectedUser.first_name} mute={false} />
                <WebcamVideo stream={localStream} name={"You"} mute={true} />
            </div>
            <CallControls
                showCallButton={false}
                onHangUp={handleHangUp}
                stream={localStream}
            />
        </div>
    );
};

export default ConnectedCall;