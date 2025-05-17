import axios from "axios";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { useContext } from "react";
import { clearNotifications } from "./Notification";

export const CallActions = ({ userId }) => {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const handleAccept = () => {
    navigate('/chat?id=' + userId + '&call=true');
    clearNotifications();
  };
  
  const handleRefuse = () => {
    console.log('Call refused');
    axios.post(`${import.meta.env.VITE_API_URL}/refuse-call/${userId}`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    clearNotifications();
  };

  return (
    <div className="call-actions">
      <Button 
        icon="pi pi-phone" 
        className="accept-call-btn p-button-success" 
        onClick={handleAccept} 
        label="Accept" 
      />
      <Button 
        icon="pi pi-times" 
        className="refuse-call-btn p-button-danger" 
        onClick={handleRefuse} 
        label="Decline" 
      />
    </div>
  );
};

export const getContent = (data) => {
  const callerName = data.message.split(' ')[0];
  const message = data.message.substring(callerName.length + 1);
  const userId = data.concerned_user_id;

  return (
    <div className="call-notification">
      <div className="call-message">
        <span className="caller-name">{callerName}</span> {message}
      </div>
      <CallActions userId={userId} />
    </div>
  );
};