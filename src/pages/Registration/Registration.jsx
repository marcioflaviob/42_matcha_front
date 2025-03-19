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

	const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
		date: null,
		gender: null,
		sexual_interest: null,
		interests_tags: [],
		biography: ''
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