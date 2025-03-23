import React, { useEffect, useState } from 'react';
import './YourPreferences.css';
import { Button } from 'primereact/button';
import { MultiSelect } from 'primereact/multiselect';
import { SelectButton } from 'primereact/selectbutton';
import { Gender, Interests, SexualInterest } from './constants';
import { Divider } from 'primereact/divider';

const YourPreferences = ({ setActiveStep }) => {

	const [formData, setFormData] = useState({
		gender: '',
		sexual_interest: '',
		interests_tags: [],
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
		// TODO Add logic to send data to the server
		setActiveStep(2);
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
				<Button label="Next" icon="pi pi-arrow-right" iconPos="right" onClick={handleButtonNext} disabled={allFieldsValid} />
			</div>
		</div>
	);
};

export default YourPreferences;