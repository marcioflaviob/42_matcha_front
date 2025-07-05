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
import { MapContext } from '../../../context/MapContext';
import 'primeicons/primeicons.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const PopulatedMap = () => {
  const { user, dates, setDates, matches, setMatches} = useContext(UserContext);
  const { mapStatus, setMapStatus, focusedDate, setFocusedDate, focusedUser} = useContext(MapContext);
  const isMapOpen = mapStatus != 'closed';
  const isSettingDate = mapStatus == 'setting_date';
  const mapContainerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ y: 0 });
  const [position, setPosition] = useState({ y: window.innerHeight });
  const positionRef = useRef(position.y);
  const isAnimating = useRef(true);
  const { token } = useContext(AuthContext);
  const [clickedPosition, setClickedPosition] = useState(null);
  const calendarRef = useRef(null);
  const [slideOut, setSlideOut] = useState(false);
  const markerRefs = useRef({});
  const [minDate, setMinDate] = useState(new Date());
  const [dateForm, setDateForm] = useState({
    senderId: '',
    receiverId: '',
    scheduledDate: '',
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
        const newY = Math.max(prev.y - 20, 0);
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
      const newY = Math.min(prev.y + 20, window.innerHeight);
      positionRef.current = newY;
      return { y: newY };
    });

    if (positionRef.current < window.innerHeight) {
      requestAnimationFrame(animateToBottom);
    } else {
      isAnimating.current = false;
      setMapStatus("closed");
    }
  };

  const handleSendDate = async () => {
    try {
      const response = await axios.post(import.meta.env.VITE_API_URL + '/dates', dateForm, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      displayAlert('success', 'Date planned!');
      setClickedPosition('');
      setDates((prev) => [...prev, response.data]);
    } catch (error) {
      displayAlert('error', error.response?.data?.message || 'Error scheduling date');
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
    if (isMapOpen) {
      const userAlreadyInMatches = matches.some(match => match.id === user.id);
      const allUsers = userAlreadyInMatches ? matches : [...matches, user];
      const updatedMatches = allUsers.map((match) => {
        const firstPictureUrl = match.pictures?.[0]?.url || '';
        const userIcon = new L.divIcon({
          className: 'circular-icon',
          html: firstPictureUrl
            ? `<div class="icon-wrapper" style="background-image: url('${import.meta.env.VITE_BLOB_URL + '/' + firstPictureUrl}');"></div>`
            : `<div class="avatar-placeholder">${match?.first_name?.charAt(0) || 'U'}</div>`,
          iconUrl: import.meta.env.VITE_BLOB_URL + '/' + firstPictureUrl,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32],
        });
        return { ...match, icon : userIcon};
      });
      setMatches(updatedMatches);


      if (focusedUser) {
        setDateForm((prev => ({
          ...prev,
          receiverId: focusedUser.id,
          senderId: user.id
        })));
      }
      isAnimating.current = true;
      animateToTop();
    }
  }, [isMapOpen]);

  useEffect(() => {
    const setAddress = async () => {
      const address = await getAddress(clickedPosition[0], clickedPosition[1], token);
      setDateForm(prev => ({
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
    if (!focusedDate) return;

    let attempts = 0;
    const maxAttempts = 20;
    const interval = setInterval(() => {
      const marker = markerRefs.current[focusedDate.id];
      if (marker) {
        marker.openPopup();
        clearInterval(interval);
      } else if (attempts >= maxAttempts) {
        console.warn(`Failed to find marker with id=${focusedDate.id}`);
        clearInterval(interval);
      } else {
        attempts++;
      }
    }, 200);

    return () => clearInterval(interval);
  }, [focusedDate, dates]);

  useEffect(() => {
    if (mapStatus == "headerClosed")
    {
      isAnimating.current = true;
      animateToBottom();
    }
  }, [mapStatus]);

  const handleUpdateDate = async (dateId, status) => {
		try {
			await axios.patch(`${import.meta.env.VITE_API_URL}/dates`, {
        id: dateId,
        status
      }, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
      });
      setDates(dates.map((date) => {
        if (date.id === dateId) {
          return { ...date, status };
        }
        return date;
      }));
      setFocusedDate(null);
		} catch (error) {
			displayAlert("error", error.response?.data?.message || "Error updating date status");
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
  
  useEffect(() => {
    const interval = setInterval(() => {
      setMinDate(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []); 

  if (!isMapOpen || !user || !user.location) {
    return null;
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
        center={focusedDate ? [focusedDate?.latitude, focusedDate?.longitude] : [user?.location?.latitude, user?.location?.longitude]}
        zoom={12}
        className="map-div"
      >
        {isSettingDate && <MapClickHandler setClickedPosition={setClickedPosition} isDragging={isDragging} />}

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

        {dates.map((date) => (
          date?.status !== "refused" &&
          <Marker key={date.id}
            ref={(ref) => {
              if (ref) markerRefs.current[date.id] = ref;
            }}
            position={[date?.latitude, date?.longitude]}
            icon={new L.Icon.Default()}
            style={{ cursor: 'pointer'}}>
            <Popup>
              <h3>{date?.address}</h3>
              <p>{new Date(date?.scheduled_date).toLocaleString('en-GB', { 
                day: '2-digit', 
                month: 'short', 
                year: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit' 
              })}</p>
              <p style={{ color: date?.status == "accepted" ? "green" : date?.status == "refused" ? "red" : "blue"}}>{date?.status}</p>
              { date?.receiver_id == user.id && date?.status == "pending" &&
                <div style={{display: 'flex', gap: "1rem"}}>
                  <Button 
                    label="Accept" 
                    icon="pi pi-check" 
                    className="p-button-success"
                    onClick={() => {handleUpdateDate(date?.id, "accepted")}} 
                    size="small"
                  />
                  <Button 
                    label="Refuse" 
                    icon="pi pi-times" 
                    className="p-button-failure"
                    severity='danger'
                    onClick={() => {handleUpdateDate(date?.id, "refused")}} 
                    size="small"
                  />
                </div>
              }
            </Popup>
          </Marker>
        ))}

        {isSettingDate && clickedPosition && (
          <Marker position={clickedPosition} icon={new L.Icon.Default()}>
            <Popup>
              <span>Selected Location</span>
            </Popup>
          </Marker>
        )}
      </MapContainer>
      {isSettingDate && <div className="map-date-location-title">Choose a Location</div>}
      {isSettingDate && clickedPosition && 
        <div ref={calendarRef} className={`map-date-calendar-container ${slideOut ? 'slide-out-animation' : ''}`}>
          <i className="pi pi-angle-left map-calendar-close-button" onClick={() => {setSlideOut(true)}}/>
          <div className='map-address-title'>{dateForm.address}</div>
          <Calendar
            value={dateForm.scheduledDate}
            onChange={(e) => {
              setDateForm((prev) => ({
                ...prev,
                scheduledDate: e.value,  
              }));
            }}
            inline
            className="map-calendar"
            hourFormat='24'
            showTime
            minDate={minDate}
            />
            <Button label="Schedule date" disabled={!dateForm.scheduledDate} className='map-date-button' text onClick={handleSendDate}/>
        </div>}
    </div>
  );
};

export default PopulatedMap;