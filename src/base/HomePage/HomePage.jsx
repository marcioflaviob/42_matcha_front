import React, { useContext, useEffect, useState } from 'react';
import './HomePage.css';
import axios from 'axios';
import { displayAlert } from '../../components/Notification/Notification';
import { AuthContext } from '../../context/AuthContext';
import ProfileCard from '../../components/HomePage/ProfileCard';
import GuestHomePage from './GuestHomePage';

const HomePage = () => {
	const [potentialMatches, setPotentialMatches] = useState(null);
	const { token } = useContext(AuthContext);
	const [matchIndex, setMatchIndex] = useState(0);
	const { isAuthenticated, isLoading } = useContext(AuthContext);
	
	useEffect(() => {
		if (isAuthenticated && !isLoading) {
			fetchPotentialMatches();
		}
	}, [isAuthenticated, isLoading]);
	
	const fetchPotentialMatches = async () => {
		try {
			const response = await axios.get(`${import.meta.env.VITE_API_URL}/matches/potential`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			setPotentialMatches(response.data);
			if (response.data.length == 0) {
				displayAlert('warn', 'No potential matches found');
				return;
			}
		} catch (err) {
			console.error('Error fetching pictures:', err);
		}
	};

	const handleLike = async () => {
		try {
			await axios.post(`${import.meta.env.VITE_API_URL}/like/${potentialMatches[matchIndex].id}`, {}, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			setMatchIndex((prevIndex) => prevIndex + 1);
		} catch (err) {
			console.error('Error liking match:', err);
		}
	}
	
	const handleBlock = async () => {
		try {
			await axios.post(`${import.meta.env.VITE_API_URL}/block/${potentialMatches[matchIndex].id}`, {}, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			setMatchIndex((prevIndex) => prevIndex + 1);
		} catch (err) {
			console.error('Error liking match:', err);
		}
	}
	
	if (!isAuthenticated || isLoading) {
		return <GuestHomePage />;
	}
	
	if (!potentialMatches) {
		return <div className='home-page-container'>Loading...</div>;
	}

	return (
		<div className='home-page-container'>
			{potentialMatches.length > matchIndex ?
				<ProfileCard profile={potentialMatches[matchIndex]} handleLike={handleLike} handleBlock={handleBlock} showLike={true} showBlock={true}/> :
				<div className='no-matches'>
					<img src={import.meta.env.VITE_BLOB_URL + '/' + 'sad_cat-wXhqHEgDRcBPGjsOb5copxfaDG1wrr.jpg'}
						alt="Sad Cat" style={{width:'300px'}} />
					<h2>No potential matches</h2>
					<p>Try modifying your profile to reach more people</p>
				</div>
			}
		</div>
	);
};

export default HomePage;