import React, { useContext, useEffect, useState } from 'react';
import './HomePage.css';
import axios from 'axios';
import { displayAlert } from '../../components/Notification/Notification';
import { AuthContext } from '../../context/AuthContext';
import ProfileCard from '../../components/HomePage/ProfileCard';
import GuestHomePage from './GuestHomePage';
import { UserContext } from '../../context/UserContext';
import sadCat from '/sad-cat.jpg';
import { Skeleton } from 'primereact/skeleton';
import SkeletonHomePage from './SkeletonHomePage';
        

const HomePage = () => {
	const { potentialMatches, setPotentialMatches } = useContext(UserContext);
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
        return (
            <SkeletonHomePage />
        );
    }

	const remainingMatches = potentialMatches.length - matchIndex;

	return (
		<div className='home-page-container'>
			{/* Page Header */}
			<div className="home-header">
				<h1 className="home-title">Discover</h1>
				{potentialMatches.length > matchIndex && (
					<div className="match-counter">
						{remainingMatches} potential {remainingMatches === 1 ? 'match' : 'matches'}
					</div>
				)}
			</div>

			{/* Main Content Area */}
			<div className="home-main-content">
				{potentialMatches.length > matchIndex ? (
					<>
						{/* Profile Card Container */}
						<div className="profile-card-container">
							<ProfileCard 
								profile={potentialMatches[matchIndex]} 
								handleLike={handleLike} 
								handleBlock={handleBlock} 
								showButtons={true} 
							/>
						</div>

						{/* Tips Sidebar */}
						<div className='home-sidebar-modern'>
							<div className='quick-stats'>
								<div className='stat-item'>
									<span className='stat-number'>{remainingMatches}</span>
									<span className='stat-label'>Potential Matches</span>
								</div>
							</div>
							
							<div className='quick-tips'>
								<h4>
									<i className="pi pi-lightbulb" />
									{' '}Tips for Better Matches
								</h4>
								<div className='tip-item'>
									<i className="pi pi-camera" />
									<span>Upload high-quality photos</span>
								</div>
								<div className='tip-item'>
									<i className="pi pi-pencil" />
									<span>Write an engaging biography</span>
								</div>
								<div className='tip-item'>
									<i className="pi pi-heart" />
									<span>Add your interests and hobbies</span>
								</div>
								<div className='tip-item'>
									<i className="pi pi-map-marker" />
									<span>Keep your location updated</span>
								</div>
								<div className='tip-item'>
									<i className="pi pi-user" />
									<span>Be authentic and genuine</span>
								</div>
							</div>
						</div>
					</>
				) : (
					<div className='no-matches-modern'>
						<div className='no-matches-content'>
							<h2>No More Matches</h2>
							<div className="no-matches-icon">
								<img src={sadCat}
				alt="Sad Cat" style={{width:'300px'}} />
							</div>
							<p>You've seen all potential matches in your area. Check back later for new profiles!</p>
							
							<div className="no-matches-suggestions">
								<h3>Get More Matches</h3>
								<ul>
									<li>Update your profile photos</li>
									<li>Expand your distance preferences</li>
									<li>Add more interests to your profile</li>
									<li>Write a more detailed biography</li>
								</ul>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default HomePage;