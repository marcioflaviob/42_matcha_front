import React, { useEffect, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './GoogleCallBack.css';
import { AuthContext } from '../../context/AuthContext';

const GoogleCallback = () => {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const { setToken } = useContext(AuthContext);

	useEffect(() => {
		const token = searchParams.get('token');

		if (token) {
			localStorage.setItem('token', token);
			setToken(token);

			setTimeout(() => {
				navigate('/');
			}, 1500);
		} else {
			navigate('/login?error=auth_failed');
		}
	}, [searchParams]);

	return (
		<div className="google-callback-container">
			<div className="loading-spinner">
				<i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
				<p>Processing your Google login...</p>
			</div>
		</div>
	);
};

export default GoogleCallback;