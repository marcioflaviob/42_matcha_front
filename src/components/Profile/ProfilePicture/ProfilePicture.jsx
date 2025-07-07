import { useContext, useState, useRef } from 'react';
import './ProfilePicture.css';
import { AuthContext } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Menu } from 'primereact/menu';
import axios from 'axios';
import { UserContext } from '../../../context/UserContext';
import { displayAlert } from '../../Notification/Notification';
import PhotoCarousel from '../../HomePage/PhotoCarousel';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
        
const ProfilePicture = ({ userInfo }) => {
  const navigate = useNavigate();
  const { user, setMatches, setNotifications } = useContext(UserContext);
  const { token } = useContext(AuthContext);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const menuRef = useRef(null);

  const removeUserFromMatches = (userId) => {
    setMatches((prevMatches) => {
      if (!prevMatches) return [];
      return prevMatches.filter((match) => match.id !== userId);
    });
  }

  const removeUserFromNotifications = (userId) => {
    setNotifications((prevNotifications) => {
      if (!prevNotifications) return [];
      return prevNotifications.filter((notification) => notification.concerned_user_id !== userId);
    });
  }

  const navigateBack = () => {
    if (window.history.length > 1 && document.referrer) {
      navigate(-1);
    } else {
      navigate('/');
    }
  }

  const confirmBlockUser = () => {
      confirmDialog({
        message: `Are you sure you want to block ${userInfo.first_name}?`,
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Yes',
        rejectLabel: 'No',
        acceptClassName: 'p-button-danger',
        accept: handleBlock,
      });
  }

  const confirmReportUser = () => {
      confirmDialog({
        message: `Are you sure you want to report ${userInfo.first_name}?`,
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Yes',
        rejectLabel: 'No',
        acceptClassName: 'p-button-danger',
        accept: handleReport,
      });
  }

  const confirmUnlikeUser = () => {
    confirmDialog({
      message: `Are you sure you want to unlike ${userInfo.first_name}?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      acceptClassName: 'p-button-danger',
      accept: handleUnlike,
    });
  }

  const handleReport = async () => {
    axios.post(`${import.meta.env.VITE_API_URL}/report/${userInfo.id}`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(() => {
      removeUserFromMatches(userInfo.id);
      removeUserFromNotifications(userInfo.id);
      setTimeout(() => {
        navigate('/');
      }, 500);
      displayAlert('success', `${userInfo.first_name} reported successfully`);
    }).catch((error) => {
      displayAlert('error', error.response?.data?.message || 'Error reporting user');
    });
  }

  const handleUnlike = async () => {
    axios.delete(`${import.meta.env.VITE_API_URL}/unlike/${userInfo.id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(() => {
      removeUserFromMatches(userInfo.id);
      removeUserFromNotifications(userInfo.id);
      setTimeout(() => {
        navigate('/');
      }, 500);
      displayAlert('success', `${userInfo.first_name} unliked successfully`);
    }).catch((error) => {
      displayAlert('error', error.response?.data?.message || 'Error unliking user');
    });
  }

  const handleBlock = async () => {
    axios.post(`${import.meta.env.VITE_API_URL}/block/${userInfo.id}`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(() => {
      removeUserFromMatches(userInfo.id);
      removeUserFromNotifications(userInfo.id);
      setTimeout(() => {
        navigate('/');
      }, 500);
      displayAlert('success', `${userInfo.first_name} blocked successfully`);
    }).catch((error) => {
      displayAlert('error', error.response?.data?.message || 'Error blocking user');
    });
  }

  const menuItems = [
    {
      label: 'Unlike user',
      icon: 'pi pi-heart',
      command: () => confirmUnlikeUser()
    },
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

  if (!userInfo || !userInfo.pictures) {
    return (
      <div className="profile-gallery-container">
        <div className="profile-gallery-skeleton">
          <div className="profile-skeleton-image"></div>
        </div>
      </div>
    )
  }

  const handleImageClick = (index) => {
    setCurrentImageIndex(index);
  };

  return (
    <div className="profile-gallery-container">
      <ConfirmDialog />
      <div className="profile-gallery-header">
        <Button 
          icon="pi pi-arrow-left" 
          className="back-button"
          onClick={navigateBack}
          text
        />
        { user.id != userInfo.id &&
          <>
            <Button 
              icon="pi pi-ellipsis-v" 
              className="menu-button"
              onClick={(e) => menuRef.current.toggle(e)}
              text
            />
            <Menu ref={menuRef} model={menuItems} popup />
          </>
        }
      </div>

      <div className="profile-gallery-main">
        <PhotoCarousel userInfo={userInfo} currentImageIndex={currentImageIndex} setCurrentImageIndex={setCurrentImageIndex} />

        {userInfo.pictures.length > 1 && (
          <div className="profile-thumbnail-strip">
            {userInfo.pictures.map((picture, index) => (
              <div 
                key={picture.id}
                className={`profile-thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                onClick={() => handleImageClick(index)}
              >
                <img 
                  src={`${import.meta.env.VITE_BLOB_URL}/${picture.url}`}
                  alt={`${userInfo.first_name} ${index + 1}`}
                  onError={(e) => {
                    e.target.src = '/placeholder-image.jpg';
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePicture;