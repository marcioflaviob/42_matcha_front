import React from 'react';
import './PreviewItem.css';
import './PictureSelector.css'
import { Button } from 'primereact/button';

const PreviewItem = ({ preview, isProfilePicture, onRemove, onSetProfile }) => {
    return (
        <div className="photo-item">
            <div className="photo-container">
                <img
                    src={preview.file ? preview.url : `${import.meta.env.VITE_BLOB_URL}/${preview.url}`}
                    alt={`Preview - ${preview.name || 'photo'}`}
                    className="photo-image"
                />
                <div className="photo-overlay">
                    <Button
                        icon="pi pi-times"
                        className="remove-photo-btn"
                        onClick={() => onRemove(preview)}
                        rounded
                        text
                    />
                    <Button
                        icon={isProfilePicture ? "pi pi-star-fill" : "pi pi-star"}
                        className={`profile-star-btn ${isProfilePicture ? 'active' : ''}`}
                        onClick={() => onSetProfile(preview)}
                        rounded
                        text
                        tooltip={isProfilePicture ? "Profile picture" : "Set as profile picture"}
                        tooltipOptions={{ position: 'top' }}
                    />
                </div>
                {isProfilePicture && (
                    <div className="profile-badge">
                        <i className="pi pi-star-fill" />
                        {' '}Profile
                    </div>
                )}
            </div>
            {preview.name && (
                <p className="photo-name">{preview.name}</p>
            )}
        </div>
)};

export default PreviewItem;