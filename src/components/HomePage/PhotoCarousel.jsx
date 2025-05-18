import React, { useState } from "react";
import './PhotoCarousel.css'; // Import the CSS file
import { Button } from "primereact/button";

const PhotoCarousel = ({ photos, name }) => {
  const placeholderImage = "https://placehold.co/500x700/f3f4f6/a1a1aa?text=No+Image";

  const displayedPhotos = photos?.length > 0 ? photos : [placeholderImage];

  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? displayedPhotos.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === displayedPhotos.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="carousel-wrapper">
      <div className="photo-container">
        <img
          src={import.meta.env.VITE_BLOB_URL + '/' + displayedPhotos[currentIndex].url}
          alt={`${name}'s photo`}
          className="photo-image"
          onError={(e) => {
            e.target.src = placeholderImage;
          }}
        />
      </div>
	  <Button className="carousel-button prev-button" onClick={handlePrev} icon="pi pi-angle-left" rounded />
	  <Button className="carousel-button next-button" onClick={handlePrev} icon="pi pi-angle-right" rounded />
    </div>
  );
};

export default PhotoCarousel;