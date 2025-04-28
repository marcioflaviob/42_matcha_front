import React, { useState, useEffect, useContext, useRef, useCallback} from 'react';
import './EditProfileInfo.css';
import axios, { formToJSON } from 'axios';
import { Chip } from 'primereact/chip';
import { UserContext } from '../../../context/UserContext';
import { displayAlert }  from "../../Notification/Notification"
import { MultiSelect } from 'primereact/multiselect';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { useNavigate} from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import { Button } from 'primereact/button';
import 'primeicons/primeicons.css';
import PictureSelector from '../../PictureSelector/PictureSelector';


const EditProfileInfo = ({ userId, shadowUser, setShadowUser }) => {
    const navigate = useNavigate();
    const { token } = useContext(AuthContext);
    const { user, setUser } = useContext(UserContext);
    const [allInterests, setAllInterests] = useState(null);
    // const { state, updateField } = useEditProfileContext();
    const [disableUpload, setDisableUpload] = useState(true);
    // const { triggerRefresh } = useRefresh();
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        interests: [],
        gender: '',
        sexual_interest: '',
        biography: '',
    });

    const handleFirstNameChange = useCallback((e) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, first_name: value }));
        setShadowUser(prev => ({ ...prev, first_name: value }));
        // updateField('first_name', value);
    }, []);

    const handleLastNameChange = useCallback((e) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, last_name: value }));
    }, []);

    const handleBioChange = useCallback((e) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, biography: value }));
        setShadowUser(prev => ({ ...prev, biography: value }));
        // updateField('bio', value);
    }, []);

    const handleRemoveInterest = (interestId) => {
        const array = formData.interests.filter(item => item.id !== interestId);
        setFormData((prevData) => ({
            ...prevData,
            ['interests']: array,
        }))
    };

    const handleDisableChange = (newValue) => {
        setDisableUpload(newValue);
        // window.location.reload();
    };
    

    const handleSelectChange = (e, field) => {
		const value = e.target.value;
        const valueSet = new Set(value);
        const changes = allInterests.filter(interest => valueSet.has(interest.name));
        setFormData((prevData) => ({
            ...prevData,
            [field]: changes,
        }));
    };

    const handleSave = async () =>
    {
        if (formData.email != '')
            formData.status = 'validation';
        axios.put(`${import.meta.env.VITE_API_URL}/update-user`, formData,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
        })
        .then((response) => {
            setUser(response.data);
        })
        .catch((error) => {
            console.error('Error:', error);
            displayAlert('error', 'An error occurred. Please try again later.');
        })
        navigate(`/profile/${user.id}`)
    }

    useEffect(() => {
        if (!user) return;
        // Fetch data from the API
        setDisableUpload(disableUpload);
        const fetchData = async () => {
            setFormData((prevData) => ({
                ...prevData,
                ['interests']: user.interests,
                ['gender']: user.gender,
                ['sexual_interest']: user.sexual_interest,
                ['first_name']: user.first_name,
                ['last_name']: user.last_name,
                ['email']: user.email,
                ['biography']: user.biography,
            }))
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/interests`);
                setAllInterests(response.data);
            } catch (err) {
                displayAlert('error', 'Error fetching information'); // Handle errors
            }
        };
        fetchData();
        // updateField('first_name', user.first_name);
        // updateField('interests', user.interests);
        // updateField('bio', user.biography);
    }, [userId, user, disableUpload]);

    useEffect(() =>
    {
        // updateField('interests', formData.interests);
        setShadowUser(prev => ({ ...prev, interests: formData.interests }));
    }, [formData?.interests])

    if (!user || !allInterests) return (
        <div className='bio-Div'>
            {/* <DotLottieReact
                src="https://lottie.host/de177ab8-5b7f-47a7-89e4-bd45eb2bf030/DS595uJPq0.lottie"
                loop
                autoplay
                className="loadingProfile"
            /> */}
        </div>
    );

    return (
    <div className='bio-Div'>
        <div className="fixed-div"></div>
        <div className="scrollable-div">
            <form>
                <div className='dualBio'>
                    <div className='bio-firstPart'>
                        <div className='editBio'>
                            <div className='editBioTitle'>First name</div>
                            <InputText type="text" name='first_name' autoComplete="given-name" className="p-inputtext-sm inputName" value={formData.first_name || ''} placeholder={`${formData.first_name}`} onChange={handleFirstNameChange}></InputText>
                        </div>
                        <div className='editBio'>
                            <div className='editBioTitle'>Last name</div>
                            <InputText type="text" name='last_name' autoComplete="family-name" className="p-inputtext-sm inputName" value={formData.last_name || ''} placeholder={`${formData.last_name}`} onChange={handleLastNameChange}></InputText>
                        </div>
                        <div className='editBio'>
                            <div className='editBioTitle'>Gender</div>
                            <Chip className={`bio-smallChip ${formData.gender === 'Male' ? 'highlighted' : 'Hoverable'}`} label={"Male"} key={72} onClick={() => {setFormData(prev => ({
                                ...prev,
                                gender: 'Male'
                            }))}}/>
                            <Chip className={`bio-smallChip ${formData.gender === 'Female' ? 'highlighted' : 'Hoverable'}`} label={"Female"} key={73} onClick={() => handleClick("Any")} />
                            <Chip className={`bio-smallChip ${formData.gender === 'Other' ? 'highlighted' : 'Hoverable'}`} label={"Other"} key={74} onClick={() => {setFormData(prev => ({
                                ...prev,
                                gender: 'Other'
                            }))}}/>
                        </div>
                        <div className='editBio'>
                            <div className='editBioTitle'>Email</div>
                            <InputText type="email" name='email' autoComplete="email" className="p-inputtext-sm inputName" value={formData.email || ''} placeholder={`${formData.email}`} onChange={(e) => setFormData({...formData, email: e.target.value})}></InputText>
                        </div>
                    </div>
                    <div className='bio-secondPart'>
                        <div className='editBio-container'>
                            <div className='editBioTitle'>Bio</div>
                            <InputTextarea type="text" className="inputBio" value={formData.biography || ''} placeholder={`${formData.biography}`} onChange={handleBioChange}></InputTextarea>
                        </div>
                        <div className='editBio'>
                            <div className='editBioTitle'>Looking for</div>
                            <Chip className={`bio-smallChip ${formData.sexual_interest === 'Male' ? 'highlighted' : 'Hoverable'}`} label={"Male"} key={69} onClick={() => {setFormData(prev => ({
                                ...prev,
                                sexual_interest: 'Male'
                            }))}}/>
                            <Chip className={`bio-smallChip ${formData.sexual_interest === 'Female' ? 'highlighted' : 'Hoverable'}`} label={"Female"} key={70} onClick={() => {setFormData(prev => ({
                                ...prev,
                                sexual_interest: 'Female'
                            }))}}/>
                            <Chip className={`bio-smallChip ${formData.sexual_interest === 'Any' ? 'highlighted' : 'Hoverable'}`} label={"Any"} key={71} onClick={() => {setFormData(prev => ({
                                ...prev,
                                sexual_interest: 'Any'
                            }))}}/>
                        </div>
                        <div className='editBio'>
                            <Button label="Change location" />
                        </div>
                    </div>
                </div>
                <div className='editBioInterests'>
                    <div className='editBioTitle'>Interests</div>
                    <span className='hobby-selection'>
                        <MultiSelect id='interests' className='hobby-selection-input' value={formData.interests.map(interest => interest.name) || []} options={allInterests} onChange={(e) => handleSelectChange(e, 'interests')}
                            optionLabel="name" optionValue="name" placeholder='Select your interests' showSelectAll={false} showClear={true}/>
                    </span>
                    <div className='bio-containerInterest'>
                            {formData.interests?.map((interest) => (
                                <Chip className='bio-interest' label={interest.name} key={interest.id} removable onRemove={() => handleRemoveInterest(interest.id)}/>
                            ))}
                    </div>
                </div>
                <div className='editBioUpload'>
                    <div className='editBioTitle'>Change Pictures</div>
                    <i className="pi pi-upload uploadButton" onClick={() => setDisableUpload(false)}></i>
                </div>
            </form> 
        </div>
        <div className='saveButton' onClick={() => handleSave()}>Save</div>
        <PictureSelector disabled={disableUpload} onDisabledChange={handleDisableChange}></PictureSelector>
    </div>
    );
    };

export default EditProfileInfo;