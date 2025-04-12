import React, { useState, useEffect, useContext} from 'react';
import './EditProfileInfo.css';
import axios from 'axios';
import { Chip } from 'primereact/chip';
import { UserContext } from '../../../context/UserContext';
import { displayAlert }  from "../../Notification/Notification"
import { MultiSelect } from 'primereact/multiselect';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { useNavigate} from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
        
const EditProfileInfo = ({ userId }) => {
    const navigate = useNavigate();
    const { token } = useContext(AuthContext);
    const { user } = useContext(UserContext);
    const [allInterests, setAllInterests] = useState(null);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        interests: [],
        gender: '',
        sexual_interest: '',
        biography: '',
    });

    const handleRemoveInterest = (interestId) => {
        const array = formData.interests.filter(item => item.id !== interestId);
        setFormData((prevData) => ({
            ...prevData,
            ['interests']: array,
        }))
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
        // console.log(formData);
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
        // console.log(formData.sexual_interest);
    }, [userId, user]);

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
        <div className='bio-container'>
            <InputText type="text" className="p-inputtext-sm inputName" value={formData.first_name || ''} placeholder={`${formData.first_name}`} onChange={(e) => setFormData({...formData, first_name: e.target.value})}></InputText>
            <InputText type="text" className="p-inputtext-sm inputName" value={formData.last_name || ''} placeholder={`${formData.last_name}`} onChange={(e) => setFormData({...formData, last_name: e.target.value})}></InputText>
            <div className='bio-age'>{user.age}</div>
            <Chip className={`bio-smallChip ${formData.gender === 'Male' ? 'highlighted' : 'Hoverable'}`} label={"Male"} key={72} onClick={() => {setFormData(prev => ({
                ...prev,
                gender: 'Male'
            }))}}/>
            <Chip className={`bio-smallChip ${formData.gender === 'Female' ? 'highlighted' : 'Hoverable'}`} label={"Female"} key={73} onClick={() => {setFormData(prev => ({
                ...prev,
                gender: 'Female'
            }))}}/>
            <Chip className={`bio-smallChip ${formData.gender === 'Other' ? 'highlighted' : 'Hoverable'}`} label={"Other"} key={74} onClick={() => {setFormData(prev => ({
                ...prev,
                gender: 'Other'
            }))}}/>
        </div>
        <div className='bio-container Email'>
            <InputText type="text" className="p-inputtext-sm inputEmail" value={formData.email || ''} placeholder={`${formData.email}`} onChange={(e) => setFormData({...formData, email: e.target.value})}></InputText>
        </div>
        <div className='bio-container bio-sexualInterest'>
            <div className='bio-info1'>Looking for</div>
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
        <div className='aligned-div'>
            <span className='hobby-selection'>
                <MultiSelect id='interests' className='hobby-selection-input' value={formData.interests.map(interest => interest.name) || []} options={allInterests} onChange={(e) => handleSelectChange(e, 'interests')}
                    optionLabel="name" optionValue="name" placeholder='Select your interests' showSelectAll={false} showClear={true}/>
            </span>

        </div>
        <div className='bio-containerInterest'>
                {formData.interests?.map((interest) => (
                    <Chip className='bio-interest' label={interest.name} key={interest.id} removable onRemove={() => handleRemoveInterest(interest.id)}/>
                ))}
        </div>
        <div className='bio-container biography'>
            <InputTextarea type="text" className="inputBio" value={formData.biography || ''} placeholder={`${formData.biography}`} onChange={(e) => setFormData({...formData, biography: e.target.value})}></InputTextarea>
        </div>
        <div className='saveButton' onClick={() => handleSave()}>Save</div>
    </div>
    );
    };

export default EditProfileInfo;