import React, { useState, useEffect, useRef } from 'react';
import './ProfilePicture.css';
import { Galleria } from 'primereact/galleria';
        
const ProfilePicture = ({ userId, userInfo }) => {
  const [pictures, setPictures] = useState(null);
  const likeRef = useRef(null);

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

  useEffect(() => 
  {
    if(userInfo)
      setPictures(userInfo.pictures)
  }, [userId, userInfo]);

  if (!userInfo)
  {
    return (
      <div className="ProfilePicture-div">

      </div>
    )
  }

  const itemTemplate = (item) => {
    return <img src={`${import.meta.env.VITE_BLOB_URL}/${item.url}`} style={{ width: '100%', objectFit: 'cover', display: 'block', height: '100%', backgroundSize: 'contain'}} />;
  }

  const thumbnailTemplate = (item) => {
    return <img src={item.url} style={{ display: 'block' }} />;
  }

  return (
    <div className="ProfilePicture-div">
      <div className="image-container">
        <Galleria value={pictures}
        style={{ width: '100%', height: '100%'}}
        numVisible={5}
        circular 
        showItemNavigators
        showItemNavigatorsOnHover
        showIndicators
        showThumbnails={false}
        item={itemTemplate}
        thumbnail={thumbnailTemplate} />
      </div>
      {/* <LikeLogo className='pfpLikeIcon' onClick={likeAnimation} ref={likeRef}/> */}
      <div className='pfpLikeCount'>{}</div>
    </div>
  );
};

export default ProfilePicture;