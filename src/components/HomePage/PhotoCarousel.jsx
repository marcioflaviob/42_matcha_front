import React from "react";
import './PhotoCarousel.css';
import { Button } from "primereact/button";
import { useLocation } from 'react-router-dom';

const PhotoCarousel = ({ userInfo, currentImageIndex, setCurrentImageIndex }) => {
  const placeholderImage = "https://placehold.co/500x700/f3f4f6/a1a1aa?text=No+Image";
  const location = useLocation();
  const isProfilePage = location.pathname.includes('/profile');

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === userInfo.pictures.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? userInfo.pictures.length - 1 : prev - 1
    );
  };

  if (!userInfo || !userInfo.pictures || userInfo.pictures.length === 0) {
    return (
      <div className="profile-main-image-container">
        <img 
          src={placeholderImage}
          alt="No image available"
          className="profile-main-image"
        />
      </div>
    );
  }

  return (
    <div className={`profile-main-image-container ${isProfilePage ? 'bottom-border' : ''}`}>
      {userInfo.pictures.length > 0 && (
        <>
          <img 
            src={`${import.meta.env.VITE_BLOB_URL}/${userInfo?.pictures[currentImageIndex]?.url}`}
            alt={`${userInfo.first_name} ${currentImageIndex + 1}`}
            className="profile-main-image"
            onError={(e) => {
              e.target.src = placeholderImage;
            }}
          />
          {userInfo.pictures.length > 1 && (
            <>
              <Button 
                icon="pi pi-chevron-left" 
                className="profile-gallery-nav-button nav-button-left"
                onClick={prevImage}
                rounded
              />
              <Button 
                icon="pi pi-chevron-right" 
                className="profile-gallery-nav-button nav-button-right"
                onClick={nextImage}
                rounded
              />
            </>
          )}
          <div className="profile-image-counter">
            {currentImageIndex + 1} / {userInfo.pictures.length}
          </div>
        </>
      )}
    </div>
  );
};

export default PhotoCarousel;