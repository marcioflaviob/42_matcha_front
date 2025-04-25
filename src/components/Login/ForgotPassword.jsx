import React, { useState } from 'react';
import './ForgotPassword.css';
import { FloatLabel } from 'primereact/floatlabel';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import axios from 'axios';
import { displayAlert } from '../Notification/Notification';

const ForgotPassword = ({ setIsPasswordForgotten }) => {
	const [email, setEmail] = useState('');
	const [loading, setLoading] = useState(false);
	const [emailSent, setEmailSent] = useState(false);
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	const isEmailValid = emailRegex.test(email);

	const handlePasswordRecovery = async () => {
		try {
			setLoading(true);
			// Send email
			setEmailSent(true);
		} catch (error) {
			console.error('Password recovery failed:', error.response?.data || error.message);
			displayAlert('error', 'Password recovery failed');
		} finally {
			setLoading(false);
		}
	};

	if (emailSent) {
		return (
			<div className="forgot-password-sent">
				<i className="pi pi-check-circle sent-icon"></i>
				<h2 className="forgot-password-title">Email Sent</h2>
				<p className="sent-message">
					We've sent a password recovery link to {email}. Please check your inbox and follow the instructions to reset your password.
				</p>
				<Button
					label="Back to Login"
					className="p-button-rounded forgot-password-back"
					onClick={() => setIsPasswordForgotten(false)}
				/>
			</div>
		);
	}

	return (
		<div className="forgot-password-component">
			<h2 className="forgot-password-title">Reset Password</h2>
			<p className="forgot-password-subtitle">
				Enter your email address to receive a link to reset your password.
			</p>
			
			<FloatLabel className="forgot-password-input">
				<InputText
					id="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					keyfilter="email"
				/>
				<label htmlFor="email">Email Address</label>
			</FloatLabel>
			
			<div className="forgot-password-buttons">
				<Button
					label="Back"
					icon="pi pi-arrow-left"
					className="p-button-rounded p-button-outlined forgot-password-back"
					onClick={() => setIsPasswordForgotten(false)}
				/>
				<Button
					label={loading ? "Sending..." : "Send Reset Link"}
					icon={loading ? "pi pi-spin pi-spinner" : "pi pi-envelope"}
					iconPos="right"
					className="p-button-rounded forgot-password-submit"
					onClick={handlePasswordRecovery}
					disabled={!isEmailValid || loading}
				/>
			</div>
		</div>
	);
};

export default ForgotPassword;