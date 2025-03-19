import React, { useRef, useState } from 'react';
import './Registration.css';

import { Stepper } from 'primereact/stepper';
import { StepperPanel } from 'primereact/stepperpanel';
import YourDetails from '../../components/Registration/YourDetails/YourDetails';
import YourPreferences from '../../components/Registration/YourPreferences/YourPreferences';
import SetUpProfile from '../../components/Registration/SetUpProfile/SetUpProfile';
import EmailValidation from '../../components/Registration/EmailValidation/EmailValidation';
        
const Registration = () => {
	const stepperRef = useRef(null);

	return (
		<div className='registration-container'>
			<Stepper ref={stepperRef} linear={true}>
				<StepperPanel header="Your details">
					<YourDetails stepperRef={stepperRef} />
				</StepperPanel>
				<StepperPanel header="Your preferences">
					<YourPreferences stepperRef={stepperRef} />
				</StepperPanel>
				<StepperPanel header="Set up profile">
					<SetUpProfile stepperRef={stepperRef} />
				</StepperPanel>
				<StepperPanel header="Validate">
					<EmailValidation />
				</StepperPanel>
			</Stepper>
		</div>
	);
}

export default Registration;