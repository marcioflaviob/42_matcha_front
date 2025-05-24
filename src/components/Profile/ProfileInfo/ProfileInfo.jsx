import React, { useEffect, useContext, useState } from 'react';
import './ProfileInfo.css';
import { Chip } from 'primereact/chip';
import { UserContext } from '../../../context/UserContext';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';
import 'primeicons/primeicons.css';
        
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

    const calculateAge = (birthdate) => {
        const today = new Date();
        const birth = new Date(birthdate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

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
                        <span className="profile-page-age">{calculateAge(userInfo.birthdate)} years old</span>
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
                        <Chip 
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
                        <Chip 
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
                            <span className="fame-score">{userInfo.fame_rating || 69}</span>
                            <div className="fame-stars">
                                {[...Array(5)].map((_, i) => (
                                    <i 
                                        key={i}
                                        className={`pi pi-star${i < Math.floor((userInfo.fame_rating || 69) / 20) ? '-fill' : ''}`}
                                    ></i>
                                ))}
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
                            <Chip 
                                key={interest.id}
                                label={interest.name} 
                                className="interest-tag"
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileInfo;