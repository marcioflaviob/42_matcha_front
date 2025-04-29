import React, { useEffect, useContext, useState } from 'react';
import './ProfileInfo.css';
import { Chip } from 'primereact/chip';
import { UserContext } from '../../../context/UserContext';
import { Map } from '../../Location/Map/map';
import 'primeicons/primeicons.css';
import { useNavigate } from 'react-router-dom';
        
const ProfileInfo = ({ userId, userInfo }) => {
    const navigate = useNavigate();
    const {user} = useContext(UserContext);
    const [showEditButton, setShowEditButton] = useState(false);

    useEffect(() => {
        if (user && Number(user.id) === Number(userId))
            setShowEditButton(true);
    }, [userId, user]);

    const handleEditButton = () =>
    {
        navigate(`/edit-profile/${userId}`);
    }

    if (!userInfo || !user) return (
        <div className='bio-Div'>
        </div>
    );

    return (
    <div className='profile-info-container'>
        <div className={showEditButton ? 'profileEditButton' : 'profileEditButtonHidden'} onClick={() => handleEditButton()}>Edit</div>
        <div className='profile-info-div'>
            <div className='profile-info-title'>First Name</div>
            <div className='profile-info-value'>{userInfo.first_name}</div>
        </div>
        <div className='profile-info-div'>
            <div className='profile-info-title'>Last Name</div>
            <div className='profile-info-value'>{userInfo.last_name}</div>
        </div>
        <div className='profile-info-div'>
            <div className='profile-info-title'>Gender</div>
            <Chip className='profile-small-chip' label={userInfo.gender} key={userId}/>
        </div>
        <div className='profile-info-div bio-sexual-interest'>
            <div className='profile-info-title'>Looking for</div>
            <Chip className='profile-small-chip' label={userInfo.sexual_interest} key={userId}/>
        </div>
        {userId == user.id && (
            <div className='profile-info-div'>
                <div className='profile-info-title'>email</div>
                <div className='profile-info-value'>{userInfo.email}</div>
            </div>
        )}
        <div className='profile-info-div'>
            <div className='profile-info-title'>Bio</div>
            <div className='profile-info-value'>{userInfo.biography}</div>
        </div>
        <div className='profile-info-interests-div'>
            <div className='profile-info-title'>Interests</div>
            <div className='profile-info-interests-value'>
                {userInfo.interests?.map((interest) => (
                    <Chip className='profile-small-chip' label={interest.name} key={interest.id}/>
                ))}
            </div>
        </div>
        <div className='profile-info-div'>
            <div className='profile-info-title'>Fame Rating</div>
            <div className='profile-info-value'>69</div>
        </div>
        <Map></Map>
    </div>
    );
};

export default ProfileInfo;