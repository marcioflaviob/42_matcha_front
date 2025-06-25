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
import StarRating from '../../StarRating/StarRating';
import PictureSelector from '../../PictureSelector/PictureSelector';
import AskLocation from '../../Location/AskLocation/AskLocation';

const EditProfileForm = ({ shadowUser, setShadowUser }) => {
    const navigate = useNavigate();
    const { token } = useContext(AuthContext);
    const { user, setUser } = useContext(UserContext);
    const [allInterests, setAllInterests] = useState(null);
    const [openPictureSelector, setOpenPictureSelector] = useState(false);
    const { setLocation } = AskLocation(true);
    const [loadingButton, setLoadingButton] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleFieldChange = useCallback((field) => (e) => {
        const value = e.target.value;
        setShadowUser(prev => ({ ...prev, [field]: value }));
    }, [setShadowUser]);

    const handleSelection = useCallback((field, value) => {
        setShadowUser(prev => ({ ...prev, [field]: value }));
    }, [setShadowUser]);

    const handleRemoveInterest = (interestId) => {
        const array = shadowUser.interests.filter(item => item.id !== interestId);
        setShadowUser(prev => ({ ...prev, interests: array }));
    };

    const handleSelectChange = (e, field) => {
        const value = e.target.value;
        const valueSet = new Set(value);
        const changes = allInterests.filter(interest => valueSet.has(interest.name));
        setShadowUser(prev => ({ ...prev, interests: changes }));
    };

    const handleRequestLocation = async (e) => {
        e.preventDefault();
        setLoadingButton(true);
        await setLocation(user.id, token);
        setLoadingButton(false);
    };

    const handleRatingChange = (newRating) => {
        setShadowUser(prev => ({ ...prev, min_desired_rating: newRating }));
    };

    const updateUser = async () => {
        try {
            let payload = { ...shadowUser };
            if (shadowUser.email.trim() == user.email) delete payload.email;
            delete payload.status;

            const response = await axios.put(`${import.meta.env.VITE_API_URL}/update-user`, payload, {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true,
            });
            
            if (response.data) {
                setUser(response.data);
                displayAlert('success', 'Profile updated successfully');
                setTimeout(() => {
                    navigate(`/profile/${response.data.id}`);
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
            if (shadowUser.email !== user.email) {
                shadowUser.status = 'validation';
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
        const fetchData = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/interests`);
                setAllInterests(response.data);
            } catch (err) {
                displayAlert('error', 'Error fetching information');
                console.error('Error fetching information:', err);
            }
        };

        fetchData();
    }, []);

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
                    <i className="pi pi-user" />
                    {' '}Personal Information
                </h3>
                <div className="form-field-group">
                    <div className="form-field-row">
                        <div className="form-field">
                            <label>First Name</label>
                            <InputText 
                                value={shadowUser.first_name || ''} 
                                onChange={handleFieldChange('first_name')}
                                placeholder="Enter your first name"
                            />
                        </div>
                        <div className="form-field">
                            <label>Last Name</label>
                            <InputText 
                                value={shadowUser.last_name || ''} 
                                onChange={handleFieldChange('last_name')}
                                placeholder="Enter your last name"
                            />
                        </div>
                    </div>
                    <div className="form-field">
                        <label>Email</label>
                        <InputText 
                            type="email"
                            value={shadowUser.email || ''} 
                            onChange={handleFieldChange('email')}
                            placeholder="Enter your email"
                        />
                    </div>
                    <div className="form-field">
                        <label>Biography</label>
                        <InputTextarea 
                            value={shadowUser.biography || ''} 
                            onChange={handleFieldChange('biography')}
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
                    <i className="pi pi-heart" />
                    {' '}Preferences
                </h3>
                <div className="form-field-group">
                    <div className="form-field">
                        <label>I am a</label>
                        <div className="chip-selection-group">
                            {['Male', 'Female', 'Other'].map(gender => (
                                <Chip
                                    key={gender}
                                    label={gender}
                                    className={`selection-chip ${shadowUser.gender === gender ? 'selected' : ''}`}
                                    onClick={() => handleSelection('gender', gender)}
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
                                    className={`selection-chip ${shadowUser.sexual_interest === interest ? 'selected' : ''}`}
                                    onClick={() => handleSelection('sexual_interest', interest)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Interests */}
            <div className="edit-form-card">
                <h3>
                    <i className="pi pi-tags" />
                    {' '}Interests
                </h3>
                <div className="form-field-group">
                    <div className="form-field">
                        <label>Select your interests</label>
                        <MultiSelect 
                            value={shadowUser.interests.map(interest => interest.name) || []} 
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
                    {shadowUser.interests.length > 0 && (
                        <div className="interests-display">
                            {shadowUser.interests.map((interest) => (
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
                    <i className="pi pi-map-marker" />
                    {' '}Location & Photos
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
                        <PictureSelector 
                            showDialog={openPictureSelector} 
                            setShowDialog={setOpenPictureSelector}
                        />
                    </div>
                </div>
            </div>

            {/* Minimum Fame Rating */}
            <div className="edit-form-card">
                <h3>
                    <i className="pi pi-star" />
                    {' '}Minimum Fame Rating
                </h3>
                <div className="form-field-group">
                    <div className="form-field">
                        <StarRating 
                            value={shadowUser.min_desired_rating || 0}
                            isModifiable={true}
                            onChange={handleRatingChange}
                            showValue={true}
                            size="medium"
                        />
                        <small className="rating-help-text">
                            Set the minimum fame rating you're interested in (0-100). Each star equals 20 points.
                        </small>
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
        </div>
    );
};

export default EditProfileForm;