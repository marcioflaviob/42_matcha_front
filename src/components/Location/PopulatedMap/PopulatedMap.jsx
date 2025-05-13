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
  const positionRef = useRef(position.y); // Ref to track the current position
  const isAnimating = useRef(false); // Ref to track if animation is running
  const [matches, setMatches] = useState([]);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    positionRef.current = position.y; // Update the ref whenever position changes
  }, [position]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ y: e.clientY });
    isAnimating.current = false; // Stop any ongoing animation when dragging starts
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const dy = e.clientY - dragStart.y;

    setPosition((prev) => {
      const newY = prev.y + dy;
      return { y: Math.max(newY, 0) }; // Ensure the position does not go below 0
    });

    setDragStart({ y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);

    const screenHeight = window.innerHeight;

    if (position.y >= screenHeight / 6) {
      // Start animation to bottom
      isAnimating.current = true;
      animateToBottom();
    }
  };

  const animateToTop = () => {
    if (!isAnimating.current) return; // Stop animation if the flag is false

    setPosition((prev) => {
      if (prev.y > 0) {
        const newY = Math.max(prev.y - 10, 0); // Decrease position by 10px per frame
        positionRef.current = newY; // Update the ref with the new position
        return { y: newY };
      }
      isAnimating.current = false; // Stop the animation when it reaches 0
      return prev;
    });

    if (positionRef.current > 0) {
      requestAnimationFrame(animateToTop); // Continue animation
    }
  };

  const animateToBottom = () => {
    if (!isAnimating.current) return; // Stop animation if the flag is false

    setPosition((prev) => {
      const newY = Math.min(prev.y + 10, window.innerHeight); // Increment position by 10px per frame
      positionRef.current = newY; // Update the ref with the new position
      return { y: newY };
    });

    if (positionRef.current < window.innerHeight) {
      requestAnimationFrame(animateToBottom); // Continue animation
    } else {
      console.log('Animation completed');
      isAnimating.current = false; // Stop the animation
      setShowMap(false); // Hide the map
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
          // Append the user and add an Icon object to each user
          const updatedMatches = allUsers.map((match) => {
            const firstPictureUrl = match.pictures?.[0]?.url || ''; // Safely access the first picture's URL
            const userIcon = new L.divIcon({
              className: 'circular-icon', // Custom class for styling
              html: `<div class="icon-wrapper" style="background-image: url('${import.meta.env.VITE_BLOB_URL + '/' + firstPictureUrl}');"></div>`,
              iconUrl: import.meta.env.VITE_BLOB_URL + '/' + firstPictureUrl, // Use the first picture's URL
              iconSize: [32, 32], // Set the size of the icon
              iconAnchor: [16, 32], // Anchor point of the icon
              popupAnchor: [0, -32], // Anchor point for the popup
            });
            return { ...match, icon : userIcon}; // Append the Icon object to the user
          });
          setMatches(updatedMatches); // Update the matches state
        } catch (err) {
          console.error('Error fetching matches:', err);
          displayAlert('error', 'Error fetching matches');
        }
      };

      fetchUsers();
      isAnimating.current = true; // Set the animation flag to true
      animateToTop(); // Start the animation
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
        center={[48.8499, 2.6370]}
        zoom={8}
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