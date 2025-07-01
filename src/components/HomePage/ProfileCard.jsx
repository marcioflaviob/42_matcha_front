import { useContext, useRef, useState } from "react";
import PhotoCarousel from "../../components/HomePage/PhotoCarousel";
import './ProfileCard.css'; 
import { Button } from "primereact/button";
import { Menu } from "primereact/menu";
import { displayAlert } from '../Notification/Notification';
import InterestChip from '../InterestChip/InterestChip';
import { UserContext } from "../../context/UserContext";
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';

const ProfileCard = ({ profile, handleLike, handleBlock, showButtons }) => {

  const menuRef = useRef(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { user } = useContext(UserContext);

  let items = [
    {
      label: 'Report',
      icon: 'pi pi-fw pi-flag',
      command: () => confirmReportUser()
    },
    {
      label: 'Block',
      icon: 'pi pi-fw pi-ban',
      command: () => confirmBlockUser()
    }
  ];

	if (!profile) {
		return (
			<p className="loading-message">Loading...</p>
		);
	}

  const confirmBlockUser = () => {
      confirmDialog({
        message: `Are you sure you want to block ${profile.first_name}?`,
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Yes',
        rejectLabel: 'No',
        acceptClassName: 'p-button-danger',
        accept: profileBlock,
      });
  }

  const confirmReportUser = () => {
      confirmDialog({
        message: `Are you sure you want to report ${profile.first_name}?`,
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Yes',
        rejectLabel: 'No',
        acceptClassName: 'p-button-danger',
        accept: handleReport,
      });
  }

  const profileBlock = () => {
    displayAlert("info", `${profile.first_name} blocked successfully`);
    handleBlock();
  }

  const profileLike = () => {
    handleLike();
  }

  const handleReport = () => {
    displayAlert("info", `${profile.first_name} reported successfully`);
    handleBlock();
  }

  return (
    <div className="profile-card">
      <ConfirmDialog />
      <PhotoCarousel userInfo={profile} currentImageIndex={currentImageIndex} setCurrentImageIndex={setCurrentImageIndex} />
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
            {
              user.id !== profile.id &&
              <>
                <Button icon="pi pi-ellipsis-v" className="profile-card-dropdown-button" onClick={(e) => menuRef.current.toggle(e)} />
                <Menu ref={menuRef} model={items} popup className="profile-card-dropdown"/>
              </>
            }
          </div>
        </div>

        <p className="profile-bio">{profile.biography}</p>

        <div className="profile-interests">
          <h3 className="interests-title">Interests</h3>
          <div className="interests-container">
            <div className="interests-list">
              {profile.interests.map((interest) => (
                <InterestChip key={interest.id} label={interest.name} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Moved buttons outside profile-content to fix z-index issues */}
      {showButtons && (
        <div className="match-buttons">
          <Button icon="pi pi-times" className="match-button reject-match-button" onClick={profileBlock} rounded />
          <Button icon="pi pi-heart-fill" className="match-button accept-match-button" onClick={profileLike} rounded />
        </div>
      )}
    </div>
  );
};

export default ProfileCard;