import { useRef } from "react";
import PhotoCarousel from "../../components/HomePage/PhotoCarousel";
import './ProfileCard.css'; 
import { Chip } from "primereact/chip";
import { Button } from "primereact/button";
import { Menu } from "primereact/menu";
import { displayAlert } from '../Notification/Notification';

const ProfileCard = ({ profile, handleLike, handleBlock, showButtons, showUnlike }) => {

  const menuRef = useRef(null);

  let items = [
    {
      label: 'Report',
      icon: 'pi pi-fw pi-flag',
      command: () => handleReport()
    },
    {
      label: 'Block',
      icon: 'pi pi-fw pi-ban',
      command: () => profileBlock()
    },
    ...(showUnlike ? [{
      label: 'Unlike',
      icon: 'pi pi-fw pi-heart',
      command: () => profileBlock()
    }] : [])
  ];

	if (!profile) {
		return (
			<p className="loading-message">Loading...</p>
		);
	}

  const profileBlock = () => {
    displayAlert("info", "User blocked successfully");
    handleBlock();
  }

  const profileLike = () => {
    handleLike();
  }

  const handleReport = () => {
    displayAlert("info", "User reported successfully");
    handleBlock();
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
              <span>{profile?.location?.city}, {profile?.location?.country}</span>
            </div>
          </div>
          <div className="profile-header-right">
            {profile.liked_me && <div className="profile-card-liked-you">liked you <i className="pi pi-heart-fill profile-card-liked-you-heart"></i></div>}
            <Button icon="pi pi-ellipsis-v" className="profile-card-dropdown-button" onClick={(e) => menuRef.current.toggle(e)} />
            <Menu ref={menuRef} model={items} popup className="profile-card-dropdown"/>
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

		{showButtons && <div className="match-buttons">
      <Button icon="pi pi-times" className="match-button reject-match-button" onClick={profileBlock} rounded />
			<Button icon="pi pi-heart-fill" className="match-button accept-match-button" onClick={profileLike} rounded />
		</div>}

      </div>
    </div>
  );
};

export default ProfileCard;