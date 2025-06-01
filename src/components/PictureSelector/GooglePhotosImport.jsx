import React, { useState, useEffect, useContext } from 'react';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { AuthContext } from '../../context/AuthContext';
import { displayAlert } from '../Notification/Notification';
import './GooglePhotosImport.css';

const GooglePhotosImport = ({ onImport, maxPhotos, disabled }) => {
    const { token } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
    const [accessToken, setAccessToken] = useState(null);
    const [tokenClient, setTokenClient] = useState(null);

    useEffect(() => {
        loadGoogleAPI();
    }, []);

    const loadGoogleAPI = () => {
        // Load Google Identity Services script
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.onload = initializeGoogleIdentity;
        script.onerror = () => {
            displayAlert('error', 'Failed to load Google API');
        };
        document.head.appendChild(script);

        // Load Google API for picker
        const pickerScript = document.createElement('script');
        pickerScript.src = 'https://apis.google.com/js/api.js';
        pickerScript.onload = () => {
            window.gapi.load('picker', () => {
                setIsGoogleLoaded(true);
            });
        };
        document.head.appendChild(pickerScript);
    };

    const initializeGoogleIdentity = () => {
        if (window.google && window.google.accounts) {
            const client = window.google.accounts.oauth2.initTokenClient({
                client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                scope: 'https://www.googleapis.com/auth/photoslibrary.readonly',
                callback: (tokenResponse) => {
                    setAccessToken(tokenResponse.access_token);
                    launchPhotoPicker(tokenResponse.access_token);
                },
                error_callback: (error) => {
                    console.error('Token client error:', error);
                    displayAlert('error', 'Failed to authenticate with Google');
                    setIsLoading(false);
                }
            });
            setTokenClient(client);
        }
    };

    const authenticateUser = async () => {
        if (!tokenClient) {
            displayAlert('error', 'Google authentication not ready');
            return;
        }

        try {
            setIsLoading(true);
            // Request access token
            tokenClient.requestAccessToken({
                prompt: 'consent'
            });
        } catch (error) {
            console.error('Authentication failed:', error);
            displayAlert('error', 'Failed to authenticate with Google');
            setIsLoading(false);
        }
    };

    const launchPhotoPicker = (accessToken) => {
        try {
            let view = new google.picker.View(google.picker.ViewId.DOCS);
            view.setMimeTypes("image/png,image/jpeg,image/jpg");
            const picker = new window.google.picker.PickerBuilder()
                .enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED)
                .setMaxItems(maxPhotos)
                .addView(view)
                .addView(new window.google.picker.PhotosView()
                    .setType(window.google.picker.PhotosView.Type.PHOTOS))
                .addView(new window.google.picker.PhotosView()
                    .setType(window.google.picker.PhotosView.Type.ALBUMS))
                .setOAuthToken(accessToken)
                .setDeveloperKey(import.meta.env.VITE_GOOGLE_API_KEY)
                .setRelayUrl(window.location.host)
                .setCallback(handlePickerCallback)
                .setAppId(import.meta.env.VITE_GOOGLE_CLIENT_ID)
                .setTitle('Select Photos from Google Photos')
                .build();
            
            picker.setVisible(true);
        } catch (error) {
            console.error('Error launching picker:', error);
            displayAlert('error', 'Failed to launch photo picker');
            setIsLoading(false);
        }
    };

    const handlePickerCallback = (data) => {
        if (data.action === window.google.picker.Action.PICKED) {
            const selectedPhotos = data.docs.map(doc => ({
                id: doc.id,
                name: doc.name || `Google Photo ${Date.now()}`,
                url: doc.url,
                thumbnailUrl: doc.thumbnails?.[0]?.url || doc.url,
                isFromGoogle: true
            }));
            if (selectedPhotos.length > 0) {
                onImport(selectedPhotos);
                displayAlert('success', `Successfully imported ${selectedPhotos.length} photo${selectedPhotos.length > 1 ? 's' : ''}`);
            }
        }
        setIsLoading(false);
    };

    // const handlePickerCallback = async (data) => {
    //     if (data.action === window.google.picker.Action.PICKED) {
    //         try {
    //             const selectedPhotos = [];
                
    //             for (const doc of data.docs) {
    //                 // For Google Photos Picker, we get direct URLs
    //                 const photoData = {
    //                     id: doc.id,
    //                     name: doc.name || `Google Photo ${Date.now()}`,
    //                     url: doc.url,
    //                     thumbnailUrl: doc.thumbnails?.[0]?.url || doc.url,
    //                     isFromGoogle: true
    //                 };

    //                 // Try to download and convert to File object
    //                 const photoFile = await downloadPhotoAsFile(doc);
    //                 if (photoFile) {
    //                     photoData.file = photoFile;
    //                     photoData.url = URL.createObjectURL(photoFile);
    //                 }

    //                 selectedPhotos.push(photoData);
    //             }
                
    //             if (selectedPhotos.length > 0) {
    //                 onImport(selectedPhotos);
    //                 displayAlert('success', `Successfully imported ${selectedPhotos.length} photo${selectedPhotos.length > 1 ? 's' : ''}`);
    //             }
                
    //         } catch (error) {
    //             console.error('Error processing selected photos:', error);
    //             displayAlert('error', 'Failed to import selected photos');
    //         }
    //     }
        
    //     setIsLoading(false);
    // };

    const downloadPhotoAsFile = async (doc) => {
        try {
            // Try to download the photo directly from the URL provided by picker
            if (doc.url) {
                const response = await fetch(doc.url);
                if (response.ok) {
                    const blob = await response.blob();
                    const fileName = doc.name || `google-photo-${doc.id}.jpg`;
                    return new File([blob], fileName, {
                        type: blob.type || 'image/jpeg',
                    });
                }
            }
            return null;
        } catch (error) {
            console.error('Error downloading photo:', error);
            return null;
        }
    };

    return (
        <div className="google-photos-import">
            <div className="google-photos-picker">
                <h3>
                    <i className="pi pi-google"></i>
                    Import from Google Photos
                </h3>
                <p className="picker-description">
                    Select up to {maxPhotos} photos from your Google Photos library
                </p>
                
                {isLoading ? (
                    <div className="loading-center">
                        <ProgressSpinner size="40px" />
                        <p>Processing photos...</p>
                    </div>
                ) : (
                    <Button 
                        label="Select Photos from Google Photos"
                        icon="pi pi-google"
                        onClick={authenticateUser}
                        className="picker-button"
                        disabled={!isGoogleLoaded || !tokenClient || disabled}
                        loading={!isGoogleLoaded}
                    />
                )}
                
                {(!isGoogleLoaded || !tokenClient) && !isLoading && (
                    <p className="loading-text">Loading Google Photos...</p>
                )}
            </div>
        </div>
    );
};

export default GooglePhotosImport;