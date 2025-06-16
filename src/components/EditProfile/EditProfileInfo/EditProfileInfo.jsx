import React, { useState, useEffect, useContext, useCallback} from 'react';
import './EditProfileInfo.css';
import axios from 'axios';
import { Chip } from 'primereact/chip';
import { UserContext } from '../../../context/UserContext';
import { displayAlert }  from "../../Notification/Notification"
import { MultiSelect } from 'primereact/multiselect';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Rating } from 'primereact/rating';
import { useNavigate} from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import { Button } from 'primereact/button';
import 'primeicons/primeicons.css';
import PictureSelector from '../../PictureSelector/PictureSelector';
import AskLocation from '../../Location/AskLocation/AskLocation';


const EditProfileInfo = ({ setShadowUser }) => {
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
        min_desired_rating: 0,
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

    const handleFameRatingChange = (e) => {
        setFormData(prev => ({
            ...prev,
            min_desired_rating: e.value * 20 || 0
        }));
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
            if (formData.email !== user.email) {
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
                ['min_desired_rating']: user.min_desired_rating,
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
    }, [user, disableUpload]);

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
        <div className='edit-profile-info-section'>
            {/* Header Card */}
            <div className="edit-profile-header-card">
                <div className="edit-profile-name-section">
            <h1 className="edit-profile-display-name">Edit Profile</h1>
                    <p className="edit-profile-subtitle">Update your profile information</p>
                </div>
                <Button 
                    label="Save Changes" 
                    icon="pi pi-check"
                    className="save-profile-btn"
                    onClick={handleSave}
                />
            </div>

            {/* Personal Info Card */}
            <div className="edit-profile-card">
                <h3 className="section-title">
                    <i className="pi pi-user"></i>
                    Personal Information
                </h3>
                <div className="edit-info-grid">
                    <div className="edit-field">
                        <label className="field-label">First Name</label>
                        <InputText 
                            type="text" 
                            name='first_name' 
                            autoComplete="given-name" 
                            className="field-input" 
                            value={formData.first_name || ''} 
                            onChange={handleFirstNameChange}
                        />
                    </div>
                    <div className="edit-field">
                        <label className="field-label">Last Name</label>
                        <InputText 
                            type="text" 
                            name='last_name' 
                            autoComplete="family-name" 
                            className="field-input" 
                            value={formData.last_name || ''} 
                            onChange={handleLastNameChange}
                        />
                    </div>
                    <div className="edit-field">
                        <label className="field-label">Email</label>
                        <InputText 
                            type="email" 
                            name='email' 
                            autoComplete="email" 
                            className="field-input" 
                            value={formData.email || ''} 
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                    </div>
                </div>
            </div>

            {/* Bio Card */}
            <div className="edit-profile-card">
                <h3 className="section-title">
                    <i className="pi pi-file-edit"></i>
                    About Me
                </h3>
                <div className="edit-field">
                    <label className="field-label">Biography</label>
                    <InputTextarea 
                        className="field-textarea" 
                        value={formData.biography || ''} 
                        placeholder="Tell us about yourself..."
                        onChange={handleBioChange}
                        rows={4}
                    />
                </div>
            </div>

            {/* Preferences Grid */}
            <div className="edit-preferences-grid">
                <div className="edit-profile-card">
                    <div className="preference-icon">
                        <i className="pi pi-user"></i>
                    </div>
                    <div className="preference-content">
                        <span className="preference-label">Gender</span>
                        <div className="chip-selection">
                            <Chip 
                                className={`selection-chip ${formData.gender === 'Male' ? 'selected' : ''}`} 
                                label="Male" 
                                onClick={() => handleChipClick("Male")}
                            />
                            <Chip 
                                className={`selection-chip ${formData.gender === 'Female' ? 'selected' : ''}`} 
                                label="Female" 
                                onClick={() => handleChipClick("Female")} 
                            />
                            <Chip 
                                className={`selection-chip ${formData.gender === 'Other' ? 'selected' : ''}`} 
                                label="Other" 
                                onClick={() => handleChipClick("Other")}
                            />
                        </div>
                    </div>
                </div>

                <div className="edit-profile-card">
                    <div className="preference-icon">
                        <i className="pi pi-heart"></i>
                    </div>
                    <div className="preference-content">
                        <span className="preference-label">Looking for</span>
                        <div className="chip-selection">
                            <Chip 
                                className={`selection-chip ${formData.sexual_interest === 'Male' ? 'selected' : ''}`} 
                                label="Male" 
                                onClick={() => setFormData(prev => ({...prev, sexual_interest: 'Male'}))}
                            />
                            <Chip 
                                className={`selection-chip ${formData.sexual_interest === 'Female' ? 'selected' : ''}`} 
                                label="Female" 
                                onClick={() => setFormData(prev => ({...prev, sexual_interest: 'Female'}))}
                            />
                            <Chip 
                                className={`selection-chip ${formData.sexual_interest === 'Any' ? 'selected' : ''}`} 
                                label="Any" 
                                onClick={() => setFormData(prev => ({...prev, sexual_interest: 'Any'}))}
                            />
                        </div>
                    </div>
                </div>

                <div className="edit-profile-card">
                    <div className="preference-icon">
                        <i className="pi pi-map-marker"></i>
                    </div>
                    <div className="preference-content">
                        <span className="preference-label">Location</span>
                        <Button 
                            label="Update Location" 
                            loading={loadingButton} 
                            className="location-btn"
                            onClick={handleRequestLocation}
                            outlined
                        />
                    </div>
                </div>

                <div className="edit-profile-card">
                    <div className="preference-icon">
                        <i className="pi pi-star"></i>
                    </div>
                    <div className="preference-content">
                        <span className="preference-label">Minimum Fame Rating</span>
                        <div className="fame-rating-container">
                            <p className="fame-rating-description">
                                Only show users with this rating or higher
                            </p>
                            <div className="fame-rating-selector">
                                <Rating 
                                    value={Math.floor(formData.min_desired_rating / 20)}
                                    onChange={handleFameRatingChange}
                                    cancel={true}
                                    className="custom-rating"
                                    stars={5}
                                />
                                <span className="fame-rating-value">
                                    {formData.min_desired_rating === 0 ? 'Any rating' : `${formData.min_desired_rating / 20}+ star${formData.min_desired_rating / 20 > 1 ? 's' : ''}`}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Interests Card */}
            <div className="edit-profile-card">
                <h3 className="section-title">
                    <i className="pi pi-tags"></i>
                    Interests
                </h3>
                <div className="edit-field">
                    <label className="field-label">Select your interests</label>
                    <MultiSelect 
                        id='interests' 
                        className='interests-selector' 
                        value={formData.interests.map(interest => interest.name) || []} 
                        options={allInterests} 
                        onChange={(e) => handleSelectChange(e, 'interests')}
                        optionLabel="name" 
                        optionValue="name" 
                        placeholder='Choose your interests...' 
                        showSelectAll={false} 
                        showClear={true}
                    />
                </div>
                {formData.interests && formData.interests.length > 0 && (
                    <div className="selected-interests">
                        {formData.interests.map((interest) => (
                            <Chip 
                                key={interest.id}
                                className='interest-tag' 
                                label={interest.name} 
                                removable 
                                onRemove={() => handleRemoveInterest(interest.id)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Pictures Card */}
            <div className="edit-profile-card">
                <h3 className="section-title">
                    <i className="pi pi-image"></i>
                    Profile Pictures
                </h3>
                <div className="upload-section">
                    <p className="upload-description">Upload and manage your profile photos</p>
                    <Button 
                        icon="pi pi-upload" 
                        label="Change Pictures"
                        className="upload-btn"
                        onClick={() => setDisableUpload(false)}
                        outlined
                    />
                </div>
            </div>

            <PictureSelector disabled={disableUpload} onDisabledChange={handleDisableChange} />
        </div>
    );
};

export default EditProfileInfo;