import React, { useState, useEffect, useRef, useContext } from 'react';
import './EditProfilePicture.css';
import { UserContext } from '../../../context/UserContext';
import ProfileCard from '../../HomePage/ProfileCard';
import 'primeicons/primeicons.css';
import { useEditProfileContext } from '../../../context/EditProfileContext';
        
const EditProfilePicture = ({ userId }) => {

  const likeRef = useRef(null);
  const { user } = useContext(UserContext);
  const { state, getLatestState } = useEditProfileContext();
  const [shadowUser, setShadowUser] = useState(null)

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
  }, [user?.pictures]);

  useEffect(() => {
    if (shadowUser && state?.first_name && state.bio) {
      setShadowUser(prev => ({ ...prev, first_name: state.first_name }));
      setShadowUser(prev => ({ ...prev, biography: state.bio }));
    }
  }, [state?.first_name, state?.bio]); // Now reacts immediately to state.first_name

  useEffect(() => {
    const latest = getLatestState();
    if (shadowUser && latest?.interests) {
      setShadowUser(prev => ({ ...prev, interests: latest.interests }));
    }
  }, [getLatestState()?.interests]); // Now tracks the latest value

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