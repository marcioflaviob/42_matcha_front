import React from 'react';
import Header from './base/Header'
import Footer from './base/Footer'
import { Outlet } from 'react-router-dom';

const Layout = () => {
	return (
		<>
			<Header />
			<Outlet />
			<Footer />
		</>
	);
};

export default Layout;