import React, { useContext, useEffect } from 'react';
import './HomePage.css';
import axios from 'axios';
import { displayAlert } from '../../components/Notification/Notification';
import { AuthContext } from '../../context/AuthContext';
import ProfileCard from '../../components/HomePage/ProfileCard';
import GuestHomePage from './GuestHomePage';
import { UserContext } from '../../context/UserContext';
import sadCat from '/sad-cat.jpg';
import SkeletonHomePage from './SkeletonHomePage';
import { TIPS } from '../../components/HomePage/constants';
import TipItem from '../../components/HomePage/TipItem';
        

const HomePage = () => {
	const { potentialMatches, setPotentialMatches, setMatches, setNotifications } = useContext(UserContext);
	const { token } = useContext(AuthContext);
	const { isAuthenticated, isLoading } = useContext(AuthContext);
	
	useEffect(() => {
		if (isAuthenticated && !isLoading && !potentialMatches) {
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
			setPotentialMatches((prevMatches) => {
			    const existingMatches = prevMatches || [];
				const newUsers = response.data.filter(user => 
					!existingMatches.some(existingUser => existingUser.id === user.id)
				);
				return [...existingMatches, ...newUsers];
			});
		} catch (error) {
			displayAlert('error', error.response?.data?.message || 'Error fetching potential matches');
		}
	};

	const handleLike = async () => {
		try {
			await axios.post(`${import.meta.env.VITE_API_URL}/like/${potentialMatches[0].id}`, {}, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			const user = potentialMatches[0];
			if (user.liked_me) addUserToMatches(user);
			setPotentialMatches((prevMatches) =>
				prevMatches.filter((match) => match.id !== potentialMatches[0].id)
			);
			if (potentialMatches.length < 3) fetchPotentialMatches();
		} catch (error) {
			displayAlert('error', error.response?.data?.message || 'Error liking match');
		}
	}
	
	const handleBlock = async () => {
		try {
			await axios.post(`${import.meta.env.VITE_API_URL}/block/${potentialMatches[0].id}`, {}, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			setPotentialMatches((prevMatches) =>
				prevMatches.filter((match) => match.id !== potentialMatches[0].id)
			);
			if (remainingMatches < 4) fetchPotentialMatches();
			removeUserFromNotifications(potentialMatches[0].id);
		} catch (error) {
			displayAlert('error', error.response?.data?.message || 'Error blocking user');
		}
	}

	const removeUserFromNotifications = (userId) => {
		setNotifications((prevNotifications) => {
			if (!prevNotifications) return [];
			return prevNotifications.filter((notification) => notification.concerned_user_id !== userId);
		});
	}
	
	const handleReport = async () => {
		try {
			await axios.post(`${import.meta.env.VITE_API_URL}/report/${potentialMatches[0].id}`, {}, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			setPotentialMatches((prevMatches) =>
				prevMatches.filter((match) => match.id !== potentialMatches[0].id)
			);
			if (remainingMatches < 4) fetchPotentialMatches();
			removeUserFromNotifications(potentialMatches[0].id);
		} catch (error) {
			displayAlert('error', error.response?.data?.message || 'Error reporting user');
		}
	}

	const addUserToMatches = (user) => {
		setMatches((prevMatches) => {
			const matchesArr = prevMatches || [];
			const existingIndex = matchesArr.findIndex((match) => match.id === user.id);
			if (existingIndex !== -1) {
				return matchesArr;
			}
			return [user, ...matchesArr];
		});
	}
	
	if (!isAuthenticated || isLoading) {
		return <GuestHomePage />;
	}
	
    if (!potentialMatches) {
        return (
            <SkeletonHomePage />
        );
    }

	const remainingMatches = potentialMatches.length;

	return (
		<div className='home-page-container'>
			{/* Page Header */}
			<div className="home-header">
				<h1 className="home-title">Discover</h1>
				{potentialMatches.length > 0 && (
					<div className="match-counter">
						{remainingMatches} potential {remainingMatches === 1 ? 'match' : 'matches'}
					</div>
				)}
			</div>

			{/* Main Content Area */}
			<div className="home-main-content">
				{potentialMatches.length > 0 ? (
					<>
						{/* Profile Card Container */}
						<div className="profile-card-container">
							<ProfileCard 
								profile={potentialMatches[0]} 
								handleLike={handleLike} 
								handleBlock={handleBlock}
								handleReport={handleReport}
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
								{TIPS.map((tip, index) => (
									<TipItem key={index} icon={tip.icon} text={tip.text} />
								))}
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