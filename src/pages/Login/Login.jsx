import React, { useContext, useEffect, useState } from 'react';
import './Login.css';
import LoginComponent from '../../components/Login/LoginComponent';
import ForgotPassword from '../../components/Login/ForgotPassword';
import { UserContext } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
	const { user } = useContext(UserContext);
	const [isPasswordForgotten, setIsPasswordForgotten] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		if (user) {
			navigate('/');
		}
	}, [user]);

	return (
		<div className='login-container'>
			<div className='login-left-div'></div>
			<div className='login-right-div'>
				{
					!isPasswordForgotten ?
					<>
						<div className='login-border'>
							<LoginComponent setIsPasswordForgotten={setIsPasswordForgotten} />
						</div>
						<div className='login-border'>
							<div className='google-signup'>
								<i className='pi pi-google'></i>
								<span>Sign in with Google</span>
							</div>
						</div>
					</>
					:
					<ForgotPassword />
				}
			</div>
		</div>
	);
};

export default Login;