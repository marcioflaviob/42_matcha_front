import React, { useEffect, useContext, useState } from 'react';
import './ProfileInfo.css';
import { UserContext } from '../../../context/UserContext';
import { AuthContext } from '../../../context/AuthContext';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';
import InterestChip from '../../InterestChip/InterestChip';
import StarRating from '../../StarRating/StarRating';
import { Skeleton } from 'primereact/skeleton';
import axios from 'axios';
import { displayAlert } from '../../Notification/Notification';
        
const ProfileInfo = ({ userInfo }) => {
    const navigate = useNavigate();
    const { token } = useContext(AuthContext);
    const { user } = useContext(UserContext);
    const [showEditButton, setShowEditButton] = useState(false);
    const [viewHistory, setViewHistory] = useState([]);
    const [showMore, setShowMore] = useState(false);

    useEffect(() => {
        if (user && userInfo && user.id == userInfo.id)
        {
            setShowEditButton(true);
            getAllProfileView();
        }

    }, [userInfo, user]);

    const handleEditButton = () => {
        navigate(`/edit-profile/`);
    }

    const getAllProfileView = () => {
        if (userInfo)
        {
            axios.get(`${import.meta.env.VITE_API_URL}/notifications/profile-views`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then((response) => {
                setViewHistory(response.data);
            })
            .catch((error) => {
                displayAlert('Failed to fetch profile views.', error.response?.data?.message || 'Error fetching profile views');
            });
        }
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
                                <span className='profile-location-txt'>{userInfo.location.city}, {userInfo.location.country}</span>
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

            {/* View history card */}
            { userInfo && userInfo.id == user.id &&
                <div className="profile-bio-card">
                    <h3 className="section-title">
                        <i className="pi pi-history" />
                        View History
                    </h3>
                    { viewHistory.length > 0 ? (
                        <div className='view-history-container'>
                            <ul className="view-history-list">
                                {viewHistory.slice(showMore ? -10 : -5).reverse().map((view) => (
                                    <div key={view.id} className="view-history-item">
                                        <div className="view-history-user">
                                            <img 
                                                src={`${import.meta.env.VITE_BLOB_URL}/${view.pictures[0].url}`} 
                                                alt={`${view.first_name} ${view.last_name}`} 
                                                className="view-history-avatar"
                                            />
                                            <span className="view-history-name">{view.message}</span>
                                        </div>
                                    </div>
                                ))}
                            </ul>
                            { viewHistory.length > 5 && !showMore &&
                                <div className="view-history-footer">
                                    <button 
                                        className="view-all-btn" 
                                        onClick={() => setShowMore(true)}
                                    >
                                        See More
                                    </button>
                                </div>
                            }
                        </div>
                    ) : (
                        <p className="no-view-history">No one has viewed your profile yet.</p>
                    )}
                </div>
            }
        </div>
    );
};

export default ProfileInfo;