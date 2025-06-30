import React, { useEffect, useContext, useState } from 'react';
import './ProfileInfo.css';
import { UserContext } from '../../../context/UserContext';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';
import InterestChip from '../../InterestChip/InterestChip';
import StarRating from '../../StarRating/StarRating';
import { Skeleton } from 'primereact/skeleton';
        
const ProfileInfo = ({ userInfo }) => {
    const navigate = useNavigate();
    const {user} = useContext(UserContext);
    const [showEditButton, setShowEditButton] = useState(false);

    useEffect(() => {
        if (user && userInfo && user.id == userInfo.id)
            setShowEditButton(true);
    }, [userInfo, user]);

    const handleEditButton = () => {
        navigate(`/edit-profile/`);
    }

    return (
        <div className='profile-info-section'>
            {/* Header Card */}
            <div className="profile-header-card">
                <div className="profile-name-section">
                    {
                        userInfo ? 
                        <h1 className="profile-display-name">
                            {userInfo.first_name} {userInfo.last_name}
                        </h1>
                        :
                        <div style={{ marginBottom: '0.5rem' }}>
                            <Skeleton width="200px" height="3rem" />
                        </div>
                    }
                    <div className="profile-age-location">
                        {
                            userInfo ?
                            <span className="profile-page-age">{userInfo.age} years old</span>
                            :
                            <div style={{ marginBottom: '0.5rem' }}>
                                <Skeleton width="100px" height="1.5rem" />
                            </div>
                        }
                        <div className="profile-location">
                            <i className="pi pi-map-marker"></i>
                            {
                                userInfo ?
                                <span>{userInfo.location.city}, {userInfo.location.country}</span>
                                :
                                <Skeleton width="150px" height="1.5rem" />
                            }
                        </div>
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
            <div className="profile-bio-card">
                <h3 className="section-title">About Me</h3>
                {
                    userInfo ?
                    <p className="bio-text">{userInfo.biography}</p>
                    :
                    <div style={{ marginBottom: '1rem' }}>
                        <Skeleton width="100%" height="4rem" />
                    </div>
                }
            </div>

            {/* Info Grid */}
            <div className="profile-info-grid">
                <div className="info-card">
                    <div className="info-icon">
                        <i className="pi pi-user"></i>
                    </div>
                    <div className="info-content">
                        <span className="info-label">Gender</span>
                        {
                            userInfo ?
                            <InterestChip 
                                label={userInfo.gender} 
                                className="info-chip gender-chip"
                            />
                            : 
                            <div style={{ marginBottom: '0.5rem' }}>
                                <Skeleton width="100px" height="1.5rem" />
                            </div>
                        }
                    </div>
                </div>

                <div className="info-card">
                    <div className="info-icon">
                        <i className="pi pi-heart"></i>
                    </div>
                    <div className="info-content">
                        <span className="info-label">Looking for</span>
                        {
                            userInfo ?
                            <InterestChip 
                                label={userInfo.sexual_interest} 
                                className="info-chip interest-chip"
                            />
                            :
                            <div style={{ marginBottom: '0.5rem' }}>
                                <Skeleton width="100px" height="1.5rem" />
                            </div>
                        }
                    </div>
                </div>

                <div className="info-card">
                    <div className="info-icon">
                        <i className="pi pi-star"></i>
                    </div>
                    <div className="info-content">
                        <span className="info-label">Fame Rating</span>
                        <div className="fame-rating">
                            <span className="fame-score">{userInfo?.rating || 0}</span>
                            <div className="fame-stars">
                                <StarRating
                                    value={userInfo?.rating || 0}
                                    isModifiable={false}
                                    showValue={true}
                                    className="fame-star-rating"
                                    size="small"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {userInfo?.id == user?.id && (
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
            <div className="profile-interests-card">
                <h3 className="section-title">
                    <i className="pi pi-tags" />
                    Interests
                </h3>
                {
                    userInfo ?
                    <div className="interests-grid">
                        {userInfo.interests.map((interest) => (
                            <InterestChip 
                                key={interest.id}
                                label={interest.name} 
                                className="info-chip interest-chip"
                            />
                        ))}
                    </div>
                    :
                    <div style={{ marginBottom: '0.5rem' }}>
                        <Skeleton width="100%" height="2rem" />
                    </div>
                }
            </div>
        </div>
    );
};

export default ProfileInfo;