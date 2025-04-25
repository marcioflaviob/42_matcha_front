import React, { useContext, useState } from 'react';
import './LoginComponent.css';
import { FloatLabel } from 'primereact/floatlabel';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { UserContext } from '../../context/UserContext';

const LoginComponent = ({ setIsPasswordForgotten }) => {
	const navigate = useNavigate();
	const { login } = useContext(AuthContext);
	const { setUser } = useContext(UserContext);
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	const [formData, setFormData] = useState({
		email: '',
		password: '',
	});
	const [touchedFields, setTouchedFields] = useState({
		email: false,
		password: false,
	});
	const [validFields, setValidFields] = useState({
		email: false,
		password: false,
	});
	const [loading, setLoading] = useState(false);

	const handleInputChange = (e) => {
        const { id, value } = e.target;
        setTouchedFields((prev) => ({ ...prev, [id]: true }));
		setFormData((prevData) => ({
            ...prevData,
            [id]: value,
        }));
		setValidFields((prevValid) => ({
			...prevValid,
			email: id === 'email' ? emailRegex.test(value) : prevValid.email,
			password: id === 'password' ? value.length >= 0 : prevValid.password,
		}));
    };

    const handleLogin = async () => {
        try {
            setLoading(true);
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, {
                email: formData.email,
                password: formData.password,
            });

			login(response.data.token);
			setUser(response.data.user);
			navigate('/');
        } catch (error) {
            console.error('Login failed:', error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

	return (
		<div className="login-component">
			<div>
				<h1 className='login-title'>Welcome Back</h1>
				<p className='login-subtitle'>Sign in to continue your journey</p>
			</div>
			<div className='login-inputs'>
				<FloatLabel>
					<InputText
						id="email"
						className='input-login'
						value={formData.email}
						onChange={handleInputChange}
						invalid={touchedFields.email && !validFields.email}
						keyfilter={/^[a-zA-Z0-9._%+-@]+$/} />
					<label htmlFor="email">Email</label>
				</FloatLabel>
				<FloatLabel>
					<Password
						inputId='password'
						className='input-login'
						value={formData.password}
						invalid={touchedFields.password && !validFields.password}
						onChange={handleInputChange}
						feedback={false} />
					<label htmlFor="password">Password</label>
				</FloatLabel>
			</div>
			<p className='forgot-password' onClick={() => setIsPasswordForgotten(true)}>
				<span>I forgot my password</span>
				<span>🤦‍♂️</span>
			</p>
			<Button 
				label={loading ? "Signing in..." : "Sign In"} 
				icon={loading ? "pi pi-spin pi-spinner" : "pi pi-sign-in"} 
				iconPos="right"
				className="p-button-raised p-button-rounded" 
				onClick={handleLogin} 
				disabled={!validFields.email || !validFields.password || loading} 
			/>
			<div className='register-div'>
				<span>No account?</span>
				<Button label="Register" className="register-button p-button-raised p-button-rounded" onClick={() => navigate('/register')} />
			</div>
		</div>
	);
};

export default LoginComponent;