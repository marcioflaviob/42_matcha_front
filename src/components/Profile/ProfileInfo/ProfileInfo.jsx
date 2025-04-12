import React, { useState, useEffect, useContext } from 'react';
import './ProfileInfo.css';
import axios from 'axios';
import { Chip } from 'primereact/chip';
import { UserContext } from '../../../context/UserContext';
import 'primeicons/primeicons.css';
import { displayAlert }  from "../../Notification/Notification"
        
const ProfileInfo = ({ userId }) => {
    const [data, setData] = useState(null);
    const [gender, setGender] = useState(null);
    const [sexualInterest, setSexualInterest] = useState(null);
    const [age, setAge] = useState(null);
    const [showEditButton, setShowEditButton] = useState(false)
    const [interests, setInterests] = useState(null); 
    const {user} = useContext(UserContext);

    useEffect(() => {
        // Fetch data from the API
        if (user && Number(user.id) === Number(userId))
            setShowEditButton(true);
        const fetchData = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/${userId}`);
                setData(response.data); // Set the fetched data to state
                setGender(response.data.gender === 'Male' ? 'male' :
                    response.data.gender === 'Other' ? 'other' : 'female'
                );
                setSexualInterest(response.data.sexual_interest === 'Male' ? 'male' :
                    response.data.sexual_interest === 'Any' ? 'any' : 'female'
                );
                setAge(response.data.age);
                setInterests(response.data.interests);
            } catch (err) {
                displayAlert('error', 'Error fetching information'); // Handle errors
            }
        };
        fetchData();
    }, [userId, user]);

    if (!data) return (
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
        <div className={showEditButton ? 'profileEditButton' : 'profileEditButtonHidden'}>Edit</div>
        <div className='bio-container'>
            <div className='bio-name'>{data.first_name} {data.last_name}</div>
            <div className='bio-age'>{age}</div>
            <Chip className='bio-smallChip' label={gender} key={userId}/>
        </div>
        <div className='bio-container bio-sexualInterest'>
            <div className='bio-info1'>Looking for</div>
            <Chip className='bio-smallChip' label={sexualInterest} key={userId}/>
        </div>
        <div className='bio-containerInterest'>
                {interests?.map((interest) => (
                    <Chip className='bio-interest' label={interest.name} key={interest.id}/>
                ))}
        </div>
        <div className='bio-container'>
            <div className='bio-Text'>{data.biography}</div>
        </div>
    </div>
    );
    };

export default ProfileInfo;