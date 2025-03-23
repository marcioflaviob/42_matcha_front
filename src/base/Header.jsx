import React, { useContext, useEffect } from 'react';
import './Header.css';
import { UserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

const Header = () => {
	const { user, setUser } = useContext(UserContext);
	const navigate = useNavigate();

	const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

	return (
		<div className="header">
			<div className="header-left">
				<h1 className="title">Matcha</h1>
			</div>
			<div className="header-right">
				{user ? (
					<div className="user-info">
						<span>Welcome {user.first_name} </span>
						<button onClick={handleLogout}>Log out</button>
					</div>
				) : (
					<div className="login-buttons">
						<button onClick={() => navigate('/login')}>Login</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default Header;
