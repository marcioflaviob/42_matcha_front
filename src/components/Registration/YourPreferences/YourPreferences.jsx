import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import './YourPreferences.css';
import { Button } from 'primereact/button';
import { MultiSelect } from 'primereact/multiselect';
import { SelectButton } from 'primereact/selectbutton';
import { Gender, SexualInterest } from './constants';
import { Divider } from 'primereact/divider';
import { UserContext } from '../../../context/UserContext';
import { displayAlert } from '../../Notification/Notification';
import { AuthContext } from '../../../context/AuthContext';
import { Slider } from 'primereact/slider';
import { Rating } from 'primereact/rating';
import AskLocation from '../../Location/AskLocation/AskLocation';

const YourPreferences = ({ setActiveStep }) => {
	const { user, setUser } = useContext(UserContext);
	const { token } = useContext(AuthContext);
	const [isLoading, setIsLoading] = useState(false);
	const [ageRange, setAgeRange] = useState([18, 99]);
	const [allInterests, setAllInterests] = useState(null);
	const {location, getLocation, addressRef} = AskLocation();
	const [locationData, setLocationData] = useState([]); // State to store address
	const [formData, setFormData] = useState({
		gender: '',
		sexual_interest: '',
		interests: [],
		age_range_min: 18,
		age_range_max: 99,
		min_desired_rating: 0,
		status: 'step_two'
	});
	const [touchedFields, setTouchedFields] = useState({
		gender: false,
		sexual_interest: false,
		interests: false
	});
	const [validFields, setValidFields] = useState({
		gender: false,
		sexual_interest: false,
		interests: false
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

	const handleInterestChange = (e, field) => {
		const value = e.selectedOption;

		setFormData((prevData) => {
			let updatedField;

			if (Array.isArray(prevData[field])) {
				if (prevData[field].some((item) => item.id === value.id)) {
					// Remove the item if it already exists
					updatedField = prevData[field].filter((item) => item.id !== value.id);
				} else {
					// Append the item if it doesn't exist
					updatedField = [...prevData[field], value];
				}
			} else {
				// Initialize as an array if undefined
				updatedField = [value];
			}

			return {
				...prevData,
				[field]: updatedField,
			};
		});
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

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await axios.get(`${import.meta.env.VITE_API_URL}/interests`);
				setAllInterests(response.data);
			} catch (err) {
				displayAlert('error', 'Error fetching information'); // Handle errors
				console.error('Error fetching information:', err);
			}
		}
		fetchData();
		getLocation();
	}, []);

	useEffect(() => {
		const checkAddressRef = setInterval(() => {
		  if (addressRef.current.city && addressRef.current.country && location?.longitude) {
			setLocationData({
				userId : user.id,
				city : addressRef.current.city,
				country : addressRef.current.country,
				longitude : location.longitude,
				latitude : location.latitude
			});
			clearInterval(checkAddressRef);
		  }
		}, 100);
	  
		return () => clearInterval(checkAddressRef);
	}, [location?.longitude, addressRef.current.city, addressRef.current.country]);

	useEffect(() => {
		const sendLocation = async () => {
			if (locationData.length === 0) return; // Check if location is available
			try { 
				await axios.post(`${import.meta.env.VITE_API_URL}/location/${user.id}`, locationData, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
					withCredentials: true,
				});
			} catch (err) {
				displayAlert('error', 'Error fetching information'); // Handle errors
				console.error('Error fetching information:', err);
			}
		}
		if (!user?.location)
			sendLocation();
	}, [locationData?.latitude, locationData?.city]);

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
					<MultiSelect id='interests' className='hobby-selection-input' value={formData.interests.map(interest => interest.name) || []} options={allInterests} onChange={(e) => handleInterestChange(e, 'interests')}
						optionLabel="name" optionValue="name" placeholder='Select your interests' showSelectAll={false} showClear={true} invalid={touchedFields.interests && !validFields.interests}/>
				</span>

			</div>
			<div className='button-div'>
				<Button label="Next" icon="pi pi-arrow-right" iconPos="right" onClick={handleButtonNext} disabled={!allFieldsValid} loading={isLoading} />
			</div>
		</div>
	);
};

export default YourPreferences;