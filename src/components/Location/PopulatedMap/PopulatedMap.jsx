import { useEffect, useRef, useState, useContext} from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvent } from 'react-leaflet';
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
import { getAddress } from '../AskLocation/AskLocation';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import 'primeicons/primeicons.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const PopulatedMap = ({ setShowMap, showMap, dateBool, matchId, showDateId, setShowDateId, setUpdatedNotifications, setAllUnansweredDates}) => {
  const { user } = useContext(UserContext);
  const mapContainerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ y: 0 });
  const [position, setPosition] = useState({ y: window.innerHeight });
  const positionRef = useRef(position.y);
  const isAnimating = useRef(true);
  const [matches, setMatches] = useState([]);
  const { token } = useContext(AuthContext);
  const [clickedPosition, setClickedPosition] = useState(null);
  const calendarRef = useRef(null);
  const [slideOut, setSlideOut] = useState(false);
  const [allDates, setAllDates] = useState([]);
  const [currentDate, setCurrentDate] = useState(null);
  const markerRefs = useRef({});
  const [refuse, setRefuse] = useState(false);
  const [date, setDate] = useState({
    senderId: '',
    receiverId: '',
    dateData: '',
    address: '',
    latitude: 0,
    longitude: 0
  });

  useEffect(() => {
    positionRef.current = position.y;
  }, [position]);

  const handleMouseDown = (e) => {
    if (isAnimating.current) return;
    setIsDragging(true);
    setDragStart({ y: e.clientY });
    isAnimating.current = false;
  };

  const handleMouseMove = (e) => {
    if (isAnimating.current) return;
    if (!isDragging) return;
    const dy = e.clientY - dragStart.y;

    setPosition((prev) => {
      const newY = prev.y + dy;
      return { y: Math.max(newY, 0) };
    });

    setDragStart({ y: e.clientY });
  };

  const handleMouseUp = () => {
    if (isAnimating.current) return;
    setIsDragging(false);

    const screenHeight = window.innerHeight;

    if (position.y >= screenHeight / 6) {
      isAnimating.current = true;
      animateToBottom();
    }
  };

  const animateToTop = () => {
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

  const handleSendDate = async () => {
    console.log(date);
    try {
      const response = await axios.post(import.meta.env.VITE_API_URL + '/notifications/date', date, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        console.log(response.data);
        displayAlert('success', 'Date planned !');
        setClickedPosition('');
        await fetchDates();
      }
    } catch (err) {
      console.error('Error sending date:', err);
      displayAlert('error', 'Error sending date');
    }
  }

  const fetchDates = async () => {
    try {
      const response = await axios.get(import.meta.env.VITE_API_URL + '/dates', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAllDates(response.data);
    } catch (err) {
      console.error('Error fetching dates:', err);
      displayAlert('error', 'Error fetching matches');
    }
  }

  function MapClickHandler({setClickedPosition, isDragging}) {
    useMapEvent('click', (event) => {
      if (!isDragging) {
        setClickedPosition([event.latlng.lat, event.latlng.lng ]);

      }
    });
    return null;
  }

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
      fetchDates();
      isAnimating.current = true;
      animateToTop();
      setDate((prev => ({
        ...prev,
        receiverId: matchId,
        senderId: user.id
      })));
    }
  }, [showMap]);

  useEffect(() => {
    const setAddress = async () => {
      const address = await getAddress(clickedPosition[0], clickedPosition[1], token);
      setDate(prev => ({
        ...prev,
        address: address,
        latitude: clickedPosition[0],
        longitude: clickedPosition[1]
      }));
    }
    if (clickedPosition) {
      setAddress();
    }
  }, [clickedPosition]);

  useEffect(() => {
    const fetchDate = async () =>
    {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/date/${showDateId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCurrentDate(response.data);
      } catch (error) {
        console.error("error getting Date:", error);
        displayAlert("error", "error getting Date");
      }
    }
    if (showDateId)
    {
      fetchDate();
      if (showDateId && markerRefs.current[showDateId]) {
        markerRefs.current[showDateId].openPopup();
      }
    }
  }, [showDateId, currentDate]);

  const handleAcceptDate = async (dateId) => {
		try {
			await axios.patch(`${import.meta.env.VITE_API_URL}/dates/accept/${dateId}`, {}, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
      });
      setUpdatedNotifications((prev) => prev.filter(n => n.dateId !== dateId));
      setShowDateId(null);
		} catch (error) {
			console.error("error accepting date:", error);
			displayAlert("error", "error accepting date");
		}
	}

  const handleRefuseDate = async (dateId) => {
		try {
			await axios.delete(`${import.meta.env.VITE_API_URL}/dates/remove/${dateId}`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
      });
      setShowDateId(null);
      setUpdatedNotifications((prev) => prev.filter(n => n.dateId !== dateId));
      setAllUnansweredDates([]);
      setRefuse(true);
		} catch (error) {
			console.error("error refusing date:", error);
			displayAlert("error", "error refusing date");
		}
	}

  useEffect(() => {
    if (slideOut) {
      const timeout = setTimeout(() => {
        setClickedPosition(null);
        setSlideOut(false);
      }, 800);
      return () => clearTimeout(timeout);
    }
  }, [slideOut]);

  if (showDateId && !currentDate) {
    return null; // or null/spinner
  }

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
        center={showDateId ? [currentDate?.latitude, currentDate?.longitude] : [user?.location?.latitude, user?.location?.longitude]}
        zoom={12}
        className="map-div"
      >
        <MapClickHandler setClickedPosition={setClickedPosition} isDragging={isDragging} />

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

        {allDates.map((date) => (
          <Marker key={date.id}
            ref={(ref) => {
              if (ref) markerRefs.current[date.id] = ref;
            }}
            position={[date.latitude, date.longitude]}
            icon={new L.Icon.Default()}
            style={{ cursor: 'pointer'}}>
            <Popup>
              <h3>{date.address}</h3>
              <p>{new Date(date.scheduled_date).toLocaleString('en-GB', { 
                day: '2-digit', 
                month: 'short', 
                year: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit' 
              })}</p>
              <p style={{ color: date.accepted ? "green" : refuse ? "red" : "blue"}}>{date.accepted ? "Accepted" : refuse ? "Refused" : "Pending"}</p>
              {showDateId &&
              <div style={{display: 'flex', gap: "1rem"}}>
                <Button 
                  label="Accept" 
                  icon="pi pi-check" 
                  className="p-button-success"
                  onClick={() => {handleAcceptDate(showDateId)}} 
                  size="small"
                />
                <Button 
                  label="Refuse" 
                  icon="pi pi-times" 
                  className="p-button-failure"
                  severity='danger'
                  onClick={() => {handleRefuseDate(showDateId)}} 
                  size="small"
                />
              </div>
              }
            </Popup>
          </Marker>
        ))}

        {dateBool && clickedPosition && (
          <Marker position={clickedPosition} icon={new L.Icon.Default()}>
            <Popup>
              <span>Selected Location</span>
            </Popup>
          </Marker>
        )}
      </MapContainer>
      {dateBool && <div className="map-date-location-title">Choose a Location</div>}
      {dateBool && clickedPosition && 
      <div ref={calendarRef} className={`map-date-calendar-container ${slideOut ? 'slide-out-animation' : ''}`}>
        <i className="pi pi-angle-left map-calendar-close-button" onClick={() => {setSlideOut(true)}}/>
        <div className='map-address-title'>{date.address}</div>
        <Calendar
          value={date.dateData}
          onChange={(e) => {
            setDate((prev) => ({
              ...prev,
              dateData: e.value,  
            }));
          }}
          inline
          className="map-calendar"
          hourFormat='24'
          showTime
          />
          <Button label="Schedule date" disabled={!date.dateData} className='map-date-button' text onClick={handleSendDate}/>
      </div>}
    </div>
  );
};

export default PopulatedMap;