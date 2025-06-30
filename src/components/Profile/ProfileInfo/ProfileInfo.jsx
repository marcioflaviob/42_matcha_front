import React, { useEffect, useContext, useState } from 'react';
import './ProfileInfo.css';
import { UserContext } from '../../../context/UserContext';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';
import InterestChip from '../../InterestChip/InterestChip';
import StarRating from '../../StarRating/StarRating';
        
const ProfileInfo = ({ userInfo }) => {
    const navigate = useNavigate();
    const {user} = useContext(UserContext);
    const [showEditButton, setShowEditButton] = useState(false);

    useEffect(() => {
        if (user && user.id == userInfo.id)
            setShowEditButton(true);
    }, [userInfo, user]);

    const handleEditButton = () => {
        navigate(`/edit-profile/`);
    }

    if (!userInfo || !user) return (
        <div className='profile-info-loading'>
            <div className="loading-skeleton"></div>
        </div>
    );

    return (
        <div className='profile-info-section'>
            {/* Header Card */}
            <div className="profile-header-card">
                <div className="profile-name-section">
                    <h1 className="profile-display-name">
                        {userInfo.first_name} {userInfo.last_name}
                    </h1>
                    <div className="profile-age-location">
                        <span className="profile-page-age">{userInfo.age} years old</span>
                        {userInfo.location && (
                            <div className="profile-location">
                                <i className="pi pi-map-marker"></i>
                                <span>{userInfo.location.city}, {userInfo.location.country}</span>
                            </div>
                        )}
                    </div>
                </div>
                {showEditButton && (
                    <Button 
                        label="Edit Profile" 
                        icon="pi pi-pencil"
                        className="edit-profile-btn"
                        onClick={handleEditButton}
                        outlined
                    />
                )}
            </div>

            {/* Bio Card */}
            {userInfo.biography && (
                <div className="profile-bio-card">
                    <h3 className="section-title">About Me</h3>
                    <p className="bio-text">{userInfo.biography}</p>
                </div>
            )}

            {/* Info Grid */}
            <div className="profile-info-grid">
                <div className="info-card">
                    <div className="info-icon">
                        <i className="pi pi-user"></i>
                    </div>
                    <div className="info-content">
                        <span className="info-label">Gender</span>
                        <InterestChip 
                            label={userInfo.gender} 
                            className="info-chip gender-chip"
                        />
                    </div>
                </div>

                <div className="info-card">
                    <div className="info-icon">
                        <i className="pi pi-heart"></i>
                    </div>
                    <div className="info-content">
                        <span className="info-label">Looking for</span>
                        <InterestChip 
                            label={userInfo.sexual_interest} 
                            className="info-chip interest-chip"
                        />
                    </div>
                </div>

                <div className="info-card">
                    <div className="info-icon">
                        <i className="pi pi-star"></i>
                    </div>
                    <div className="info-content">
                        <span className="info-label">Fame Rating</span>
                        <div className="fame-rating">
                            <div className="fame-stars">
                                <StarRating
                                    value={userInfo.rating || 0}
                                    isModifiable={false}
                                    showValue={true}
                                    className="fame-star-rating"
                                    size="small"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {userInfo.id == user.id && (
                    <div className="info-card email-card">
                        <div className="info-icon">
                            <i className="pi pi-envelope"></i>
                        </div>
                        <div className="info-content">
                            <span className="info-label">Email</span>
                            <span className="info-value">{userInfo.email}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Interests Card */}
            {userInfo.interests && userInfo.interests.length > 0 && (
                <div className="profile-interests-card">
                    <h3 className="section-title">
                        <i className="pi pi-tags" />
                        Interests
                    </h3>
                    <div className="interests-grid">
                        {userInfo.interests.map((interest) => (
                            <InterestChip 
                                key={interest.id}
                                label={interest.name} 
                                className="info-chip interest-chip"
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileInfo;