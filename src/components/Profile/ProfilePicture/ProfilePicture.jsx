import './ProfilePicture.css';
import ProfileCard from '../../HomePage/ProfileCard';
        
const ProfilePicture = ({ userId, userInfo }) => {

  if (!userInfo)
  {
    return (
      <div className="profile-card-container">

      </div>
    )
  }

  return (
    <div className="profile-card-container">
      <ProfileCard profile={userInfo} showButtons={false}/>
    </div>
  );
};

export default ProfilePicture;