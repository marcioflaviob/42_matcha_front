import './PictureSelector.css';
import React, { useEffect, useContext, useState, useCallback, useRef } from 'react';
import 'primeicons/primeicons.css';
import { UserContext } from '../../context/UserContext';
import { displayAlert } from '../Notification/Notification';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import PreviewItem from './PreviewItem';

const PictureSelector = ({ showDialog, setShowDialog }) => {
    const { token } = useContext(AuthContext);
    const { user, setUser } = useContext(UserContext);
    const [previews, setPreviews] = useState([]);
    const [profilePicture, setProfilePicture] = useState(null);
    const [urlInput, setUrlInput] = useState('');
    const [isUrlLoading, setIsUrlLoading] = useState(false);
    const fileInputRef = useRef(null);
    const uploadUrl = import.meta.env.VITE_API_URL + "/upload/single/";

    const handleDragEnter = useCallback((e) => handleDragEvent(e), []);
    const handleDragLeave = useCallback((e) => handleDragEvent(e), []);
    const handleDragOver = useCallback((e) => handleDragEvent(e), []);

    const handleDragEvent = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const triggerFileInput = () => {
        if (previews.length >= 5) {
            displayAlert('error', 'Cannot have more than 5 pictures');
            return;
        }
        fileInputRef.current.click();
    };

    const handleDrop = useCallback((e) => {
        handleDragEvent(e);
        if (previews.length >= 5) {
            displayAlert('error', 'Cannot have more than 5 pictures');
            return;
        }
        const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
        if (files.length === 0) {
            displayAlert('error', 'Please drop only image files');
            return;
        }
        addPreviews(files);
    }, [previews]);

    const addPreviews = (files) => {
        const remainingSlots = 5 - previews.length;
        const filesToAdd = files.slice(0, remainingSlots);
        
        const newPreviews = filesToAdd.map(file => ({
            id: URL.createObjectURL(file),
            url: URL.createObjectURL(file),
            file,
            name: file.name,
        }));
        
        const updatedPreviews = [...previews, ...newPreviews];
        setPreviews(updatedPreviews);
        
        // Auto-set first uploaded image as profile picture if none is set
        if (!profilePicture && updatedPreviews.length > 0) {
            setProfilePicture(updatedPreviews[0]);
        }
    };

    useEffect(() => {
        console.log('User context updated:', user);
    }, [user]);

    const handleUpload = async () => {
        if (previews.every(preview => !preview.file)) return;

        try {
            await uploadFiles();
            await handleDelete();
            resetState();
        } catch (error) {
            console.error('Error:', error);
            displayAlert('error', 'An error occurred. Please try again later.');
        }
    };

    const uploadFiles = async () => {
        for (const file of previews) {
            if (!file.file) continue;

            const payload = new FormData();
            payload.append('isProfilePicture', file === profilePicture);
            payload.append('picture', file.file);

            const result = await axios.post(uploadUrl, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
                withCredentials: true,
            });

            setUser(prev => ({
                ...prev,
                pictures: [...prev.pictures, result.data],
                is_profile: file === profilePicture,
            }));
        }
    };

    const resetState = () => {
        setPreviews([]);
        setProfilePicture(null);
        setShowDialog(false);
    };

    const handleUploadClick = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) addPreviews(files);
        e.target.value = null;
    };

    const handleXButton = async (preview) => {
        if (previews.length === 1) {
            displayAlert('error', 'You need to have at least 1 picture');
            return;
        }

        if (!preview.file) {
            try {
                await axios.delete(`${import.meta.env.VITE_API_URL}/pictures/${preview.user_id}/${preview.id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true,
                });
                setUser(prev => ({
                    ...prev,
                    pictures: prev.pictures.filter(pic => pic.id !== preview.id),
                }));
                setPreviews(prev => prev.filter(p => p.id !== preview.id));
            } catch (error) {
                displayAlert('error', 'Error deleting file');
                return;
            }
        }

        // If deleted picture was profile picture, set first remaining as profile
        if (profilePicture === preview && updatedPreviews.length > 0) {
            setProfilePicture(updatedPreviews[0]);
        } else if (profilePicture === preview) {
            setProfilePicture(null);
        }
    };

    const handleSetProfilePicture = (preview) => {
        setProfilePicture(preview);
    };

    const handleImportFromUrl = async () => {
        if (!urlInput.trim()) {
            displayAlert('error', 'Please enter a valid image URL');
            return;
        }
        setIsUrlLoading(true);
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/pictures/upload-from-url`,
                { url: urlInput.trim() },
                {
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true,
                }
            );
            if (response.data) {
                const newPic = response.data;
                setPreviews(prev => [...prev, newPic]);
                setUser(prev => ({
                    ...prev,
                    pictures: [...prev.pictures, newPic],
                }));
                if (!profilePicture && updatedPreviews.length > 0) {
                    setProfilePicture(updatedPreviews[0]);
                }
                setUrlInput('');
                displayAlert('success', 'Photo imported successfully!');
            }
        } catch (error) {
            console.error('Error importing photo from URL:', error);
            displayAlert('error', error.response?.data?.message || 'Failed to import photo from URL');
        } finally {
            setIsUrlLoading(false);
        }
    };

    useEffect(() => {
        if (showDialog && user?.pictures) {
            setPreviews(user.pictures);
            // Find current profile picture
            const currentProfile = user.pictures.find(pic => pic.is_profile);
            setProfilePicture(currentProfile || user.pictures[0] || null);
        }
    }, [showDialog]);

    if (!showDialog || !user) {
        return null;
    }

    return (
        <Dialog 
            visible={showDialog} 
            onHide={() => setShowDialog(false)} 
            className="picture-selector-dialog"
            header={
                <div className="dialog-header">
                    <i className="pi pi-images"></i>
                    Manage Your Photos
                </div>
            }
            style={{ width: '90vw', maxWidth: '900px' }}
            modal
        >
            <div className="picture-selector-content">

                {/* Upload Section Card */}
                <div className="upload-card">
                    <h3>
                        <i className="pi pi-cloud-upload"></i>
                        Upload New Photos
                    </h3>
                    <div 
                        className="upload-drop-zone"
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onClick={triggerFileInput}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            onChange={handleUploadClick}
                            multiple
                            accept="image/*"
                            style={{ display: 'none' }}
                        />
                        <i className="pi pi-upload upload-icon"></i>
                        <p className="upload-text">Click or drag and drop images here</p>
                        <small className="upload-limit">Maximum 5 photos ({previews.length}/5)</small>
                    </div>
                </div>

                {/* Import from URL Card */}
                <div className="upload-card" style={{ opacity: previews.length >= 5 ? 0.5 : 1 }}>
                    <h3>
                        <i className="pi pi-link"></i>
                        Import from social media
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <input
                            type="text"
                            className="p-inputtext"
                            placeholder="Paste image URL here..."
                            value={urlInput}
                            onChange={e => setUrlInput(e.target.value)}
                            disabled={previews.length >= 5 || isUrlLoading}
                            style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #e9f5f0', fontSize: '1rem' }}
                        />
                        <Button
                            label={isUrlLoading ? 'Importing...' : 'Import Photo'}
                            icon="pi pi-arrow-down"
                            className="action-button save-button"
                            onClick={handleImportFromUrl}
                            disabled={previews.length >= 5 || isUrlLoading}
                        />
                        <small className="upload-limit">Maximum 5 photos ({previews.length}/5)</small>
                    </div>
                </div>

                {/* Photos Grid Card */}
                <div className="photos-card">
                    <h3>
                        <span>
                            <i className="pi pi-images" style={{marginRight: '0.5rem'}} ></i>
                            Your Photos
                        </span>
                        {profilePicture && (
                            <span className="profile-indicator">
                                <i className="pi pi-star-fill"></i>
                                Profile picture selected
                            </span>
                        )}
                    </h3>
                    
                    {previews.length > 0 ? (
                        <div className="photos-grid">
                            {previews.map(preview => (
                                <PreviewItem
                                    key={preview.id}
                                    preview={preview}
                                    isProfilePicture={profilePicture === preview}
                                    onRemove={handleXButton}
                                    onSetProfile={handleSetProfilePicture}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="no-photos">
                            <i className="pi pi-image"></i>
                            <p>No photos uploaded yet</p>
                            <small>Upload at least one photo to continue</small>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="dialog-actions">
                    <Button 
                        label="Cancel" 
                        icon="pi pi-times"
                        className="action-button cancel-button"
                        onClick={() => setShowDialog(false)}
                        outlined
                    />
                    <Button 
                        label="Save Changes" 
                        icon="pi pi-check"
                        className="action-button save-button"
                        onClick={handleUpload}
                        disabled={previews.length === 0 || previews.every(preview => !preview.file)}
                    />
                </div>
            </div>
        </Dialog>
    );
};

export default PictureSelector;