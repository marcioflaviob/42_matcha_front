import React from "react";
import PhotoCarousel from "../../components/HomePage/PhotoCarousel";
import './ProfileCard.css'; 
import { Chip } from "primereact/chip";
import { Button } from "primereact/button";

const ProfileCard = ({ profile, handleLike, handleBlock }) => {

	if (!profile) {
		return (
			<p className="loading-message">Loading...</p>
		);
	}

  return (
    <div className="profile-card">
      <PhotoCarousel photos={profile.pictures} name={profile.name} />
      <div className="profile-content">
        <div className="profile-header">
          <div className="profile-header-left">
            <div className="profile-name-age">
              <h2 className="profile-name">{profile.first_name}</h2>
              <span className="profile-age">{profile.age}</span>
            </div>
            <div className="profile-location">
              <i className="pi pi-map-marker location-icon"></i>
              <span>Paris, France</span>
            </div>
          </div>
          <div className="profile-header-right">
            {profile.liked_me && <Chip label="liked you" className="liked-you-chip" /> }
          </div>
        </div>

        <p className="profile-bio">{profile.biography}</p>

        <div className="profile-interests">
          <h3 className="interests-title">Interests</h3>
          <div className="interests-container">
            <div className="interests-list">
              {profile.interests.map((interest) => (
                <Chip key={interest.id} label={interest.name} className="interest-item" />
              ))}
            </div>
          </div>
        </div>

		<div className="match-buttons">
			<Button icon="pi pi-times" className="match-button reject-match-button" onClick={handleBlock} rounded />
			<Button icon="pi pi-heart-fill" className="match-button accept-match-button" onClick={handleLike} rounded />
		</div>

      </div>
    </div>
  );
};

export default ProfileCard;