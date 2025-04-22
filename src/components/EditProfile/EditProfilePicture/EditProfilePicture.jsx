import React, { useState, useEffect, useRef, useContext } from 'react';
import './EditProfilePicture.css';
import { Galleria } from 'primereact/galleria';
import { UserContext } from '../../../context/UserContext';
import PictureSelector from '../../PictureSelector/PictureSelector';
import 'primeicons/primeicons.css';
        
const EditProfilePicture = ({ userId }) => {

  const likeRef = useRef(null);
  const { user } = useContext(UserContext);
  const [disableUpload, setDisableUpload] = useState(true);

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

  const handleDisableChange = (newValue) => {
    setDisableUpload(newValue);
    // window.location.reload();
  };


  useEffect(() => {
    setDisableUpload(disableUpload);
  }, [disableUpload, user?.pictures]);

  const itemTemplate = (item) => {
    return <img src={`${import.meta.env.VITE_BLOB_URL}/${item.url}`} style={{ width: '100%', objectFit: 'cover', display: 'block', height: '100%', backgroundSize: 'contain'}} />;
  }

  const thumbnailTemplate = (item) => {
    return <img src={item.url} style={{ display: 'block' }} />;
  }

  if (!user)
  {
    return (
      <div className="ProfilePicture-div">

      </div>
    )
  }

  return (
    <div className="ProfilePicture-div">
      <div className="image-container">
        <Galleria value={user.pictures}
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
      <i className="pi pi-upload uploadButton" onClick={() => setDisableUpload(false)}></i>
      <PictureSelector disabled={disableUpload} onDisabledChange={handleDisableChange}></PictureSelector>
    </div>
  );
};

export default EditProfilePicture;