import { useContext} from 'react';
import './ProfilePicture.css';
import ProfileCard from '../../HomePage/ProfileCard';
import axios from 'axios';
import { AuthContext } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
        
const ProfilePicture = ({ userId, userInfo }) => {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

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
      console.error('Error liking match:', err);
    }
  }

  if (!userInfo)
  {
    return (
      <div className="profile-card-container">

      </div>
    )
  }

  return (
    <div className="profile-card-container">
      <ProfileCard profile={userInfo} showButtons={false} showUnlike={true} handleBlock={handleBlock}/>
    </div>
  );
};

export default ProfilePicture;