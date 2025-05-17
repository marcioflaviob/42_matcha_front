import React, { useRef, useState } from 'react';
import Header from './base/Header'
import Footer from './base/Footer'
import { Outlet } from 'react-router-dom';
import Notification from './components/Notification/Notification';

const Layout = () => {
	const notificationRef = useRef(null);
	const [potentialMatches, setPotentialMatches] = useState(null);

	return (
		<>
			<Notification ref={notificationRef} />
			<Header potentialMatches={potentialMatches} setPotentialMatches={setPotentialMatches} />
     		<main>
        		<Outlet context={{ potentialMatches, setPotentialMatches }} />
      		</main>
			<Footer />
		</>
	);
};

export default Layout;