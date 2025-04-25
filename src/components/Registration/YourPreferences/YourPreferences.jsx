import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import './YourPreferences.css';
import { Button } from 'primereact/button';
import { MultiSelect } from 'primereact/multiselect';
import { SelectButton } from 'primereact/selectbutton';
import { Gender, Interests, SexualInterest } from './constants';
import { Divider } from 'primereact/divider';
import { UserContext } from '../../../context/UserContext';
import { displayAlert } from '../../Notification/Notification';
import { AuthContext } from '../../../context/AuthContext';
import { Slider } from 'primereact/slider';
import { Rating } from 'primereact/rating';
        
        

const YourPreferences = ({ setActiveStep }) => {
	const { user, setUser } = useContext(UserContext);
	const { token } = useContext(AuthContext);
	const [isLoading, setIsLoading] = useState(false);
	const [ageRange, setAgeRange] = useState([18, 99]);
	const [formData, setFormData] = useState({
		gender: '',
		sexual_interest: '',
		interests_tags: [],
		age_range_min: 18,
		age_range_max: 99,
		min_desired_rating: 0,
		status: 'step_two'
	});
	const [touchedFields, setTouchedFields] = useState({
		gender: false,
		sexual_interest: false,
		interests_tags: false
	});
	const [validFields, setValidFields] = useState({
		gender: false,
		sexual_interest: false,
		interests_tags: false
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

	const handleAgeRangeChange = (value) => {
        setTouchedFields((prev) => ({ ...prev, age_range: true }));
        setAgeRange(value);
		setFormData((prevData) => ({
			...prevData,
			age_range_min: value[0],
			age_range_max: value[1],
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
			interests: formData.interests.length > 0,
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
			<div className='aligned-div'>
				<span>
					<p>Desired age range</p>
					<div className="slider-container">
                        <Slider id='age_range' value={ageRange} onChange={(e) => handleAgeRangeChange(e.value)} range min={0} max={100} />
                        <div className="age-range-display">
                            <span>{formData.age_range_min}</span>
                            <span>{formData.age_range_max}</span>
                        </div>
                    </div>
				</span>
				<span>
					<p>Minimum desired rating</p>
					<Rating id='min_desired_rating' value={formData.min_desired_rating} onChange={(e) => handleSelectChange(e, 'min_desired_rating')} cancel={false} />
				</span>
			</div>
			<Divider align="center" />
			<div className='aligned-div'>
				<span className='hobby-selection'>
					<p>My hobbies</p>
					<MultiSelect id='interests' className='hobby-selection-input' value={formData.interests} options={Interests} onChange={(e) => handleSelectChange(e, 'interests')}
						optionLabel="name" optionValue="value" display="chip" placeholder='Select your interests' showSelectAll={false} filter invalid={touchedFields.interests && !validFields.interests} />
				</span>

			</div>
			<div className='button-div'>
				<Button label="Next" icon="pi pi-arrow-right" iconPos="right" onClick={handleButtonNext} disabled={!allFieldsValid} loading={isLoading} />
			</div>
		</div>
	);
};

export default YourPreferences;