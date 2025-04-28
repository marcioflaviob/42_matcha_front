import React, { useState, useEffect, useRef, useContext } from 'react';
import './EditProfilePicture.css';
import { UserContext } from '../../../context/UserContext';
import ProfileCard from '../../HomePage/ProfileCard';
import 'primeicons/primeicons.css';
        
const EditProfilePicture = ({ userId, shadowUser, setShadowUser }) => {

  const likeRef = useRef(null);
  const { user } = useContext(UserContext);
  // const { state, getLatestState } = useEditProfileContext();

  const likeAnimation = () => {
    if (likeRef.current) {
      likeRef.current.addEventListener('transitionend', handleAnimationEnd);
      likeRef.current.style.transform = 'scale(0.7)';
    }
  };
  
  const handleAnimationEnd = (e) => {
    if (e.propertyName === 'transform') {
      e.target.removeEventListener('transitionend', handleAnimationEnd);
      if (e.target.style.fill == 'red')
      {
        e.target.style.fill = 'none';
        e.target.style.stroke = 'aliceblue';
      }
      else
      {
        e.target.style.fill = 'red';
        e.target.style.stroke = 'red';
      }
      e.target.style.transform = 'scale(1)';
    }
  };


  useEffect(() => {
    if (user)
      setShadowUser(user);
  }, [user]);

  if (!user)
  {
    return (
      <div className="ProfilePicture-div">

      </div>
    )
  }

  return (
    <div className="ProfilePicture-div">
      <ProfileCard profile={shadowUser} showLike={false} showBlock={false}/> :
      {/* <LikeLogo className='pfpLikeIcon' onClick={likeAnimation} ref={likeRef}/> */}
      {/* <div className='pfpLikeCount'>{}</div> */}
    </div>
  );
};

export default EditProfilePicture;