import React, { useContext, useEffect, useState } from 'react';
import './Login.css';
import LoginComponent from '../../components/Login/LoginComponent';
import ForgotPassword from '../../components/Login/ForgotPassword';
import { UserContext } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';
import drawing from '/login_drawing.png';
import { Button } from 'primereact/button';
import { displayAlert } from '../../components/Notification/Notification';

const Login = () => {
	const { user } = useContext(UserContext);
	const [isPasswordForgotten, setIsPasswordForgotten] = useState(false);
	const params = new URLSearchParams(window.location.search);
	const navigate = useNavigate();

	useEffect(() => {
		if (user) {
			navigate('/');
		}
	}, [user]);

	useEffect(() => {
		if (params?.get('error')) {
			displayAlert('error', 'Google authentication failed. Please try again.');
		}
	}, [params]);

	const handleGoogleSignUp = async () => {
		window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
	}

	return (
		<div className='login-container'>
			<div className='login-left-div'>
				<img src={drawing} alt='Couple Illustration' className='login-background-img' />
			</div>
			<div className='login-right-div'>
				{
					!isPasswordForgotten ?
					<>
						<div className='login-border'>
							<LoginComponent setIsPasswordForgotten={setIsPasswordForgotten} />
						</div>
						<div className='login-border'>
							<Button className='google-signup'
								icon='pi pi-google google-signup-icon'
								label='Sign in with Google'
								onClick={handleGoogleSignUp} />
						</div>
					</>
					:
					<div className='login-border'>
						<ForgotPassword setIsPasswordForgotten={setIsPasswordForgotten} />
					</div>
				}
			</div>
		</div>
	);
};

export default Login;