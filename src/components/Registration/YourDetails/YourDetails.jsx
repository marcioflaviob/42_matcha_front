import React, { useEffect, useState } from 'react';
import './YourDetails.css';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { FloatLabel } from 'primereact/floatlabel';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Divider } from 'primereact/divider';
        
const YourDetails = ({ setActiveStep }) => {
	const nameKeyFilter = /^[a-zA-ZÀ-ÿ' -]+$/;
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	const [formData, setFormData] = useState({
		first_name: '',
		last_name: '',
		birthdate: null,
		email: '',
		password: '',
	});
	const [touchedFields, setTouchedFields] = useState({
        first_name: false,
        last_name: false,
		birthdate: false,
        email: false,
        password: false,
    });
	const [validFields, setValidFields] = useState({
        first_name: false,
        last_name: false,
		birthdate: false,
        email: false,
        password: false,
    });

	const allFieldsValid = Object.values(validFields).every((isValid) => isValid);

	const handleInputChange = (e) => {
        const { id, value } = e.target;
        setTouchedFields((prev) => ({ ...prev, [id]: true }));
		setFormData((prevData) => ({
            ...prevData,
            [id]: value,
        }));
    };

	const handleDateChange = (e) => {
		setTouchedFields((prev) => ({ ...prev, birthdate: true }));
		setFormData((prevData) => ({
			...prevData,
			birthdate: e.value,
		}));
	};

	const handleButtonNext = () => {
		// TODO Add logic to send data to the server
		setActiveStep(1);
	}

	useEffect(() => {
		setValidFields({
			first_name: nameKeyFilter.test(formData.first_name),
			last_name: nameKeyFilter.test(formData.last_name),
			birthdate: formData.birthdate !== null && new Date(formData.birthdate) < new Date(),
			email: emailRegex.test(formData.email),
			password: formData.password.length > 0,
		});
	}, [formData]);

	return (
		<div className='your-details-panel'>
			<h2>Your Personal Information</h2>
			<div className='aligned-div'>
				<FloatLabel>
					<InputText id="first_name"
						value={formData.first_name}
						onChange={handleInputChange}
						keyfilter={nameKeyFilter}
						invalid={touchedFields.first_name && !validFields.first_name} />
					<label htmlFor="first_name">First Name</label>
				</FloatLabel>
				<FloatLabel>
					<InputText id="last_name"
					value={formData.last_name}
					onChange={handleInputChange}
					keyfilter={nameKeyFilter} 
					invalid={touchedFields.last_name && !validFields.last_name} />
					<label htmlFor="last_name">Last Name</label>
				</FloatLabel>
			</div>
			<Calendar
				className='birthdate'
				inputId='birthdate'
				placeholder='Birth Date'
				value={formData.birthdate}
				onChange={handleDateChange}
				invalid={touchedFields.birthdate && !validFields.birthdate}
				showIcon />
			<Divider align="center" />
			<div className='aligned-div'>
				<FloatLabel>
					<InputText
						id="email"
						value={formData.email}
						onChange={handleInputChange}
						invalid={touchedFields.email && !validFields.email}
						keyfilter={/^[a-zA-Z0-9._%+-@]+$/} />
					<label htmlFor="email">Email</label>
				</FloatLabel>
				<FloatLabel>
					<Password
						inputId='password'
						value={formData.password}
						invalid={touchedFields.password && !validFields.password}
						onChange={handleInputChange}
						feedback={false} />
					<label htmlFor="password">Password</label>
				</FloatLabel>
			</div>
			<div className='button-div'>
				<Button label="Next" icon="pi pi-arrow-right" iconPos="right" onClick={handleButtonNext} disabled={allFieldsValid} />
			</div>
		</div>
	);
};

export default YourDetails;