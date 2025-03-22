import React, { useRef, useState } from 'react';
import './SetUpProfile.css';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { FileUpload } from 'primereact/fileupload';
import { InputTextarea } from 'primereact/inputtextarea';
import { displayAlert } from '../../Notification/Notification';
import { Tooltip } from 'primereact/tooltip';

const SetUpProfile = ({ stepperRef }) => {

	const [fileCount, setFileCount] = useState(0);
	const fileUploadRef = useRef(null);
	const uploadedFiles = useRef([]);
	const [profilePicture, setProfilePicture] = useState(null);
    const [biography, setBiography] = useState('');
    const [biographyTouched, setBiographyTouched] = useState(false);

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
        setBiography(e.target.value);
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

    const handleUpload = () => {
        if (fileUploadRef.current) {
            fileUploadRef.current.upload();
        }
        stepperRef.current.nextCallback();
    };

	return (
		<div className='set-up-panel'>
			<div className='biography-div'>
				<h2 className='h2-bio'>Write your biography</h2>
				<InputTextarea rows={5} cols={40} autoResize value={biography} onChange={handleChange} invalid={biographyTouched && !biography} />
			</div>
			<Divider align="center" />
			<div>
				<h2>Upload your pictures</h2>
				<FileUpload ref={fileUploadRef} name="demo[]" url="/api/upload" multiple accept="image/*" maxFileSize={1000000}
					onSelect={onTemplateSelect}
					headerTemplate={headerTemplate} itemTemplate={itemTemplate} emptyTemplate={emptyTemplate} chooseOptions={chooseOptions} />
			</div>
			<div className='button-div'>
				<Button label="Back" severity="secondary" icon="pi pi-arrow-left" onClick={() => stepperRef.current.prevCallback()} />
				<Button label="Next" icon="pi pi-arrow-right" iconPos="right" onClick={handleUpload} disabled={!biography || fileCount == 0} />
			</div>
		</div>
	);
};

export default SetUpProfile;