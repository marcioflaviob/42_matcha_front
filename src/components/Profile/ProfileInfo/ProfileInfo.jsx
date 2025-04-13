import React, { useEffect, useContext, useState } from 'react';
import './ProfileInfo.css';
import { Chip } from 'primereact/chip';
import { UserContext } from '../../../context/UserContext';
import 'primeicons/primeicons.css';
import { useNavigate } from 'react-router-dom';
        
const ProfileInfo = ({ userId, userInfo }) => {
    const navigate = useNavigate();
    const {user} = useContext(UserContext);
    const [showEditButton, setShowEditButton] = useState(false);

    useEffect(() => {
        // Fetch data from the API
        if (user && Number(user.id) === Number(userId))
            setShowEditButton(true);
    }, [userId, user]);

    const handleEditButton = () =>
    {
        navigate(`/editprofile/${userId}`);
    }

    if (!userInfo || !user) return (
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
        <div className={showEditButton ? 'profileEditButton' : 'profileEditButtonHidden'} onClick={() => handleEditButton()}>Edit</div>
        <div className='bio-container'>
            <div className='bio-name'>{userInfo.first_name} {userInfo.last_name}</div>
            <div className='bio-age'>{userInfo.age}</div>
            <Chip className='bio-smallChip' label={userInfo.gender} key={userId}/>
        </div>
        <div className='bio-container bio-sexualInterest'>
            <div className='bio-info1'>Looking for</div>
            <Chip className='bio-smallChip' label={userInfo.sexual_interest} key={userId}/>
        </div>
        <div className='bio-containerInterest'>
                {userInfo.interests?.map((interest) => (
                    <Chip className='bio-interest' label={interest.name} key={interest.id}/>
                ))}
        </div>
        <div className='bio-container'>
            <div className='bio-Text'>{userInfo.biography}</div>
        </div>
    </div>
    );
};

export default ProfileInfo;