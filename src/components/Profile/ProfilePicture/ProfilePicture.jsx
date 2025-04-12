import React, { useState, useEffect, useRef } from 'react';
import './ProfilePicture.css';
import { Galleria } from 'primereact/galleria';
import axios from 'axios';
        
const ProfilePicture = ({ userId }) => {
  const [data, setData] = useState(null);
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

  useEffect(() => {
    // Fetch data from the API
    const fetchData = async () => {
      console.log('API URL:', `${import.meta.env.VITE_API_URL}/users/${userId}`);
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/${userId}`);
        setData(response.data); // Set the fetched data to state
        // console.log(response.data);
      } catch (err) {
        console.log('error'); // Handle errors
      } finally {
        console.log(data);
      }
    };
    fetchData();
    const fetchPictures = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/pictures/${userId}`);
        setPictures(response.data); // Set the fetched data to state
        // console.log("This is the pictures here \n", response.data);
      } catch (err) {
        console.log('error'); // Handle errors
      } finally {
        // console.log(data);
      }
    };
    fetchPictures();
  }, [userId]);

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