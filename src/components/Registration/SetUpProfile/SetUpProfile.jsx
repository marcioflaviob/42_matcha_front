import React, { useState, useContext } from 'react';
import './SetUpProfile.css';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { AuthContext } from '../../../context/AuthContext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Calendar } from 'primereact/calendar';
import axios from 'axios';
import { UserContext } from '../../../context/UserContext';
import { displayAlert } from '../../Notification/Notification';
import PictureSelector from '../../PictureSelector/PictureSelector';

const SetUpProfile = ({ setActiveStep }) => {
    const { setUser, user } = useContext(UserContext);
    const { token } = useContext(AuthContext);
    const [openPictureSelector, setOpenPictureSelector] = useState(false);
    const [formData, setFormData] = useState({
        biography: '',
        birthdate: null,
        status: 'validation'
    });
    const [biographyTouched, setBiographyTouched] = useState(false);
    const [birthdateTouched, setBirthdateTouched] = useState(false);
    
    const isBirthdateValid = (date) => {
        if (!date) return false;
        
        const today = new Date();
        const birthDate = new Date(date);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age >= 18;
    };

    const handleChange = (e) => {
        setBiographyTouched(true);
        setFormData((prevData) => ({
            ...prevData,
            biography: e.target.value,
        }));
    };

    const handleDateChange = (e) => {
		setBirthdateTouched(true);
		setFormData((prevData) => ({
			...prevData,
			birthdate: e.value,
		}));
	};

    const handleButtonNext = async () => {
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
			setActiveStep(4);
		})
		.catch((error) => {
			displayAlert('error', error.response?.data?.message || 'Error updating profile');
		})
	}

	return (
		<div className='set-up-panel'>
			<div className='biography-div'>
				<h2 className='h2-bio'>Write your biography</h2>
				<InputTextarea rows={5} cols={40} autoResize value={formData.biography} onChange={handleChange} invalid={biographyTouched && !formData.biography} maxLength={255} />
			</div>
            <div className='row-div'>
				<h2 className='h2-bio'>Birthdate</h2>
                <Calendar
                    className='birthdate'
                    inputId='birthdate'
                    placeholder='Birth Date'
                    value={formData.birthdate}
                    onChange={handleDateChange}
                    invalid={birthdateTouched && !isBirthdateValid(formData.birthdate)}
                    showIcon
                    monthNavigator 
                    yearNavigator 
                    dateFormat="dd/mm/yy"
                    yearRange={`1900:${new Date().getFullYear() - 18}`} />
                {birthdateTouched && !isBirthdateValid(formData.birthdate) && (
                    <small className="p-error">You must be at least 18 years old</small>
                )}
            </div>
			<Divider align="center" />
			<div>
				<h2>Upload your pictures</h2>
                <PictureSelector showDialog={openPictureSelector} setShowDialog={setOpenPictureSelector} />
			</div>
			<div className='button-div'>
				{/* <Button label="Back" severity="secondary" icon="pi pi-arrow-left" onClick={() => setActiveStep(1)} /> */}
				<Button label="Next" icon="pi pi-arrow-right" iconPos="right" onClick={() => handleButtonNext()} 
                    disabled={!formData.biography || !isBirthdateValid(formData.birthdate) || user.pictures.length == 0} />
			</div>
		</div>
	);
};

export default SetUpProfile;