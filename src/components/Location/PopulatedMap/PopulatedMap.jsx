import React, { useEffect, useRef, useState, useContext } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './PopulatedMap.css';
import axios from 'axios';
import { displayAlert} from '../../Notification/Notification';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { AuthContext } from '../../../context/AuthContext';
import { UserContext } from '../../../context/UserContext';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const PopulatedMap = ({ setShowMap, showMap }) => {
  const { user } = useContext(UserContext);
  const mapContainerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ y: 0 });
  const [position, setPosition] = useState({ y: window.innerHeight });
  const positionRef = useRef(position.y);
  const isAnimating = useRef(false);
  const [matches, setMatches] = useState([]);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    positionRef.current = position.y;
  }, [position]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ y: e.clientY });
    isAnimating.current = false;
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const dy = e.clientY - dragStart.y;

    setPosition((prev) => {
      const newY = prev.y + dy;
      return { y: Math.max(newY, 0) };
    });

    setDragStart({ y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);

    const screenHeight = window.innerHeight;

    if (position.y >= screenHeight / 6) {
      isAnimating.current = true;
      animateToBottom();
    }
  };

  const animateToTop = () => {
    if (!isAnimating.current) return;

    setPosition((prev) => {
      if (prev.y > 0) {
        const newY = Math.max(prev.y - 10, 0);
        positionRef.current = newY;
        return { y: newY };
      }
      isAnimating.current = false;
      return prev;
    });

    if (positionRef.current > 0) {
      requestAnimationFrame(animateToTop);
    }
  };

  const animateToBottom = () => {
    if (!isAnimating.current) return;

    setPosition((prev) => {
      const newY = Math.min(prev.y + 10, window.innerHeight);
      positionRef.current = newY;
      return { y: newY };
    });

    if (positionRef.current < window.innerHeight) {
      requestAnimationFrame(animateToBottom);
    } else {
      isAnimating.current = false;
      setShowMap(false);
    }
  };

  useEffect(() => {
    if (showMap) {
      const fetchUsers = async () => {
        try {
          const response = await axios.get(import.meta.env.VITE_API_URL + '/matches', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const allUsers = [...response.data, user];
          const updatedMatches = allUsers.map((match) => {
            const firstPictureUrl = match.pictures?.[0]?.url || '';
            const userIcon = new L.divIcon({
              className: 'circular-icon',
              html: `<div class="icon-wrapper" style="background-image: url('${import.meta.env.VITE_BLOB_URL + '/' + firstPictureUrl}');"></div>`,
              iconUrl: import.meta.env.VITE_BLOB_URL + '/' + firstPictureUrl,
              iconSize: [32, 32],
              iconAnchor: [16, 32],
              popupAnchor: [0, -32],
            });
            return { ...match, icon : userIcon};
          });
          setMatches(updatedMatches);
        } catch (err) {
          console.error('Error fetching matches:', err);
          displayAlert('error', 'Error fetching matches');
        }
      };

      fetchUsers();
      isAnimating.current = true;
      animateToTop();
    }
  }, [showMap]);

  return (
    <div
      className="map-container"
      style={{
        transform: `translateY(${position.y}px)`,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
    >
      <div
        className="grabbable-div"
        ref={mapContainerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      ></div>
      <MapContainer
        center={[user?.location?.latitude, user?.location?.longitude]}
        zoom={12}
        className="map-div"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
        />

        {matches.map((match) => (
          <Marker key={match.id} position={[match.location.latitude, match.location.longitude]} icon={match.icon} style={{ cursor: 'pointer'}}>
            <Popup>
              <h3>{match.first_name}</h3>
              <p>{match.biography}</p>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default PopulatedMap;