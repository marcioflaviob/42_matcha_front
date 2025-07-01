import React, { useContext, useRef} from 'react';
import './Header.css';
import { UserContext } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';
import logoMatcha from '/logo_matcha.png';
import { Button } from 'primereact/button';
import NotificationButton from './NotificationButton';
import { MapContext } from '../../context/MapContext';

const Header = () => {
	const { user, logoutUser } = useContext(UserContext);
	const { setMapStatus, setFocusedDate, mapStatus } = useContext(MapContext);
	const profilePicture = user?.pictures?.find(picture => picture.is_profile);
	const navigate = useNavigate();
	const headerRef = useRef(null);
	const handleLogout = async () => {
		logoutUser();
		navigate('/');
	};

	const openMap = () => {
		setMapStatus("open");
		setFocusedDate(null);
	}

	const handleClick = () => {
		if (mapStatus != "closed" && mapStatus != "headerClosed") {
			setMapStatus("headerClosed");
		}
	}

	return (
		<div ref={headerRef} className="header" onClick={handleClick}>
			<div className="header-left">
				<img 
					src={logoMatcha} 
					alt="Matcha Logo" 
					className="logo" 
					onClick={() => navigate('/')} />
			</div>
			<div className="header-right">
				{user ? (
					<div className="user-nav">

						<span className='material-symbols-outlined header-map-button' onClick={openMap} >
							public
						</span>

						<Button className='nav-button chat-button' label='Chat' onClick={() => navigate('/chat')} />
						
						<NotificationButton />
						
						<div className="user-profile">
							<div 
								className="user-avatar"
								onClick={() => navigate('/profile/' + user.id)}>
								{profilePicture ? (
									<img 
										src={import.meta.env.VITE_BLOB_URL + '/' + profilePicture.url} 
										alt={`${user.first_name}'s avatar`}/>
								) : (
									<div className="avatar-placeholder">
										{user?.first_name?.charAt(0)}
									</div>
								)}
							</div>
							<div className="user-dropdown">
								<span className="user-name">Hi, {user.first_name}</span>
								<button 
									className="logout-button"
									onClick={handleLogout}>
									Log out
								</button>
							</div>
						</div>
					</div>
				) : (
					<Button className='login-button' onClick={() => navigate('/login')} label='Login' />
				)}
			</div>
		</div>
	);
};

export default Header;
