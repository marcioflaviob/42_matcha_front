import React, { useEffect } from 'react';
import './AwaitingPermissions.css';
import { displayAlert } from '../../Notification/Notification';

const AwaitingPermissions = ({ setStream, setPermissionGranted }) => {

    useEffect(() => {
        if (!navigator || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            displayAlert('error', 'Your browser does not support camera or microphone access.');
            return;
        }
        navigator.mediaDevices
            .getUserMedia({ 
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: "user"
                }, 
                audio: true 
            })
            .then((mediaStream) => {
                setStream(mediaStream);
                setPermissionGranted(true);
            })
            .catch((err) => {
                console.error('Media access error:', err);
                displayAlert('error', 'Unable to access camera or microphone. Please grant permissions.');
            });
    }, [setStream, setPermissionGranted]);

    return (
        <div className="permission-prompt">
            <div className="permission-message">
                <i className="pi pi-video permission-icon" />
                <h3>Camera and Microphone Access Required</h3>
                <p>Please accept the browser permission requests to enable video calling.</p>
            </div>
        </div>
    );
};

export default AwaitingPermissions;