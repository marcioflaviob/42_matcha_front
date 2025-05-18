import React, { useEffect, useRef } from 'react';
import './CallDialog.css';
import { displayAlert } from '../../Notification/Notification';

const WebcamVideo = ({ stream, name }) => {
    const localVideoRef = useRef(null);

    useEffect(() => {
        if (!localVideoRef.current || !stream) return;
        
        localVideoRef.current.srcObject = stream;
        let playPromise;
        
        try {
            playPromise = localVideoRef.current.play();
        } catch (err) {
            displayAlert('error', 'Error playing video, try refreshing the page');
            console.error('Exception during play():', err);
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
        <div className="video-container preview">
            <div className="video-wrapper local">
                <video 
                    ref={localVideoRef} 
                    autoPlay 
                    playsInline
                    className="local-video"
                />
                <div className="video-label">{name}</div>
            </div>
        </div>
    );
};

export default WebcamVideo;