import React, { useState, useEffect, useContext, useCallback } from 'react';
import './EditProfileForm.css';
import axios from 'axios';
import { Chip } from 'primereact/chip';
import { UserContext } from '../../../context/UserContext';
import { displayAlert } from "../../Notification/Notification";
import { MultiSelect } from 'primereact/multiselect';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import { Button } from 'primereact/button';
import PictureSelector from '../../PictureSelector/PictureSelector';
import AskLocation from '../../Location/AskLocation/AskLocation';

const EditProfileForm = ({ shadowUser, setShadowUser }) => {
    const navigate = useNavigate();
    const { token } = useContext(AuthContext);
    const { user, setUser } = useContext(UserContext);
    const [allInterests, setAllInterests] = useState(null);
    const [showUploadDialog, setShowUploadDialog] = useState(false);
    const { setLocation } = AskLocation();
    const [loadingButton, setLoadingButton] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
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

    const handleFirstNameChange = useCallback((e) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, first_name: value }));
        setShadowUser(prev => ({ ...prev, first_name: value }));
    }, [setShadowUser]);

    const handleLastNameChange = useCallback((e) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, last_name: value }));
        setShadowUser(prev => ({ ...prev, last_name: value }));
    }, [setShadowUser]);

    const handleBioChange = useCallback((e) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, biography: value }));
        setShadowUser(prev => ({ ...prev, biography: value }));
    }, [setShadowUser]);

    const handleEmailChange = useCallback((e) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, email: value }));
    }, []);

    const handleGenderSelect = (gender) => {
        setFormData(prev => ({ ...prev, gender }));
        setShadowUser(prev => ({ ...prev, gender }));
    };

    const handleSexualInterestSelect = (sexual_interest) => {
        setFormData(prev => ({ ...prev, sexual_interest }));
        setShadowUser(prev => ({ ...prev, sexual_interest }));
    };

    const handleRemoveInterest = (interestId) => {
        const array = formData.interests.filter(item => item.id !== interestId);
        setFormData(prevData => ({ ...prevData, interests: array }));
        setShadowUser(prev => ({ ...prev, interests: array }));
    };

    const handleSelectChange = (e, field) => {
        const value = e.target.value;
        const valueSet = new Set(value);
        const changes = allInterests.filter(interest => valueSet.has(interest.name));
        setFormData(prevData => ({ ...prevData, [field]: changes }));
        setShadowUser(prev => ({ ...prev, interests: changes }));
    };

    const handleRequestLocation = async (e) => {
        e.preventDefault();
        setLoadingButton(true);
        await setLocation(user.id, token);
        setLoadingButton(false);
    };

    const updateUser = async () => {
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/update-user`, formData, {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true,
            });
            
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
            setIsLoading(true);
            if (formData.email !== user.email) {
                formData.status = 'validation';
            }
            await updateUser();
        } catch (error) {
            console.error('Error updating profile:', error);
            displayAlert('error', 'Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        navigate(`/profile/${user.id}`);
    };

    useEffect(() => {
        if (!user) return;
        const fetchData = async () => {
            setFormData(prevData => ({
                ...prevData,
                interests: user.interests,
                gender: user.gender,
                sexual_interest: user.sexual_interest,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                biography: user.biography,
                location: user.location,
            }));
            
            // TODO: Why is it necessary to fetch interests?
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/interests`);
                setAllInterests(response.data);
            } catch (err) {
                displayAlert('error', 'Error fetching information');
                console.error('Error fetching information:', err);
            }
        };
        // TODO: Why is it necessary to refetch data?
        fetchData();
    }, [user, showUploadDialog]);

    useEffect(() => {
        if (user) {
            setShadowUser(prev => ({ 
                ...user, 
                interests: formData.interests, 
                location: formData.location,
                first_name: formData.first_name,
                last_name: formData.last_name,
                biography: formData.biography,
                gender: formData.gender,
                sexual_interest: formData.sexual_interest
            }));
        }
    }, [user, formData, setShadowUser]);

    useEffect(() => {
        if (user?.location) {
            setShadowUser(prevData => ({
                ...prevData,
                location: { 
                    latitude: user?.location?.latitude, 
                    longitude: user?.location?.longitude,
                    city: user?.location?.city,
                    country: user?.location?.country 
                },
            }));
        }
    }, [user?.location, setShadowUser]);

    if (!user || !allInterests) return (
        <div className="edit-form-loading">
            <div className="loading-spinner"></div>
            <p>Loading profile data...</p>
        </div>
    );

    return (
        <div className="edit-profile-form">
            {/* Header */}
            <div className="edit-profile-header">
                <h1 className="edit-profile-title">Edit Profile</h1>
                <p className="edit-profile-subtitle">
                    Update your information and see the changes in real-time
                </p>
            </div>

            {/* Personal Information */}
            <div className="edit-form-card">
                <h3>
                    <i className="pi pi-user"></i>
                    Personal Information
                </h3>
                <div className="form-field-group">
                    <div className="form-field-row">
                        <div className="form-field">
                            <label>First Name</label>
                            <InputText 
                                value={formData.first_name || ''} 
                                onChange={handleFirstNameChange}
                                placeholder="Enter your first name"
                            />
                        </div>
                        <div className="form-field">
                            <label>Last Name</label>
                            <InputText 
                                value={formData.last_name || ''} 
                                onChange={handleLastNameChange}
                                placeholder="Enter your last name"
                            />
                        </div>
                    </div>
                    <div className="form-field">
                        <label>Email</label>
                        <InputText 
                            type="email"
                            value={formData.email || ''} 
                            onChange={handleEmailChange}
                            placeholder="Enter your email"
                        />
                    </div>
                    <div className="form-field">
                        <label>Biography</label>
                        <InputTextarea 
                            value={formData.biography || ''} 
                            onChange={handleBioChange}
                            placeholder="Tell others about yourself..."
                            rows={4}
                            autoResize
                        />
                    </div>
                </div>
            </div>

            {/* Preferences */}
            <div className="edit-form-card">
                <h3>
                    <i className="pi pi-heart"></i>
                    Preferences
                </h3>
                <div className="form-field-group">
                    <div className="form-field">
                        <label>I am a</label>
                        <div className="chip-selection-group">
                            {['Male', 'Female', 'Other'].map(gender => (
                                <Chip
                                    key={gender}
                                    label={gender}
                                    className={`selection-chip ${formData.gender === gender ? 'selected' : ''}`}
                                    onClick={() => handleGenderSelect(gender)}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="form-field">
                        <label>I'm looking for</label>
                        <div className="chip-selection-group">
                            {['Male', 'Female', 'Any'].map(interest => (
                                <Chip
                                    key={interest}
                                    label={interest}
                                    className={`selection-chip ${formData.sexual_interest === interest ? 'selected' : ''}`}
                                    onClick={() => handleSexualInterestSelect(interest)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Interests */}
            <div className="edit-form-card">
                <h3>
                    <i className="pi pi-tags"></i>
                    Interests
                </h3>
                <div className="form-field-group">
                    <div className="form-field">
                        <label>Select your interests</label>
                        <MultiSelect 
                            value={formData.interests.map(interest => interest.name) || []} 
                            options={allInterests} 
                            onChange={(e) => handleSelectChange(e, 'interests')}
                            optionLabel="name" 
                            optionValue="name" 
                            placeholder="Choose your interests" 
                            showSelectAll={false} 
                            showClear={true}
                            maxSelectedLabels={3}
                        />
                    </div>
                    {formData.interests.length > 0 && (
                        <div className="interests-display">
                            {formData.interests.map((interest) => (
                                <Chip
                                    key={interest.id}
                                    label={interest.name}
                                    className="interest-tag"
                                    removable
                                    onRemove={() => handleRemoveInterest(interest.id)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Location & Photos */}
            <div className="edit-form-card">
                <h3>
                    <i className="pi pi-map-marker"></i>
                    Location & Photos
                </h3>
                <div className="form-field-group">
                    <div className="form-field">
                        <label>Location</label>
                        <Button 
                            label="Update Location" 
                            icon="pi pi-map-marker"
                            loading={loadingButton} 
                            onClick={handleRequestLocation}
                            className="location-button"
                            outlined
                        />
                    </div>
                    <div className="form-field">
                        <label>Profile Photos</label>
                        <div className="upload-section" onClick={() => setShowUploadDialog(true)}>
                            <i className="pi pi-camera"></i>
                            <p>Click to update your photos</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="edit-actions-section">
                <Button 
                    label="Cancel" 
                    icon="pi pi-times"
                    className="edit-action-button cancel-button"
                    onClick={handleCancel}
                    outlined
                />
                <Button 
                    label="Save Changes" 
                    icon="pi pi-check"
                    className="edit-action-button save-button"
                    onClick={handleSave}
                    loading={isLoading}
                />
            </div>

            <PictureSelector 
                showDialog={showUploadDialog} 
                setShowDialog={setShowUploadDialog}
            />
        </div>
    );
};

export default EditProfileForm;