import React, { useRef } from 'react';
import Header from './base/Header'
import Footer from './base/Footer'
import { Outlet } from 'react-router-dom';
import Notification from './components/Notification/Notification';

const Layout = () => {
	const notificationRef = useRef(null);

	return (
		<>
			<Notification ref={notificationRef} />
			<Header />
			<Outlet />
			<Footer />
		</>
	);
};

export default Layout;