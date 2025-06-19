import React, { forwardRef, useEffect, useRef } from 'react';
import './Notification.css';
import { Toast } from 'primereact/toast';
import { getContent } from './CallActions';
let notificationInstance = null;

// Severity options: success, info, warn, error

export const clearNotifications = () => {
	notificationInstance.clear();
}

export const displayAlert = (severity, message) => {
	notificationInstance.show({ severity, summary: message, life: 3000 });
}

export const displayNotification = (severity, title, message) => {
	notificationInstance.show({ severity, summary: title, detail: message, life: 10000 });
}

export const displayCall = (data) => {
    const content = getContent(data);

    notificationInstance.show({ 
        severity: 'info', 
        summary: 'Incoming Call', 
        detail: content, 
        life: 100000, 
        closable: false,
        sticky: true,
        className: 'call-toast'
    });
}

const Notification = forwardRef (( props, ref ) => {
	const notificationRef = useRef(null);

    useEffect(() => {
        if (ref) {
            ref.current = notificationRef.current;
            notificationInstance = notificationRef.current;
        }
    }, [ref]);

	useEffect(() => {
		const handleScroll = () => {
			const toastContainer = document.querySelector('.p-toast');
			if (toastContainer) {
				toastContainer.style.marginTop = window.scrollY > 50 ? '10px' : '60px';
			}
		};

		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, [])

	return <Toast ref={notificationRef} />;
});

export default Notification;