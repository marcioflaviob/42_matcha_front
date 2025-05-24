import React, { useContext, useRef, useState } from 'react';
import './SetUpProfile.css';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { FileUpload } from 'primereact/fileupload';
import { InputTextarea } from 'primereact/inputtextarea';
import { Calendar } from 'primereact/calendar';
import { displayAlert } from '../../Notification/Notification';
import { Tooltip } from 'primereact/tooltip';
import { UserContext } from '../../../context/UserContext';
import axios from 'axios';
import { AuthContext } from '../../../context/AuthContext';

const SetUpProfile = ({ setActiveStep }) => {
    const { setUser } = useContext(UserContext);
    const { token } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(false);
	const [fileCount, setFileCount] = useState(0);
    const uploadUrl = import.meta.env.VITE_API_URL + "/upload/single/";
	const fileUploadRef = useRef(null);
	const uploadedFiles = useRef([]);
	const [profilePicture, setProfilePicture] = useState(null);
    const [formData, setFormData] = useState({
        biography: '',
        birthdate: null,
        status: 'validation'
    });
    const [biographyTouched, setBiographyTouched] = useState(false);
    const [birthdateTouched, setBirthdateTouched] = useState(false);
    
    const isBirthdateValid = (date) => {
        if (!date) return false;
        
        const today = new Date();
        const birthDate = new Date(date);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age >= 18;
    };

	const chooseOptions = { icon: 'pi pi-fw pi-images', iconOnly: true, className: 'custom-choose-btn p-button-rounded p-button-outlined' };
    const onTemplateSelect = (e) => {
        let files = e.files;

        if (fileCount + files.length > 5) {
            displayAlert('warn', 'You can only upload up to 5 photos');
            return;
        }

		if (fileCount === 0) {
			setProfilePicture(files[0]);
		}

        uploadedFiles.current = [...uploadedFiles.current, ...files];
        setFileCount(uploadedFiles.current.length);
    };
		
    const onTemplateRemove = (file, callback) => {
        uploadedFiles.current = uploadedFiles.current.filter(f => f !== file);
        setFileCount(uploadedFiles.current.length);
		if (profilePicture === file) {
            setProfilePicture(uploadedFiles.length > 0 ? uploadedFiles.current[0] : null);
        }
        callback();
    };

    const headerTemplate = (options, props) => {
        const { className, chooseButton } = options;

        return (
            <div className={className} style={{ backgroundColor: 'transparent', display: 'flex', alignItems: 'center' }}>
                {chooseButton}
                <div className="header-progress">
                    <span>{fileCount} / 5 photos</span>
                </div>
            </div>
        );
    };

    const itemTemplate = (file, props) => {
		const isProfilePicture = profilePicture === file;
        return (
            <div className="item-template">
                <div className="image-div">
                    <img alt={file.name} role="presentation" src={file.objectURL} width={100} style={{ borderRadius:'10px' }} />
                    <span className="filename-span">
                        {file.name}
                    </span>
                </div>
				<div className='right-div'>
					<Tooltip target=".select-star" position="top" />
					<i className={`pi ${isProfilePicture ? 'pi-star-fill' : 'pi-star'} select-star`}
						data-pr-tooltip={isProfilePicture ? "Profile picture" : "Set as profile picture"}
						style={{ cursor: isProfilePicture ? 'default' : 'pointer' }}
						onClick={() => setProfilePicture(file)} />
                	<Button type="button" icon="pi pi-times" className="p-button-outlined p-button-rounded p-button-danger" onClick={() => onTemplateRemove(file, props.onRemove)} />
				</div>
            </div>
        );
    };

    const handleChange = (e) => {
        setBiographyTouched(true);
        setFormData((prevData) => ({
            ...prevData,
            biography: e.target.value,
        }));
    };

    const handleDateChange = (e) => {
		setBirthdateTouched(true);
		setFormData((prevData) => ({
			...prevData,
			birthdate: e.value,
		}));
	};

    const emptyTemplate = () => {
        return (
            <div className="empty-template">
                <i className="pi pi-image empty-icon"></i>
                <span className="empty-span">
                    Drag and Drop Image Here
                </span>
            </div>
        );
    };

    const handleUpload = async () => {
        setIsLoading(true);
    
        try {
            uploadedFiles.current.forEach((file) => {
                const payload = new FormData();

                payload.append('isProfilePicture', file === profilePicture);
                payload.append('picture', file);

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
            });
    
            const response = await axios.put(`${import.meta.env.VITE_API_URL}/update-user`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                withCredentials: true,
            });
    
            setUser(response.data);
            setActiveStep(3);
        } catch (error) {
            console.error('Error:', error);
            displayAlert('error', 'An error occurred. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

	return (
		<div className='set-up-panel'>
			<div className='biography-div'>
				<h2 className='h2-bio'>Write your biography</h2>
				<InputTextarea rows={5} cols={40} autoResize value={formData.biography} onChange={handleChange} invalid={biographyTouched && !formData.biography} />
			</div>
            <div className='row-div'>
				<h2 className='h2-bio'>Birthdate</h2>
                <Calendar
                    className='birthdate'
                    inputId='birthdate'
                    placeholder='Birth Date'
                    value={formData.birthdate}
                    onChange={handleDateChange}
                    invalid={birthdateTouched && !isBirthdateValid(formData.birthdate)}
                    showIcon
                    monthNavigator 
                    yearNavigator 
                    dateFormat="dd/mm/yy"
                    yearRange={`1900:${new Date().getFullYear() - 18}`} />
                {birthdateTouched && !isBirthdateValid(formData.birthdate) && (
                    <small className="p-error">You must be at least 18 years old</small>
                )}
            </div>
			<Divider align="center" />
			<div>
				<h2>Upload your pictures</h2>
				<FileUpload ref={fileUploadRef} url={uploadUrl} multiple accept="image/*" maxFileSize={1000000}
					onSelect={onTemplateSelect}
					headerTemplate={headerTemplate} itemTemplate={itemTemplate} emptyTemplate={emptyTemplate} chooseOptions={chooseOptions} />
			</div>
			<div className='button-div'>
				<Button label="Back" severity="secondary" icon="pi pi-arrow-left" onClick={() => setActiveStep(1)} />
				<Button label="Next" icon="pi pi-arrow-right" iconPos="right" onClick={handleUpload} 
                    disabled={!formData.biography || fileCount === 0 || !isBirthdateValid(formData.birthdate)} 
                    loading={isLoading} />
			</div>
		</div>
	);
};

export default SetUpProfile;