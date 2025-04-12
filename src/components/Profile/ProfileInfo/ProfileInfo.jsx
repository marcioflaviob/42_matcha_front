import React, { useState, useEffect, useContext } from 'react';
import './ProfileInfo.css';
import axios from 'axios';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Chip } from 'primereact/chip';
import { UserContext } from '../../../context/UserContext';
import 'primeicons/primeicons.css';
        
const ProfileInfo = ({ userId }) => {
    const [data, setData] = useState(null);
    const [genderIcon, setGenderIcon] = useState(null);
    const [interestIcon, setInterestIcon] = useState(null);
    const [age, setAge] = useState(null);
    const [showEditButton, setShowEditButton] = useState(false)
    const [interests, setInterests] = useState(null); 
    const {user} = useContext(UserContext);

    const calculateAge = (birthdate) => {
        try {
            if (!birthdate) return null;
            
            const birthDate = new Date(birthdate);
            if (isNaN(birthDate.getTime())) return null;
            
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
        return age >= 0 ? age : null; // Prevent negative ages
        } catch (e) {
            console.error("Age calculation error:", e);
            return null;
        }
    };

    useEffect(() => {
        // Fetch data from the API
        if (user && Number(user.id) === Number(userId))
            setShowEditButton(true);
        const fetchData = async () => {
            // console.log('API URL:', `${import.meta.env.VITE_API_URL}/users/${userId}`);
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/${userId}`);
                setData(response.data); // Set the fetched data to state
                setGenderIcon(response.data.gender === 'Male' ? 'mars' :
                    response.data.gender === 'Other' ? 'circle' : 'venus'
                );
                setInterestIcon(response.data.sexual_interest === 'Male' ? 'mars' :
                    response.data.sexual_interest === 'Any' ? 'circle' : 'venus'
                );
                setAge(calculateAge(response.data.birthdate))
                console.log(response.data);
            } catch (err) {
                console.log('error'); // Handle errors
            } finally {
            // console.log(data);
            }
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/interests/${userId}`);
                setInterests(response.data); // Set the fetched data to state
                console.log(response.data);
                console.log('moch woaw');
            } catch (err) {
                console.log('error'); // Handle errors
            }
        };
        // fetchData();
        setInterestIcon('circle')
    }, [userId, user]);

    if (!data) return (
        <div className='bio-Div'>
            <DotLottieReact
                src="https://lottie.host/de177ab8-5b7f-47a7-89e4-bd45eb2bf030/DS595uJPq0.lottie"
                loop
                autoplay
                className="loadingProfile"
            />
        </div>
    );

    return (
    <div className='bio-Div'>
        <div className={showEditButton ? 'profileEditButton' : 'profileEditButtonHidden'}>Edit</div>
        <div className='bio-container'>
            <div className='bio-name'>{data.first_name} {data.last_name}</div>
            <div className='bio-age'>{age}</div>
            <i className={`pi pi-${genderIcon} bio-img ${genderIcon}`}></i>
        </div>
        <div className='bio-container bio-sexualInterest'>
            <div className='bio-info1'>Looking for</div>
            {/* <i className={`pi pi-${interestIcon} bio-img ${interestIcon}`}></i> */}
            {interestIcon === 'circle' ? (
                <>
                    <i className="pi pi-mars bio-img mars"></i>
                    <i className="pi pi-venus bio-img venus"></i>
                </>
                ) : (
                <i className={`pi pi-${interestIcon} bio-img ${interestIcon}`}></i>
            )}
        </div>
        <div className='bio-containerInterest'>
                {interests?.map((interest) => (
                    <Chip className='bio-interest' label={interest.name} />
                ))}
        </div>
        <div className='bio-container'>
            <div className='bio-Text'>{data.biography}</div>
        </div>
    </div>
    );
    };

export default ProfileInfo;