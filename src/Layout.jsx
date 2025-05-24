import React, { useRef } from 'react';
import Header from './base/Header/Header'
import Footer from './base/Footer'
import { Outlet } from 'react-router-dom';
import Notification from './components/Notification/Notification';
import PopulatedMap from './components/Location/PopulatedMap/PopulatedMap';

const Layout = () => {
	const notificationRef = useRef(null);

	return (
		<>
			<Notification ref={notificationRef} />
			<PopulatedMap />
			<Header />
			<Outlet />
			<Footer />
		</>
	);
};

export default Layout;