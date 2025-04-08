import React, { useContext } from 'react';
import './Header.css';
import { UserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Header = () => {
	const { user } = useContext(UserContext);
	const { logout } = useContext(AuthContext);
	const navigate = useNavigate();

	return (
		<div className="header">
			<div className="header-left">
				<h1 className="title">Matcha</h1>
			</div>
			<div className="header-right">
				{user ? (
					<div className="user-info">
						<span>Welcome {user.first_name} </span>
						<button onClick={logout}>Log out</button>
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
