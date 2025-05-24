import { useContext, useState, useRef } from 'react';
import './ProfilePicture.css';
import { AuthContext } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Menu } from 'primereact/menu';
import axios from 'axios';
import { UserContext } from '../../../context/UserContext';
import { displayAlert } from '../../Notification/Notification';
        
const ProfilePicture = ({ userInfo }) => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const { token } = useContext(AuthContext);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const menuRef = useRef(null);

  const navigateBack = () => {
    if (window.history.length > 1 && document.referrer) {
      navigate(-1);
    } else {
      navigate('/');
    }
  }

  const handleReport = () => {
    // TODO
    displayAlert('warn', 'This feature is not implemented yet');
  }

  const handleUnlike = () => {
    // TODO
    displayAlert('warn', 'This feature is not implemented yet');
  }

  const handleBlock = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/block/${userInfo.id}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTimeout(() => {
        navigate('/');
      }, 500);
    } catch (err) {
      console.error('Error blocking user:', err);
    }
  }

  const menuItems = [
    {
      label: 'Unlike user',
      icon: 'pi pi-heart',
      command: () => handleUnlike()
    },
    {
      label: 'Report',
      icon: 'pi pi-fw pi-flag',
      command: () => handleReport()
    },
    {
      label: 'Block',
      icon: 'pi pi-fw pi-ban',
      command: () => handleBlock()
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

  return (
    <div className="profile-gallery-container">
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
        <div className="profile-main-image-container">
          {userInfo.pictures.length > 0 && (
            <>
              <img 
                src={`${import.meta.env.VITE_BLOB_URL}/${userInfo.pictures[currentImageIndex].url}`}
                alt={`${userInfo.first_name} ${currentImageIndex + 1}`}
                className="profile-main-image"
                onError={(e) => {
                  e.target.src = '/placeholder-image.jpg';
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