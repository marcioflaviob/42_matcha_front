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
        } catch {
            displayAlert('error', 'Error playing video, try refreshing the page');
        }

        return () => {
            if (playPromise !== undefined && typeof playPromise.then === 'function') {
                playPromise.then(() => {
                    if (localVideoRef.current && localVideoRef.current.srcObject) {
                        const tracks = localVideoRef.current.srcObject.getTracks();
                        tracks.forEach(track => track.stop());
                        localVideoRef.current.srcObject = null;
                    }
                });
            } else {
                if (localVideoRef.current && localVideoRef.current.srcObject) {
                    const tracks = localVideoRef.current.srcObject.getTracks();
                    tracks.forEach(track => track.stop());
                    localVideoRef.current.srcObject = null;
                }
            }
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