import React, { useContext, useEffect, useState } from 'react';
import './HomePage.css';
import axios from 'axios';
import { displayAlert } from '../../components/Notification/Notification';
import { AuthContext } from '../../context/AuthContext';
import ProfileCard from '../../components/HomePage/ProfileCard';


const HomePage = () => {
	const [potentialMatches, setPotentialMatches] = useState(null);
	const { token } = useContext(AuthContext);
	const [matchIndex, setMatchIndex] = useState(0);
	
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
			const response = await axios.post(`${import.meta.env.VITE_API_URL}/like/${potentialMatches[matchIndex].id}`, {}, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			if (response.data.interaction_type == 'match') {
				displayAlert('success', `You have matched with ${potentialMatches[matchIndex].first_name}!`);
			} else {
				displayAlert('success', `You have liked ${potentialMatches[matchIndex].first_name}!`);
			}
			setMatchIndex((prevIndex) => prevIndex + 1);
		} catch (err) {
			console.error('Error liking match:', err);
		}
	}

	const handleBlock = async () => {
		try {
			const response = await axios.post(`${import.meta.env.VITE_API_URL}/block/${potentialMatches[matchIndex].id}`, {}, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			setMatchIndex((prevIndex) => prevIndex + 1);
		} catch (err) {
			console.error('Error liking match:', err);
		}
	}

	
	useEffect(() => {
		fetchPotentialMatches();
	}, []);
	
	if (!potentialMatches) {
		return <div className='home-page-container'>Loading...</div>;
	}

	return (
		<div className='home-page-container'>
			{potentialMatches.length > matchIndex ?
				<ProfileCard profile={potentialMatches[matchIndex]} handleLike={handleLike} handleBlock={handleBlock} /> :
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