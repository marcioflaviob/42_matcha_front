import React, { useRef, useState } from 'react';
import './Registration.css';

import { Stepper } from 'primereact/stepper';
import { StepperPanel } from 'primereact/stepperpanel';
import YourDetails from './steps/YourDetails';
import YourPreferences from './steps/YourPreferences';
import SetUpProfile from './steps/SetUpProfile';
import EmailValidation from './steps/EmailValidation';
        
const Registration = () => {
	const stepperRef = useRef(null);

	const [formData, setFormData] = useState({
        first_name: null,
        last_name: null,
        email: null,
        password: null,
		date: null,
		gender: null,
		sexual_interest: null,
		interests_tags: null,
		biography: null
    });

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [id]: value,
        }));
    };

	const handleSelectChange = (e, field) => {
        setFormData((prevData) => ({
            ...prevData,
            [field]: e.value,
        }));
    };

	return (
		<div className='registration-container'>
			<Stepper ref={stepperRef} linear={true}>
				<StepperPanel header="Your details">
					<YourDetails formData={formData} handleChange={handleChange} stepperRef={stepperRef} />
				</StepperPanel>
				<StepperPanel header="Your preferences">
					<YourPreferences formData={formData} handleSelectChange={handleSelectChange} stepperRef={stepperRef} />
				</StepperPanel>
				<StepperPanel header="Set up profile">
					<SetUpProfile formData={formData} handleChange={handleChange} stepperRef={stepperRef} />
				</StepperPanel>
				<StepperPanel header="Validate">
					<EmailValidation />
				</StepperPanel>
			</Stepper>
		</div>
	);
}

export default Registration;