import React, { useContext, useEffect, useState } from 'react';
import axios, { all } from 'axios';
import './YourPreferences.css';
import { Button } from 'primereact/button';
import { MultiSelect } from 'primereact/multiselect';
import { SelectButton } from 'primereact/selectbutton';
import { Gender, Interests, SexualInterest } from './constants';
import { Divider } from 'primereact/divider';
import { UserContext } from '../../../context/UserContext';
import { displayAlert } from '../../Notification/Notification';
import { AuthContext } from '../../../context/AuthContext';

const YourPreferences = ({ setActiveStep }) => {
	const { user, setUser } = useContext(UserContext);
	const { token } = useContext(AuthContext);
	const [isLoading, setIsLoading] = useState(false);
	const [formData, setFormData] = useState({
		gender: '',
		sexual_interest: '',
		interests_tags: [],
		status: 'step_two'
	});
	const [touchedFields, setTouchedFields] = useState({
		gender: false,
		sexual_interest: false,
		interests_tags: false,
	});
	const [validFields, setValidFields] = useState({
		gender: false,
		sexual_interest: false,
		interests_tags: false,
	});
	const allFieldsValid = Object.values(validFields).every((isValid) => isValid);

	const handleSelectChange = (e, field) => {
		const { id, value } = e.target;
		setTouchedFields((prev) => ({ ...prev, [id]: true }));
        setFormData((prevData) => ({
            ...prevData,
            [field]: value,
        }));
    };

	const handleButtonNext = () => {
		setIsLoading(true);
		axios.put(
			`${import.meta.env.VITE_API_URL}/update-user`,
			formData,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
				withCredentials: true,
			}
		)
		.then((response) => {
			setUser(response.data);
			setActiveStep(2);
		})
		.catch((error) => {
			console.error('Error:', error);
			displayAlert('error', 'An error occurred. Please try again later.');
		})
		setIsLoading(false);
	}

	useEffect(() => {
		setValidFields({
			gender: formData.gender !== '',
			sexual_interest: formData.sexual_interest !== '',
			interests_tags: formData.interests_tags.length > 0,
		});
	}, [formData]);

	return (
		<div className='your-preferences-panel'>
			<h2>Tell us more about you</h2>
			<div className='aligned-div'>
				<span>
					<p>I am a</p>
					<SelectButton id='gender' value={formData.gender} onChange={(e) => handleSelectChange(e, 'gender')} optionLabel="name" options={Gender} allowEmpty={false}  />
				</span>
				<span>
					<p>I am interested in</p>
					<SelectButton id='sexual_interest' value={formData.sexual_interest} onChange={(e) => handleSelectChange(e, 'sexual_interest')} optionLabel="name" options={SexualInterest} allowEmpty={false} />
				</span>
			</div>
			<Divider align="center" />
			<div className='aligned-div'>
				<span className='hobby-selection'>
					<p>My hobbies</p>
					<MultiSelect id='interests_tags' className='hobby-selection-input' value={formData.interests_tags} options={Interests} onChange={(e) => handleSelectChange(e, 'interests_tags')}
						optionLabel="name" optionValue="value" display="chip" placeholder='Select your interests' showSelectAll={false} filter invalid={touchedFields.interests_tags && !validFields.interests_tags} />
				</span>

			</div>
			<div className='button-div'>
				<Button label="Next" icon="pi pi-arrow-right" iconPos="right" onClick={handleButtonNext} disabled={!allFieldsValid} loading={isLoading} />
			</div>
		</div>
	);
};

export default YourPreferences;