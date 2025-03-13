import React, { useState } from 'react';
import './EmailValidation.css';
import { Button } from 'primereact/button';

const EmailValidation = () => {

	const [isButtonActive, setIsButtonActive] = useState(true);

	const handleEmailResend = () => {
		setIsButtonActive(false);
		// TODO Implement email resend functionality
	};


	return (
		<div className="validation-div">
			<h2>Validate your account</h2>
			<p>We have sent you an email with a link to validate your account.</p>
			<p>Click on the link in the email to validate your account.</p>
			<Button label="Resend email" disabled={!isButtonActive} onClick={handleEmailResend} icon="pi pi-envelope" iconPos="right" />
		</div>
	);
};

export default EmailValidation;