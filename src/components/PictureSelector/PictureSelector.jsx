import './PictureSelector.css';
import React, { useEffect, useContext, useState, useCallback, useRef } from 'react';
import 'primeicons/primeicons.css';
import { UserContext } from '../../context/UserContext';
import { displayAlert } from '../Notification/Notification';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const PictureSelector = ({ disabled, onDisabledChange }) => {
    const { token } = useContext(AuthContext);
    const { user, setUser } = useContext(UserContext);
    const [isDisabled, setIsDisabled] = useState(disabled);
    const [previews, setPreviews] = useState([]);
    const [deletedPictures, setDeletedPictures] = useState([]);
    const [profilePicture, setProfilePicture] = useState(null);
    const fileInputRef = useRef(null);
    const uploadUrl = import.meta.env.VITE_API_URL + "/upload/single/";

    // Drag event handlers
    const handleDragEnter = useCallback((e) => handleDragEvent(e), []);
    const handleDragLeave = useCallback((e) => handleDragEvent(e), []);
    const handleDragOver = useCallback((e) => handleDragEvent(e), []);

    const handleDragEvent = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const triggerFileInput = () => {
        if (previews.length === 5) {
            displayAlert('error', 'Cannot have more than 5 pictures');
            return;
        }
        fileInputRef.current.click();
    };

    const handleDrop = useCallback((e) => {
        handleDragEvent(e);
        if (previews.length === 5) {
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
        const newPreviews = files.map(file => ({
            id: URL.createObjectURL(file),
            url: URL.createObjectURL(file),
            file,
            name: file.name,
        }));
        setPreviews(prev => [...prev, ...newPreviews]);
    };

    const handleDelete = async () => {
        try {
            for (const file of deletedPictures) {
                await axios.delete(`${import.meta.env.VITE_API_URL}/pictures/${file.user_id}/${file.id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true,
                });
                setUser(prev => ({
                    ...prev,
                    pictures: prev.pictures.filter(p => p.id !== file.id),
                }));
            }
        } catch (error) {
            console.error('Error deleting file:', error);
            displayAlert('error', 'Error deleting file');
        }
    };

    const handleUpload = async () => {
        if (previews.every(preview => !preview.file) && deletedPictures.length === 0) return;

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
        setDeletedPictures([]);
        setPreviews([]);
        const newValue = !disabled;
        onDisabledChange(newValue);
        setIsDisabled(true);
    };

    const handleUploadClick = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) addPreviews(files);
        e.target.value = null; // Reset input to allow selecting the same files again
    };

    const handleXButton = (preview) => {
        if (previews.length === 1) {
            displayAlert('error', 'You need to have at least 1 picture');
            return;
        }
        if (!preview.file) setDeletedPictures(prev => [...prev, preview]);
        setPreviews(prev => prev.filter(p => p.id !== preview.id));
        setProfilePicture(previews[0]);
    };

    useEffect(() => {
        setPreviews(user.pictures);
        setIsDisabled(disabled);
    }, [disabled, user]);

    if (isDisabled || !user) {
        return <div></div>;
    }

    return (
        <div
            className="outerSelectorDiv"
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <div className="blurDiv" onClick={resetState}></div>
            <div className="outerMenuSelector">
                <div className="outerUploadDiv">
                    <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleUploadClick}
                        multiple
                        style={{ display: 'none' }}
                    />
                    <i className="pi pi-upload uploadButtonSelector" onClick={triggerFileInput}></i>
                    <div className="uploadTextSelector">Click or drag and drop</div>
                </div>
                <div className="previewSelectorDiv">
                    {previews?.map(preview => (
                        <PreviewItem
                            key={preview.id}
                            preview={preview}
                            handleXButton={handleXButton}
                        />
                    ))}
                </div>
            </div>
            <div
                className={
                    previews.every(preview => !preview.file) && deletedPictures.length === 0
                        ? 'buttonSaveSelectorDisabled'
                        : 'buttonSaveSelector'
                }
                onClick={handleUpload}
            >
                Save
            </div>
        </div>
    );
};

const PreviewItem = ({ preview, handleXButton }) => (
    <div className="preview-container">
        <div onClick={() => handleXButton(preview)} className="remove-preview-btn">
            ×
        </div>
        <img
            src={preview.file ? preview.url : `${import.meta.env.VITE_BLOB_URL}/${preview.url}`}
            alt={`Preview - ${preview.name}`}
            className="imagePreviewSelector"
        />
    </div>
);

export default PictureSelector;