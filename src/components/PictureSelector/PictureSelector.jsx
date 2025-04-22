import './PictureSelector.css';
import React, { useEffect, useContext, useState, useCallback, useRef } from 'react';
import 'primeicons/primeicons.css';
import { UserContext } from '../../context/UserContext';
import { displayAlert } from '../Notification/Notification';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useRefresh } from "../../context/RefreshContext";

const PictureSelector = ({disabled, onDisabledChange}) => {
    const { token } = useContext(AuthContext);
    const [isDragging, setIsDragging] = useState(false);
    const [isDisabled, setIsDisabled] = useState(disabled);
    const [previews, setPreviews] = useState([]);
    const [deletedPictures, setDeletedPictures] = useState([]);
    const [profilePicture, setProfilePicture] = useState(null);
    const uploadUrl = import.meta.env.VITE_API_URL + "/upload/single/";
    const fileInputRef = useRef(null);
    const { user } = useContext(UserContext);
    const { triggerRefresh } = useRefresh();

    // Handle drag events
    const handleDragEnter = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);
  
    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);
  
    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const triggerFileInput = () => {
        if (previews.length == 5)
        {
            displayAlert('error', 'Cannot have more than 5 pictures');
            return;
        }
        fileInputRef.current.click();
    };
  
    // Process dropped files
    const handleDrop = useCallback((e) => {
        if (previews.length == 5)
        {
            displayAlert('error', 'Cannot have more than 5 pictures');
            return;
        }
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
      
        const files = Array.from(e.dataTransfer.files)
          .filter(file => file.type.startsWith('image/')); // Only accept images
      
        if (files.length === 0) {
          displayAlert('error', 'Please drop only image files');
          return;
        }
      
        // Process all dropped files
        const newPreviews = files.map(file => {
          return {
            id: URL.createObjectURL(file), // Use URL as unique ID
            url: URL.createObjectURL(file), // Create preview URL
            file, // Store original file for upload
            name: file.name
          };
        });
      
        setPreviews(prev => [...prev, ...newPreviews]);
    }, []);

    const handleDelete = async () =>
    {
        try {
            deletedPictures.forEach(async (file) =>
            {
                await axios.delete(`${import.meta.env.VITE_API_URL}/pictures/${file.user_id}/${file.id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    withCredentials: true,
                })
            })
        } catch (error) {
            console.error('Error uploading file:', error);
            displayAlert('error', 'Error deleting file');
        }
    }

    const handleUpload = async () => {
        if (previews.every(preview => !preview.file) && deletedPictures.length === 0)
            return;
        try {
            previews.forEach(async (file) => {
                if (!file.file)
                {

                }
                else
                {
                    const payload = new FormData();
                    payload.append('isProfilePicture', file === profilePicture);
                    payload.append('picture', file.file);
                    console.log(payload);
                    axios.post(uploadUrl, payload, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'multipart/form-data',
                        },
                        withCredentials: true,
                    })
                    .catch((error) => {
                        console.error('Error uploading file:', error);
                        displayAlert('error', 'Error uploading file');
                    });
                }
            });
        } catch (error) {
            console.error('Error:', error);
            displayAlert('error', 'An error occurred. Please try again later.');
        } finally {
            setTimeout(async () =>
            {
                await handleDelete();
                handleClick();
            }, 500)
        }
    };

    const handleUploadClick = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
        //   console.log('Selected files:', files);
          // Process your files here
        }
        const newPreviews = files.map(file => {
            return {
              id: URL.createObjectURL(file), // Use URL as unique ID
              url: URL.createObjectURL(file), // Create preview URL
              file, // Store original file for upload
              user_id: user.id,
              name: file.name
            };
        });
        
        setPreviews(prev => [...prev, ...newPreviews]);
        // Reset the input to allow selecting the same files again
        e.target.value = null;
    };

    useEffect(() => {
        setPreviews(user.pictures);
        setIsDisabled(disabled);
        // console.log(previews);
        // console.log(deletedPictures);
    }, [disabled, user]);

    const handleClick = async () => {
        await triggerRefresh();
        setDeletedPictures([]);
        setPreviews([]);
        const newValue = !disabled;
        onDisabledChange(newValue);
        setIsDisabled(true);
    };

    if (isDisabled || !user)
    {
        return (
            <div>

            </div>
        )
    }

    const handleXButton = (preview) =>
    {
        if (previews.length == 1)
        {
            displayAlert('error', 'You need to have at list 1 picture');
            return;
        }
        if (!preview.file)
            setDeletedPictures(prev => [...prev, preview]);
        setPreviews(prev => prev.filter(p => p.id !== preview.id));
        setProfilePicture(previews[0]);
    }
    
    return (
        <div className="outerSelectorDiv" onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop}>
            <div className="blurDiv" onClick={handleClick}></div>
            <div className="outerMenuSelector">
                <div className='outerUploadDiv'>
                    <input ref={fileInputRef} type="file" onChange={handleUploadClick} multiple style={{ display: 'none' }}/>
                    <i className="pi pi-upload uploadButtonSelector" onClick={triggerFileInput}>
                    </i>
                    <div className='uploadTextSelector'>Click or drag and drop</div>
                </div>
                <div className='previewSelectorDiv'>
                    {previews?.map(preview => (
                        <div key={preview.id} className="preview-container">
                            <div  onClick={() => handleXButton(preview)} className="remove-preview-btn" >
                            ×
                            </div>
                            <img src={preview.file ? preview.url : `${import.meta.env.VITE_BLOB_URL}/${preview.url}`} alt={`Preview - ${preview.name}`} className="imagePreviewSelector" />
                        </div>
                    ))}
                </div>
            </div>
            <div className={previews.every(preview => !preview.file) && deletedPictures.length === 0 ? 'buttonSaveSelectorDisabled' : 'buttonSaveSelector'} disabled={previews.every(preview => !preview.file)} onClick={handleUpload}>Save</div>
        </div>
    )
};

export default PictureSelector;