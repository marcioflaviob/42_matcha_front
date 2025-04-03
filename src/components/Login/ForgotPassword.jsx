import React, { useState } from 'react';
import './ForgotPassword.css';
import { FloatLabel } from 'primereact/floatlabel';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

const ForgotPassword = () => {
	const [email, setEmail] = useState('');
	const [emailSent, setEmailSent] = useState(false);

	const handleEmailRecovery = () => {
		setEmailSent(true);
		// Send a recovery email to the user
	};

	return (
		<div>
			<div className='forgot-password-container'>
				<h1>Recover your password</h1>
				<FloatLabel>
					<InputText
						id="email"
						className='forgot-email-input'
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						keyfilter={/^[a-zA-Z0-9._%+-@]+$/} />
					<label htmlFor="email">Email</label>
				</FloatLabel>
				<Button label="Receive a recovery email" onClick={handleEmailRecovery} className="p-button-raised p-button-rounded" disabled={emailSent} />
			</div>
		</div>
	);
};

export default ForgotPassword;