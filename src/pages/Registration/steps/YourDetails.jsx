import React from 'react';
import './YourDetails.css';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { FloatLabel } from 'primereact/floatlabel';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Divider } from 'primereact/divider';
        

const YourDetails = ({ formData, handleChange, stepperRef }) => {
	return (
		<div className='your-details-panel'>
			<h2>Your Personal Information</h2>
			<div className='aligned-div'>
				<FloatLabel>
					<InputText id="first_name" value={formData.first_name} onChange={handleChange} />
					<label htmlFor="first_name">First Name</label>
				</FloatLabel>
				<FloatLabel>
					<InputText id="last_name" value={formData.last_name} onChange={handleChange} />
					<label htmlFor="last_name">Last Name</label>
				</FloatLabel>
			</div>
			<Calendar className='birthdate' inputId='birth_date' placeholder='Birth Date' value={formData.date} onChange={handleChange} showIcon />
			<Divider align="center" />
			<div className='aligned-div'>
				<FloatLabel>
					<InputText id="email" value={formData.email} onChange={handleChange} />
					<label htmlFor="email">Email</label>
				</FloatLabel>
				<FloatLabel>
					<Password value={formData.password} onChange={handleChange} feedback={false} />
					<label htmlFor="password">Password</label>
				</FloatLabel>
			</div>
			<div className='button-div'>
				<Button label="Next" icon="pi pi-arrow-right" iconPos="right" onClick={() => stepperRef.current.nextCallback()} />
			</div>
		</div>
	);
};

export default YourDetails;