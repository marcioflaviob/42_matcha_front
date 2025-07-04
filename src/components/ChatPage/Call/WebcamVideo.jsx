import React, { useEffect, useRef } from 'react';
import './CallDialog.css';
import { displayAlert } from '../../Notification/Notification';

const WebcamVideo = ({ stream, name, mute }) => {
    const localVideoRef = useRef(null);

    useEffect(() => {
        if (!localVideoRef.current || !stream) return;
        
        localVideoRef.current.srcObject = stream;
        let playPromise;
        
        try {
            playPromise = localVideoRef.current.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                }).catch(error => {
                    console.error('Error playing video:', error);
                    displayAlert('error', 'Error playing video, try refreshing the page');
                });
            }
        } catch {
            displayAlert('error', 'Error playing video, try refreshing the page');
        }
    }, [stream]);

    return (
        <div className="video-wrapper">
            <video 
                ref={localVideoRef} 
                autoPlay
                muted={mute}
                playsInline
                className={mute ? "local-video" : "remote-video"}
            />
            <div className="video-label">{name}</div>
        </div>
    );
};

export default WebcamVideo;