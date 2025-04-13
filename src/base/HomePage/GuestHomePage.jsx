import React, { useContext, useEffect } from 'react';
import './GuestHomePage.css';
import { AuthContext } from '../../context/AuthContext';
import HomePage from './HomePage';

const GuestHomePage = () => {
	const { isAuthenticated, isLoading } = useContext(AuthContext);

	if (isAuthenticated || isLoading) {
		return <HomePage />;
	}

	return (
		<div className='guest-home-page-container'>
			<h1>You are not logged in</h1>
			<p>Please log in to get started!</p>
		</div>
	);
};

export default GuestHomePage;