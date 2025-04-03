import React, { useContext, useEffect, useRef, useState } from 'react';
import './Registration.css';

import { Stepper } from 'primereact/stepper';
import { StepperPanel } from 'primereact/stepperpanel';
import YourDetails from '../../components/Registration/YourDetails/YourDetails';
import YourPreferences from '../../components/Registration/YourPreferences/YourPreferences';
import SetUpProfile from '../../components/Registration/SetUpProfile/SetUpProfile';
import EmailValidation from '../../components/Registration/EmailValidation/EmailValidation';
import { UserContext } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';
        
const Registration = () => {
	const { user } = useContext(UserContext);
	const navigate = useNavigate();
	const [activeStep, setActiveStep] = useState(0);

	useEffect(() => {
		if (user && user.status) {
			console.log(user.status);
			switch (user.status) {
				case 'step_one':
					setActiveStep(1);
					break;
				case 'step_two':
					setActiveStep(2);
					break;
				case 'validation':
					setActiveStep(3);
					break;
				default:
					navigate('/');
			}
		}
	}, [user]);

	return (
		<div className='registration-container'>
			<Stepper activeStep={activeStep} onSelect={(e) => setActiveStep(e.index)} linear={true}>
			<StepperPanel header="Your details">
                    <YourDetails setActiveStep={setActiveStep} />
                </StepperPanel>
                <StepperPanel header="Your preferences">
                    <YourPreferences setActiveStep={setActiveStep} />
                </StepperPanel>
                <StepperPanel header="Set up profile">
                    <SetUpProfile setActiveStep={setActiveStep} />
                </StepperPanel>
                <StepperPanel header="Validate">
                    <EmailValidation />
                </StepperPanel>
            </Stepper>
		</div>
	);
}

export default Registration;