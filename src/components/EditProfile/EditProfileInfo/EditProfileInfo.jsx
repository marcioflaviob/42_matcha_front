import React, { useState, useEffect, useContext, useCallback} from 'react';
import './EditProfileInfo.css';
import axios from 'axios';
import { Chip } from 'primereact/chip';
import { UserContext } from '../../../context/UserContext';
import { displayAlert }  from "../../Notification/Notification"
import { MultiSelect } from 'primereact/multiselect';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { useNavigate} from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import { Button } from 'primereact/button';
import 'primeicons/primeicons.css';
import PictureSelector from '../../PictureSelector/PictureSelector';
import AskLocation from '../../Location/AskLocation/AskLocation';


const EditProfileInfo = ({ userId, setShadowUser }) => {
    const navigate = useNavigate();
    const { token } = useContext(AuthContext);
    const { user, setUser } = useContext(UserContext);
    const [allInterests, setAllInterests] = useState(null);
    const [disableUpload, setDisableUpload] = useState(true);
    const { setLocation } = AskLocation();
    const [loadingButton, setLoadingButton] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        interests: [],
        gender: '',
        sexual_interest: '',
        biography: '',
        location: [],
    });

    const handleChipClick = (value) => {
        setFormData(prev => ({
            ...prev,
            gender: value
        }))
    }

    const handleFirstNameChange = useCallback((e) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, first_name: value }));
        setShadowUser(prev => ({ ...prev, first_name: value }));
    }, []);

    const handleLastNameChange = useCallback((e) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, last_name: value }));
    }, []);

    const handleBioChange = useCallback((e) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, biography: value }));
        setShadowUser(prev => ({ ...prev, biography: value }));
    }, []);

    const handleRemoveInterest = (interestId) => {
        const array = formData.interests.filter(item => item.id !== interestId);
        setFormData((prevData) => ({
            ...prevData,
            ['interests']: array,
        }))
    };

    const handleDisableChange = (newValue) => {
        setDisableUpload(newValue);
    };

    const handleRequestLocation = async (e) => {
        e.preventDefault();
        setLoadingButton(true);
        await setLocation(user.id, token);
        setLoadingButton(false);
    };
    
    const handleSelectChange = (e, field) => {
		const value = e.target.value;
        const valueSet = new Set(value);
        const changes = allInterests.filter(interest => valueSet.has(interest.name));
        setFormData((prevData) => ({
            ...prevData,
            [field]: changes,
        }));
    };

    const updateUser = async () => {
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/update-user`, formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    withCredentials: true,
                }
            );
            
            const userResponse = await axios.get(`${import.meta.env.VITE_API_URL}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            
            if (userResponse.data.user) {
                setUser(userResponse.data.user);
                displayAlert('success', 'Profile updated successfully');
                setTimeout(() => {
                    navigate(`/profile/${userResponse.data.user.id}`);
                }, 100);
            }
        } catch (error) {
            console.error('Error:', error);
            displayAlert('error', 'An error occurred. Please try again later.');
            throw error;
        }
    };

    const handleSave = async () => {
        try {
            if (formData.email !== '') {
                formData.status = 'validation';
            }
            await updateUser();
        } catch (error) {
            console.error('Error updating profile:', error);
            displayAlert('error', 'Failed to update profile');
        }
    };

    useEffect(() => {
        if (!user) return;
        const fetchData = async () => {
            setFormData((prevData) => ({
                ...prevData,
                ['interests']: user.interests,
                ['gender']: user.gender,
                ['sexual_interest']: user.sexual_interest,
                ['first_name']: user.first_name,
                ['last_name']: user.last_name,
                ['email']: user.email,
                ['biography']: user.biography,
                ['location']: user.location,
            }))
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/interests`);
                setAllInterests(response.data);
            } catch (err) {
                displayAlert('error', 'Error fetching information');
                console.error('Error fetching information:', err);
            }
        };
        fetchData();
    }, [userId, user, disableUpload]);

    useEffect(() =>
    {
        setShadowUser(prev => ({ ...prev, interests: formData.interests, location: formData.location }));
    }, [formData?.interests, formData?.location?.city]);

    useEffect(() => {
        if (user?.location) {
            setShadowUser((prevData) => ({
                ...prevData,
                location: { 
                    latitude: user?.location?.latitude, 
                    longitude: user?.location?.longitude,
                    city: user?.location?.city,
                    country: user?.location?.country 
                },
            }));
        }
    }, [user?.location])

    if (!user || !allInterests) return (
        <div className='edit-profile-info-container'>
        </div>
    );

    return (
    <div className='edit-profile-info-container'>
        <div className="fixed-div"></div>
        <div className="scrollable-div">
            <form>
                <div className='dual-bio'>
                    <div className='bio-first-part'>
                        <div className='edit-bio'>
                            <div className='edit-bio-title'>First name</div>
                            <InputText type="text" name='first_name' autoComplete="given-name" className="p-inputtext-sm input-name" value={formData.first_name || ''} placeholder={`${formData.first_name}`} onChange={handleFirstNameChange}></InputText>
                        </div>
                        <div className='edit-bio'>
                            <div className='edit-bio-title'>Last name</div>
                            <InputText type="text" name='last_name' autoComplete="family-name" className="p-inputtext-sm input-name" value={formData.last_name || ''} placeholder={`${formData.last_name}`} onChange={handleLastNameChange}></InputText>
                        </div>
                        <div className='edit-bio'>
                            <div className='edit-bio-title'>Gender</div>
                            <Chip className={`bio-small-chip ${formData.gender === 'Male' ? 'highlighted' : 'hoverable'}`} label={"Male"} key={72} onClick={() => handleChipClick("Male")}/>
                            <Chip className={`bio-small-chip ${formData.gender === 'Female' ? 'highlighted' : 'hoverable'}`} label={"Female"} key={73} onClick={() => handleChipClick("Female")} />
                            <Chip className={`bio-small-chip ${formData.gender === 'Other' ? 'highlighted' : 'hoverable'}`} label={"Other"} key={74} onClick={() => handleChipClick("Other")}/>
                        </div>
                        <div className='edit-bio'>
                            <div className='edit-bio-title'>Email</div>
                            <InputText type="email" name='email' autoComplete="email" className="p-inputtext-sm input-name" value={formData.email || ''} placeholder={`${formData.email}`} onChange={(e) => setFormData({...formData, email: e.target.value})}></InputText>
                        </div>
                    </div>
                    <div className='bio-second-part'>
                        <div className='edit-bio-container'>
                            <div className='edit-bio-title'>Bio</div>
                            <InputTextarea type="text" className="input-bio" value={formData.biography || ''} placeholder={`${formData.biography}`} onChange={handleBioChange}></InputTextarea>
                        </div>
                        <div className='edit-bio'>
                            <div className='edit-bio-title'>Looking for</div>
                            <Chip className={`bio-small-chip ${formData.sexual_interest === 'Male' ? 'highlighted' : 'hoverable'}`} label={"Male"} key={69} onClick={() => {setFormData(prev => ({
                                ...prev,
                                sexual_interest: 'Male'
                            }))}}/>
                            <Chip className={`bio-small-chip ${formData.sexual_interest === 'Female' ? 'highlighted' : 'hoverable'}`} label={"Female"} key={70} onClick={() => {setFormData(prev => ({
                                ...prev,
                                sexual_interest: 'Female'
                            }))}}/>
                            <Chip className={`bio-small-chip ${formData.sexual_interest === 'Any' ? 'highlighted' : 'hoverable'}`} label={"Any"} key={71} onClick={() => {setFormData(prev => ({
                                ...prev,
                                sexual_interest: 'Any'
                            }))}}/>
                        </div>
                        <div className='edit-bio'>
                            <Button label="Change location" loading={loadingButton} type="button" onClick={handleRequestLocation}/>
                        </div>
                    </div>
                </div>
                <div className='edit-bio-interests'>
                    <div className='edit-bio-title'>Interests</div>
                    <span className='hobby-selection'>
                        <MultiSelect id='interests' className='hobby-selection-input' value={formData.interests.map(interest => interest.name) || []} options={allInterests} onChange={(e) => handleSelectChange(e, 'interests')}
                            optionLabel="name" optionValue="name" placeholder='Select your interests' showSelectAll={false} showClear={true}/>
                    </span>
                    <div className='bio-container-interest'>
                            {formData.interests?.map((interest) => (
                                <Chip className='bio-interest' label={interest.name} key={interest.id} removable onRemove={() => handleRemoveInterest(interest.id)}/>
                            ))}
                    </div>
                </div>
                <div className='edit-bio-upload'>
                    <div className='edit-bio-title'>Change Pictures</div>
                    <i className="pi pi-upload upload-button" onClick={() => setDisableUpload(false)}></i>
                </div>
            </form> 
        </div>
        <div className='save-button' role='button' onClick={() => handleSave()}>Save</div>
        <PictureSelector disabled={disableUpload} onDisabledChange={handleDisableChange}></PictureSelector>
    </div>
    );
};

export default EditProfileInfo;