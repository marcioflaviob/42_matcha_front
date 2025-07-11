import React, { useState } from 'react';
import { Button } from 'primereact/button';
import './CallDialog.css';

const CallControls = ({ 
    showCallButton = false, 
    callButtonText = 'Call', 
    onCall, 
    onHangUp, 
    stream,
    buttonDisabled = false
}) => {
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);
    const [hangUpButtonDisabled, setHangUpButtonDisabled] = useState(false);

    const handleMuteToggle = () => {
        if (stream) {
            const audioTracks = stream.getAudioTracks();
            audioTracks.forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsMuted(!isMuted);
        }
    };

    const handleCameraToggle = () => {
        if (stream) {
            const videoTracks = stream.getVideoTracks();
            videoTracks.forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsCameraOff(!isCameraOff);
        }
    };

    return (
        <div className="call-controls">
            {showCallButton && (
                <Button
                    label={callButtonText}
                    icon="pi pi-phone"
                    className="call-action-button"
                    onClick={onCall}
                    disabled={buttonDisabled}
                    rounded
                />
            )}
            
            <Button
                icon={"pi pi-microphone"}
                className={`control-button ${isMuted ? 'control-muted' : ''}`}
                onClick={handleMuteToggle}
                tooltip={isMuted ? 'Unmute microphone' : 'Mute microphone'}
                tooltipOptions={{ position: 'top' }}
                rounded
            />
            
            <Button
                icon={"pi pi-video"}
                className={`control-button ${isCameraOff ? 'control-camera-off' : ''}`}
                onClick={handleCameraToggle}
                tooltip={isCameraOff ? 'Turn camera on' : 'Turn camera off'}
                tooltipOptions={{ position: 'top' }}
                rounded
            />
            
            <Button
                label="Hang Up"
                className="hangup-button"
                onClick={() => {
                    setHangUpButtonDisabled(true);
                    onHangUp();
                }}
                disabled={hangUpButtonDisabled}
                rounded
            />
        </div>
    );
};

export default CallControls;